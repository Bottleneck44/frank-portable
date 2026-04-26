export function computeBlendedConfidence(
  fundamentalConfidence: number,
  technicalConfidence: number,
  fundamentalWeight: number,
  technicalWeight: number,
  signalConflict: boolean
): number {
  const weighted = fundamentalConfidence * fundamentalWeight + technicalConfidence * technicalWeight;
  const conflictPenalty = signalConflict ? 0.10 : 0.0;
  return Math.max(0, Math.min(1, weighted - conflictPenalty));
}
