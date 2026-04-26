"use client";
import { RuleResult } from "@/lib/engine/types";
import { AlertTriangle, AlertCircle, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function RedFlagsTable({ redFlags }: { redFlags: RuleResult[] }) {
  if (redFlags.length === 0) return null;
  const criticalCount = redFlags.filter((f) => f.severity === "critical").length;

  return (
    <div className="rounded-xl overflow-hidden border border-red-200 shadow-sm">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 px-4 py-3 flex items-center gap-3 border-b border-red-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-red-800 text-sm">Red Flags Detected</h2>
          <p className="text-xs text-red-600 mt-0.5">
            {redFlags.length} issue{redFlags.length !== 1 ? "s" : ""}
            {criticalCount > 0 && <span className="ml-1 font-semibold">· {criticalCount} critical</span>}
          </p>
        </div>
      </div>
      <div className="divide-y divide-red-50 bg-white">
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
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-red-50/50 transition-colors"
      >
        <div className={`flex h-7 w-7 shrink-0 mt-0.5 items-center justify-center rounded-lg ${isCritical ? "bg-red-100" : "bg-amber-100"}`}>
          <AlertCircle className={`h-3.5 w-3.5 ${isCritical ? "text-red-600" : "text-amber-600"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-slate-800">{flag.ruleName}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
              isCritical ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>{flag.severity}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{flag.message}</p>
        </div>
        <div className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full transition-colors ${expanded ? "bg-violet-100 text-violet-600" : "bg-slate-100 text-slate-400"}`}>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 ml-10 space-y-2.5">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-800">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  <p className="font-bold">What does this mean?</p>
                </div>
                <p className="leading-relaxed">{flag.educationalNote}</p>
              </div>
              {flag.recommendation && (
                <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-xs text-violet-800">
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
