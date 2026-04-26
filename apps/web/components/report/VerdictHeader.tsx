"use client";
import { FusionResult } from "@/lib/engine/types";
import { Badge } from "@/components/ui";
import { ScoreGauge } from "@/components/charts/ScoreGauge";
import { Building2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const VERDICT_COLOR: Record<string, "emerald" | "amber" | "red" | "slate"> = {
  Healthy: "emerald", Caution: "amber", "High Risk": "red", "Insufficient Data": "slate",
};
const SIGNAL_COLOR: Record<string, "emerald" | "red" | "slate" | "amber"> = {
  BULLISH: "emerald", BEARISH: "red", NEUTRAL: "slate", CONFLICTED: "amber",
};

export function VerdictHeader({ result }: { result: FusionResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
    >
      {/* Top gradient bar */}
      <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

      <div className="p-6">
        {/* Company header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight">{result.companyName}</h1>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{result.ticker} · {result.analysisDate}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge color={VERDICT_COLOR[result.verdict]}>{result.verdict}</Badge>
            <Badge color={SIGNAL_COLOR[result.signal]}>{result.signal}</Badge>
          </div>
        </div>

        {/* Score area */}
        <div className="flex items-center gap-6">
          <ScoreGauge score={result.compositeScore} label="Composite Score" />
          <div className="flex-1 space-y-3">
            <ScoreBar label="Fundamental" score={result.fundamentalScore} weight={result.adaptedFundamentalWeight} />
            <ScoreBar label="Technical (ML)" score={result.technicalScore} weight={result.adaptedTechnicalWeight} />
            <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
              <span className="text-slate-500">
                <span className="font-semibold text-slate-700">Confidence:</span> {Math.round(result.blendedConfidence * 100)}%
              </span>
              {result.signalConflict && (
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <AlertTriangle className="h-3 w-3" /> Signal conflict
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Risk override */}
        {result.riskOverrideApplied && (
          <div className="mt-4 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
            <p><span className="font-semibold">Risk Override: </span>{result.riskOverrideReason}</p>
          </div>
        )}

        {/* Signal explanation */}
        <p className="mt-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">{result.signalExplanation}</p>
      </div>
    </motion.div>
  );
}

function ScoreBar({ label, score, weight }: { label: string; score: number; weight: number }) {
  const trackColor = score >= 70 ? "bg-emerald-500" : score >= 45 ? "bg-amber-500" : "bg-red-500";
  const labelColor = score >= 70 ? "text-emerald-600" : score >= 45 ? "text-amber-600" : "text-red-600";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className={`font-bold ${labelColor}`}>
          {score} <span className="text-slate-400 font-normal">({Math.round(weight * 100)}% weight)</span>
        </span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${trackColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}
