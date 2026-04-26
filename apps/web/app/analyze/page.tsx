"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FusionResult, FinancialYear } from "@/lib/engine/types";
import { useAnalysisStore } from "@/store/analysis-store";
import { Button, Card, Spinner, Alert } from "@/components/ui";
import { Search, FileText, Code, BarChart2, Zap, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

type Mode = "ticker" | "manual" | "json";

const NIFTY50 = [
  "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS", "HINDUNILVR.NS",
  "SBIN.NS", "BHARTIARTL.NS", "KOTAKBANK.NS", "LT.NS", "WIPRO.NS", "AXISBANK.NS",
  "MARUTI.NS", "TITAN.NS", "BAJFINANCE.NS", "SUNPHARMA.NS", "NESTLEIND.NS", "ITC.NS",
  "TECHM.NS", "M&M.NS",
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
    if (v.length >= 2) {
      setSuggestions(NIFTY50.filter((t) => t.includes(v.toUpperCase())).slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const runAnalysis = useCallback(async (body: object) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const result: FusionResult = data.result;
      setCurrentResult(result);
      addToHistory(result);
      router.push(`/report/${encodeURIComponent(result.ticker)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
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
    } catch {
      setError("Invalid JSON format. Expected { years: [...] } or an array of financial years.");
    }
  };

  const TABS: { id: Mode; label: string; icon: React.ReactNode }[] = [
    { id: "ticker", label: "Stock Ticker", icon: <Search className="h-4 w-4" /> },
    { id: "json", label: "JSON Paste", icon: <Code className="h-4 w-4" /> },
    { id: "manual", label: "Manual Entry", icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
              <BarChart2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analyze a Company</h1>
              <p className="text-slate-500 text-sm mt-0.5">Get a composite fundamental + ML score with educational explanations.</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap mt-6">
            {[
              { icon: <Zap className="h-3.5 w-3.5" />, text: "32 forensic rules" },
              { icon: <BarChart2 className="h-3.5 w-3.5" />, text: "4 ML models" },
              { icon: <Search className="h-3.5 w-3.5" />, text: "All NIFTY 50 tickers" },
            ].map(({ icon, text }) => (
              <div key={text} className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 text-xs font-medium px-3 py-1.5 rounded-full border border-violet-100">
                {icon} {text}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl"
        >
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setMode(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all
                ${mode === tab.id
                  ? "bg-white text-violet-700 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"}`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-8 shadow-xl shadow-slate-900/5 border-slate-200">
            {error && <Alert type="error" className="mb-6">{error}</Alert>}

            {mode === "ticker" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Stock Ticker</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      value={tickerInput}
                      onChange={(e) => handleTickerChange(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitTicker()}
                      placeholder="e.g. RELIANCE.NS or INFY"
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                    />
                    {suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden">
                        {suggestions.map((s) => (
                          <button key={s} onClick={() => { setTickerInput(s); setSuggestions([]); }}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors">
                            <span>{s}</span>
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Add .NS for NSE (India). ML analysis available for NIFTY 50 stocks.</p>
                </div>
                <Button onClick={submitTicker} disabled={loading || !tickerInput.trim()} className="w-full py-3.5 text-base">
                  {loading ? <><Spinner /><span className="ml-2">Analyzing…</span></> : "Run Analysis"}
                </Button>
              </div>
            )}

            {mode === "json" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Paste Financial Data (JSON)</label>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    rows={10}
                    placeholder={`{\n  "companyName": "My Company",\n  "ticker": "MYCO",\n  "years": [\n    { "year": 2023, "incomeStatement": {...}, "balanceSheet": {...}, "cashFlow": {...} }\n  ]\n}`}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 resize-none transition-all"
                  />
                </div>
                <Button onClick={submitJSON} disabled={loading || !jsonInput.trim()} className="w-full py-3.5 text-base">
                  {loading ? <><Spinner /><span className="ml-2">Analyzing…</span></> : "Analyze JSON"}
                </Button>
              </div>
            )}

            {mode === "manual" && (
              <div className="text-center py-12">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
                  <FileText className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-base font-semibold text-slate-600 mb-1">Manual entry coming soon</p>
                <p className="text-sm text-slate-400">Use JSON mode to paste financial data directly.</p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Quick picks */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Quick picks — NIFTY 50 with ML support</p>
          <div className="flex flex-wrap gap-2">
            {["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS"].map((t) => (
              <button key={t} onClick={() => { setTickerInput(t); setMode("ticker"); }}
                className="text-xs px-3 py-1.5 bg-white border-2 border-slate-200 rounded-full font-semibold text-slate-600 hover:border-violet-400 hover:text-violet-700 hover:bg-violet-50 transition-all">
                {t.replace(".NS", "")}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
