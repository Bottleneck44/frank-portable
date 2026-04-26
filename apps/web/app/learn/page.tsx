"use client";
import { useState } from "react";
import { BookOpen, BarChart2, TrendingUp, Shield, Zap, Brain, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

const GLOSSARY = [
  { term: "Current Ratio", def: "Current assets divided by current liabilities. Above 1.5 generally indicates the company can pay short-term debts. Below 1.0 is a warning sign." },
  { term: "Debt-to-Equity (D/E)", def: "Total debt divided by shareholders' equity. High D/E means the company is heavily financed by debt. Above 2.0 warrants scrutiny in most industries." },
  { term: "Operating Cash Flow", def: "Cash generated from day-to-day business operations. More reliable than net income because it's harder to manipulate with accounting choices." },
  { term: "Return on Equity (ROE)", def: "Net income divided by shareholders' equity. Measures how efficiently management uses shareholder capital. Above 15% is generally considered strong." },
  { term: "Gross Margin", def: "Revenue minus cost of goods sold, as a percentage of revenue. Shows pricing power and production efficiency." },
  { term: "Altman Z-Score", def: "A composite formula predicting bankruptcy risk. Z < 1.81: distress zone. 1.81–2.99: grey zone. Z > 2.99: safe zone." },
  { term: "Free Cash Flow (FCF)", def: "Operating cash flow minus capital expenditure. The cash left after maintaining/growing the business — available for dividends, debt repayment, or buybacks." },
  { term: "Interest Coverage Ratio", def: "EBIT divided by interest expense. Measures ability to pay interest. Below 1.5 is dangerous; below 1.0 means the company can't cover its interest." },
  { term: "Receivables Turnover", def: "Revenue divided by accounts receivable. How many times per year the company collects its average receivable. Declining ratio may indicate collection problems." },
  { term: "MACD", def: "Moving Average Convergence Divergence. A momentum indicator using the difference between 12-day and 26-day exponential moving averages. Crossovers signal potential trend changes." },
  { term: "RSI", def: "Relative Strength Index. A momentum oscillator measuring speed/change of price movements on a 0–100 scale. Above 70: potentially overbought. Below 30: potentially oversold." },
  { term: "Bollinger Bands", def: "Volatility bands placed above and below a moving average. %B measures where price is relative to the bands. Bandwidth measures volatility." },
  { term: "ADX", def: "Average Directional Index. Measures trend strength (not direction). Above 25 indicates a strong trend. Below 20 means the market is ranging/directionless." },
  { term: "R² (R-squared)", def: "Statistical measure of how well a model explains variance in data (0–1). Used to weight model predictions in the ensemble — higher R² = more weight." },
  { term: "Directional Accuracy", def: "Percentage of predictions where the model correctly predicted whether price would go up or down, regardless of magnitude." },
  { term: "Ensemble Prediction", def: "A combined prediction from multiple models (XGBoost, LightGBM, Random Forest, LSTM) weighted by their R² scores. Reduces reliance on any single model." },
];

const TOPICS = [
  {
    icon: BarChart2, color: "violet", title: "Profitability Analysis",
    rules: ["Gross Margin trend", "Operating Margin", "Net Profit Margin", "Return on Assets", "Return on Equity", "Margin compression"],
    summary: "Profitability rules check whether the company is generating returns from its operations and assets, and whether those returns are improving or deteriorating over time."
  },
  {
    icon: Shield, color: "blue", title: "Liquidity",
    rules: ["Current Ratio", "Quick Ratio", "Cash Ratio", "Working Capital trend"],
    summary: "Liquidity rules ensure the company has enough short-term assets to cover short-term obligations. Poor liquidity is one of the most common early signs of financial distress."
  },
  {
    icon: TrendingUp, color: "rose", title: "Solvency & Leverage",
    rules: ["Debt-to-Equity", "Interest Coverage", "Debt-to-Assets", "Equity trend", "Negative equity"],
    summary: "Solvency rules examine long-term debt sustainability. A company can be profitable but still go bankrupt if it can't service its debt load."
  },
  {
    icon: Zap, color: "amber", title: "Efficiency",
    rules: ["Asset Turnover", "Inventory Turnover", "Receivables Turnover", "Days Receivables Outstanding"],
    summary: "Efficiency rules measure how well management converts assets into revenue. Declining turnover ratios often signal operational problems before they appear in profit figures."
  },
  {
    icon: BookOpen, color: "emerald", title: "Earnings Quality",
    rules: ["Accruals ratio", "OCF vs Net Income", "Revenue recognition consistency", "Beneish M-Score inputs", "Earnings smoothing"],
    summary: "These rules detect whether reported earnings are backed by real cash flows. High accruals relative to cash flow is a classic red flag for earnings manipulation."
  },
  {
    icon: Shield, color: "teal", title: "Cash Flow",
    rules: ["OCF positivity", "FCF generation", "Capex ratio"],
    summary: "Cash flow rules are the most manipulation-resistant checks. Companies can engineer accounting profits, but cash is much harder to fake."
  },
  {
    icon: Brain, color: "purple", title: "ML Technical Signals",
    rules: ["RSI(14)", "MACD histogram", "Bollinger %B", "ADX trend strength", "Parabolic SAR", "Volatility", "Momentum 5/10/20d"],
    summary: "Four models (XGBoost, LightGBM, Random Forest, LSTM) are trained on 2012–2024 NIFTY 50 data. Their predictions are R²-weighted into an ensemble. Available only for pre-trained NIFTY 50 tickers."
  },
  {
    icon: TrendingUp, color: "indigo", title: "Growth",
    rules: ["Revenue CAGR", "Earnings CAGR"],
    summary: "Growth rules require at least 2 years of data. They check whether the company is expanding revenue and earnings at a sustainable pace."
  },
];

const COLOR_MAP: Record<string, { icon: string; border: string; badge: string }> = {
  violet:  { icon: "bg-violet-100 text-violet-700",   border: "border-l-violet-500",  badge: "bg-violet-50 text-violet-700 border-violet-200" },
  blue:    { icon: "bg-blue-100 text-blue-700",       border: "border-l-blue-500",    badge: "bg-blue-50 text-blue-700 border-blue-200" },
  rose:    { icon: "bg-rose-100 text-rose-700",       border: "border-l-rose-500",    badge: "bg-rose-50 text-rose-700 border-rose-200" },
  amber:   { icon: "bg-amber-100 text-amber-700",     border: "border-l-amber-500",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
  emerald: { icon: "bg-emerald-100 text-emerald-700", border: "border-l-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  teal:    { icon: "bg-teal-100 text-teal-700",       border: "border-l-teal-500",    badge: "bg-teal-50 text-teal-700 border-teal-200" },
  purple:  { icon: "bg-purple-100 text-purple-700",   border: "border-l-purple-500",  badge: "bg-purple-50 text-purple-700 border-purple-200" },
  indigo:  { icon: "bg-indigo-100 text-indigo-700",   border: "border-l-indigo-500",  badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
};

export default function LearnPage() {
  const [search, setSearch] = useState("");
  const [openTopic, setOpenTopic] = useState<string | null>(null);

  const filtered = GLOSSARY.filter(
    (g) => g.term.toLowerCase().includes(search.toLowerCase()) || g.def.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Learn</h1>
              <p className="text-slate-500 text-sm mt-0.5">Understand every concept behind FinSight&apos;s analysis.</p>
            </div>
          </div>
        </motion.div>

        {/* Topics */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-5">Analysis Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TOPICS.map((t, i) => {
              const isOpen = openTopic === t.title;
              const c = COLOR_MAP[t.color] ?? COLOR_MAP.violet;
              return (
                <motion.div
                  key={t.title}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`overflow-hidden border-l-4 ${c.border}`}>
                    <button
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
                      onClick={() => setOpenTopic(isOpen ? null : t.title)}
                    >
                      <div className={`p-2 rounded-xl ${c.icon} shrink-0`}>
                        <t.icon className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-slate-900 flex-1">{t.title}</span>
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${isOpen ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                        {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-5 space-y-3 border-t border-slate-100 pt-3">
                            <p className="text-sm text-slate-600">{t.summary}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {t.rules.map((r) => (
                                <span key={r} className={`text-xs px-2.5 py-1 rounded-full font-medium border ${c.badge}`}>{r}</span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Glossary */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-5">Glossary</h2>
          <div className="relative mb-5">
            <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search terms…"
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
            />
          </div>
          <div className="space-y-3">
            {filtered.map((g, i) => (
              <motion.div
                key={g.term}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card className="p-4 hover:border-violet-200 transition-colors">
                  <p className="font-bold text-violet-700 text-sm">{g.term}</p>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{g.def}</p>
                </Card>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 mb-3">
                  <Search className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium">No matching terms found.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
          <strong>Disclaimer: </strong>All content is for educational purposes only. Ratios and thresholds are general guidelines — context matters. Not investment advice.
        </div>
      </div>
    </div>
  );
}
