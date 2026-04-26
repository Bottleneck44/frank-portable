import { NextRequest } from "next/server";
import { runRulesEngine } from "@/lib/engine/rules-engine";
import { fuse } from "@/lib/engine/fusion";
import { fetchFinancialStatements, fetchPriceHistory } from "@/lib/data/yahoo-finance";
import { fetchMLPrediction } from "@/lib/ml-client";
import { FinancialYear } from "@/lib/engine/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ticker: string | undefined = body.ticker;
    const companyName: string = body.companyName ?? ticker ?? "Unknown";
    // years can be supplied manually or fetched from Yahoo
    let years: FinancialYear[] = body.years ?? [];

    // Indian stocks need .NS suffix for Yahoo Finance
    const yahooTicker = ticker && !ticker.includes(".") ? `${ticker}.NS` : ticker;

    if (years.length === 0 && yahooTicker) {
      years = await fetchFinancialStatements(yahooTicker);
    }

    if (years.length === 0) {
      return Response.json({ error: "No financial data available" }, { status: 400 });
    }

    // Run fundamental analysis
    const fundamental = runRulesEngine(years, ticker, companyName);

    // Run ML analysis (best-effort — null if unavailable)
    let ml = null;
    if (yahooTicker) {
      try {
        const priceData = await fetchPriceHistory(yahooTicker, "2y");
        if (priceData.dates.length >= 60) {
          // ML backend uses bare ticker (without .NS)
          ml = await fetchMLPrediction(ticker ?? yahooTicker, priceData);
        }
      } catch {
        // ML is optional — continue without it
      }
    }

    // Fuse
    const fusionResult = fuse(fundamental, ml, ticker ?? "MANUAL");

    return Response.json({ result: fusionResult });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
