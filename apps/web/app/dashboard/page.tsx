"use client";
import { useRouter } from "next/navigation";
import { useAnalysisStore } from "@/store/analysis-store";
import { Card, Button } from "@/components/ui";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Trash2, BarChart2, TrendingUp, Activity, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const { history, clearHistory } = useAnalysisStore();

  const scatterData = history.map((h) => ({
    name: h.ticker,
    x: h.result.fundamentalScore,
    y: h.result.technicalScore,
    composite: h.result.compositeScore,
  }));

  const avgComposite = history.length
    ? Math.round(history.reduce((s, h) => s + h.result.compositeScore, 0) / history.length)
    : 0;

  const healthyCount = history.filter((h) => h.result.verdict === "Healthy").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/30">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
            </div>
            <p className="text-sm text-slate-500 ml-[52px]">
              {history.length} analysis{history.length !== 1 ? "es" : ""} this session
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            {history.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={clearHistory}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-sm font-semibold transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </motion.button>
            )}
            <Button onClick={() => router.push("/analyze")} className="text-sm">
              Analyze a Stock <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </motion.div>

        {history.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card className="p-16 text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 mb-6">
                <BarChart2 className="h-10 w-10 text-slate-300" />
              </div>
              <p className="text-xl font-bold text-slate-700 mb-2">No analyses yet</p>
              <p className="text-sm text-slate-400 mb-8 max-w-xs mx-auto">
                Run your first analysis to see scores, comparisons, and history here.
              </p>
              <Button onClick={() => router.push("/analyze")}>
                Analyze a Stock <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Stat summary bar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { icon: <BarChart2 className="h-5 w-5" />, label: "Analyses", value: history.length, sub: "this session", accent: "violet" },
                { icon: <TrendingUp className="h-5 w-5" />, label: "Avg Composite", value: avgComposite, sub: "out of 100", accent: "emerald" },
                { icon: <Activity className="h-5 w-5" />, label: "Healthy", value: healthyCount, sub: `of ${history.length} analysed`, accent: "blue" },
              ].map(({ icon, label, value, sub, accent }) => {
                const border = accent === "violet" ? "border-l-violet-500" : accent === "emerald" ? "border-l-emerald-500" : "border-l-blue-500";
                const iconBg = accent === "violet" ? "bg-violet-100 text-violet-600" : accent === "emerald" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600";
                return (
                  <Card key={label} className={`p-5 border-l-4 ${border}`}>
                    <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl mb-3 ${iconBg}`}>{icon}</div>
                    <p className="text-2xl font-black text-slate-900">{value}</p>
                    <p className="text-sm font-semibold text-slate-700">{label}</p>
                    <p className="text-xs text-slate-400">{sub}</p>
                  </Card>
                );
              })}
            </motion.div>

            {/* Scatter chart */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
                    <Activity className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">Fundamental vs Technical Scores</h2>
                </div>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={280}>
                    <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" dataKey="x" name="Fundamental" domain={[0, 100]}
                        label={{ value: "Fundamental Score", position: "insideBottom", offset: -10, fontSize: 12, fill: "#94a3b8" }}
                        tick={{ fontSize: 11 }} />
                      <YAxis type="number" dataKey="y" name="Technical" domain={[0, 100]}
                        label={{ value: "Technical Score", angle: -90, position: "insideLeft", offset: 10, fontSize: 12, fill: "#94a3b8" }}
                        tick={{ fontSize: 11 }} />
                      <ReferenceLine x={50} stroke="#e2e8f0" strokeDasharray="4 4" />
                      <ReferenceLine y={50} stroke="#e2e8f0" strokeDasharray="4 4" />
                      <Tooltip
                        content={({ payload }) => {
                          if (!payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs shadow-xl">
                              <p className="font-bold text-slate-900 mb-1">{d.name}</p>
                              <p className="text-slate-500">Fundamental: <span className="font-semibold text-slate-700">{d.x}</span></p>
                              <p className="text-slate-500">Technical: <span className="font-semibold text-slate-700">{d.y}</span></p>
                              <p className="text-violet-700 font-bold mt-1">Composite: {d.composite}</p>
                            </div>
                          );
                        }}
                      />
                      <Scatter data={scatterData} fill="#7c3aed" opacity={0.85} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            {/* History table */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h2 className="text-sm font-bold text-slate-800">Analysis History</h2>
                  <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">{history.length} entries</span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Ticker", "Company", "Composite", "Fundamental", "Technical", "Verdict", ""].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => {
                      const v = h.result.verdict;
                      const verdictColor =
                        v === "Healthy" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : v === "High Risk" ? "text-red-700 bg-red-50 border-red-200"
                        : "text-amber-700 bg-amber-50 border-amber-200";
                      return (
                        <tr key={`${h.ticker}-${h.analysisDate}`}
                          className="border-b border-slate-50 hover:bg-violet-50/40 transition-colors cursor-pointer"
                          onClick={() => router.push(`/report/${encodeURIComponent(h.ticker)}`)}>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold font-mono">
                              {h.ticker}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 text-sm">{h.result.companyName}</td>
                          <td className="px-5 py-3.5">
                            <span className="text-lg font-black text-violet-700">{Math.round(h.result.compositeScore)}</span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 font-medium">{Math.round(h.result.fundamentalScore)}</td>
                          <td className="px-5 py-3.5 text-slate-600 font-medium">{Math.round(h.result.technicalScore)}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${verdictColor}`}>{v}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <button className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors">View →</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            </motion.div>
          </>
        )}

        <p className="text-xs text-slate-400 text-center">Session data only — cleared when you close the browser tab.</p>
      </div>
    </div>
  );
}
