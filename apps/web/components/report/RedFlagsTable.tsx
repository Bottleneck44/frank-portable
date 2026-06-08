"use client";
import { RuleResult } from "@/lib/engine/types";
import { AlertTriangle, AlertCircle, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export function RedFlagsTable({ redFlags }: { redFlags: RuleResult[] }) {
  if (redFlags.length === 0) return null;
  const criticalCount = redFlags.filter((f) => f.severity === "critical").length;

  return (
    <div className="bg-slate-900 border border-red-500/20 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-3 border-b border-red-500/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/15">
          <AlertTriangle className="h-4 w-4 text-red-400" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-red-300 text-sm">Red Flags Detected</h2>
          <p className="text-xs text-red-500/70 mt-0.5">
            {redFlags.length} issue{redFlags.length !== 1 ? "s" : ""}
            {criticalCount > 0 && <span className="ml-1 font-semibold">· {criticalCount} critical</span>}
          </p>
        </div>
      </div>
      <div className="divide-y divide-white/4">
        {redFlags.map((flag) => <FlagRow key={flag.ruleId} flag={flag} />)}
      </div>
    </div>
  );
}

function FlagRow({ flag }: { flag: RuleResult }) {
  const [expanded, setExpanded] = useState(false);
  const isCritical = flag.severity === "critical";
  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-red-500/4 transition-colors"
      >
        <div className={clsx(
          "flex h-7 w-7 shrink-0 mt-0.5 items-center justify-center rounded-xl",
          isCritical ? "bg-red-500/15" : "bg-amber-500/15"
        )}>
          <AlertCircle className={clsx("h-3.5 w-3.5", isCritical ? "text-red-400" : "text-amber-400")} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-slate-200">{flag.ruleName}</span>
            <span className={clsx(
              "text-[10px] px-2 py-0.5 rounded-full font-bold border",
              isCritical
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            )}>{flag.severity}</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{flag.message}</p>
        </div>
        <div className={clsx(
          "shrink-0 flex h-6 w-6 items-center justify-center rounded-full transition-colors",
          expanded ? "bg-violet-500/20 text-violet-400" : "bg-white/6 text-slate-500"
        )}>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 ml-10 space-y-2">
              <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-3.5 text-xs text-blue-300">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  <p className="font-bold">What does this mean?</p>
                </div>
                <p className="leading-relaxed text-blue-400/80">{flag.educationalNote}</p>
              </div>
              {flag.recommendation && (
                <div className="bg-violet-500/8 border border-violet-500/20 rounded-xl p-3 text-xs text-violet-300">
                  <span className="font-bold">Recommendation: </span>{flag.recommendation}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
