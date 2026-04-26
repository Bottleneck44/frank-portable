"use client";
import { EnsemblePrediction } from "@/lib/engine/types";
import { TrendingUp, TrendingDown } from "lucide-react";

export function PriceChart({ ml }: { ml: EnsemblePrediction }) {
  const isPredUp = ml.ensemblePredictedPrice >= ml.actualPrice;
  const pct = Math.abs(ml.ensemblePredictedReturn * 100).toFixed(2);

  return (
    <div className="space-y-4">
      {/* Price summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <p className="text-xs text-slate-500 mb-1">Current Price</p>
          <p className="text-lg font-black text-slate-900">₹{ml.actualPrice.toFixed(2)}</p>
        </div>
        <div className={`rounded-xl p-3 border ${isPredUp ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
          <p className={`text-xs mb-1 ${isPredUp ? "text-emerald-600" : "text-red-600"}`}>Predicted (next day)</p>
          <p className={`text-lg font-black ${isPredUp ? "text-emerald-700" : "text-red-700"}`}>
            ₹{ml.ensemblePredictedPrice.toFixed(2)}
          </p>
        </div>
        <div className={`rounded-xl p-3 border flex flex-col items-center justify-center gap-1 ${isPredUp ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
          {isPredUp
            ? <TrendingUp className="h-5 w-5 text-emerald-600" />
            : <TrendingDown className="h-5 w-5 text-red-600" />}
          <span className={`text-sm font-black ${isPredUp ? "text-emerald-700" : "text-red-700"}`}>
            {isPredUp ? "+" : "-"}{pct}%
          </span>
        </div>
      </div>

      {/* Per-model cards */}
      <div className="grid grid-cols-2 gap-3">
        {ml.predictions.map((p) => {
          const up = p.predictedPrice >= ml.actualPrice;
          return (
            <div key={p.modelName} className="bg-white rounded-xl border border-slate-200 p-3 hover:border-violet-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{p.modelName}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${up ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {up ? "▲" : "▼"}
                </span>
              </div>
              <p className="text-base font-black text-slate-900 mb-1">₹{p.predictedPrice.toFixed(2)}</p>
              <div className="flex gap-3 text-xs text-slate-400">
                <span>R² <span className="text-slate-600 font-semibold">{p.r2.toFixed(3)}</span></span>
                <span>DA <span className="text-slate-600 font-semibold">{(p.directionalAccuracy * 100).toFixed(0)}%</span></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
