import { NextRequest } from "next/server";
import { fetchPriceHistory } from "@/lib/data/yahoo-finance";
import { fetchMLPrediction } from "@/lib/ml-client";

export async function POST(request: NextRequest) {
  try {
    const { ticker } = await request.json();
    if (!ticker) return Response.json({ error: "ticker required" }, { status: 400 });

    const priceData = await fetchPriceHistory(ticker, "2y");
    if (priceData.dates.length < 60) {
      return Response.json({ prediction: null, reason: "insufficient_price_history" });
    }

    const prediction = await fetchMLPrediction(ticker, priceData);
    return Response.json({ prediction });
  } catch (e) {
    return Response.json({ prediction: null, error: String(e) });
  }
}
