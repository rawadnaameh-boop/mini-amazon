from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

import os
import json
import time
import threading
import urllib.parse
from datetime import datetime, timedelta

import boto3
import pandas as pd
import numpy as np

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from sqlalchemy import create_engine, text
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

from ml_model import calculate_fraud_score
from recommendation_model import RecommendationModel
from sentiment_analyzer import analyze_sentiment
from schemas import AnalyzeReviewRequest, AnalyzeReviewResponse
from PIL import Image
from sklearn.metrics.pairwise import cosine_similarity
# Dynamic Pricing Additions
from pricing_model import DynamicPricingModel

from visual_search import extract_embedding

print("MAIN.PY LOADED - SQS + DYNAMIC PRICING VERSION", flush=True)


# ==========================================
# ENV CONFIGURATION
# ==========================================

DB_USER = os.getenv("DB_USER", "admin")
DB_PASS = os.getenv("DB_PASS", "")
DB_HOST = os.getenv("DB_HOST", "")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "miniamazon_db")

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "eu-north-1")
SQS_QUEUE_URL = os.getenv("SQS_QUEUE_URL")


# ==========================================
# DATABASE ENGINE
# ==========================================

engine = None

try:
    if DB_HOST and DB_NAME:
        encoded_pass = urllib.parse.quote_plus(DB_PASS)

        DB_CONNECTION_STRING = (
            f"mysql+pymysql://{DB_USER}:{encoded_pass}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        )

        engine = create_engine(DB_CONNECTION_STRING, pool_pre_ping=True)

        print("Database engine initialized successfully.", flush=True)
    else:
        print("Database config missing. Live RFM update will not run.", flush=True)

except Exception as ex:
    engine = None
    print(f"Database engine initialization failed: {ex}", flush=True)


# ==========================================
# AWS SQS CLIENT
# ==========================================

sqs_client = None

try:
    sqs_config = {
        "region_name": AWS_REGION
    }

    if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
        sqs_config["aws_access_key_id"] = AWS_ACCESS_KEY_ID
        sqs_config["aws_secret_access_key"] = AWS_SECRET_ACCESS_KEY

    sqs_client = boto3.client("sqs", **sqs_config)

    print("AWS SQS client initialized successfully.", flush=True)

except Exception as ex:
    sqs_client = None
    print(f"AWS SQS client initialization failed: {ex}", flush=True)


# ==========================================
# FASTAPI APP & ML MODEL INSTANCES
# ==========================================

app = FastAPI(title="Mini Amazon ML Service")

recommendation_model = RecommendationModel()
pricing_model = DynamicPricingModel()

# ==========================================
# VISUAL SEARCH CONFIGURATION
# ==========================================

BASE_DIR = Path(__file__).resolve().parent

VISUAL_EMBEDDINGS_PATH = BASE_DIR / "embeddings" / "product_embeddings.npy"
VISUAL_METADATA_PATH = BASE_DIR / "embeddings" / "product_metadata.json"

# ==========================================
# TRANSACTION PAYLOAD SCHEMA
# ==========================================

class TransactionPayload(BaseModel):
    total_cost: float = Field(..., description="The total cart cost in dollars")
    quantity: int = Field(..., description="The total number of items in the cart")
    hour_of_day: float = Field(..., description="The hour the transaction occurred")


# ==========================================
# MOCK DATA FALLBACKS
# ==========================================

def get_mock_order_data():
    np.random.seed(42)
    num_orders = 1000
    user_ids = [f"user_{i}" for i in range(1, 101)]

    return pd.DataFrame({
        "UserId": np.random.choice(user_ids, num_orders),
        "OrderDate": [
            datetime.now() - timedelta(days=int(np.random.randint(0, 365)))
            for _ in range(num_orders)
        ],
        "OrderTotal": np.random.exponential(scale=50, size=num_orders).round(2)
    })


# Global state to track mock fluctuating competitor pricing
competitor_prices = {
    101: 52.0,   # Product 101 base competitor price
    102: 210.0,  # Product 102 base competitor price
    103: 79.0    # Product 103 base competitor price
}

def get_mock_product_data():
    """Fallback product data matching acceptance criteria buyout conditions."""
    return pd.DataFrame([
        {"Id": 101, "Name": "Wireless Headphones", "StockQuantity": 100, "SalesVelocity": 5, "Price": 50.0},
        {"Id": 102, "Name": "Ergonomic Office Chair", "StockQuantity": 2, "SalesVelocity": 45, "Price": 200.0}, # Buyout target
        {"Id": 103, "Name": "Mechanical Keyboard", "StockQuantity": 50, "SalesVelocity": 0, "Price": 80.0}     # Dead sales
    ])

def start_competitor_simulator():
    """Background thread loop changing competitor prices +/- 3% every 10 seconds."""
    print("Competitor price simulator background worker active.", flush=True)
    while True:
        time.sleep(10)
        for prod_id in list(competitor_prices.keys()):
            change_percent = np.random.uniform(-0.03, 0.03)
            competitor_prices[prod_id] = round(competitor_prices[prod_id] * (1 + change_percent), 2)


# ==========================================
# RFM HELPERS
# ==========================================

def normalize_orders_dataframe(df_raw: pd.DataFrame) -> pd.DataFrame:
    """
    Detects the real column names from your Orders table and converts them
    into the format needed by the RFM model.
    """
    if df_raw.empty:
        return pd.DataFrame()

    columns = list(df_raw.columns)
    print(f"Orders columns found: {columns}", flush=True)

    user_columns = [c for c in columns if "user" in c.lower()]
    date_columns = [
        c for c in columns
        if "date" in c.lower() or "creat" in c.lower()
    ]
    total_columns = [
        c for c in columns
        if "total" in c.lower() or "amount" in c.lower() or "price" in c.lower()
    ]

    if not user_columns:
        raise Exception("No UserId/User column found in Orders table.")

    if not date_columns:
        raise Exception("No OrderDate/CreatedAt column found in Orders table.")

    if not total_columns:
        raise Exception("No Total/Amount/Price column found in Orders table.")

    if not user_columns or not date_columns or not total_columns:
        return pd.DataFrame()

    col_user = user_columns[0]
    col_date = date_columns[0]
    col_total = total_columns[0]

    df_orders = df_raw[[col_user, col_date, col_total]].copy()
    df_orders.columns = ["UserId", "OrderDate", "OrderTotal"]

    df_orders["OrderDate"] = pd.to_datetime(df_orders["OrderDate"], errors="coerce")
    df_orders["OrderTotal"] = pd.to_numeric(df_orders["OrderTotal"], errors="coerce")

    df_orders = df_orders.dropna(subset=["UserId", "OrderDate", "OrderTotal"])

    return df_orders


def build_rfm_segments(df_orders: pd.DataFrame) -> pd.DataFrame:
    """
    Creates Recency, Frequency, Monetary features, applies K-Means,
    and assigns Tier 1, Tier 2, Tier 3.
    """
    if df_orders.empty:
        return pd.DataFrame()

    snapshot_date = df_orders["OrderDate"].max() + timedelta(days=1)

    rfm = df_orders.groupby("UserId").agg({
        "OrderDate": lambda x: (snapshot_date - x.max()).days,
        "UserId": "count",
        "OrderTotal": "sum"
    })

    rfm.rename(
        columns={
            "OrderDate": "Recency",
            "UserId": "Frequency",
            "OrderTotal": "Monetary"
        },
        inplace=True
    )

    if rfm.empty:
        return pd.DataFrame()

    number_of_clusters = min(3, len(rfm))

    if number_of_clusters == 1:
        rfm["Cluster"] = 0
        rfm["Tier"] = "Tier 1"
        return rfm

    scaler = StandardScaler()
    rfm_scaled = scaler.fit_transform(rfm[["Recency", "Frequency", "Monetary"]])

    kmeans = KMeans(
        n_clusters=number_of_clusters,
        random_state=42,
        n_init=10
    )

    rfm["Cluster"] = kmeans.fit_predict(rfm_scaled)

    cluster_monetary_means = (
        rfm.groupby("Cluster")["Monetary"]
        .mean()
        .sort_values(ascending=False)
    )

    tier_names = ["Tier 1", "Tier 2", "Tier 3"]

    tier_mapping = {
        cluster_id: tier_names[index]
        for index, cluster_id in enumerate(cluster_monetary_means.index)
    }

    rfm["Tier"] = rfm["Cluster"].map(tier_mapping)

    return rfm


def fetch_live_order_data() -> pd.DataFrame:
    """
    Fetches real orders from your MySQL/RDS database.
    """
    if engine is None:
        raise Exception("Database engine is not available.")

    df_raw = pd.read_sql("SELECT * FROM `Orders`", con=engine)

    if df_raw.empty:
        return pd.DataFrame()

    return normalize_orders_dataframe(df_raw)


# ==========================================
# LIVE DATABASE RFM UPDATE
# ==========================================

def execute_rfm_pipeline(triggered_by_user_id=None):
    """
    Runs after an OrderPlaced SQS message arrives.
    Reads Orders, calculates user tiers, and updates Users table.
    """
    print(
        f"RFM pipeline triggered by UserId: {triggered_by_user_id}",
        flush=True
    )

    if engine is None:
        print("RFM pipeline stopped: database engine is not available.", flush=True)
        return

    try:
        df_orders = fetch_live_order_data()

        if df_orders.empty:
            print("RFM pipeline stopped: Orders table is empty.", flush=True)
            return

        rfm = build_rfm_segments(df_orders)

        if rfm.empty:
            print("RFM pipeline stopped: no valid RFM rows.", flush=True)
            return

        df_users_check = pd.read_sql("SELECT * FROM `Users` LIMIT 1", con=engine)

        print(f"Users columns found: {list(df_users_check.columns)}", flush=True)

        user_id_columns = [
            c for c in df_users_check.columns
            if c.lower() == "id"
        ]

        tier_columns = [
            c for c in df_users_check.columns
            if "tier" in c.lower()
        ]

        if not user_id_columns:
            print("No Id column found in Users table.", flush=True)
            return

        if not tier_columns:
            print(
                "No Tier column found in Users table. Add a Tier/UserTier column first.",
                flush=True
            )
            return

        user_id_col = user_id_columns[0]
        tier_col = tier_columns[0]

        with engine.begin() as connection:
            for user_id, row in rfm.iterrows():
                assigned_tier = row["Tier"]

                update_statement = text(f"""
                    UPDATE `Users`
                    SET `{tier_col}` = :tier
                    WHERE `{user_id_col}` = :uid
                """)

                result = connection.execute(
                    update_statement,
                    {
                        "tier": assigned_tier,
                        "uid": user_id
                    }
                )

                print(
                    f"UserId {user_id} assigned {assigned_tier}. "
                    f"Rows updated: {result.rowcount}",
                    flush=True
                )

        print("RFM pipeline completed successfully.", flush=True)

    except Exception as ex:
        print(f"RFM pipeline failed: {ex}", flush=True)


# ==========================================
# SQS LISTENER
# ==========================================

def extract_user_id_from_sqs_body(raw_body: str):
    """
    Extracts UserId from the SQS message body.
    Supports UserId, userId, and user_id.
    """
    body = json.loads(raw_body)

    if isinstance(body, str):
        body = json.loads(body)

    if "Message" in body:
        try:
            body = json.loads(body["Message"])
        except Exception:
            pass

    return (
        body.get("UserId")
        or body.get("userId")
        or body.get("user_id")
    )


def start_sqs_listener():
    """
    Background daemon that constantly polls SQS.
    """
    print("SQS listener function entered.", flush=True)

    if sqs_client is None:
        print("SQS listener stopped: sqs_client is not available.", flush=True)
        return

    if not SQS_QUEUE_URL:
        print("SQS listener stopped: SQS_QUEUE_URL is missing in .env.", flush=True)
        return

    if "YOUR_" in SQS_QUEUE_URL or "PUT_" in SQS_QUEUE_URL:
        print("SQS listener stopped: SQS_QUEUE_URL is still a placeholder.", flush=True)
        return

    print("SQS listener is now polling AWS SQS...", flush=True)

    while True:
        try:
            response = sqs_client.receive_message(
                QueueUrl=SQS_QUEUE_URL,
                AttributeNames=["All"],
                MaxNumberOfMessages=1,
                WaitTimeSeconds=10
            )

            messages = response.get("Messages", [])

            for message in messages:
                print("SQS message received.", flush=True)

                try:
                    incoming_user_id = extract_user_id_from_sqs_body(message["Body"])

                    if incoming_user_id is not None:
                        execute_rfm_pipeline(triggered_by_user_id=incoming_user_id)
                    else:
                        print("SQS message skipped: UserId not found.", flush=True)

                    sqs_client.delete_message(
                        QueueUrl=SQS_QUEUE_URL,
                        ReceiptHandle=message["ReceiptHandle"]
                    )

                    print("SQS message deleted from queue.", flush=True)

                except Exception as message_error:
                    print(
                        f"Failed to process one SQS message: {message_error}",
                        flush=True
                    )

        except Exception as ex:
            print(f"SQS listener error. Retrying in 5 seconds: {ex}", flush=True)
            time.sleep(5)


# ==========================================
# STARTUP EVENT
# ==========================================

@app.on_event("startup")
def startup_event():
    print("FastAPI startup event fired.", flush=True)

    # Train Recommendation Model
    try:
        recommendation_model.train()
        print("Recommendation model trained.", flush=True)
    except Exception as ex:
        print(f"Recommendation model training failed: {ex}", flush=True)

    # Train Dynamic Pricing Model
    try:
        pricing_model.train()
        print("Dynamic pricing model trained successfully.", flush=True)
    except Exception as ex:
        print(f"Dynamic pricing model training failed: {ex}", flush=True)

    # Start SQS Background Thread
    thread = threading.Thread(target=start_sqs_listener, daemon=True)
    thread.start()
    print("SQS background thread started.", flush=True)

    # Start Competitor Pricing Background Simulator Thread
    competitor_thread = threading.Thread(target=start_competitor_simulator, daemon=True)
    competitor_thread.start()
    print("Competitor pricing simulator thread started.", flush=True)


# ==========================================
# 1. REAL-TIME FRAUD SCORING ENDPOINT
# ==========================================

@app.post("/api/score-transaction")
def score_transaction(payload: TransactionPayload):
    try:
        score = calculate_fraud_score(
            total_cost=payload.total_cost,
            quantity=payload.quantity,
            hour_of_day=payload.hour_of_day
        )

        return {
            "status": "success",
            "fraud_score": score
        }

    except Exception as ex:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": f"Failed to score transaction: {str(ex)}"
            }
        )


# ==========================================
# 2. CUSTOMER SEGMENTATION ENDPOINT
# ==========================================

@app.get("/customer-segments")
def get_customer_segments():
    try:
        try:
            df_orders = fetch_live_order_data()
            source = "database"
        except Exception as db_ex:
            print(f"Using mock RFM data because DB fetch failed: {db_ex}", flush=True)
            df_orders = get_mock_order_data()
            source = "mock"

        rfm = build_rfm_segments(df_orders)

        if rfm.empty:
            return {"status": "success", "source": source, "segments": []}

        rfm_output = rfm.reset_index()[["UserId", "Tier"]]

        return {
            "status": "success",
            "source": source,
            "segments": rfm_output.to_dict(orient="records")
        }

    except Exception as ex:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": f"Failed to compute customer segments: {str(ex)}"
            }
        )


# ==========================================
# 3. MANUAL RFM TRIGGER
# ==========================================

@app.post("/api/run-rfm")
def run_rfm_manually():
    execute_rfm_pipeline(triggered_by_user_id="manual")

    return {
        "status": "success",
        "message": "RFM pipeline manually triggered."
    }


# ==========================================
# 4. HEALTH ENDPOINT
# ==========================================

@app.get("/api/ml-health")
def ml_health():
    return {
        "status": "running",
        "service": "mini-amazon-ml-service",
        "sqs_configured": bool(SQS_QUEUE_URL),
        "db_configured": engine is not None,
        "visual_embeddings_file_exists": VISUAL_EMBEDDINGS_PATH.exists(),
        "visual_metadata_file_exists": VISUAL_METADATA_PATH.exists()
    }


# ==========================================
# 5. RECOMMENDATION ENDPOINTS
# ==========================================

@app.get("/recommendations/{product_id}")
def get_recommendations(product_id: int):
    recommended_ids = recommendation_model.recommend(product_id, limit=3)

    return {
        "product_id": product_id,
        "recommended_product_ids": recommended_ids
    }


@app.post("/recommendations/retrain")
def retrain_recommendations():
    recommendation_model.train()

    return {
        "status": "retrained"
    }


# ==========================================
# 6. SENTIMENT ENDPOINT
# ==========================================

@app.post("/analyze-review", response_model=AnalyzeReviewResponse)
def analyze_review(request: AnalyzeReviewRequest):
    score = analyze_sentiment(request.text)

    return AnalyzeReviewResponse(score=score)
# ==========================================
# 7. VISUAL SEARCH ENDPOINT
# ==========================================

@app.post("/visual-search")
async def visual_search(file: UploadFile = File(...)):
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="Uploaded file must be an image."
            )

        if not VISUAL_EMBEDDINGS_PATH.exists():
            raise HTTPException(
                status_code=500,
                detail="Product embeddings file not found. Run index_product_images.py first."
            )

        if not VISUAL_METADATA_PATH.exists():
            raise HTTPException(
                status_code=500,
                detail="Product metadata file not found. Run index_product_images.py first."
            )

        image = Image.open(file.file).convert("RGB")

        query_embedding = extract_embedding(image)

        product_embeddings = np.load(VISUAL_EMBEDDINGS_PATH)

        with open(VISUAL_METADATA_PATH, "r", encoding="utf-8") as metadata_file:
            product_metadata = json.load(metadata_file)

        if len(product_embeddings) == 0 or len(product_metadata) == 0:
            raise HTTPException(
                status_code=500,
                detail="Visual search index is empty. Run index_product_images.py again."
            )

        if len(product_embeddings) != len(product_metadata):
            raise HTTPException(
                status_code=500,
                detail="Embeddings and metadata count mismatch. Re-run index_product_images.py."
            )

        similarities = cosine_similarity(
            query_embedding.reshape(1, -1),
            product_embeddings
        )[0]

        top_k = min(5, len(similarities))
        top_indices = similarities.argsort()[::-1][:top_k]

        results = []

        for index in top_indices:
            product = product_metadata[index]

            results.append({
                "productId": product.get("productId"),
                "name": product.get("name"),
                "price": product.get("price"),
                "stockQuantity": product.get("stockQuantity"),
                "imageUrl": product.get("imageUrl"),
                "similarity": float(similarities[index])
            })

        return {
            "status": "success",
            "results": results
        }

    except HTTPException:
        raise

    except Exception as ex:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": f"Visual search failed: {str(ex)}"
            }
        )


# ==========================================
# 7. DYNAMIC PRICING OPTIMIZATION ENDPOINT (DEFENSIVE UPGRADE)
# ==========================================

@app.get("/optimize-prices")
def optimize_prices():
    try:
        # Step A: Query live products data with automatic naming adjustments
        try:
            if engine is None:
                raise Exception("Database engine uninitialized")
            df_products = pd.read_sql("SELECT * FROM `Products`", con=engine)
            source = "database"
            
            df_products = df_products.rename(columns={
                "id": "Id", "ID": "Id",
                "stock": "StockQuantity", "stock_quantity": "StockQuantity", "Stock": "StockQuantity",
                "velocity": "SalesVelocity", "sales_velocity": "SalesVelocity",
                "price": "Price", "current_price": "Price"
            })
        except Exception as db_ex:
            print(f"Using mock product data because database query failed: {db_ex}", flush=True)
            df_products = get_mock_product_data()
            source = "mock"

        if df_products.empty:
            return {"status": "success", "source": source, "data": []}

        optimized_results = []

        # Step B: Pass inputs to our trained Decision Tree with defensive default checks
        for _, row in df_products.iterrows():
            prod_id = int(row.get("Id", 0))
            base_price = float(row.get("Price", 0.0))
            
            # Defensive check for Stock: if missing from DB schema, default to 10
            stock_val = row.get("StockQuantity")
            stock = int(stock_val) if (pd.notna(stock_val) and stock_val is not None) else 10
            
            # Defensive check for Velocity: if missing from DB schema, auto-simulate stress based on stock
            velocity_val = row.get("SalesVelocity")
            if pd.notna(velocity_val) and velocity_val is not None:
                velocity = int(velocity_val)
            else:
                # Dynamic Trigger: simulates a buyout state for any real product with critically low stock
                velocity = 45 if stock <= 5 else 5

            # Map the product to our concurrent competitor pricing metrics. 
            if prod_id in competitor_prices:
                comp_price = competitor_prices[prod_id]
            else:
                comp_price = round(base_price * 0.98, 2)
                competitor_prices[prod_id] = comp_price 

            target_price = pricing_model.predict_optimal_price(
                stock=stock, 
                comp_price=comp_price, 
                velocity=velocity
            )

            optimized_results.append({
                "product_id": prod_id,
                "product_name": row.get("Name", "Unknown Product"),
                "current_stock": stock,
                "sales_velocity_24h": velocity,
                "competitor_price": round(comp_price, 2),
                "optimized_price": target_price
            })

        return {
            "status": "success",
            "source": source,
            "data": optimized_results
        }

    except Exception as ex:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": f"Failed to optimize market pricing: {str(ex)}"
            }
        )