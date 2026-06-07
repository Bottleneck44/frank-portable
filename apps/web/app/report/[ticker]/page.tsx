"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FusionResult } from "@/lib/engine/types";
import { useAnalysisStore } from "@/store/analysis-store";
import { VerdictHeader } from "@/components/report/VerdictHeader";
import { FundamentalBreakdown } from "@/components/report/FundamentalBreakdown";
import { TechnicalBreakdown } from "@/components/report/TechnicalBreakdown";
import { RedFlagsTable } from "@/components/report/RedFlagsTable";
import { EdgeCaseBanner } from "@/components/report/EdgeCaseBanner";
import { FundamentalRadarChart } from "@/components/charts/RadarChart";
import { Spinner } from "@/components/ui";
import { ArrowLeft, LayoutDashboard, AlertTriangle, Search } from "lucide-react";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = decodeURIComponent(params.ticker as string);
  const { currentResult, history } = useAnalysisStore();
  const [result, setResult] = useState<FusionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentResult?.ticker === ticker) { setResult(currentResult); return; }
    const fromHistory = history.find((h) => h.ticker === ticker);
    if (fromHistory) { setResult(fromHistory.result); return; }
    setLoading(true);
    fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticker }) })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setResult(data.result);
        useAnalysisStore.getState().setCurrentResult(data.result);
        useAnalysisStore.getState().addToHistory(data.result);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [ticker, currentResult, history]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-600/8 rounded-full blur-[120px]" />
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 relative">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl shadow-violet-500/30 mb-2">
          <Spinner size="lg" />
        </div>
        <div>
          <p className="text-lg font-bold text-white">Analyzing {ticker}</p>
          <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}
            className="text-sm text-slate-500 mt-1">
            Running 30 forensic rules + 4 ML models…
          </motion.p>
        </div>
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-slate-900 border border-white/8 rounded-2xl p-10 max-w-md text-center shadow-2xl">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-lg font-bold text-white mb-2">Analysis failed</p>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <button onClick={() => router.push("/analyze")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to analyze
          </button>
        </div>
      </motion.div>
    </div>
  );

  if (!result) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Nav bar */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between">
          <button onClick={() => router.push("/analyze")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-white/8 text-sm font-semibold text-slate-400 hover:text-violet-400 hover:border-violet-500/30 transition-all">
            <ArrowLeft className="h-4 w-4" /> Analyze Another
          </button>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] hidden sm:block">FRANK · Report</p>
            <button onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-white/8 text-sm font-semibold text-slate-400 hover:text-violet-400 hover:border-violet-500/30 transition-all">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </button>
          </div>
        </motion.div>

        {/* Edge case banners */}
        <EdgeCaseBanner flags={result.edgeCaseFlags} />

        {/* Verdict header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease }}>
          <VerdictHeader result={result} />
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, ease }}
            className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-white/8 rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-slate-300 mb-3">Category Scores</h2>
              <FundamentalRadarChart categoryScores={result.categoryScores} />
            </div>
            <div className="bg-slate-900 border border-white/8 rounded-2xl p-4 text-sm space-y-2">
              <h2 className="font-semibold text-slate-300">Weight Adaptation</h2>
              <p className="text-slate-500 text-sm">{result.weightAdaptationReason}</p>
              <div className="flex gap-3 text-xs">
                <span className="bg-violet-500/15 text-violet-400 px-2.5 py-1 rounded-full font-semibold border border-violet-500/20">
                  Fundamental {Math.round(result.adaptedFundamentalWeight * 100)}%
                </span>
                <span className="bg-blue-500/15 text-blue-400 px-2.5 py-1 rounded-full font-semibold border border-blue-500/20">
                  Technical {Math.round(result.adaptedTechnicalWeight * 100)}%
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, ease }}
            className="lg:col-span-3 space-y-4">
            <RedFlagsTable redFlags={result.redFlags} />
            <TechnicalBreakdown ml={result.mlPredictions} />
          </motion.div>
        </div>

        {/* Full-width fundamental breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, ease }}>
          <FundamentalBreakdown result={result} />
        </motion.div>

        {/* Quick actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-3">
          <button onClick={() => router.push("/analyze")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/20">
            <Search className="h-4 w-4" /> Analyze Another Stock
          </button>
          <button onClick={() => router.push("/learn")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-white/8 text-slate-300 text-sm font-semibold hover:border-violet-500/30 hover:text-violet-300 transition-all">
            Learn about these metrics →
          </button>
        </motion.div>

        {/* Disclaimer */}
        <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-400">
          <strong>Disclaimer: </strong>This analysis is for educational purposes only and does not constitute investment advice.
          Results are based solely on provided financial data. Historical patterns may not predict future performance.
          Always consult a qualified financial advisor before making investment decisions.
        </div>
      </div>
    </div>
  );
}
