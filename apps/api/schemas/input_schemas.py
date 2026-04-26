from pydantic import BaseModel
from typing import Optional


class RawPriceData(BaseModel):
    ticker: str
    dates: list[str]
    open: list[float]
    high: list[float]
    low: list[float]
    close: list[float]
    volume: list[float]
    adj_close: list[float]


class FeatureVector(BaseModel):
    date: str
    close: float
    rsi: float
    macd: float
    macd_signal: float
    macd_hist: float
    bb_bandwidth: float
    bb_pct_b: float
    adx: float
    plus_di: float
    minus_di: float
    sar_diff: float
    daily_return: float
    log_return: float
    volume_change: float
    price_range: float
    close_open_ratio: float
    volatility_5d: float
    volatility_20d: float
    momentum_5d: float
    momentum_10d: float
    momentum_20d: float


class FeatureMatrix(BaseModel):
    ticker: str
    features: list[FeatureVector]
    lookback_window: int = 20
    feature_count: int = 21


class PredictRequest(BaseModel):
    ticker: str
    price_data: RawPriceData
