import { NextRequest } from "next/server";
import { runRulesEngine } from "@/lib/engine/rules-engine";
import { FinancialYear } from "@/lib/engine/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const years: FinancialYear[] = body.years;
    const ticker: string | undefined = body.ticker;
    const companyName: string = body.companyName ?? "Unknown";

    if (!years || years.length === 0) {
      return Response.json({ error: "No financial years provided" }, { status: 400 });
    }

    const result = runRulesEngine(years, ticker, companyName);
    return Response.json({ result });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
