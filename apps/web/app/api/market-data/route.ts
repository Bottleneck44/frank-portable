import { NextRequest } from "next/server";
import { fetchPriceHistory, searchCompanies, fetchFinancialStatements } from "@/lib/data/yahoo-finance";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get("action");
  const ticker = searchParams.get("ticker");
  const query = searchParams.get("q");

  if (action === "search" && query) {
    const results = await searchCompanies(query);
    return Response.json({ results });
  }

  if (action === "price" && ticker) {
    const period = (searchParams.get("period") as "1y" | "2y" | "5y") ?? "2y";
    const data = await fetchPriceHistory(ticker, period);
    return Response.json({ data });
  }

  if (action === "financials" && ticker) {
    const years = await fetchFinancialStatements(ticker);
    return Response.json({ years });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}
