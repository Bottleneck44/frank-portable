"use client";
import { FusionResult } from "@/lib/engine/types";
import { ScoreGauge } from "@/components/charts/ScoreGauge";
import { Building2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

const VERDICT_STYLE: Record<string, string> = {
  Healthy:            "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Caution:            "bg-amber-500/10  text-amber-400  border-amber-500/20",
  "High Risk":        "bg-red-500/10    text-red-400    border-red-500/20",
  "Insufficient Data":"bg-slate-500/10  text-slate-400  border-slate-500/20",
};
const SIGNAL_STYLE: Record<string, string> = {
  BULLISH:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  BEARISH:    "bg-red-500/10    text-red-400    border-red-500/20",
  NEUTRAL:    "bg-slate-500/10  text-slate-400  border-slate-500/20",
  CONFLICTED: "bg-amber-500/10  text-amber-400  border-amber-500/20",
};

function Pill({ label, style }: { label: string; style: string }) {
  return (
    <span className={clsx("text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest", style)}>
      {label}
    </span>
  );
}

export function VerdictHeader({ result }: { result: FusionResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-900 border border-white/8 rounded-2xl overflow-hidden"
    >
      <div className="h-px bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

      <div className="p-6 md:p-8">
        {/* Company header */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white leading-tight tracking-tight">{result.companyName}</h1>
              <p className="text-xs text-slate-600 mt-0.5 font-mono">{result.ticker} · {result.analysisDate}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Pill label={result.verdict} style={VERDICT_STYLE[result.verdict] ?? VERDICT_STYLE["Insufficient Data"]} />
            <Pill label={result.signal}  style={SIGNAL_STYLE[result.signal]   ?? SIGNAL_STYLE.NEUTRAL} />
          </div>
        </div>

        {/* Score area */}
        <div className="flex items-center gap-6 flex-wrap md:flex-nowrap">
          <ScoreGauge score={result.compositeScore} label="Composite Score" />
          <div className="flex-1 min-w-0 space-y-4">
            <ScoreBar label="Fundamental" score={result.fundamentalScore} weight={result.adaptedFundamentalWeight} />
            <ScoreBar label="Technical (ML)" score={result.technicalScore} weight={result.adaptedTechnicalWeight} />
            <div className="flex items-center justify-between text-xs bg-white/4 border border-white/6 rounded-xl px-4 py-2.5">
              <span className="text-slate-500">
                <span className="font-semibold text-slate-300">Confidence:</span> {Math.round(result.blendedConfidence * 100)}%
              </span>
              {result.signalConflict && (
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <AlertTriangle className="h-3 w-3" /> Signal conflict
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Risk override */}
        {result.riskOverrideApplied && (
          <div className="mt-5 flex items-start gap-2.5 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p><span className="font-semibold">Risk Override: </span>{result.riskOverrideReason}</p>
          </div>
        )}

        {/* Signal explanation */}
        <p className="mt-5 text-sm text-slate-500 leading-relaxed border-t border-white/5 pt-5">{result.signalExplanation}</p>
      </div>
    </motion.div>
  );
}

function ScoreBar({ label, score, weight }: { label: string; score: number; weight: number }) {
  const trackColor = score >= 70 ? "bg-emerald-500" : score >= 45 ? "bg-amber-500" : "bg-red-500";
  const labelColor = score >= 70 ? "text-emerald-400" : score >= 45 ? "text-amber-400" : "text-red-400";
  return (
    <div>
      <div className="flex justify-between text-xs mb-2">
        <span className="text-slate-400 font-medium">{label}</span>
        <span className={clsx("font-black tabular-nums", labelColor)}>
          {Math.round(score)}{" "}
          <span className="text-slate-600 font-normal">({Math.round(weight * 100)}% weight)</span>
        </span>
      </div>
      <div className="h-2 bg-white/6 rounded-full overflow-hidden">
        <motion.div
          className={clsx("h-full rounded-full", trackColor)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}
