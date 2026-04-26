import { FinancialYear, TrendAnalysis, TrendDirection } from "./types";

export function currentRatio(y: FinancialYear): number {
  if (y.balanceSheet.currentLiabilities === 0) return Infinity;
  return y.balanceSheet.currentAssets / y.balanceSheet.currentLiabilities;
}

export function quickRatio(y: FinancialYear): number {
  if (y.balanceSheet.currentLiabilities === 0) return Infinity;
  return (y.balanceSheet.currentAssets - y.balanceSheet.inventory) / y.balanceSheet.currentLiabilities;
}

export function debtToEquity(y: FinancialYear): number {
  if (y.balanceSheet.shareholderEquity === 0) return Infinity;
  return y.balanceSheet.totalLiabilities / y.balanceSheet.shareholderEquity;
}

export function interestCoverageRatio(y: FinancialYear): number {
  if (y.incomeStatement.interestExpense === 0) return Infinity;
  return y.incomeStatement.operatingIncome / y.incomeStatement.interestExpense;
}

export function grossMargin(y: FinancialYear): number {
  if (y.incomeStatement.revenue === 0) return 0;
  return (y.incomeStatement.grossProfit / y.incomeStatement.revenue) * 100;
}

export function operatingMargin(y: FinancialYear): number {
  if (y.incomeStatement.revenue === 0) return 0;
  return (y.incomeStatement.operatingIncome / y.incomeStatement.revenue) * 100;
}

export function netProfitMargin(y: FinancialYear): number {
  if (y.incomeStatement.revenue === 0) return 0;
  return (y.incomeStatement.netIncome / y.incomeStatement.revenue) * 100;
}

export function returnOnAssets(y: FinancialYear): number {
  if (y.balanceSheet.totalAssets === 0) return 0;
  return (y.incomeStatement.netIncome / y.balanceSheet.totalAssets) * 100;
}

export function returnOnEquity(y: FinancialYear): number {
  if (y.balanceSheet.shareholderEquity === 0) return 0;
  return (y.incomeStatement.netIncome / y.balanceSheet.shareholderEquity) * 100;
}

export function assetTurnover(y: FinancialYear): number {
  if (y.balanceSheet.totalAssets === 0) return 0;
  return y.incomeStatement.revenue / y.balanceSheet.totalAssets;
}

export function inventoryTurnover(y: FinancialYear): number {
  if (y.balanceSheet.inventory === 0) return Infinity;
  return y.incomeStatement.cogs / y.balanceSheet.inventory;
}

export function receivablesTurnover(y: FinancialYear): number {
  if (y.balanceSheet.accountsReceivable === 0) return Infinity;
  return y.incomeStatement.revenue / y.balanceSheet.accountsReceivable;
}

export function daysReceivablesOutstanding(y: FinancialYear): number {
  const t = receivablesTurnover(y);
  if (!isFinite(t) || t === 0) return 0;
  return 365 / t;
}

export function daysInventoryOutstanding(y: FinancialYear): number {
  const t = inventoryTurnover(y);
  if (!isFinite(t) || t === 0) return 0;
  return 365 / t;
}

export function operatingCashFlowToNetIncome(y: FinancialYear): number {
  if (y.incomeStatement.netIncome === 0) return y.cashFlow.operatingCashFlow > 0 ? Infinity : 0;
  return y.cashFlow.operatingCashFlow / y.incomeStatement.netIncome;
}

export function freeCashFlow(y: FinancialYear): number {
  return y.cashFlow.freeCashFlow ?? (y.cashFlow.operatingCashFlow + y.cashFlow.investingCashFlow);
}

export function analyzeTrend(values: number[]): TrendAnalysis {
  if (values.length < 2) {
    return { direction: "stable", percentageChange: 0, startValue: values[0] ?? 0, endValue: values[0] ?? 0 };
  }
  const startValue = values[0];
  const endValue = values[values.length - 1];
  let percentageChange = 0;
  if (startValue !== 0) {
    percentageChange = ((endValue - startValue) / Math.abs(startValue)) * 100;
  } else if (endValue !== 0) {
    percentageChange = endValue > 0 ? 100 : -100;
  }
  let direction: TrendDirection = "stable";
  if (percentageChange > 5) direction = "improving";
  else if (percentageChange < -5) direction = "deteriorating";
  return { direction, percentageChange, startValue, endValue };
}

export function extractValuesOverTime(years: FinancialYear[], fn: (y: FinancialYear) => number): number[] {
  return [...years].sort((a, b) => a.year - b.year).map(fn);
}

export function getLatestYear(years: FinancialYear[]): FinancialYear {
  return [...years].sort((a, b) => b.year - a.year)[0];
}

export function formatNumber(v: number, decimals = 2): string {
  if (!isFinite(v)) return "N/A";
  return v.toFixed(decimals);
}

export function formatPercentage(v: number): string {
  if (!isFinite(v)) return "N/A";
  return `${v.toFixed(1)}%`;
}
