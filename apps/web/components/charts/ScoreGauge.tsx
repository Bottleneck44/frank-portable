"use client";
import { motion } from "framer-motion";

function getScoreColor(score: number) {
  if (score >= 70) return { stroke: "#059669", gradId: "emerald", pill: "bg-emerald-100 text-emerald-700", verdict: "Healthy" };
  if (score >= 45) return { stroke: "#d97706", gradId: "amber",   pill: "bg-amber-100 text-amber-700",   verdict: "Caution" };
  return             { stroke: "#dc2626", gradId: "red",     pill: "bg-red-100 text-red-700",       verdict: "High Risk" };
}

export function ScoreGauge({ score, label = "Composite Score" }: { score: number; label?: string }) {
  const { stroke, gradId, pill, verdict } = getScoreColor(score);
  const circumference = Math.PI * 64;
  const arc = (Math.min(score, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="160" height="92" viewBox="0 0 160 92">
          <defs>
            <linearGradient id={`gauge-${gradId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.4" />
              <stop offset="100%" stopColor={stroke} stopOpacity="1" />
            </linearGradient>
          </defs>
          {/* Track */}
          <path d="M 16 86 A 64 64 0 0 1 144 86" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
          {/* Animated arc */}
          <motion.path
            d="M 16 86 A 64 64 0 0 1 144 86"
            fill="none"
            stroke={`url(#gauge-${gradId})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - arc }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          />
          <text x="80" y="80" textAnchor="middle" fontSize="30" fontWeight="800" fill={stroke}>{Math.round(score)}</text>
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1">
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${pill}`}>{verdict}</span>
        </div>
      </div>
      <p className="text-xs font-medium text-slate-500 mt-5">{label}</p>
    </div>
  );
}
