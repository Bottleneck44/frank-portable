import YahooFinance from "yahoo-finance2";
import { RawPriceData, FinancialYear } from "@/lib/engine/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yf = new (YahooFinance as any)({ suppressNotices: ["yahooSurvey"] });

export async function fetchPriceHistory(ticker: string, period: "1y" | "2y" | "5y" = "2y"): Promise<RawPriceData> {
  const period1 = new Date();
  period1.setFullYear(period1.getFullYear() - parseInt(period));
  const result = await yf.chart(ticker, { period1: period1.toISOString().split("T")[0], interval: "1d" }) as unknown as { quotes: Record<string, unknown>[] };
  const quotes = result.quotes.filter((q) => q["close"] != null);
  return {
    ticker,
    dates: quotes.map((q) => (q["date"] as Date).toISOString().split("T")[0]),
    open: quotes.map((q) => (q["open"] as number) ?? 0),
    high: quotes.map((q) => (q["high"] as number) ?? 0),
    low: quotes.map((q) => (q["low"] as number) ?? 0),
    close: quotes.map((q) => q["close"] as number),
    volume: quotes.map((q) => (q["volume"] as number) ?? 0),
    adjClose: quotes.map((q) => (q["adjclose"] as number | undefined) ?? (q["close"] as number)),
  };
}

export interface CompanyInfo {
  ticker: string;
  name: string;
  sector?: string;
  exchange?: string;
  currency?: string;
  currentPrice?: number;
}

export async function searchCompanies(query: string): Promise<CompanyInfo[]> {
  try {
    const results = await yf.search(query, { newsCount: 0 }) as unknown as { quotes: Record<string, unknown>[] };
    return (results.quotes ?? [])
      .filter((q) => q["quoteType"] === "EQUITY")
      .slice(0, 8)
      .map((q) => ({
        ticker: q["symbol"] as string,
        name: (q["longname"] ?? q["shortname"] ?? q["symbol"]) as string,
        exchange: q["exchange"] as string | undefined,
      }));
  } catch {
    return [];
  }
}

export async function fetchFinancialStatements(ticker: string): Promise<FinancialYear[]> {
  try {
    const summary = await yf.quoteSummary(ticker, {
      modules: ["incomeStatementHistory", "balanceSheetHistory", "cashflowStatementHistory"],
    }) as unknown as Record<string, unknown>;

    const incomeYears: Record<string, unknown>[] =
      ((summary["incomeStatementHistory"] as Record<string, unknown> | undefined)?.["incomeStatementHistory"] as Record<string, unknown>[] | undefined) ?? [];
    const balanceYears: Record<string, unknown>[] =
      ((summary["balanceSheetHistory"] as Record<string, unknown> | undefined)?.["balanceSheetHistory"] as Record<string, unknown>[] | undefined) ?? [];
    const cashYears: Record<string, unknown>[] =
      ((summary["cashflowStatementHistory"] as Record<string, unknown> | undefined)?.["cashflowStatementHistory"] as Record<string, unknown>[] | undefined) ?? [];

    const yearMap = new Map<number, FinancialYear>();

    for (const inc of incomeYears) {
      const yr = new Date(inc["endDate"] as Date).getFullYear();
      const rev = (inc["totalRevenue"] as number) ?? 0;
      const grossP = (inc["grossProfit"] as number) ?? 0;
      yearMap.set(yr, {
        year: yr,
        isAudited: true,
        incomeStatement: {
          revenue: rev,
          cogs: rev - grossP,
          grossProfit: grossP,
          operatingExpenses: (inc["totalOperatingExpenses"] as number) ?? 0,
          operatingIncome: (inc["operatingIncome"] as number) ?? 0,
          interestExpense: Math.abs((inc["interestExpense"] as number) ?? 0),
          taxExpense: (inc["incomeTaxExpense"] as number) ?? 0,
          netIncome: (inc["netIncome"] as number) ?? 0,
        },
        balanceSheet: { cashAndEquivalents: 0, accountsReceivable: 0, inventory: 0, currentAssets: 0, totalAssets: 0, accountsPayable: 0, shortTermDebt: 0, currentLiabilities: 0, longTermDebt: 0, totalLiabilities: 0, shareholderEquity: 0 },
        cashFlow: { operatingCashFlow: 0, investingCashFlow: 0, financingCashFlow: 0 },
      });
    }

    for (const bs of balanceYears) {
      const yr = new Date(bs["endDate"] as Date).getFullYear();
      const entry = yearMap.get(yr);
      if (entry) {
        entry.balanceSheet = {
          cashAndEquivalents: (bs["cash"] as number) ?? 0,
          accountsReceivable: (bs["netReceivables"] as number) ?? 0,
          inventory: (bs["inventory"] as number) ?? 0,
          currentAssets: (bs["totalCurrentAssets"] as number) ?? 0,
          totalAssets: (bs["totalAssets"] as number) ?? 0,
          accountsPayable: (bs["accountsPayable"] as number) ?? 0,
          shortTermDebt: (bs["shortTermDebt"] as number) ?? 0,
          currentLiabilities: (bs["totalCurrentLiabilities"] as number) ?? 0,
          longTermDebt: (bs["longTermDebt"] as number) ?? 0,
          totalLiabilities: (bs["totalLiab"] as number) ?? 0,
          shareholderEquity: (bs["totalStockholderEquity"] as number) ?? 0,
        };
      }
    }

    for (const cf of cashYears) {
      const yr = new Date(cf["endDate"] as Date).getFullYear();
      const entry = yearMap.get(yr);
      if (entry) {
        const ocf = (cf["totalCashFromOperatingActivities"] as number) ?? 0;
        const icf = (cf["totalCashflowsFromInvestingActivities"] as number) ?? 0;
        const fcf = (cf["freeCashFlow"] as number) ?? undefined;
        entry.cashFlow = {
          operatingCashFlow: ocf,
          investingCashFlow: icf,
          financingCashFlow: (cf["totalCashFromFinancingActivities"] as number) ?? 0,
          freeCashFlow: fcf,
        };
      }
    }

    return [...yearMap.values()].sort((a, b) => b.year - a.year).slice(0, 5);
  } catch {
    return [];
  }
}
