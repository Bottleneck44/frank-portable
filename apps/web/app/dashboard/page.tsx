"use client";
import { useRouter } from "next/navigation";
import { useAnalysisStore } from "@/store/analysis-store";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Trash2, BarChart2, TrendingUp, Activity, ArrowRight, Search } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import clsx from "clsx";

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

function useCounter(target: number) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });
  useEffect(() => {
    if (!inView || target === 0) return;
    const start = Date.now();
    const dur = 1000;
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);
  return { ref, val };
}

function CountStat({ target, suffix = "" }: { target: number; suffix?: string }) {
  const { ref, val } = useCounter(target);
  return <span ref={ref}>{val}{suffix}</span>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { history, clearHistory } = useAnalysisStore();

  const avgComposite = history.length
    ? Math.round(history.reduce((s, h) => s + h.result.compositeScore, 0) / history.length)
    : 0;
  const healthyCount = history.filter((h) => h.result.verdict === "Healthy").length;
  const highRiskCount = history.filter((h) => h.result.verdict === "High Risk").length;

  const scatterData = history.map((h) => ({
    name: h.ticker,
    x: Math.round(h.result.fundamentalScore),
    y: Math.round(h.result.technicalScore),
    composite: Math.round(h.result.compositeScore),
  }));

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-violet-600 selection:text-white">

      {/* ambient + dot grid */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/8 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(circle, #a78bfa 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-24">

        {/* ── Header ── */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="mb-20">
          <motion.p variants={fadeUp} className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-8">
            FRANK · Session Dashboard
          </motion.p>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <motion.h1 variants={fadeUp}
              className="text-[clamp(2.5rem,6vw,5rem)] font-black text-white leading-[0.95] tracking-tighter">
              {history.length === 0
                ? <>No analyses<br /><span className="text-slate-600 font-light">yet this session.</span></>
                : <>{history.length} {history.length === 1 ? "analysis" : "analyses"}<br />
                    <span className="text-slate-500 font-light">this session.</span></>
              }
            </motion.h1>
            <motion.div variants={fadeUp} className="flex gap-3 shrink-0">
              {history.length > 0 && (
                <button onClick={clearHistory}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-sm font-semibold transition-all">
                  <Trash2 className="h-3.5 w-3.5" /> Clear
                </button>
              )}
              <button onClick={() => router.push("/analyze")}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all">
                Analyze a Stock <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          </div>
        </motion.div>

        {history.length === 0 ? (

          /* ── Empty state ── */
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden mb-16">
              {[
                { label: "Analyses", value: "—", color: "text-slate-700" },
                { label: "Avg composite", value: "—", color: "text-slate-700" },
                { label: "Healthy", value: "—", color: "text-slate-700" },
                { label: "High risk", value: "—", color: "text-slate-700" },
              ].map((s) => (
                <div key={s.label} className="bg-slate-950 p-8 md:p-10 flex flex-col gap-3">
                  <p className={clsx("text-4xl md:text-5xl font-black tracking-tighter", s.color)}>{s.value}</p>
                  <p className="text-xs text-slate-700">{s.label}</p>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-0">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-[0.2em] mb-4">Run an analysis to get started</p>
              {[
                { n: "01", title: "Pick a NIFTY 50 ticker", desc: "RELIANCE.NS, TCS.NS, HDFCBANK.NS — or any listed company." },
                { n: "02", title: "Get forensic + ML report", desc: "30 rules, 4 ML models, composite score, and every flag explained." },
                { n: "03", title: "Compare stocks here", desc: "Session history, scatter plot, and side-by-side scores land on this page." },
              ].map((step) => (
                <div key={step.n}
                  className="flex items-start gap-8 py-7 border-t border-white/5">
                  <span className="text-xs font-black text-slate-800 w-8 shrink-0 pt-0.5">{step.n}</span>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">{step.title}</p>
                    <p className="text-sm text-slate-500">{step.desc}</p>
                  </div>
                </div>
              ))}
              <div className="border-t border-white/5" />
            </motion.div>

            <motion.div variants={fadeUp} className="mt-12">
              <button onClick={() => router.push("/analyze")}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-10 py-5 text-base font-bold text-white shadow-2xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all">
                <Search className="h-5 w-5" /> Analyze Your First Stock
                <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          </motion.div>

        ) : (

          <>
            {/* ── Stats strip ── */}
            <motion.div variants={stagger} initial="hidden" animate="show" className="mb-16">
              <motion.div variants={fadeUp}
                className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
                {[
                  { label: "Analyses run", value: history.length, suffix: "", color: "text-violet-400" },
                  { label: "Avg composite score", value: avgComposite, suffix: "", color: "text-emerald-400" },
                  { label: "Healthy verdicts", value: healthyCount, suffix: "", color: "text-blue-400" },
                  { label: "High risk flags", value: highRiskCount, suffix: "", color: "text-red-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-950 p-8 md:p-10 flex flex-col gap-3">
                    <p className={clsx("text-4xl md:text-5xl font-black tabular-nums tracking-tighter", s.color)}>
                      <CountStat target={s.value} suffix={s.suffix} />
                    </p>
                    <p className="text-xs text-slate-500 leading-snug max-w-[120px]">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ── Scatter chart ── */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease }}
              className="mb-16">
              <p className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-8">
                Fundamental vs Technical scatter
              </p>
              <div className="bg-slate-900/60 border border-white/8 rounded-2xl overflow-hidden">
                <div className="p-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" dataKey="x" name="Fundamental" domain={[0, 100]}
                        label={{ value: "Fundamental Score", position: "insideBottom", offset: -12, fontSize: 11, fill: "#475569" }}
                        tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
                      <YAxis type="number" dataKey="y" name="Technical" domain={[0, 100]}
                        label={{ value: "Technical Score", angle: -90, position: "insideLeft", offset: 12, fontSize: 11, fill: "#475569" }}
                        tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
                      <ReferenceLine x={50} stroke="#334155" strokeDasharray="4 4" />
                      <ReferenceLine y={50} stroke="#334155" strokeDasharray="4 4" />
                      <Tooltip content={({ payload }) => {
                        if (!payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-800 border border-white/10 rounded-xl p-3 text-xs shadow-2xl">
                            <p className="font-bold text-white mb-2 font-mono">{d.name}</p>
                            <p className="text-slate-400">Fund: <span className="font-semibold text-slate-200">{d.x}</span></p>
                            <p className="text-slate-400">Tech: <span className="font-semibold text-slate-200">{d.y}</span></p>
                            <p className="text-violet-400 font-bold mt-1.5">Composite: {d.composite}</p>
                          </div>
                        );
                      }} />
                      <Scatter data={scatterData} fill="#7c3aed" opacity={0.85} r={6} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* ── History as editorial rows ── */}
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
              <motion.p variants={fadeUp} className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-8">
                Analysis history
              </motion.p>
              <motion.div variants={fadeUp} className="space-y-0">
                {history.map((h, i) => {
                  const v = h.result.verdict;
                  const vc = v === "Healthy"
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : v === "High Risk"
                    ? "text-red-400 bg-red-500/10 border-red-500/20"
                    : "text-amber-400 bg-amber-500/10 border-amber-500/20";
                  return (
                    <motion.button key={`${h.ticker}-${h.analysisDate}`}
                      variants={fadeUp}
                      onClick={() => router.push(`/report/${encodeURIComponent(h.ticker)}`)}
                      className="group w-full flex items-center gap-6 md:gap-10 py-6 border-t border-white/5 hover:border-violet-500/20 transition-colors duration-200 text-left">
                      {/* index */}
                      <span className="text-xs font-black text-slate-800 w-8 shrink-0 group-hover:text-violet-500 transition-colors tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {/* ticker */}
                      <span className="font-mono text-sm font-bold text-slate-400 group-hover:text-violet-300 transition-colors w-28 shrink-0">
                        {h.ticker}
                      </span>
                      {/* company */}
                      <span className="flex-1 min-w-0 text-sm font-semibold text-white truncate">
                        {h.result.companyName}
                      </span>
                      {/* scores */}
                      <div className="hidden md:flex items-center gap-6 shrink-0 text-xs text-slate-600">
                        <span>Fund <span className="text-slate-300 font-semibold">{Math.round(h.result.fundamentalScore)}</span></span>
                        <span>Tech <span className="text-slate-300 font-semibold">{Math.round(h.result.technicalScore)}</span></span>
                      </div>
                      {/* composite */}
                      <span className="text-2xl font-black text-violet-400 tabular-nums shrink-0">
                        {Math.round(h.result.compositeScore)}
                      </span>
                      {/* verdict */}
                      <span className={clsx("text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0 whitespace-nowrap", vc)}>
                        {v}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-800 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </motion.button>
                  );
                })}
                <div className="border-t border-white/5" />
              </motion.div>
            </motion.div>
          </>
        )}

        <p className="mt-12 text-xs text-slate-700 text-center">
          Session data only — cleared when you close the browser tab.
        </p>
      </div>
    </div>
  );
}
