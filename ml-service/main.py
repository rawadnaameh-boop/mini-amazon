from fastapi import FastAPI
from fastapi.responses import JSONResponse
from sqlalchemy import text

app = FastAPI(title="Mini Amazon ML Service")


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