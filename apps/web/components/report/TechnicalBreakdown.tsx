"use client";
import { EnsemblePrediction } from "@/lib/engine/types";
import { PriceChart } from "@/components/charts/PriceChart";
import { Badge } from "@/components/ui";
import { BrainCircuit, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function TechnicalBreakdown({ ml }: { ml: EnsemblePrediction | null }) {
  if (!ml) {
    return (
      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 flex items-center gap-3 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200">
            <BrainCircuit className="h-4 w-4 text-slate-500" />
          </div>
          <h2 className="font-bold text-slate-700 text-sm">Technical Analysis (ML)</h2>
        </div>
        <div className="bg-white px-6 py-8 text-center">
          <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">ML prediction not available for this stock. Only NIFTY 50 stocks have pre-trained models.</p>
        </div>
      </div>
    );
  }

  const signalColor = ml.signal === "BULLISH" ? "emerald" : ml.signal === "BEARISH" ? "red" : "slate";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl overflow-hidden border border-violet-100 shadow-sm"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-3 flex items-center justify-between border-b border-violet-100">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
            <BrainCircuit className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <h2 className="font-bold text-violet-900 text-sm">Technical Analysis (ML)</h2>
            <p className="text-xs text-violet-500">Machine-learning ensemble prediction</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={signalColor as "emerald" | "red" | "slate"}>{ml.signal}</Badge>
          <span className="text-xs text-slate-500 bg-white border border-slate-100 rounded-full px-2.5 py-0.5">
            {Math.round(ml.technicalConfidence * 100)}% confidence
          </span>
        </div>
      </div>

      <div className="bg-white p-5 space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Technical Score" value={`${ml.technicalScore.toFixed(0)} / 100`} accent="violet" />
          <Stat label="Directional Consensus" value={`${Math.round(ml.directionalConsensus * 100)}% bullish`} accent="emerald" />
          <Stat label="Signal Strength" value={`${Math.round(ml.signalStrength * 100)}%`} accent="blue" />
        </div>

        {/* Price chart */}
        <PriceChart ml={ml} />

        {/* Disclaimer */}
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3.5 text-xs text-amber-700">
          <TrendingUp className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
          <p><span className="font-semibold">Disclaimer: </span>ML predictions are based on historical price patterns (NIFTY 50, 2012–2024). Past performance does not guarantee future results. This is not investment advice.</p>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: "violet" | "emerald" | "blue" }) {
  const accentMap = {
    violet: "border-l-violet-400 bg-violet-50/60",
    emerald: "border-l-emerald-400 bg-emerald-50/60",
    blue: "border-l-blue-400 bg-blue-50/60",
  };
  const textMap = {
    violet: "text-violet-800",
    emerald: "text-emerald-800",
    blue: "text-blue-800",
  };
  return (
    <div className={`border-l-4 rounded-lg p-3 ${accentMap[accent]}`}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`font-bold text-sm ${textMap[accent]}`}>{value}</p>
    </div>
  );
}
