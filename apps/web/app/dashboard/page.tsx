"use client";
import { useRouter } from "next/navigation";
import { useAnalysisStore } from "@/store/analysis-store";
import { Button } from "@/components/ui";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Trash2, BarChart2, TrendingUp, Activity, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

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
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      {/* ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-violet-600/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial="hidden" animate="show" variants={fadeUp}
          className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-3">FRANK · Dashboard</p>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/30">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Dashboard</h1>
            </div>
            <p className="text-sm text-slate-500 ml-[52px]">
              {history.length} analysis{history.length !== 1 ? "es" : ""} this session
            </p>
          </div>
          <div className="flex gap-3 shrink-0 mt-6">
            {history.length > 0 && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={clearHistory}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-sm font-semibold transition-all">
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </motion.button>
            )}
            <Button onClick={() => router.push("/analyze")} className="text-sm">
              Analyze a Stock <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </motion.div>

        {history.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <div className="bg-slate-900 border border-white/8 rounded-2xl p-16 text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 mb-6">
                <BarChart2 className="h-10 w-10 text-slate-700" />
              </div>
              <p className="text-xl font-bold text-white mb-2">No analyses yet</p>
              <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">
                Run your first analysis to see scores, comparisons, and history here.
              </p>
              <Button onClick={() => router.push("/analyze")}>
                Analyze a Stock <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Stat summary */}
            <motion.div variants={stagger} initial="hidden" animate="show"
              className="grid grid-cols-3 gap-4">
              {[
                { icon: <BarChart2 className="h-5 w-5" />, label: "Analyses", value: history.length, sub: "this session", color: "violet" },
                { icon: <TrendingUp className="h-5 w-5" />, label: "Avg Composite", value: avgComposite, sub: "out of 100", color: "emerald" },
                { icon: <Activity className="h-5 w-5" />, label: "Healthy", value: healthyCount, sub: `of ${history.length} analysed`, color: "blue" },
              ].map(({ icon, label, value, sub, color }) => (
                <motion.div key={label} variants={fadeUp}
                  className={clsx("bg-slate-900 border rounded-2xl p-5 border-l-4",
                    color === "violet" ? "border-violet-500/50 border-l-violet-500" :
                    color === "emerald" ? "border-emerald-500/20 border-l-emerald-500" :
                    "border-blue-500/20 border-l-blue-500"
                  )}>
                  <div className={clsx("inline-flex h-9 w-9 items-center justify-center rounded-xl mb-3",
                    color === "violet" ? "bg-violet-500/15 text-violet-400" :
                    color === "emerald" ? "bg-emerald-500/15 text-emerald-400" :
                    "bg-blue-500/15 text-blue-400"
                  )}>{icon}</div>
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-sm font-semibold text-slate-300">{label}</p>
                  <p className="text-xs text-slate-500">{sub}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Scatter chart */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-slate-900 border border-white/8 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-sm font-bold text-white">Fundamental vs Technical Scores</h2>
                </div>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={280}>
                    <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" dataKey="x" name="Fundamental" domain={[0, 100]}
                        label={{ value: "Fundamental Score", position: "insideBottom", offset: -10, fontSize: 12, fill: "#475569" }}
                        tick={{ fontSize: 11, fill: "#475569" }} />
                      <YAxis type="number" dataKey="y" name="Technical" domain={[0, 100]}
                        label={{ value: "Technical Score", angle: -90, position: "insideLeft", offset: 10, fontSize: 12, fill: "#475569" }}
                        tick={{ fontSize: 11, fill: "#475569" }} />
                      <ReferenceLine x={50} stroke="#334155" strokeDasharray="4 4" />
                      <ReferenceLine y={50} stroke="#334155" strokeDasharray="4 4" />
                      <Tooltip content={({ payload }) => {
                        if (!payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-800 border border-white/10 rounded-xl p-3 text-xs shadow-2xl">
                            <p className="font-bold text-white mb-1">{d.name}</p>
                            <p className="text-slate-400">Fundamental: <span className="font-semibold text-slate-200">{d.x}</span></p>
                            <p className="text-slate-400">Technical: <span className="font-semibold text-slate-200">{d.y}</span></p>
                            <p className="text-violet-400 font-bold mt-1">Composite: {d.composite}</p>
                          </div>
                        );
                      }} />
                      <Scatter data={scatterData} fill="#7c3aed" opacity={0.9} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* History table */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="bg-slate-900 border border-white/8 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                  <h2 className="text-sm font-bold text-white">Analysis History</h2>
                  <span className="ml-auto text-xs text-slate-500 bg-white/5 px-2.5 py-1 rounded-full font-medium border border-white/5">{history.length} entries</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        {["Ticker","Company","Composite","Fundamental","Technical","Verdict",""].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => {
                        const v = h.result.verdict;
                        const vc = v === "Healthy" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : v === "High Risk" ? "text-red-400 bg-red-500/10 border-red-500/20"
                          : "text-amber-400 bg-amber-500/10 border-amber-500/20";
                        return (
                          <tr key={`${h.ticker}-${h.analysisDate}`}
                            className="border-b border-white/5 hover:bg-violet-600/5 transition-colors cursor-pointer"
                            onClick={() => router.push(`/report/${encodeURIComponent(h.ticker)}`)}>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/5 text-slate-200 text-xs font-bold font-mono border border-white/8">
                                {h.ticker}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-400 text-sm">{h.result.companyName}</td>
                            <td className="px-5 py-3.5">
                              <span className="text-lg font-black text-violet-400">{Math.round(h.result.compositeScore)}</span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-400 font-medium">{Math.round(h.result.fundamentalScore)}</td>
                            <td className="px-5 py-3.5 text-slate-400 font-medium">{Math.round(h.result.technicalScore)}</td>
                            <td className="px-5 py-3.5">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${vc}`}>{v}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <button className="text-xs font-semibold text-violet-500 hover:text-violet-300 transition-colors">View →</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </>
        )}

        <p className="text-xs text-slate-700 text-center">Session data only — cleared when you close the browser tab.</p>
      </div>
    </div>
  );
}
