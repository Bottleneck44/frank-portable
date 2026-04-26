from fastapi import APIRouter
from ..schemas.output_schemas import HealthResponse
from ..services.model_inference import NIFTY50_NAMES, MODELS_DIR

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health():
    import os
    loaded = []
    for name in ["xgboost", "rf", "lgbm", "lstm"]:
        sample = NIFTY50_NAMES[0]
        ext = {"xgboost": ".json", "rf": "_rf.pkl", "lgbm": "_lgbm.txt", "lstm": "_lstm.keras"}.get(name, "")
        if name == "xgboost":
            path = MODELS_DIR / f"{sample}_xgboost.json"
        elif name == "rf":
            path = MODELS_DIR / f"{sample}_rf.pkl"
        elif name == "lgbm":
            path = MODELS_DIR / f"{sample}_lgbm.txt"
        else:
            path = MODELS_DIR / f"{sample}_lstm.keras"
        if path.exists():
            loaded.append(name)
    return HealthResponse(status="ok", models_loaded=loaded, nifty50_count=len(NIFTY50_NAMES))
