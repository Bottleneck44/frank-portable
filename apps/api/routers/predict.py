from fastapi import APIRouter, HTTPException
from ..schemas.input_schemas import PredictRequest
from ..schemas.output_schemas import EnsemblePrediction
from ..services.feature_engineering import compute_features
from ..services.model_inference import run_ensemble, is_nifty50

router = APIRouter()


@router.post("/predict", response_model=EnsemblePrediction)
async def predict(req: PredictRequest):
    if not is_nifty50(req.ticker):
        raise HTTPException(status_code=404, detail=f"{req.ticker} not in pre-trained NIFTY 50 set")
    if len(req.price_data.dates) < 60:
        raise HTTPException(status_code=422, detail="Insufficient price history (need ≥60 rows)")
    try:
        feature_matrix = compute_features(req.price_data)
        return run_ensemble(req.ticker, feature_matrix)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
