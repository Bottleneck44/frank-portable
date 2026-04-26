import { RawPriceData, EnsemblePrediction } from "@/lib/engine/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchMLPrediction(ticker: string, priceData: RawPriceData): Promise<EnsemblePrediction | null> {
  try {
    const res = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticker,
        price_data: {
          ticker: priceData.ticker,
          dates: priceData.dates,
          open: priceData.open,
          high: priceData.high,
          low: priceData.low,
          close: priceData.close,
          volume: priceData.volume,
          adj_close: priceData.adjClose,
        },
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (res.status === 404) return null; // Not in NIFTY 50
    if (!res.ok) return null;

    const data = await res.json();
    return {
      ticker: data.ticker,
      predictionDate: data.prediction_date,
      actualPrice: data.actual_price,
      predictions: data.predictions.map((p: Record<string, unknown>) => ({
        modelName: p.model_name,
        predictedReturn: p.predicted_return,
        predictedPrice: p.predicted_price,
        r2: p.r2,
        directionalAccuracy: p.directional_accuracy,
        mae: p.mae,
        mape: p.mape,
      })),
      ensemblePredictedReturn: data.ensemble_predicted_return,
      ensemblePredictedPrice: data.ensemble_predicted_price,
      directionalConsensus: data.directional_consensus,
      technicalScore: data.technical_score,
      technicalConfidence: data.technical_confidence,
      signal: data.signal,
      signalStrength: data.signal_strength,
    };
  } catch {
    return null;
  }
}

export async function checkMLHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}
