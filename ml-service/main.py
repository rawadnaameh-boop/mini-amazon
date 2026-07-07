from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from sqlalchemy import text
from recommendation_model import RecommendationModel
from pydantic import BaseModel
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sentiment_analyzer import analyze_sentiment
from schemas import AnalyzeReviewRequest, AnalyzeReviewResponse
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

@app.post("/analyze-review", response_model=AnalyzeReviewResponse)
def analyze_review(request: AnalyzeReviewRequest):
    score = analyze_sentiment(request.text)

    return AnalyzeReviewResponse(score=score)