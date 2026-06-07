"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FusionResult, FinancialYear } from "@/lib/engine/types";
import { useAnalysisStore } from "@/store/analysis-store";
import { Spinner } from "@/components/ui";
import {
  Search, Code, BarChart2, Zap, ChevronRight,
  AlertCircle, ArrowRight, Shield, Brain, BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";

/* ─── shared motion tokens ─── */
const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

/* ─── particles (deterministic) ─── */
const PARTICLES = [
  { x: 8,  y: 20, s: 1.5, d: 6.2 }, { x: 92, y: 15, s: 1,   d: 8.1 },
  { x: 78, y: 70, s: 2,   d: 5.4 }, { x: 20, y: 60, s: 1.5, d: 7.0 },
  { x: 55, y: 85, s: 1,   d: 9.2 }, { x: 40, y: 30, s: 2,   d: 6.8 },
];

type Mode = "ticker" | "json";

const NIFTY50 = [
  "RELIANCE.NS","TCS.NS","HDFCBANK.NS","INFY.NS","ICICIBANK.NS","HINDUNILVR.NS",
  "SBIN.NS","BHARTIARTL.NS","KOTAKBANK.NS","LT.NS","WIPRO.NS","AXISBANK.NS",
  "MARUTI.NS","TITAN.NS","BAJFINANCE.NS","SUNPHARMA.NS","NESTLEIND.NS","ITC.NS","TECHM.NS","M&M.NS",
];

const QUICK_PICKS = [
  { t: "RELIANCE.NS", label: "Reliance",   sector: "Energy" },
  { t: "TCS.NS",      label: "TCS",        sector: "IT" },
  { t: "HDFCBANK.NS", label: "HDFC Bank",  sector: "Banking" },
  { t: "INFY.NS",     label: "Infosys",    sector: "IT" },
  { t: "ICICIBANK.NS",label: "ICICI Bank", sector: "Banking" },
  { t: "WIPRO.NS",    label: "Wipro",      sector: "IT" },
  { t: "ITC.NS",      label: "ITC",        sector: "FMCG" },
  { t: "LT.NS",       label: "L&T",        sector: "Infra" },
];

export default function AnalyzePage() {
  const router = useRouter();
  const { setCurrentResult, addToHistory } = useAnalysisStore();
  const [mode, setMode] = useState<Mode>("ticker");
  const [tickerInput, setTickerInput] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleTickerChange = (v: string) => {
    setTickerInput(v.toUpperCase());
    setSuggestions(v.length >= 2 ? NIFTY50.filter((t) => t.includes(v.toUpperCase())).slice(0, 6) : []);
  };

  const runAnalysis = useCallback(async (body: object) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const result: FusionResult = data.result;
      setCurrentResult(result); addToHistory(result);
      router.push(`/report/${encodeURIComponent(result.ticker)}`);
    } catch (e) { setError(e instanceof Error ? e.message : "Analysis failed"); }
    finally { setLoading(false); }
  }, [router, setCurrentResult, addToHistory]);

  const submitTicker = () => {
    if (!tickerInput.trim()) return;
    const ticker = tickerInput.trim().includes(".") ? tickerInput.trim() : `${tickerInput.trim()}.NS`;
    runAnalysis({ ticker, companyName: tickerInput.trim() });
  };

  const submitJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const years: FinancialYear[] = parsed.years ?? parsed;
      runAnalysis({ years, companyName: parsed.companyName ?? "Manual Entry", ticker: parsed.ticker ?? "MANUAL" });
    } catch { setError("Invalid JSON. Expected { years: [...] } or a FinancialYear array."); }
  };

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-violet-600 selection:text-white">

      {/* ── ambient + dot grid ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-2/3 left-1/4 w-[300px] h-[300px] bg-purple-600/8 rounded-full blur-[80px]" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(circle, #a78bfa 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        {/* particles */}
        {PARTICLES.map((p, i) => (
          <motion.div key={i}
            className="absolute rounded-full bg-violet-400/20"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s * 2, height: p.s * 2 }}
            animate={{ y: [0, -10, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ repeat: Infinity, duration: p.d, ease: "easeInOut", delay: i * 0.4 }}
          />
        ))}
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-24">

        {/* ── Hero header ── */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="mb-20">
          <motion.p variants={fadeUp}
            className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-8">
            FRANK · Analysis Engine
          </motion.p>
          <motion.h1 variants={fadeUp}
            className="text-[clamp(2.8rem,7vw,5.5rem)] font-black text-white leading-[0.95] tracking-tighter mb-6 max-w-3xl">
            Forensic analysis,<br />
            <span className="text-violet-400">in seconds.</span>
          </motion.h1>
          <motion.p variants={fadeUp}
            className="text-xl text-slate-400 font-light leading-relaxed max-w-xl mb-10">
            Enter any NIFTY 50 ticker. 30 deterministic rules + 4 ML models produce a composite score with full educational breakdowns.
          </motion.p>

          {/* capability badges */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
            {[
              { icon: <Shield className="h-3.5 w-3.5" />, text: "30 forensic rules" },
              { icon: <Brain className="h-3.5 w-3.5" />, text: "4 ML models" },
              { icon: <Zap className="h-3.5 w-3.5" />, text: "<100ms DFAL latency" },
              { icon: <BookOpen className="h-3.5 w-3.5" />, text: "Progressive disclosure" },
            ].map(({ icon, text }) => (
              <span key={text}
                className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-slate-300 text-xs font-medium px-3 py-1.5 rounded-full">
                <span className="text-violet-400">{icon}</span> {text}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Two-column: form + quick picks ── */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left — input form */}
          <motion.div variants={stagger} initial="hidden" animate="show">

            {/* Mode toggle */}
            <motion.div variants={fadeUp}
              className="inline-flex gap-1 mb-8 bg-white/5 border border-white/8 p-1 rounded-full">
              {([
                { id: "ticker" as Mode, label: "Ticker", icon: <Search className="h-3.5 w-3.5" /> },
                { id: "json"   as Mode, label: "JSON",   icon: <Code className="h-3.5 w-3.5" /> },
              ]).map((tab) => (
                <button key={tab.id} onClick={() => setMode(tab.id)}
                  className={clsx(
                    "flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all",
                    mode === tab.id
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                      : "text-slate-500 hover:text-slate-200"
                  )}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {mode === "ticker" && (
              <motion.div variants={fadeUp} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Stock ticker
                  </label>
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                    <input
                      value={tickerInput}
                      onChange={(e) => handleTickerChange(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitTicker()}
                      placeholder="RELIANCE.NS or INFY"
                      className="w-full pl-14 pr-5 py-5 bg-slate-900 border border-white/8 rounded-2xl text-lg font-semibold text-white placeholder:text-slate-700 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all"
                    />
                    <AnimatePresence>
                      {suggestions.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-10 overflow-hidden">
                          {suggestions.map((s) => (
                            <button key={s} onClick={() => { setTickerInput(s); setSuggestions([]); }}
                              className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-mono font-medium text-slate-300 hover:bg-violet-600/15 hover:text-violet-300 transition-colors border-b border-white/5 last:border-0">
                              {s} <ChevronRight className="h-4 w-4 text-slate-700" />
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="text-xs text-slate-700 mt-2 ml-1">Append .NS for NSE. ML available for 49 NIFTY 50 stocks.</p>
                </div>

                <button onClick={submitTicker} disabled={loading || !tickerInput.trim()}
                  className="group w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200">
                  {loading
                    ? <><Spinner /><span>Analyzing…</span></>
                    : <><span>Run Analysis</span><ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" /></>}
                </button>
              </motion.div>
            )}

            {mode === "json" && (
              <motion.div variants={fadeUp} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Financial data (JSON)
                  </label>
                  <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} rows={11}
                    placeholder={`{\n  "companyName": "My Company",\n  "ticker": "MYCO",\n  "years": [\n    { "year": 2023, "incomeStatement": {…}, "balanceSheet": {…}, "cashFlow": {…} }\n  ]\n}`}
                    className="w-full px-5 py-4 bg-slate-900 border border-white/8 rounded-2xl text-xs font-mono text-slate-200 placeholder:text-slate-800 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 resize-none transition-all leading-relaxed"
                  />
                </div>
                <button onClick={submitJSON} disabled={loading || !jsonInput.trim()}
                  className="group w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200">
                  {loading
                    ? <><Spinner /><span>Analyzing…</span></>
                    : <><span>Analyze JSON</span><ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" /></>}
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Right — quick picks as editorial list */}
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.p variants={fadeUp}
              className="text-xs font-bold text-slate-600 uppercase tracking-[0.2em] mb-2">
              Quick picks
            </motion.p>
            <motion.div variants={fadeUp} className="space-y-0">
              {QUICK_PICKS.map((pick, i) => (
                <motion.button key={pick.t} variants={fadeUp}
                  onClick={() => { setTickerInput(pick.t); setMode("ticker"); }}
                  className="group w-full flex items-center gap-6 py-5 border-t border-white/5 hover:border-violet-500/20 transition-colors duration-200 text-left">
                  <span className="text-xs font-black text-slate-800 w-6 shrink-0 group-hover:text-violet-500 transition-colors tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-xs text-slate-600 group-hover:text-violet-400 transition-colors w-28 shrink-0">{pick.t}</span>
                  <span className="flex-1 text-sm font-semibold text-white">{pick.label}</span>
                  <span className="text-xs text-slate-700 group-hover:text-slate-500 transition-colors shrink-0">{pick.sector}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-800 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </motion.button>
              ))}
              <div className="border-t border-white/5" />
            </motion.div>

            <motion.p variants={fadeUp} className="mt-8 text-xs text-slate-700 leading-relaxed">
              All 49 NIFTY 50 stocks have full ML ensemble coverage.
              Any other ticker runs in fundamental-only mode.{" "}
              <Link href="/learn" className="text-violet-600 hover:text-violet-400 transition-colors">
                Learn how it works →
              </Link>
            </motion.p>
          </motion.div>
        </div>

        {/* ── How it works strip ── */}
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
          className="mt-32 pt-16 border-t border-white/5">
          <motion.p variants={fadeUp} className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-12">
            What happens when you run an analysis
          </motion.p>
          <motion.div variants={fadeUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {[
              { n: "01", title: "Data fetch", body: "3 years of P&L, balance sheet, and cash flow via Yahoo Finance. Real-time." },
              { n: "02", title: "DFAL rules", body: "30 deterministic forensic rules across 7 categories. Pure functions — no ML, fully explainable." },
              { n: "03", title: "ML ensemble", body: "4 pre-trained models on NIFTY 50 history produce a Technical Score 0–100." },
              { n: "04", title: "Fusion + ELL", body: "Adaptive weights combine both scores. Every flag is explained in plain English." },
            ].map((s) => (
              <div key={s.n} className="bg-slate-950 p-8 flex flex-col gap-4">
                <span className="text-xs font-black text-slate-700">{s.n}</span>
                <p className="text-sm font-bold text-white">{s.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* disclaimer */}
        <p className="mt-12 text-xs text-slate-700 text-center">
          Educational & research use only · Not investment advice
        </p>
      </div>
    </div>
  );
}
