import os
import numpy as np
import joblib
from pathlib import Path
from ..schemas.input_schemas import FeatureMatrix

MODELS_DIR = Path(__file__).parent.parent / "models" / "trained"
SCALERS_DIR = Path(__file__).parent.parent / "models" / "scalers"
LOOKBACK = 20
N_FEATURES = 21

FEATURE_ORDER = [
    "close", "rsi", "macd", "macd_signal", "macd_hist",
    "bb_bandwidth", "bb_pct_b", "adx", "plus_di", "minus_di",
    "sar_diff", "daily_return", "log_return", "volume_change",
    "price_range", "close_open_ratio",
    "volatility_5d", "volatility_20d", "momentum_5d", "momentum_10d", "momentum_20d",
]

NIFTY50_NAMES = [
    "ADANIENT", "ADANIPORTS", "APOLLOHOSP", "ASIANPAINT", "AXISBANK",
    "BAJAJ-AUTO", "BAJFINANCE", "BAJAJFINSV", "BPCL", "BHARTIARTL",
    "BRITANNIA", "CIPLA", "COALINDIA", "DIVISLAB", "DRREDDY",
    "EICHERMOT", "GRASIM", "HCLTECH", "HDFCBANK", "HDFCLIFE",
    "HEROMOTOCO", "HINDALCO", "HINDUNILVR", "ICICIBANK", "ITC",
    "INDUSINDBK", "INFY", "JSWSTEEL", "KOTAKBANK", "LT",
    "M&M", "MARUTI", "NTPC", "NESTLEIND", "ONGC", "POWERGRID",
    "RELIANCE", "SBILIFE", "SBIN", "SUNPHARMA", "TCS",
    "TATACONSUM", "TATAMOTORS", "TATASTEEL", "TECHM", "TITAN",
    "UPL", "ULTRACEMCO", "WIPRO",
]


def ticker_to_name(ticker: str) -> str:
    return ticker.replace(".NS", "").replace(".BO", "")


def is_nifty50(ticker: str) -> bool:
    return ticker_to_name(ticker).upper() in NIFTY50_NAMES


def _feature_matrix_to_array(fm: FeatureMatrix) -> tuple[np.ndarray, float]:
    """Convert FeatureMatrix to flat array for last LOOKBACK rows. Returns (X, current_price)."""
    rows = fm.features[-LOOKBACK:]
    if len(rows) < LOOKBACK:
        raise ValueError(f"Need {LOOKBACK} rows, got {len(rows)}")
    arr = np.array([[getattr(v, f) for f in FEATURE_ORDER] for v in rows], dtype=np.float32)
    current_price = rows[-1].close
    return arr, current_price


def predict_single_model(name: str, model_type: str, X_flat: np.ndarray, X_3d: np.ndarray,
                          scaler_y) -> float:
    """Run inference for one model. Returns denormalized predicted return."""
    if model_type == "xgboost":
        import xgboost as xgb
        model = xgb.XGBRegressor()
        model.load_model(str(MODELS_DIR / f"{name}_xgboost.json"))
        pred_norm = model.predict(X_flat)
    elif model_type == "rf":
        model = joblib.load(str(MODELS_DIR / f"{name}_rf.pkl"))
        pred_norm = model.predict(X_flat)
    elif model_type == "lgbm":
        import lightgbm as lgb
        model = lgb.Booster(model_file=str(MODELS_DIR / f"{name}_lgbm.txt"))
        pred_norm = model.predict(X_flat)
    elif model_type == "lstm":
        from tensorflow.keras.models import load_model as keras_load
        model = keras_load(str(MODELS_DIR / f"{name}_lstm.keras"))
        pred_norm = model.predict(X_3d, verbose=0).flatten()
    else:
        raise ValueError(f"Unknown model type: {model_type}")

    return float(scaler_y.inverse_transform(
        np.array(pred_norm).reshape(-1, 1)
    ).flatten()[0])


def load_stored_metrics(name: str) -> dict:
    """Load stored per-stock metrics from results CSVs if available."""
    import csv
    metrics_path = Path(__file__).parent.parent.parent.parent.parent / "model" / "results" / "metrics" / "per_stock_metrics.csv"
    result = {}
    if not metrics_path.exists():
        return result
    with open(metrics_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("Stock", "").upper() == name.upper():
                model_key = row.get("Model", "").lower()
                result[model_key] = {
                    "r2": float(row.get("R2", 0)),
                    "directional_accuracy": float(row.get("DirectionalAccuracy", 50)) / 100,
                    "mae": float(row.get("MAE", 0)),
                    "mape": float(row.get("MAPE", 0)),
                }
    return result


def run_ensemble(ticker: str, feature_matrix: FeatureMatrix):
    """Run all 4 models and return predictions list + ensemble stats."""
    from ..schemas.output_schemas import SingleModelPrediction, EnsemblePrediction
    from datetime import date

    name = ticker_to_name(ticker).upper()
    arr, current_price = _feature_matrix_to_array(feature_matrix)

    scaler_X = joblib.load(str(SCALERS_DIR / f"{name}_scaler_X.pkl"))
    scaler_y = joblib.load(str(SCALERS_DIR / f"{name}_scaler_y.pkl"))

    X_flat = scaler_X.transform(arr.flatten().reshape(1, -1))
    X_3d = X_flat.reshape(1, LOOKBACK, N_FEATURES)

    stored = load_stored_metrics(name)

    model_defs = [
        ("xgboost", "xgboost"),
        ("rf", "random_forest"),
        ("lgbm", "lightgbm"),
        ("lstm", "lstm"),
    ]

    predictions = []
    for mtype, mname in model_defs:
        try:
            pred_return = predict_single_model(name, mtype, X_flat, X_3d, scaler_y)
            m = stored.get(mname, {})
            predictions.append(SingleModelPrediction(
                model_name=mname,
                predicted_return=pred_return,
                predicted_price=current_price * (1 + pred_return),
                r2=m.get("r2", 0.0),
                directional_accuracy=m.get("directional_accuracy", 0.5),
                mae=m.get("mae", 0.0),
                mape=m.get("mape", 0.0),
            ))
        except Exception as e:
            print(f"Model {mname} failed for {name}: {e}")

    if not predictions:
        raise RuntimeError(f"All models failed for {name}")

    return _build_ensemble(ticker, current_price, predictions)


def _build_ensemble(ticker: str, current_price: float, predictions) -> dict:
    from ..schemas.output_schemas import EnsemblePrediction
    from datetime import date

    # R²-weighted ensemble (floor R² at 0 to avoid negative weights)
    r2s = [max(0.0, p.r2) for p in predictions]
    total_r2 = sum(r2s)
    weights = [r / total_r2 for r in r2s] if total_r2 > 0 else [1/len(predictions)] * len(predictions)

    ensemble_return = sum(p.predicted_return * w for p, w in zip(predictions, weights))
    ensemble_price = current_price * (1 + ensemble_return)

    # Directional consensus: fraction agreeing on direction
    bullish = sum(1 for p in predictions if p.predicted_return > 0)
    directional_consensus = bullish / len(predictions)

    # Technical score: map [-5%, +5%] → [0, 100]
    clipped = max(-0.05, min(0.05, ensemble_return))
    technical_score = (clipped / 0.10) * 100 + 50

    # Technical confidence
    avg_r2 = sum(max(0, p.r2) for p in predictions) / len(predictions)
    avg_dir_acc = sum(p.directional_accuracy for p in predictions) / len(predictions)
    consensus_factor = abs(directional_consensus - 0.5) * 2
    technical_confidence = 0.50 * avg_r2 + 0.35 * avg_dir_acc + 0.15 * consensus_factor

    if ensemble_return > 0.005:
        signal = "BULLISH"
    elif ensemble_return < -0.005:
        signal = "BEARISH"
    else:
        signal = "NEUTRAL"

    signal_strength = min(1.0, abs(ensemble_return) / 0.05)

    return EnsemblePrediction(
        ticker=ticker,
        prediction_date=str(date.today()),
        actual_price=current_price,
        predictions=predictions,
        ensemble_predicted_return=ensemble_return,
        ensemble_predicted_price=ensemble_price,
        directional_consensus=directional_consensus,
        technical_score=technical_score,
        technical_confidence=technical_confidence,
        signal=signal,
        signal_strength=signal_strength,
    )
