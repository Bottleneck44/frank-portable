"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FusionResult, FinancialYear } from "@/lib/engine/types";
import { useAnalysisStore } from "@/store/analysis-store";
import { Spinner } from "@/components/ui";
import { Search, FileText, Code, BarChart2, Zap, ChevronRight, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } };

type Mode = "ticker" | "manual" | "json";

const NIFTY50 = [
  "RELIANCE.NS","TCS.NS","HDFCBANK.NS","INFY.NS","ICICIBANK.NS","HINDUNILVR.NS",
  "SBIN.NS","BHARTIARTL.NS","KOTAKBANK.NS","LT.NS","WIPRO.NS","AXISBANK.NS",
  "MARUTI.NS","TITAN.NS","BAJFINANCE.NS","SUNPHARMA.NS","NESTLEIND.NS","ITC.NS","TECHM.NS","M&M.NS",
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
    setSuggestions(v.length >= 2 ? NIFTY50.filter((t) => t.includes(v.toUpperCase())).slice(0, 5) : []);
  };

  const runAnalysis = useCallback(async (body: object) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
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
    } catch { setError("Invalid JSON format. Expected { years: [...] } or an array of financial years."); }
  };

  const TABS: { id: Mode; label: string; icon: React.ReactNode }[] = [
    { id: "ticker", label: "Stock Ticker", icon: <Search className="h-4 w-4" /> },
    { id: "json",   label: "JSON Paste",  icon: <Code className="h-4 w-4" /> },
    { id: "manual", label: "Manual Entry",icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-16 px-4">
      {/* ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="mb-10">
          <p className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-4">FRANK · Analysis</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
              <BarChart2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Analyze a Company</h1>
              <p className="text-slate-400 text-sm mt-0.5">Composite fundamental + ML score with educational explanations.</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap mt-6">
            {[
              { icon: <Zap className="h-3.5 w-3.5" />, text: "30 forensic rules" },
              { icon: <BarChart2 className="h-3.5 w-3.5" />, text: "4 ML models" },
              { icon: <Search className="h-3.5 w-3.5" />, text: "All NIFTY 50 tickers" },
            ].map(({ icon, text }) => (
              <div key={text} className="inline-flex items-center gap-1.5 bg-violet-600/15 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full border border-violet-500/20">
                {icon} {text}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease }}
          className="flex gap-1 mb-6 bg-slate-900 p-1 rounded-xl border border-white/5">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setMode(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                mode === tab.id ? "bg-violet-600 text-white" : "text-slate-500 hover:text-slate-200"
              }`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6, ease }}>
          <div className="bg-slate-900 border border-white/8 rounded-2xl p-8 shadow-2xl shadow-black/40">

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {mode === "ticker" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Stock Ticker</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      value={tickerInput}
                      onChange={(e) => handleTickerChange(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitTicker()}
                      placeholder="e.g. RELIANCE.NS or INFY"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-800 border border-white/10 rounded-xl text-base font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                    />
                    <AnimatePresence>
                      {suggestions.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-10 overflow-hidden">
                          {suggestions.map((s) => (
                            <button key={s} onClick={() => { setTickerInput(s); setSuggestions([]); }}
                              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-300 hover:bg-violet-600/20 hover:text-violet-300 transition-colors border-b border-white/5 last:border-0">
                              <span className="font-mono">{s}</span>
                              <ChevronRight className="h-4 w-4 text-slate-600" />
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">Add .NS for NSE (India). ML analysis available for NIFTY 50 stocks.</p>
                </div>
                <button onClick={submitTicker} disabled={loading || !tickerInput.trim()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-base font-bold hover:from-violet-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2">
                  {loading ? <><Spinner /><span>Analyzing…</span></> : "Run Analysis"}
                </button>
              </div>
            )}

            {mode === "json" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Paste Financial Data (JSON)</label>
                  <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} rows={10}
                    placeholder={`{\n  "companyName": "My Company",\n  "ticker": "MYCO",\n  "years": [...]\n}`}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-xs font-mono text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none transition-all"
                  />
                </div>
                <button onClick={submitJSON} disabled={loading || !jsonInput.trim()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-base font-bold hover:from-violet-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2">
                  {loading ? <><Spinner /><span>Analyzing…</span></> : "Analyze JSON"}
                </button>
              </div>
            )}

            {mode === "manual" && (
              <div className="text-center py-12">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 mb-4">
                  <FileText className="h-8 w-8 text-slate-600" />
                </div>
                <p className="text-base font-semibold text-slate-300 mb-1">Manual entry coming soon</p>
                <p className="text-sm text-slate-600">Use JSON mode to paste financial data directly.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick picks */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-3">Quick picks — NIFTY 50 with full ML</p>
          <div className="flex flex-wrap gap-2">
            {["RELIANCE.NS","TCS.NS","HDFCBANK.NS","INFY.NS","ICICIBANK.NS","WIPRO.NS"].map((t) => (
              <button key={t} onClick={() => { setTickerInput(t); setMode("ticker"); }}
                className="text-xs px-3 py-1.5 bg-slate-900 border border-white/8 rounded-full font-semibold text-slate-400 hover:border-violet-500/40 hover:text-violet-400 hover:bg-violet-600/10 transition-all">
                {t.replace(".NS", "")}
              </button>
            ))}
          </div>
        </motion.div>

        <p className="mt-10 text-xs text-slate-700 text-center">
          Educational & research use only · Not investment advice ·{" "}
          <Link href="/learn" className="text-violet-600 hover:text-violet-400 transition-colors">Learn how it works</Link>
        </p>
      </div>
    </div>
  );
}
