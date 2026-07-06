from fastapi import FastAPI
from fastapi.responses import JSONResponse
from sqlalchemy import text
from recommendation_model import RecommendationModel


app = FastAPI(title="Mini Amazon ML Service")

recommendation_model = RecommendationModel()


@app.on_event("startup")
def startup_event():
    recommendation_model.train()


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