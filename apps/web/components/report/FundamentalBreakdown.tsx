"use client";
import { useState } from "react";
import { FusionResult, RuleResult, CategoryScore } from "@/lib/engine/types";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Info, BookOpen, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const CATEGORY_LABELS: Record<string, string> = {
  profitability:    "Profitability",
  liquidity:        "Liquidity",
  solvency:         "Solvency",
  efficiency:       "Efficiency",
  earnings_quality: "Earnings Quality",
  cash_flow:        "Cash Flow",
  growth:           "Growth",
  red_flags:        "Red Flags",
};

const SEVERITY_STYLE: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  warning:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  caution:  "bg-slate-500/10 text-slate-400 border-slate-500/20",
  info:     "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export function FundamentalBreakdown({ result }: { result: FusionResult }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15">
          <BarChart3 className="h-4 w-4 text-violet-400" />
        </div>
        <h2 className="text-base font-bold text-white">Fundamental Analysis</h2>
      </div>
      {result.categoryScores.map((cs, i) => (
        <motion.div
          key={cs.category}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
        >
          <CategoryAccordion
            categoryScore={cs}
            rules={result.ruleResults.filter((r) => r.category === cs.category)}
          />
        </motion.div>
      ))}
    </div>
  );
}

function CategoryAccordion({ categoryScore, rules }: { categoryScore: CategoryScore; rules: RuleResult[] }) {
  const [open, setOpen] = useState(false);
  const scoreColor = categoryScore.score >= 70 ? "text-emerald-400" : categoryScore.score >= 45 ? "text-amber-400" : "text-red-400";
  const barColor   = categoryScore.score >= 70 ? "bg-emerald-500" : categoryScore.score >= 45 ? "bg-amber-500"   : "bg-red-500";

  return (
    <div className={clsx(
      "border rounded-xl overflow-hidden transition-all",
      open ? "border-violet-500/25 bg-slate-900" : "border-white/6 bg-slate-900/60"
    )}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/3 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-white/6 overflow-hidden flex flex-col justify-end">
            <div className={clsx("w-full rounded-full transition-all", barColor)} style={{ height: `${categoryScore.score}%` }} />
          </div>
          <span className="font-semibold text-slate-200 text-sm">{CATEGORY_LABELS[categoryScore.category] ?? categoryScore.category}</span>
          <span className="text-xs text-slate-600">{categoryScore.rulesApplied} rules</span>
          {categoryScore.criticalFails > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full border bg-red-500/10 text-red-400 border-red-500/20">
              {categoryScore.criticalFails} critical
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={clsx("font-black text-lg tabular-nums", scoreColor)}>{categoryScore.score}</span>
          <div className={clsx(
            "flex h-6 w-6 items-center justify-center rounded-full transition-colors",
            open ? "bg-violet-500/20 text-violet-400" : "bg-white/6 text-slate-500"
          )}>
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 divide-y divide-white/4">
              {rules.map((rule) => <RuleRow key={rule.ruleId} rule={rule} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RuleRow({ rule }: { rule: RuleResult }) {
  const [showNote, setShowNote] = useState(false);
  return (
    <div className="px-4 py-3 hover:bg-white/3 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {rule.passed
            ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
            : <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
          <span className="text-sm font-medium text-slate-200 truncate">{rule.ruleName}</span>
          {!rule.passed && (
            <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0", SEVERITY_STYLE[rule.severity])}>
              {rule.severity}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {rule.value !== null && (
            <span className="font-mono text-xs bg-white/6 text-slate-400 px-1.5 py-0.5 rounded-md">
              {typeof rule.value === "number" ? rule.value.toFixed(2) : rule.value}
            </span>
          )}
          <button
            onClick={() => setShowNote(!showNote)}
            className={clsx(
              "flex h-6 w-6 items-center justify-center rounded-full transition-colors",
              showNote ? "bg-blue-500/20 text-blue-400" : "bg-white/6 text-slate-500 hover:text-slate-300"
            )}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-600 mt-1 ml-6 leading-relaxed">{rule.message}</p>

      <AnimatePresence>
        {showNote && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="mt-2 ml-6 space-y-1.5">
              <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  <p className="font-bold">What does this mean?</p>
                </div>
                <p className="leading-relaxed text-blue-400/80">{rule.educationalNote}</p>
              </div>
              {!rule.passed && rule.recommendation && (
                <div className="bg-violet-500/8 border border-violet-500/20 rounded-xl p-3 text-xs text-violet-300">
                  <span className="font-bold">Recommendation: </span>{rule.recommendation}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
