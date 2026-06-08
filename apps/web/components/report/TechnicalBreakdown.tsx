"use client";
import { EnsemblePrediction } from "@/lib/engine/types";
import { PriceChart } from "@/components/charts/PriceChart";
import { BrainCircuit, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

const SIGNAL_STYLE: Record<string, string> = {
  BULLISH:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  BEARISH:  "bg-red-500/10    text-red-400    border-red-500/20",
  NEUTRAL:  "bg-slate-500/10  text-slate-400  border-slate-500/20",
};

export function TechnicalBreakdown({ ml }: { ml: EnsemblePrediction | null }) {
  if (!ml) {
    return (
      <div className="bg-slate-900 border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3 border-b border-white/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/6">
            <BrainCircuit className="h-4 w-4 text-slate-500" />
          </div>
          <h2 className="font-bold text-slate-400 text-sm">Technical Analysis (ML)</h2>
        </div>
        <div className="px-6 py-10 text-center">
          <AlertCircle className="h-8 w-8 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-600">ML prediction not available. Only NIFTY 50 stocks have pre-trained models.</p>
        </div>
      </div>
    );
  }

  const sigStyle = SIGNAL_STYLE[ml.signal] ?? SIGNAL_STYLE.NEUTRAL;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-slate-900 border border-violet-500/20 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15">
            <BrainCircuit className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">Technical Analysis (ML)</h2>
            <p className="text-xs text-slate-600">Machine-learning ensemble prediction</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx("text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest", sigStyle)}>
            {ml.signal}
          </span>
          <span className="text-xs text-slate-600 bg-white/4 border border-white/6 rounded-full px-2.5 py-0.5">
            {Math.round(ml.technicalConfidence * 100)}% conf.
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Technical Score"       value={`${ml.technicalScore.toFixed(0)} / 100`}                accent="violet" />
          <Stat label="Directional Consensus" value={`${Math.round(ml.directionalConsensus * 100)}% bullish`} accent="emerald" />
          <Stat label="Signal Strength"       value={`${Math.round(ml.signalStrength * 100)}%`}               accent="blue" />
        </div>

        {/* Price chart */}
        <PriceChart ml={ml} />

        {/* Disclaimer */}
        <div className="flex items-start gap-2.5 bg-amber-500/8 border border-amber-500/20 rounded-xl p-3.5 text-xs text-amber-400">
          <TrendingUp className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <p>
            <span className="font-semibold">Disclaimer: </span>
            ML predictions are based on historical price patterns (NIFTY 50, 2012–2024). Past performance does not guarantee future results. Not investment advice.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: "violet" | "emerald" | "blue" }) {
  const styles = {
    violet: { border: "border-violet-500/30", bg: "bg-violet-500/8",  text: "text-violet-300" },
    emerald:{ border: "border-emerald-500/30",bg: "bg-emerald-500/8", text: "text-emerald-300" },
    blue:   { border: "border-blue-500/30",   bg: "bg-blue-500/8",    text: "text-blue-300" },
  };
  const s = styles[accent];
  return (
    <div className={clsx("border-l-2 rounded-lg p-3", s.border, s.bg)}>
      <p className="text-xs text-slate-600 mb-1">{label}</p>
      <p className={clsx("font-bold text-sm", s.text)}>{value}</p>
    </div>
  );
}
