"use client";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { CategoryScore } from "@/lib/engine/types";

const CATEGORY_LABELS: Record<string, string> = {
  profitability: "Profit",
  liquidity: "Liquidity",
  solvency: "Solvency",
  efficiency: "Efficiency",
  earnings_quality: "Earnings",
  cash_flow: "Cash Flow",
  growth: "Growth",
  red_flags: "Red Flags",
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { dimension: string; score: number } }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = d.score >= 70 ? "#059669" : d.score >= 45 ? "#d97706" : "#dc2626";
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="font-bold text-slate-800 mb-1">{d.dimension}</p>
      <p style={{ color }} className="font-black text-sm">{d.score}<span className="text-slate-400 font-normal"> / 100</span></p>
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
            <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#7c3aed"
          fill="url(#radarFill)"
          strokeWidth={2.5}
          dot={{ fill: "#7c3aed", r: 3, strokeWidth: 0 }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
