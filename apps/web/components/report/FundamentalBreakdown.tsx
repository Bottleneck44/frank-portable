"use client";
import { useState } from "react";
import { FusionResult, RuleResult, CategoryScore } from "@/lib/engine/types";
import { Badge } from "@/components/ui";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Info, BookOpen, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_LABELS: Record<string, string> = {
  profitability: "Profitability",
  liquidity: "Liquidity",
  solvency: "Solvency",
  efficiency: "Efficiency",
  earnings_quality: "Earnings Quality",
  cash_flow: "Cash Flow",
  growth: "Growth",
  red_flags: "Red Flags",
};

const SEVERITY_COLOR: Record<string, "red" | "amber" | "slate" | "blue"> = {
  critical: "red", warning: "amber", caution: "slate", info: "blue",
};

export function FundamentalBreakdown({ result }: { result: FusionResult }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
          <BarChart3 className="h-4 w-4 text-violet-600" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Fundamental Analysis</h2>
      </div>
      {result.categoryScores.map((cs, i) => (
        <motion.div
          key={cs.category}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
        >
          <CategoryAccordion categoryScore={cs}
            rules={result.ruleResults.filter((r) => r.category === cs.category)} />
        </motion.div>
      ))}
    </div>
  );
}

function CategoryAccordion({ categoryScore, rules }: { categoryScore: CategoryScore; rules: RuleResult[] }) {
  const [open, setOpen] = useState(false);
  const scoreColor = categoryScore.score >= 70 ? "text-emerald-600" : categoryScore.score >= 45 ? "text-amber-600" : "text-red-600";
  const barColor = categoryScore.score >= 70 ? "bg-emerald-400" : categoryScore.score >= 45 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className={`border rounded-xl overflow-hidden transition-shadow ${open ? "border-violet-200 shadow-sm" : "border-slate-200"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-slate-50/80 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-slate-100 overflow-hidden flex flex-col justify-end">
            <div
              className={`w-full rounded-full ${barColor} transition-all`}
              style={{ height: `${categoryScore.score}%` }}
            />
          </div>
          <span className="font-semibold text-slate-800 text-sm">{CATEGORY_LABELS[categoryScore.category] ?? categoryScore.category}</span>
          <span className="text-xs text-slate-400">{categoryScore.rulesApplied} rules</span>
          {categoryScore.criticalFails > 0 && <Badge color="red">{categoryScore.criticalFails} critical</Badge>}
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-black text-lg tabular-nums ${scoreColor}`}>{categoryScore.score}</span>
          <div className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${open ? "bg-violet-100 text-violet-600" : "bg-slate-100 text-slate-400"}`}>
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
            <div className="border-t border-slate-100 divide-y divide-slate-50 bg-slate-50/40">
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
    <div className="px-4 py-3 bg-white hover:bg-slate-50/60 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {rule.passed
            ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
            : <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
          <span className="text-sm font-medium text-slate-800 truncate">{rule.ruleName}</span>
          {!rule.passed && <Badge color={SEVERITY_COLOR[rule.severity]}>{rule.severity}</Badge>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {rule.value !== null && (
            <span className="font-mono text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
              {typeof rule.value === "number" ? rule.value.toFixed(2) : rule.value}
            </span>
          )}
          <button
            onClick={() => setShowNote(!showNote)}
            className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${showNote ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400 hover:text-slate-600"}`}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-1 ml-6 leading-relaxed">{rule.message}</p>

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
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  <p className="font-bold">What does this mean?</p>
                </div>
                <p className="leading-relaxed">{rule.educationalNote}</p>
              </div>
              {!rule.passed && rule.recommendation && (
                <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-xs text-violet-800">
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
