// FinSight — All TypeScript schemas (source of truth)
// Field names aligned with FRIE financials.ts schema

// ─── Financial Statement Input ───────────────────────────────────────────────

export interface IncomeStatement {
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;      // EBIT
  interestExpense: number;
  taxExpense: number;
  netIncome: number;
}

export interface BalanceSheet {
  cashAndEquivalents: number;
  accountsReceivable: number;
  inventory: number;
  currentAssets: number;
  totalAssets: number;
  accountsPayable: number;
  shortTermDebt: number;
  currentLiabilities: number;
  longTermDebt: number;
  totalLiabilities: number;
  shareholderEquity: number;
}

export interface CashFlow {
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  freeCashFlow?: number;
}

export interface FinancialYear {
  year: number;
  isAudited?: boolean;
  incomeStatement: IncomeStatement;
  balanceSheet: BalanceSheet;
  cashFlow: CashFlow;
}

export type FinancialHistory = FinancialYear[];

export interface FinancialStatementInput {
  ticker?: string;
  companyName: string;
  sector?: string;
  currency?: string;
  years: FinancialYear[];
}

// ─── Rules Engine ────────────────────────────────────────────────────────────

export type RuleSeverity = "info" | "caution" | "warning" | "critical";

export type RuleCategory =
  | "profitability"
  | "liquidity"
  | "solvency"
  | "efficiency"
  | "earnings_quality"
  | "cash_flow"
  | "growth"
  | "red_flags";

export type TrendDirection = "improving" | "stable" | "deteriorating";

export interface TrendAnalysis {
  direction: TrendDirection;
  percentageChange: number;
  startValue: number;
  endValue: number;
}

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  category: RuleCategory;
  passed: boolean;
  severity: RuleSeverity;
  value: number | string | null;
  threshold: number | string | null;
  message: string;
  recommendation: string;
  educationalNote: string;
  trend?: TrendDirection;
}

export interface CategoryScore {
  category: RuleCategory;
  score: number;
  weight: number;
  rulesApplied: number;
  rulesFailed: number;
  criticalFails: number;
}

export interface FundamentalAnalysisResult {
  ticker?: string;
  companyName: string;
  fundamentalScore: number;
  fundamentalConfidence: number;
  dataCompleteness: number;
  yearsAnalyzed: number;
  categoryScores: CategoryScore[];
  ruleResults: RuleResult[];
  redFlags: RuleResult[];
  verdict: "Healthy" | "Caution" | "High Risk";
  verdictReason: string;
  hasDataWarnings: boolean;
  dataWarnings: string[];
}

export interface RuleDefinition {
  id: string;
  name: string;
  category: RuleCategory;
  severity: RuleSeverity;
  description: string;
  educationalNote: string;
  evaluate: (years: FinancialYear[]) => {
    passed: boolean;
    value: number | string | null;
    threshold: number | string | null;
    message: string;
    recommendation?: string;
    trend?: TrendDirection;
  };
}

// ─── ML / Technical ──────────────────────────────────────────────────────────

export interface SingleModelPrediction {
  modelName: string;
  predictedReturn: number;
  predictedPrice: number;
  r2: number;
  directionalAccuracy: number;
  mae: number;
  mape: number;
}

export interface EnsemblePrediction {
  ticker: string;
  predictionDate: string;
  actualPrice: number;
  predictions: SingleModelPrediction[];
  ensemblePredictedReturn: number;
  ensemblePredictedPrice: number;
  directionalConsensus: number;
  technicalScore: number;
  technicalConfidence: number;
  signal: "BULLISH" | "BEARISH" | "NEUTRAL";
  signalStrength: number;
}

// ─── Edge Cases ───────────────────────────────────────────────────────────────

export type EdgeCaseType =
  | "MISSING_FINANCIAL_DATA"
  | "SINGLE_YEAR_ONLY"
  | "PENNY_STOCK"
  | "IPO_UNDER_ONE_YEAR"
  | "NO_ML_MODEL_AVAILABLE"
  | "INSUFFICIENT_PRICE_HISTORY"
  | "STALE_FINANCIAL_DATA"
  | "EXTREME_VOLATILITY";

export interface EdgeCaseFlag {
  type: EdgeCaseType;
  detected: boolean;
  severity: "info" | "warning" | "critical";
  description: string;
  mitigationApplied: string;
  affectsScore: boolean;
  scoreImpact: number;
}

// ─── Fusion Result ────────────────────────────────────────────────────────────

export interface FusionResult {
  ticker: string;
  companyName: string;
  analysisDate: string;

  fundamentalScore: number;
  technicalScore: number;
  fundamentalConfidence: number;
  technicalConfidence: number;

  adaptedFundamentalWeight: number;
  adaptedTechnicalWeight: number;
  weightAdaptationReason: string;

  compositeScore: number;
  blendedConfidence: number;
  signalConflict: boolean;

  riskOverrideApplied: boolean;
  riskOverrideReason: string | null;
  riskOverrideSeverity: "none" | "caution" | "critical";

  verdict: "Healthy" | "Caution" | "High Risk" | "Insufficient Data";
  verdictReason: string;
  signal: "BULLISH" | "BEARISH" | "NEUTRAL" | "CONFLICTED";
  signalExplanation: string;

  categoryScores: CategoryScore[];
  ruleResults: RuleResult[];
  redFlags: RuleResult[];
  mlPredictions: EnsemblePrediction | null;

  edgeCaseFlags: EdgeCaseFlag[];
  dataWarnings: string[];
}

// ─── Raw Market Data ──────────────────────────────────────────────────────────

export interface RawPriceData {
  ticker: string;
  dates: string[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
  adjClose: number[];
}
