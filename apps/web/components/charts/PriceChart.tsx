"use client";
import { EnsemblePrediction } from "@/lib/engine/types";
import { TrendingUp, TrendingDown } from "lucide-react";
import clsx from "clsx";

export function PriceChart({ ml }: { ml: EnsemblePrediction }) {
  const isPredUp = ml.ensemblePredictedPrice >= ml.actualPrice;
  const pct = Math.abs(ml.ensemblePredictedReturn * 100).toFixed(2);

  return (
    <div className="space-y-3">
      {/* Price summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/4 border border-white/8 rounded-xl p-3">
          <p className="text-xs text-slate-600 mb-1">Current Price</p>
          <p className="text-lg font-black text-white tabular-nums">₹{ml.actualPrice.toFixed(2)}</p>
        </div>
        <div className={clsx(
          "rounded-xl p-3 border",
          isPredUp ? "bg-emerald-500/8 border-emerald-500/20" : "bg-red-500/8 border-red-500/20"
        )}>
          <p className={clsx("text-xs mb-1", isPredUp ? "text-emerald-600" : "text-red-600")}>Predicted (next day)</p>
          <p className={clsx("text-lg font-black tabular-nums", isPredUp ? "text-emerald-400" : "text-red-400")}>
            ₹{ml.ensemblePredictedPrice.toFixed(2)}
          </p>
        </div>
        <div className={clsx(
          "rounded-xl p-3 border flex flex-col items-center justify-center gap-1",
          isPredUp ? "bg-emerald-500/8 border-emerald-500/20" : "bg-red-500/8 border-red-500/20"
        )}>
          {isPredUp
            ? <TrendingUp className="h-5 w-5 text-emerald-400" />
            : <TrendingDown className="h-5 w-5 text-red-400" />}
          <span className={clsx("text-sm font-black tabular-nums", isPredUp ? "text-emerald-400" : "text-red-400")}>
            {isPredUp ? "+" : "-"}{pct}%
          </span>
        </div>
      </div>

      {/* Per-model cards */}
      <div className="grid grid-cols-2 gap-3">
        {ml.predictions.map((p) => {
          const up = p.predictedPrice >= ml.actualPrice;
          return (
            <div key={p.modelName}
              className="bg-white/4 border border-white/8 rounded-xl p-3 hover:border-violet-500/25 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{p.modelName}</span>
                <span className={clsx(
                  "text-xs font-bold px-2 py-0.5 rounded-full border",
                  up
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                )}>
                  {up ? "▲" : "▼"}
                </span>
              </div>
              <p className="text-base font-black text-white mb-1 tabular-nums">₹{p.predictedPrice.toFixed(2)}</p>
              <div className="flex gap-3 text-xs text-slate-600">
                <span>R² <span className="text-slate-400 font-semibold">{p.r2.toFixed(3)}</span></span>
                <span>DA <span className="text-slate-400 font-semibold">{(p.directionalAccuracy * 100).toFixed(0)}%</span></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
