import os
import urllib.parse
from datetime import timedelta
import time
import threading
import json

import pandas as pd
import boto3
from fastapi import FastAPI
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sqlalchemy import create_engine, text


# ==========================================
# CONFIGURATION: DATABASE & AWS SQS SETUP
# ==========================================

DB_USER = "admin"
DB_PASS = "Ritajaf43"
DB_HOST = "miniamazon-db.chawqysseqx6.eu-north-1.rds.amazonaws.com"
DB_PORT = "3306"
DB_NAME = "miniamazon_db"

AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = "eu-north-1"
SQS_QUEUE_URL = os.getenv("SQS_QUEUE_URL")


# ==========================================
# DATABASE ENGINE INITIALIZATION
# ==========================================

encoded_pass = urllib.parse.quote_plus(DB_PASS)
DB_CONNECTION_STRING = (
    f"mysql+pymysql://{DB_USER}:{encoded_pass}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

try:
    engine = create_engine(DB_CONNECTION_STRING)
    print("Successfully connected to the database.")
except Exception as e:
    engine = None
    print(f"Database engine initialization failed: {e}")


# ==========================================
# AWS SQS CLIENT INITIALIZATION
# ==========================================

try:
    sqs_client = boto3.client(
        "sqs",
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY,
        region_name=AWS_REGION,
    )
    print("Successfully initialized AWS SQS client.")
except Exception as e:
    sqs_client = None
    print(f"AWS SQS client initialization failed: {e}")


# ==========================================
# CORE MACHINE LEARNING RUNTIME ENGINE
# ==========================================

def execute_ml_pipeline(triggered_by_user_id: int):
    """
    Runs the ML pipeline after an OrderPlaced message is received from SQS.
    It reads orders, clusters users, and updates the user tier in the database.
    """

    print(f"\nML pipeline triggered for User ID: {triggered_by_user_id}")

    if engine is None:
        print("Pipeline stopped because database engine is not available.")
        return

    try:
        # 1. Read orders from database
        df_raw = pd.read_sql("SELECT * FROM Orders", con=engine)

        if df_raw.empty:
            print("Pipeline stopped: Orders table is empty.")
            return

        print(f"Orders columns found: {list(df_raw.columns)}")

        # 2. Detect column names automatically
        user_columns = [c for c in df_raw.columns if "user" in c.lower()]
        date_columns = [
            c for c in df_raw.columns
            if "date" in c.lower() or "creat" in c.lower()
        ]
        total_columns = [
            c for c in df_raw.columns
            if "total" in c.lower() or "amount" in c.lower()
        ]

        if not user_columns:
            print("No user column found in Orders table.")
            return

        if not date_columns:
            print("No date/created column found in Orders table.")
            return

        if not total_columns:
            print("No total/amount column found in Orders table.")
            return

        col_user = user_columns[0]
        col_date = date_columns[0]
        col_total = total_columns[0]

        df_orders = df_raw[[col_user, col_date, col_total]].copy()
        df_orders.columns = ["UserId", "OrderDate", "OrderTotal"]

        df_orders["OrderDate"] = pd.to_datetime(df_orders["OrderDate"])
        df_orders["OrderTotal"] = pd.to_numeric(df_orders["OrderTotal"], errors="coerce")
        df_orders = df_orders.dropna(subset=["UserId", "OrderDate", "OrderTotal"])

        if df_orders.empty:
            print("Pipeline stopped: No valid order rows after cleaning.")
            return

        # 3. Build RFM table
        snapshot_date = df_orders["OrderDate"].max() + timedelta(days=1)

        rfm = df_orders.groupby("UserId").agg({
            "OrderDate": lambda x: (snapshot_date - x.max()).days,
            "UserId": "count",
            "OrderTotal": "sum",
        })

        rfm.rename(
            columns={
                "OrderDate": "Recency",
                "UserId": "Frequency",
                "OrderTotal": "Monetary",
            },
            inplace=True,
        )

        if rfm.empty:
            print("Pipeline stopped: RFM table is empty.")
            return

        # 4. Scale features
        scaler = StandardScaler()
        rfm_scaled = scaler.fit_transform(rfm[["Recency", "Frequency", "Monetary"]])

        # 5. KMeans clustering
        number_of_clusters = min(3, len(rfm))

        if number_of_clusters < 1:
            print("Pipeline stopped: Not enough users for clustering.")
            return

        kmeans = KMeans(
            n_clusters=number_of_clusters,
            random_state=42,
            n_init="auto",
        )

        rfm["Cluster"] = kmeans.fit_predict(rfm_scaled)

        # 6. Determine lowest value cluster
        cluster_analysis = rfm.groupby("Cluster").mean(numeric_only=True)
        lowest_cluster_index = cluster_analysis["Monetary"].idxmin()

        # 7. Read Users table structure
        df_users_check = pd.read_sql("SELECT * FROM Users LIMIT 3", con=engine)

        print(f"Users columns found: {list(df_users_check.columns)}")

        user_id_columns = [c for c in df_users_check.columns if c.lower() == "id"]
        tier_columns = [c for c in df_users_check.columns if "tier" in c.lower()]

        if not user_id_columns:
            print("No ID column found in Users table.")
            return

        if not tier_columns:
            print("No tier column found in Users table. Add a Tier column first.")
            return

        user_id_col = user_id_columns[0]
        tier_col = tier_columns[0]

        print("--- Live Dynamic Tier Assignments ---")

        # 8. Update Users table
        with engine.begin() as connection:
            for user_id, row in rfm.iterrows():
                current_cluster = row["Cluster"]

                if current_cluster != lowest_cluster_index:
                    assigned_tier = "Tier 1"
                else:
                    assigned_tier = "Tier 2"

                update_statement = text(f"""
                    UPDATE Users
                    SET {tier_col} = :tier
                    WHERE {user_id_col} = :uid
                """)

                result = connection.execute(
                    update_statement,
                    {
                        "tier": assigned_tier,
                        "uid": int(user_id),
                    },
                )

                print(
                    f"User ID {user_id} | "
                    f"Cluster {int(current_cluster)} | "
                    f"Assigned {assigned_tier} | "
                    f"Rows updated: {result.rowcount}"
                )

        print("ML pipeline completed successfully.")

    except Exception as err:
        print(f"Critical ML pipeline failure: {err}")


# ==========================================
# AWS SQS BACKGROUND LISTENER
# ==========================================

def start_sqs_listener():
    """
    Infinite loop background worker.
    It polls SQS for OrderPlaced events and processes them asynchronously.
    """

    if sqs_client is None:
        print("SQS listener stopped because SQS client is not available.")
        return

    if not SQS_QUEUE_URL or "PUT_YOUR_REAL" in SQS_QUEUE_URL:
        print("SQS listener stopped because SQS_QUEUE_URL is not configured.")
        return

    print("SQS listener is now polling for incoming checkout events...")

    while True:
        try:
            response = sqs_client.receive_message(
                QueueUrl=SQS_QUEUE_URL,
                AttributeNames=["All"],
                MaxNumberOfMessages=1,
                WaitTimeSeconds=10,
            )

            messages = response.get("Messages", [])

            for msg in messages:
                print("\nSQS message detected.")

                body = json.loads(msg["Body"])

                incoming_user_id = (
                    body.get("UserId")
                    or body.get("userId")
                    or body.get("user_id")
                )

                if incoming_user_id is not None:
                    execute_ml_pipeline(triggered_by_user_id=int(incoming_user_id))
                else:
                    print("Malformed SQS message. UserId was not found.")

                sqs_client.delete_message(
                    QueueUrl=SQS_QUEUE_URL,
                    ReceiptHandle=msg["ReceiptHandle"],
                )

                print("Processed SQS message was deleted from the queue.")

        except Exception as e:
            print(f"SQS listener error. Retrying in 5 seconds: {e}")
            time.sleep(5)


# ==========================================
# FASTAPI APP
# ==========================================

app = FastAPI(
    title="Mini-Amazon ML Service - Async SQS Mode",
    version="2.0.0",
)


@app.on_event("startup")
def launch_background_worker():
    """
    Starts the SQS listener in the background when FastAPI starts.
    """
    thread = threading.Thread(target=start_sqs_listener, daemon=True)
    thread.start()


@app.post("/api/score-transaction")
def manual_recalculate_trigger():
    """
    Manual endpoint to run the ML pipeline without SQS.
    Useful for testing.
    """
    execute_ml_pipeline(triggered_by_user_id=0)

    return {
        "status": "success",
        "message": "Manual ML pipeline executed.",
    }


@app.get("/api/ml-health")
def health_check():
    return {
        "status": "online",
        "mode": "asynchronous_queue_worker",
    }


# ==========================================
# LOCAL RUN SUPPORT
# ==========================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )