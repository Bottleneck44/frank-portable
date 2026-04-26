import { NextRequest } from "next/server";
import { fuse } from "@/lib/engine/fusion";
import { FundamentalAnalysisResult, EnsemblePrediction } from "@/lib/engine/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fundamental: FundamentalAnalysisResult = body.fundamental;
    const ml: EnsemblePrediction | null = body.ml ?? null;
    const ticker: string = body.ticker ?? "UNKNOWN";

    if (!fundamental) return Response.json({ error: "fundamental required" }, { status: 400 });

    const result = fuse(fundamental, ml, ticker);
    return Response.json({ result });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
