from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy import text
from ml_model import calculate_fraud_score  # Imports your trained Isolation Forest brain
from recommendation_model import RecommendationModel


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
# 3. YOUR EXISTING HEALTH & DEMO ENDPOINTS
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