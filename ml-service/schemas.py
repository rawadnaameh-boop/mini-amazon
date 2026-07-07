from pydantic import BaseModel


class AnalyzeReviewRequest(BaseModel):
    text: str


class AnalyzeReviewResponse(BaseModel):
    score: float