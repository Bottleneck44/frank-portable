import numpy as np
import pandas as pd
from ..schemas.input_schemas import RawPriceData, FeatureMatrix, FeatureVector

RSI_PERIOD = 14
MACD_FAST, MACD_SLOW, MACD_SIGNAL = 12, 26, 9
BB_PERIOD, BB_STD = 20, 2
ADX_PERIOD = 14
SAR_AF_START, SAR_AF_INCREMENT, SAR_AF_MAX = 0.02, 0.02, 0.20


def compute_rsi(close: pd.Series, period: int = RSI_PERIOD) -> pd.Series:
    delta = close.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)
    avg_gain = gain.rolling(window=period, min_periods=period).mean()
    avg_loss = loss.rolling(window=period, min_periods=period).mean()
    for i in range(period, len(close)):
        avg_gain.iloc[i] = (avg_gain.iloc[i-1] * (period - 1) + gain.iloc[i]) / period
        avg_loss.iloc[i] = (avg_loss.iloc[i-1] * (period - 1) + loss.iloc[i]) / period
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))


def compute_macd(close: pd.Series):
    ema_fast = close.ewm(span=MACD_FAST, adjust=False).mean()
    ema_slow = close.ewm(span=MACD_SLOW, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=MACD_SIGNAL, adjust=False).mean()
    return macd_line, signal_line, macd_line - signal_line


def compute_bollinger_bands(close: pd.Series):
    sma = close.rolling(window=BB_PERIOD).mean()
    std = close.rolling(window=BB_PERIOD).std()
    upper = sma + BB_STD * std
    lower = sma - BB_STD * std
    bandwidth = (upper - lower) / sma
    pct_b = (close - lower) / (upper - lower)
    return bandwidth, pct_b


def compute_adx(high: pd.Series, low: pd.Series, close: pd.Series):
    plus_dm = high.diff()
    minus_dm = -low.diff()
    plus_dm_clean = np.where((plus_dm > minus_dm) & (plus_dm > 0), plus_dm, 0.0)
    minus_dm_clean = np.where((minus_dm > plus_dm) & (minus_dm > 0), minus_dm, 0.0)
    plus_dm_s = pd.Series(plus_dm_clean, index=close.index)
    minus_dm_s = pd.Series(minus_dm_clean, index=close.index)
    tr = pd.concat([high - low, (high - close.shift(1)).abs(), (low - close.shift(1)).abs()], axis=1).max(axis=1)
    atr = tr.rolling(window=ADX_PERIOD).mean()
    plus_di = 100 * (plus_dm_s.rolling(window=ADX_PERIOD).mean() / atr)
    minus_di = 100 * (minus_dm_s.rolling(window=ADX_PERIOD).mean() / atr)
    dx = 100 * ((plus_di - minus_di).abs() / (plus_di + minus_di))
    adx = dx.rolling(window=ADX_PERIOD).mean()
    return adx, plus_di, minus_di


def compute_sar(high: pd.Series, low: pd.Series, close: pd.Series) -> pd.Series:
    n = len(close)
    sar = np.zeros(n)
    ep = np.zeros(n)
    af = np.zeros(n)
    trend = np.ones(n)
    sar[0] = low.iloc[0]
    ep[0] = high.iloc[0]
    af[0] = SAR_AF_START
    for i in range(1, n):
        sar[i] = sar[i-1] + af[i-1] * (ep[i-1] - sar[i-1])
        if trend[i-1] == 1:
            sar[i] = min(sar[i], low.iloc[i-1])
            if i >= 2:
                sar[i] = min(sar[i], low.iloc[i-2])
            if low.iloc[i] < sar[i]:
                trend[i] = -1; sar[i] = ep[i-1]; ep[i] = low.iloc[i]; af[i] = SAR_AF_START
            else:
                trend[i] = 1
                if high.iloc[i] > ep[i-1]:
                    ep[i] = high.iloc[i]; af[i] = min(af[i-1] + SAR_AF_INCREMENT, SAR_AF_MAX)
                else:
                    ep[i] = ep[i-1]; af[i] = af[i-1]
        else:
            sar[i] = max(sar[i], high.iloc[i-1])
            if i >= 2:
                sar[i] = max(sar[i], high.iloc[i-2])
            if high.iloc[i] > sar[i]:
                trend[i] = 1; sar[i] = ep[i-1]; ep[i] = high.iloc[i]; af[i] = SAR_AF_START
            else:
                trend[i] = -1
                if low.iloc[i] < ep[i-1]:
                    ep[i] = low.iloc[i]; af[i] = min(af[i-1] + SAR_AF_INCREMENT, SAR_AF_MAX)
                else:
                    ep[i] = ep[i-1]; af[i] = af[i-1]
    return close - pd.Series(sar, index=close.index)


def compute_features(price_data: RawPriceData) -> FeatureMatrix:
    df = pd.DataFrame({
        "Open": price_data.open,
        "High": price_data.high,
        "Low": price_data.low,
        "Close": price_data.close,
        "Volume": price_data.volume,
    }, index=pd.to_datetime(price_data.dates))

    close = df["Close"]
    high = df["High"]
    low = df["Low"]

    df["RSI"] = compute_rsi(close)
    df["MACD"], df["MACD_Signal"], df["MACD_Hist"] = compute_macd(close)
    df["BB_Bandwidth"], df["BB_PctB"] = compute_bollinger_bands(close)
    df["ADX"], df["Plus_DI"], df["Minus_DI"] = compute_adx(high, low, close)
    df["SAR_diff"] = compute_sar(high, low, close)

    df["daily_return"] = close.pct_change()
    df["log_return"] = np.log(close / close.shift(1))
    df["volume_change"] = df["Volume"].pct_change()
    df["price_range"] = (high - low) / close
    df["close_open_ratio"] = close / df["Open"]
    df["volatility_5d"] = df["daily_return"].rolling(5).std()
    df["volatility_20d"] = df["daily_return"].rolling(20).std()
    df["momentum_5d"] = close / close.shift(5) - 1.0
    df["momentum_10d"] = close / close.shift(10) - 1.0
    df["momentum_20d"] = close / close.shift(20) - 1.0

    # Winsorize at 1st/99th percentile (exclude Close)
    feature_cols = ["RSI", "MACD", "MACD_Signal", "MACD_Hist", "BB_Bandwidth", "BB_PctB",
                    "ADX", "Plus_DI", "Minus_DI", "SAR_diff", "daily_return", "log_return",
                    "volume_change", "price_range", "close_open_ratio",
                    "volatility_5d", "volatility_20d", "momentum_5d", "momentum_10d", "momentum_20d"]
    for col in feature_cols:
        q01 = df[col].quantile(0.01)
        q99 = df[col].quantile(0.99)
        df[col] = df[col].clip(q01, q99)

    df = df.replace([np.inf, -np.inf], np.nan).dropna()

    vectors = []
    for idx, row in df.iterrows():
        vectors.append(FeatureVector(
            date=str(idx.date()),
            close=float(row["Close"]),
            rsi=float(row["RSI"]),
            macd=float(row["MACD"]),
            macd_signal=float(row["MACD_Signal"]),
            macd_hist=float(row["MACD_Hist"]),
            bb_bandwidth=float(row["BB_Bandwidth"]),
            bb_pct_b=float(row["BB_PctB"]),
            adx=float(row["ADX"]),
            plus_di=float(row["Plus_DI"]),
            minus_di=float(row["Minus_DI"]),
            sar_diff=float(row["SAR_diff"]),
            daily_return=float(row["daily_return"]),
            log_return=float(row["log_return"]),
            volume_change=float(row["volume_change"]),
            price_range=float(row["price_range"]),
            close_open_ratio=float(row["close_open_ratio"]),
            volatility_5d=float(row["volatility_5d"]),
            volatility_20d=float(row["volatility_20d"]),
            momentum_5d=float(row["momentum_5d"]),
            momentum_10d=float(row["momentum_10d"]),
            momentum_20d=float(row["momentum_20d"]),
        ))

    return FeatureMatrix(ticker=price_data.ticker, features=vectors)
