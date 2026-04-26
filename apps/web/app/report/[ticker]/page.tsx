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
import { Spinner, Card } from "@/components/ui";
import { ArrowLeft, LayoutDashboard, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

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
    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker }),
    })
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl shadow-violet-500/30 mb-2">
          <Spinner size="lg" />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-800">Analyzing {ticker}</p>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}
            className="text-sm text-slate-500 mt-1"
          >
            Running 32 forensic rules + 4 ML models…
          </motion.p>
        </div>
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-10 max-w-md text-center shadow-xl">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 mb-2">Analysis failed</p>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => router.push("/analyze")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to analyze
          </button>
        </Card>
      </motion.div>
    </div>
  );

  if (!result) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Navigation bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={() => router.push("/analyze")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 hover:text-violet-700 hover:border-violet-300 hover:bg-violet-50 transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Analyze Another
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 hover:text-violet-700 hover:border-violet-300 hover:bg-violet-50 transition-all shadow-sm"
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </button>
        </motion.div>

        {/* Edge case banners */}
        <EdgeCaseBanner flags={result.edgeCaseFlags} />

        {/* Verdict header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <VerdictHeader result={result} />
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            <Card className="p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Category Scores</h2>
              <FundamentalRadarChart categoryScores={result.categoryScores} />
            </Card>

            <Card className="p-4 text-sm space-y-2">
              <h2 className="font-semibold text-slate-700">Weight Adaptation</h2>
              <p className="text-slate-500">{result.weightAdaptationReason}</p>
              <div className="flex gap-3 text-xs">
                <span className="bg-violet-100 text-violet-700 px-2.5 py-1 rounded-lg font-semibold">
                  Fundamental {Math.round(result.adaptedFundamentalWeight * 100)}%
                </span>
                <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg font-semibold">
                  Technical {Math.round(result.adaptedTechnicalWeight * 100)}%
                </span>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
            className="lg:col-span-3 space-y-4"
          >
            <RedFlagsTable redFlags={result.redFlags} />
            <TechnicalBreakdown ml={result.mlPredictions} />
          </motion.div>
        </div>

        {/* Full-width fundamental breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <FundamentalBreakdown result={result} />
        </motion.div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
          <strong>Disclaimer: </strong>This analysis is for educational purposes only and does not constitute investment advice.
          Results are based solely on provided financial data. Historical patterns may not predict future performance.
          Always consult a qualified financial advisor before making investment decisions.
        </div>
      </div>
    </div>
  );
}
