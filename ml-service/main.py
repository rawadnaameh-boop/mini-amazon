from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy import text
from ml_model import calculate_fraud_score  # Imports your trained Isolation Forest brain

app = FastAPI(title="Mini Amazon ML Service")


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
# 3. YOUR EXISTING HEALTH & DEMO ENDPOINTS
# ==========================================
@app.get("/api/ml-health")
def ml_health():
    try:
        from database import engine

        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1")).scalar()

        return {
            "status": "running",
            "service": "mini-amazon-ml-service",
            "database": "connected",
            "db_test": result
        }

    except Exception as ex:
        return {
            "status": "running",
            "service": "mini-amazon-ml-service",
            "database": "failed",
            "error": str(ex)
        }


@app.get("/api/ml-db-health")
def ml_db_health():
    try:
        from database import engine

        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1")).scalar()

        return {
            "status": "connected",
            "db_test": result
        }

    except Exception as ex:
        return JSONResponse(
            status_code=500,
            content={
                "status": "failed",
                "error": str(ex)
            }
        )


@app.get("/api/predict-demo")
def predict_demo():
    return {
        "prediction": "demo prediction",
        "message": "Python ML service responded successfully"
    }