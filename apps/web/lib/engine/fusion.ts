import { FundamentalAnalysisResult, EnsemblePrediction, FusionResult } from "./types";
import { applyRiskOverrides } from "./risk-overrides";
import { computeBlendedConfidence } from "./confidence";
import { detectEdgeCases } from "./hks";

export function fuse(
  fundamental: FundamentalAnalysisResult,
  ml: EnsemblePrediction | null,
  ticker: string
): FusionResult {
  const edgeCaseFlags = detectEdgeCases(fundamental, ml);
  const dataWarnings = [...fundamental.dataWarnings];

  // ML fallback
  const technicalScore = ml?.technicalScore ?? 50;
  const technicalConfidence = ml?.technicalConfidence ?? 0;

  // Base weights 60/40
  let fw = 0.60;
  let tw = 0.40;
  const adaptationReasons: string[] = [];

  if (technicalConfidence < 0.40) {
    fw += 0.15; tw -= 0.15;
    adaptationReasons.push("ML confidence low — shifted toward fundamentals");
  }
  if (fundamental.yearsAnalyzed <= 2) {
    fw -= 0.10; tw += 0.10;
    adaptationReasons.push("Only 2 years of financial data — shifted toward technical");
  }
  if (fundamental.fundamentalConfidence < 0.50) {
    fw -= 0.10; tw += 0.10;
    adaptationReasons.push("Fundamental data sparse — shifted toward technical");
  }
  if (!ml) {
    fw = 1.0; tw = 0.0;
    adaptationReasons.push("No ML model available — 100% fundamental weighting");
  }

  fw = Math.max(0.20, Math.min(0.80, fw));
  tw = 1 - fw;

  // Composite
  let compositeScore = Math.round(fundamental.fundamentalScore * fw + technicalScore * tw);

  // Critical flag penalty
  const criticalCount = fundamental.redFlags.filter((r) => r.severity === "critical").length;
  const penalty = Math.min(criticalCount * 8, 25);
  compositeScore = Math.max(0, compositeScore - penalty);

  // Risk overrides
  const override = applyRiskOverrides(compositeScore, fundamental, ml);
  compositeScore = override.adjustedScore;

  // Signal conflict
  const fundCat = fundamental.fundamentalScore >= 70 ? "positive" : fundamental.fundamentalScore <= 40 ? "negative" : "neutral";
  const techCat = technicalScore >= 70 ? "positive" : technicalScore <= 40 ? "negative" : "neutral";
  const signalConflict = (fundCat === "positive" && techCat === "negative") || (fundCat === "negative" && techCat === "positive");

  // Blended confidence
  const blendedConfidence = computeBlendedConfidence(
    fundamental.fundamentalConfidence, technicalConfidence, fw, tw, signalConflict
  );

  // Final verdict
  let verdict: FusionResult["verdict"];
  if (fundamental.yearsAnalyzed < 1) {
    verdict = "Insufficient Data";
  } else if (override.severity === "critical" || compositeScore < 35) {
    verdict = "High Risk";
  } else if (compositeScore < 55 || fundamental.verdict === "High Risk") {
    verdict = "Caution";
  } else if (compositeScore >= 70 && fundamental.verdict === "Healthy") {
    verdict = "Healthy";
  } else {
    verdict = fundamental.verdict;
  }

  // Signal
  let signal: FusionResult["signal"];
  if (override.severity === "critical") {
    signal = "BEARISH";
  } else if (signalConflict) {
    signal = "CONFLICTED";
  } else if (ml) {
    signal = ml.signal === "BULLISH" && fundamental.verdict !== "High Risk" ? "BULLISH"
           : ml.signal === "BEARISH" || fundamental.verdict === "High Risk" ? "BEARISH"
           : "NEUTRAL";
  } else {
    signal = fundamental.verdict === "Healthy" ? "BULLISH" : fundamental.verdict === "High Risk" ? "BEARISH" : "NEUTRAL";
  }

  const signalExplanation = buildSignalExplanation(signal, fundamental, ml, signalConflict, override);

  return {
    ticker,
    companyName: fundamental.companyName,
    analysisDate: new Date().toISOString().split("T")[0],
    fundamentalScore: fundamental.fundamentalScore,
    technicalScore,
    fundamentalConfidence: fundamental.fundamentalConfidence,
    technicalConfidence,
    adaptedFundamentalWeight: fw,
    adaptedTechnicalWeight: tw,
    weightAdaptationReason: adaptationReasons.length > 0 ? adaptationReasons.join("; ") : "Default weights (60% fundamental, 40% technical)",
    compositeScore,
    blendedConfidence,
    signalConflict,
    riskOverrideApplied: override.overrideApplied,
    riskOverrideReason: override.reason ?? null,
    riskOverrideSeverity: override.severity,
    verdict,
    verdictReason: fundamental.verdictReason,
    signal,
    signalExplanation,
    categoryScores: fundamental.categoryScores,
    ruleResults: fundamental.ruleResults,
    redFlags: fundamental.redFlags,
    mlPredictions: ml,
    edgeCaseFlags,
    dataWarnings,
  };
}

function buildSignalExplanation(
  signal: FusionResult["signal"],
  fundamental: FundamentalAnalysisResult,
  ml: EnsemblePrediction | null,
  conflict: boolean,
  override: { overrideApplied: boolean; reason?: string }
): string {
  if (override.overrideApplied && override.reason) return `Risk override applied: ${override.reason}`;
  if (conflict) return `Conflict detected: fundamentals suggest ${fundamental.verdict} but ML model predicts ${ml?.signal ?? "N/A"}. Treat with caution.`;
  if (!ml) return `Signal based on fundamental analysis only (ML not available for this stock)`;
  return `Composite signal derived from ${Math.round(ml.directionalConsensus * 100)}% model consensus and ${fundamental.verdict.toLowerCase()} fundamental health.`;
}
