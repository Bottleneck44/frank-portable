from fastapi import APIRouter, HTTPException
from ..schemas.input_schemas import RawPriceData, FeatureMatrix
from ..services.feature_engineering import compute_features

router = APIRouter()


@router.post("/features", response_model=FeatureMatrix)
async def get_features(price_data: RawPriceData):
    if len(price_data.dates) < 60:
        raise HTTPException(status_code=422, detail="Insufficient price history (need ≥60 rows)")
    try:
        return compute_features(price_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
