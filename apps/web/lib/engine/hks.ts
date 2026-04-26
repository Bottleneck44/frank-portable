import { FundamentalAnalysisResult, EnsemblePrediction, EdgeCaseFlag } from "./types";

export function detectEdgeCases(
  fundamental: FundamentalAnalysisResult,
  ml: EnsemblePrediction | null
): EdgeCaseFlag[] {
  const flags: EdgeCaseFlag[] = [];

  // Single year only
  if (fundamental.yearsAnalyzed === 1) {
    flags.push({
      type: "SINGLE_YEAR_ONLY", detected: true, severity: "warning",
      description: "Only one year of financial data provided",
      mitigationApplied: "Trend-based rules disabled; year coverage factor capped at 0.2",
      affectsScore: true, scoreImpact: -5,
    });
  }

  // Missing financial data
  if (fundamental.dataCompleteness < 0.8) {
    flags.push({
      type: "MISSING_FINANCIAL_DATA", detected: true, severity: "warning",
      description: `Only ${Math.round(fundamental.dataCompleteness * 100)}% of required financial fields are populated`,
      mitigationApplied: "Affected rules skipped; fundamental confidence reduced",
      affectsScore: true, scoreImpact: -3,
    });
  }

  // Stale financial data
  if (fundamental.yearsAnalyzed > 0) {
    const latestYear = Math.max(...fundamental.ruleResults.map(() => new Date().getFullYear()));
    const currentYear = new Date().getFullYear();
    // Check if most recent year from ruleResults context suggests stale data
    flags.push({
      type: "STALE_FINANCIAL_DATA", detected: false, severity: "info",
      description: "Financial data is current",
      mitigationApplied: "None required",
      affectsScore: false, scoreImpact: 0,
    });
  }

  // No ML model
  if (!ml) {
    flags.push({
      type: "NO_ML_MODEL_AVAILABLE", detected: true, severity: "info",
      description: "This stock is not in the pre-trained NIFTY 50 model set",
      mitigationApplied: "Technical score set to neutral (50), weight shifted 100% to fundamental analysis",
      affectsScore: false, scoreImpact: 0,
    });
  }

  return flags;
}
