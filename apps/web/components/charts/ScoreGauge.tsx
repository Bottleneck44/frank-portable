"use client";
import { motion } from "framer-motion";
import clsx from "clsx";

function getScoreColor(score: number) {
  if (score >= 70) return { stroke: "#10b981", gradId: "emerald", pillClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", verdict: "Healthy" };
  if (score >= 45) return { stroke: "#f59e0b", gradId: "amber",   pillClass: "bg-amber-500/15  text-amber-400  border-amber-500/25",  verdict: "Caution" };
  return             { stroke: "#ef4444", gradId: "red",     pillClass: "bg-red-500/15    text-red-400    border-red-500/25",    verdict: "High Risk" };
}

export function ScoreGauge({ score, label = "Composite Score" }: { score: number; label?: string }) {
  const { stroke, gradId, pillClass, verdict } = getScoreColor(score);
  const circumference = Math.PI * 64;
  const arc = (Math.min(score, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="160" height="92" viewBox="0 0 160 92">
          <defs>
            <linearGradient id={`gauge-${gradId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
              <stop offset="100%" stopColor={stroke} stopOpacity="1" />
            </linearGradient>
          </defs>
          {/* Track */}
          <path d="M 16 86 A 64 64 0 0 1 144 86" fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
          {/* Glow */}
          <path d="M 16 86 A 64 64 0 0 1 144 86" fill="none" stroke={stroke} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${circumference}`} strokeDashoffset={circumference - arc * 0.8}
            opacity="0.12" />
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
          <span className={clsx("text-[10px] font-black px-2.5 py-0.5 rounded-full border", pillClass)}>{verdict}</span>
        </div>
      </div>
      <p className="text-xs font-medium text-slate-600 mt-5">{label}</p>
    </div>
  );
}
