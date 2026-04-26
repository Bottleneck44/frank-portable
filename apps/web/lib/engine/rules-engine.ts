import { FinancialYear, FundamentalAnalysisResult, CategoryScore, RuleResult, RuleCategory } from "./types";
import { ALL_RULES, RULE_ENGINE_VERSION } from "./rules";
import { getLatestYear } from "./utils";

const CATEGORY_WEIGHTS: Record<RuleCategory, number> = {
  profitability: 0.20,
  liquidity: 0.15,
  solvency: 0.15,
  efficiency: 0.10,
  earnings_quality: 0.15,
  cash_flow: 0.15,
  growth: 0.05,
  red_flags: 0.05,
};

const SEVERITY_ORDER: Record<string, number> = { critical: 0, warning: 1, caution: 2, info: 3 };

export function runRulesEngine(
  years: FinancialYear[],
  ticker?: string,
  companyName = "Unknown"
): FundamentalAnalysisResult {
  const results: RuleResult[] = ALL_RULES.map((rule) => {
    try {
      const partial = rule.evaluate(years);
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        category: rule.category,
        severity: rule.severity,
        educationalNote: rule.educationalNote,
        recommendation: partial.recommendation ?? "",
        ...partial,
      } as RuleResult;
    } catch {
      return {
        ruleId: rule.id, ruleName: rule.name, category: rule.category,
        severity: rule.severity, passed: true, value: null, threshold: null,
        message: "Rule could not be evaluated due to missing data",
        recommendation: "", educationalNote: rule.educationalNote,
      };
    }
  });

  // Sort: failed first, then by severity
  results.sort((a, b) => {
    if (a.passed !== b.passed) return a.passed ? 1 : -1;
    return (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3);
  });

  // Category scores
  const categories = Object.keys(CATEGORY_WEIGHTS) as RuleCategory[];
  const categoryScores: CategoryScore[] = categories.map((cat) => {
    const catRules = results.filter((r) => r.category === cat);
    if (catRules.length === 0) return { category: cat, score: 100, weight: CATEGORY_WEIGHTS[cat], rulesApplied: 0, rulesFailed: 0, criticalFails: 0 };
    const passed = catRules.filter((r) => r.passed).length;
    const score = Math.round((passed / catRules.length) * 100);
    return {
      category: cat,
      score,
      weight: CATEGORY_WEIGHTS[cat],
      rulesApplied: catRules.length,
      rulesFailed: catRules.length - passed,
      criticalFails: catRules.filter((r) => !r.passed && r.severity === "critical").length,
    };
  });

  // Weighted fundamental score
  const fundamentalScore = Math.round(
    categoryScores.reduce((sum, cs) => sum + cs.score * cs.weight, 0)
  );

  // Confidence
  const filledFields = countFilledFields(years[years.length - 1] ?? years[0]);
  const dataCompleteness = filledFields / 28;
  const yearCoverage = Math.min(years.length / 5, 1.0);
  const applicableRules = results.filter((r) => r.value !== null).length;
  const ruleCoverage = applicableRules / results.length;
  const fundamentalConfidence = 0.40 * dataCompleteness + 0.35 * yearCoverage + 0.25 * ruleCoverage;

  const redFlags = results.filter((r) => !r.passed && (r.severity === "critical" || r.severity === "warning"));

  // Verdict
  const criticalFails = results.filter((r) => !r.passed && r.severity === "critical").length;
  const warningFails = results.filter((r) => !r.passed && r.severity === "warning").length;
  let verdict: FundamentalAnalysisResult["verdict"];
  let verdictReason: string;
  if (criticalFails >= 2 || (criticalFails >= 1 && warningFails >= 2)) {
    verdict = "High Risk";
    verdictReason = `${criticalFails} critical and ${warningFails} warning issues detected`;
  } else if (criticalFails === 1 || warningFails >= 3) {
    verdict = "High Risk";
    verdictReason = criticalFails === 1 ? `Critical issue: ${redFlags[0]?.ruleName}` : `${warningFails} warning-level issues detected`;
  } else if (warningFails >= 1 || results.filter((r) => !r.passed && r.severity === "caution").length >= 3) {
    verdict = "Caution";
    verdictReason = `${warningFails} warnings and ${results.filter((r) => !r.passed && r.severity === "caution").length} caution-level issues`;
  } else {
    verdict = "Healthy";
    verdictReason = "No significant financial risk indicators detected";
  }

  return {
    ticker,
    companyName,
    fundamentalScore,
    fundamentalConfidence: Math.min(1, Math.max(0, fundamentalConfidence)),
    dataCompleteness,
    yearsAnalyzed: years.length,
    categoryScores,
    ruleResults: results,
    redFlags,
    verdict,
    verdictReason,
    hasDataWarnings: dataCompleteness < 0.8,
    dataWarnings: dataCompleteness < 0.8 ? ["Some financial data fields are missing — analysis may be incomplete"] : [],
  };
}

function countFilledFields(year: FinancialYear): number {
  if (!year) return 0;
  const is = year.incomeStatement;
  const bs = year.balanceSheet;
  const cf = year.cashFlow;
  let count = 0;
  const fields = [
    is.revenue, is.cogs, is.grossProfit, is.operatingExpenses, is.operatingIncome,
    is.interestExpense, is.taxExpense, is.netIncome,
    bs.cashAndEquivalents, bs.accountsReceivable, bs.inventory, bs.currentAssets, bs.totalAssets,
    bs.accountsPayable, bs.shortTermDebt, bs.currentLiabilities, bs.longTermDebt, bs.totalLiabilities,
    bs.shareholderEquity,
    cf.operatingCashFlow, cf.investingCashFlow, cf.financingCashFlow,
  ];
  for (const f of fields) { if (f !== null && f !== undefined && !isNaN(f as number)) count++; }
  return count;
}
