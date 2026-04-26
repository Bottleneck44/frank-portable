from pydantic import BaseModel
from typing import Optional


class SingleModelPrediction(BaseModel):
    model_name: str
    predicted_return: float
    predicted_price: float
    r2: float
    directional_accuracy: float
    mae: float
    mape: float


class EnsemblePrediction(BaseModel):
    ticker: str
    prediction_date: str
    actual_price: float
    predictions: list[SingleModelPrediction]
    ensemble_predicted_return: float
    ensemble_predicted_price: float
    directional_consensus: float
    technical_score: float        # 0-100
    technical_confidence: float   # 0-1
    signal: str                   # BULLISH | BEARISH | NEUTRAL
    signal_strength: float        # 0-1


class HealthResponse(BaseModel):
    status: str
    models_loaded: list[str]
    nifty50_count: int
