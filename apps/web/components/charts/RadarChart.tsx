"use client";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { CategoryScore } from "@/lib/engine/types";

const CATEGORY_LABELS: Record<string, string> = {
  profitability:    "Profit",
  liquidity:        "Liquidity",
  solvency:         "Solvency",
  efficiency:       "Efficiency",
  earnings_quality: "Earnings",
  cash_flow:        "Cash Flow",
  growth:           "Growth",
  red_flags:        "Red Flags",
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { dimension: string; score: number } }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = d.score >= 70 ? "#10b981" : d.score >= 45 ? "#f59e0b" : "#ef4444";
  return (
    <div className="bg-slate-800 border border-white/10 rounded-xl px-3 py-2 shadow-2xl text-xs">
      <p className="font-bold text-slate-200 mb-1">{d.dimension}</p>
      <p style={{ color }} className="font-black text-sm tabular-nums">
        {d.score}<span className="text-slate-500 font-normal"> / 100</span>
      </p>
    </div>
  );
}

export function FundamentalRadarChart({ categoryScores }: { categoryScores: CategoryScore[] }) {
  const data = categoryScores.map((cs) => ({
    dimension: CATEGORY_LABELS[cs.category] ?? cs.category,
    score: cs.score,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <defs>
          <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#7c3aed" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <PolarGrid stroke="#1e293b" strokeDasharray="3 3" />
        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: "#475569", fontWeight: 600 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#7c3aed"
          fill="url(#radarFill)"
          strokeWidth={2}
          dot={{ fill: "#7c3aed", r: 3, strokeWidth: 0 }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
