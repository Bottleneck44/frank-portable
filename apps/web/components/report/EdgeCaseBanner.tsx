"use client";
import { EdgeCaseFlag } from "@/lib/engine/types";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export function EdgeCaseBanner({ flags }: { flags: EdgeCaseFlag[] }) {
  const active = flags.filter((f) => f.detected && f.type !== "STALE_FINANCIAL_DATA");
  if (active.length === 0) return null;
  return (
    <div className="space-y-2">
      {active.map((f, i) => (
        <motion.div
          key={f.type}
          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-800 text-sm">{f.description}</p>
            <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">{f.mitigationApplied}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
