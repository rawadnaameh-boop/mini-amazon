from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy import text
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

from ml_model import calculate_fraud_score  # Imports your trained Isolation Forest brain
from recommendation_model import RecommendationModel

# NOTE: Uncomment the line below when you are ready to link your real database engine
# from database import engine 

app = FastAPI(title="Mini Amazon ML Service")

recommendation_model = RecommendationModel()


@app.on_event("startup")
def startup_event():
    recommendation_model.train()


# ==========================================
# 1. DATA VALIDATION SCHEMA (Pydantic)
# This strictly validates the JSON incoming from the .NET checkout flow
# ==========================================
class TransactionPayload(BaseModel):
    total_cost: float = Field(..., description="The total cart cost in dollars")
    quantity: int = Field(..., description="The total number of items in the cart")
    hour_of_day: float = Field(..., description="The hour the transaction occurred (0.0 to 23.99)")


# ==========================================
# 2. REAL-TIME FRAUD SCORING ENDPOINT
# ==========================================
@app.post("/api/score-transaction")
def score_transaction(payload: TransactionPayload):
    """
    Accepts a transaction payload from the .NET system, passes it to the  
    Isolation Forest model, and returns a real-time fraud probability score.
    """
    try:
        # Extract validated fields and send them to the ML model
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
# 3. CUSTOMER SEGMENTATION ENDPOINT (RFM + K-Means)
# ==========================================
def fetch_order_data():
    """Helper function to fetch transactional data."""
    # OPTION A: Mock Data (Default so your server boots up safely right now)
    np.random.seed(42)
    num_orders = 1000
    user_ids = [f"user_{i}" for i in range(1, 101)]
    return pd.DataFrame({
        "UserId": np.random.choice(user_ids, num_orders),
        "OrderDate": [datetime.now() - timedelta(days=int(np.random.randint(0, 365))) for _ in range(num_orders)],
        "OrderTotal": np.random.exponential(scale=50, size=num_orders).round(2)
    })

    # OPTION B: Live SQL Database Data
    # (Uncomment below and comment out Option A above once 'engine' is imported)
    # query = text("SELECT UserId, OrderDate, OrderTotal FROM Orders")
    # with engine.connect() as conn:
    #     return pd.read_sql(query, conn)


@app.get("/customer-segments")
def get_customer_segments():
    """
    Aggregates raw order data into RFM profiles, runs K-Means clustering,
    and returns an automated tier assignment for every user.
    """
    try:
        # 1. Fetch historical data
        df_orders = fetch_order_data()
        
        # 2. Process RFM metrics
        snapshot_date = df_orders['OrderDate'].max() + timedelta(days=1)
        rfm = df_orders.groupby('UserId').agg({
            'OrderDate': lambda x: (snapshot_date - x.max()).days,  # Recency
            'UserId': 'count',                                      # Frequency
            'OrderTotal': 'sum'                                     # Monetary
        }).rename(columns={'OrderDate': 'Recency', 'UserId': 'Frequency', 'OrderTotal': 'Monetary'})
        
        # 3. Feature Scaling (Crucial for balanced K-Means clustering)
        scaler = StandardScaler()
        rfm_scaled = scaler.fit_transform(rfm)
        
        # 4. Fit K-Means Model
        kmeans = KMeans(n_clusters=3, random_state=42, n_init='auto')
        rfm['Cluster'] = kmeans.fit_predict(rfm_scaled)
        
        # 5. Guardrail: Force consistent Tier Mapping based on overall spend
        # (Ensures Tier 1 is always the highest spending VIP group regardless of randomness)
        cluster_monetary_means = rfm.groupby('Cluster')['Monetary'].mean().sort_values(ascending=False)
        
        tier_mapping = {
            cluster_monetary_means.index[0]: "Tier 1",  # Highest Spenders (VIPs)
            cluster_monetary_means.index[1]: "Tier 2",  # Mid Spenders (Regulars)
            cluster_monetary_means.index[2]: "Tier 3"   # Lowest Spenders (Inactive)
        }
        rfm['Tier'] = rfm['Cluster'].map(tier_mapping)
        
        # 6. Format structure for .NET API ingestion
        rfm_output = rfm.reset_index()[['UserId', 'Tier']]
        return rfm_output.to_dict(orient='records')
        
    except Exception as ex:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": f"Failed to compute customer segments: {str(ex)}"
            }
        )


# ==========================================
# 4. YOUR EXISTING HEALTH & RECOMMENDATION ENDPOINTS
# ==========================================
@app.get("/api/ml-health")
def ml_health():
    return {
        "status": "running",
        "service": "mini-amazon-ml-service"
    }


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