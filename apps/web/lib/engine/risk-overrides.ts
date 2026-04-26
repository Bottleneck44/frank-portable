import { FundamentalAnalysisResult, EnsemblePrediction } from "./types";

interface OverrideResult {
  adjustedScore: number;
  overrideApplied: boolean;
  reason?: string;
  severity: "none" | "caution" | "critical";
}

export function applyRiskOverrides(
  score: number,
  fundamental: FundamentalAnalysisResult,
  ml: EnsemblePrediction | null
): OverrideResult {
  let adjustedScore = score;
  let overrideApplied = false;
  let reason: string | undefined;
  let severity: OverrideResult["severity"] = "none";

  const criticals = fundamental.redFlags.filter((r) => r.severity === "critical");
  const warnings = fundamental.redFlags.filter((r) => r.severity === "warning");

  // Hard caps (critical overrides — check in priority order)
  for (const flag of criticals) {
    if (flag.ruleId === "SOLV_004" && !flag.passed) {
      adjustedScore = Math.min(adjustedScore, 30);
      overrideApplied = true; severity = "critical";
      reason = "Negative equity detected — company may be technically insolvent";
      break;
    }
    if (flag.ruleId === "RF_001" && !flag.passed) {
      adjustedScore = Math.min(adjustedScore, 40);
      overrideApplied = true; severity = "critical";
      reason = "Balance sheet does not balance — data integrity issue";
      break;
    }
    if (flag.ruleId === "RF_002" && !flag.passed) {
      adjustedScore = Math.min(adjustedScore, 40);
      overrideApplied = true; severity = "critical";
      reason = "Multiple consecutive years of losses — structural viability concern";
      break;
    }
    if (flag.ruleId === "SOLV_002" && !flag.passed) {
      adjustedScore = Math.max(0, adjustedScore - 20);
      overrideApplied = true; severity = "critical";
      reason = "Dangerously low interest coverage — debt service at risk";
      break;
    }
    if (flag.ruleId === "PROF_003" && !flag.passed) {
      adjustedScore = Math.max(0, adjustedScore - 15);
      if (!overrideApplied) { overrideApplied = true; severity = "critical"; reason = "Company is loss-making"; }
    }
  }

  // Caution penalties (accumulating)
  if (!overrideApplied || severity !== "critical") {
    const deRuleResult = fundamental.ruleResults.find((r) => r.ruleId === "SOLV_001");
    if (deRuleResult && !deRuleResult.passed && typeof deRuleResult.value === "number" && deRuleResult.value > 3.0) {
      adjustedScore = Math.max(0, adjustedScore - 20);
      if (!overrideApplied) { overrideApplied = true; severity = "caution"; reason = "D/E ratio exceeds 3.0 — high financial leverage"; }
    }

    const ocfRule = fundamental.ruleResults.find((r) => r.ruleId === "CF_001");
    if (ocfRule && !ocfRule.passed) {
      adjustedScore = Math.max(0, adjustedScore - 15);
      if (!overrideApplied) { overrideApplied = true; severity = "caution"; reason = "Negative operating cash flow"; }
    }

    const revRule = fundamental.ruleResults.find((r) => r.ruleId === "RF_003");
    if (revRule && !revRule.passed && typeof revRule.value === "number" && revRule.value < -30) {
      adjustedScore = Math.max(0, adjustedScore - 10);
      if (!overrideApplied) { overrideApplied = true; severity = "caution"; reason = "Revenue declined >30%"; }
    }

    if (warnings.length >= 3) {
      adjustedScore = Math.max(0, adjustedScore - 10);
      if (!overrideApplied) { overrideApplied = true; severity = "caution"; reason = `${warnings.length} warning-level flags detected`; }
    }
  }

  return { adjustedScore, overrideApplied, reason, severity };
}
