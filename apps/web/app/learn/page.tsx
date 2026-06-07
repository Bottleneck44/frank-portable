"use client";
import { useState } from "react";
import {
  BookOpen, BarChart2, TrendingUp, Shield, Zap, Brain,
  Search, ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

/* ─── Data ─── */
const GLOSSARY = [
  { term: "Current Ratio", cat: "Liquidity", def: "Current assets divided by current liabilities. Above 1.5 generally indicates the company can pay short-term debts. Below 1.0 is a warning sign." },
  { term: "Debt-to-Equity (D/E)", cat: "Solvency", def: "Total debt divided by shareholders' equity. High D/E means the company is heavily financed by debt. Above 2.0 warrants scrutiny in most industries." },
  { term: "Operating Cash Flow", cat: "Cash Flow", def: "Cash generated from day-to-day business operations. More reliable than net income because it's harder to manipulate with accounting choices." },
  { term: "Return on Equity (ROE)", cat: "Profitability", def: "Net income divided by shareholders' equity. Measures how efficiently management uses shareholder capital. Above 15% is generally considered strong." },
  { term: "Gross Margin", cat: "Profitability", def: "Revenue minus cost of goods sold, as a percentage of revenue. Shows pricing power and production efficiency." },
  { term: "Altman Z-Score", cat: "Solvency", def: "A composite formula predicting bankruptcy risk. Z < 1.81: distress zone. 1.81–2.99: grey zone. Z > 2.99: safe zone." },
  { term: "Free Cash Flow (FCF)", cat: "Cash Flow", def: "Operating cash flow minus capital expenditure. The cash left after maintaining/growing the business — available for dividends, debt repayment, or buybacks." },
  { term: "Interest Coverage Ratio", cat: "Solvency", def: "EBIT divided by interest expense. Measures ability to pay interest. Below 1.5 is dangerous; below 1.0 means the company can't cover its interest." },
  { term: "Receivables Turnover", cat: "Efficiency", def: "Revenue divided by accounts receivable. How many times per year the company collects its average receivable. Declining ratio may indicate collection problems." },
  { term: "MACD", cat: "Technical", def: "Moving Average Convergence Divergence. A momentum indicator using the difference between 12-day and 26-day exponential moving averages. Crossovers signal potential trend changes." },
  { term: "RSI", cat: "Technical", def: "Relative Strength Index. A momentum oscillator measuring speed/change of price movements on a 0–100 scale. Above 70: potentially overbought. Below 30: potentially oversold." },
  { term: "Bollinger Bands", cat: "Technical", def: "Volatility bands placed above and below a moving average. %B measures where price is relative to the bands. Bandwidth measures volatility." },
  { term: "ADX", cat: "Technical", def: "Average Directional Index. Measures trend strength (not direction). Above 25 indicates a strong trend. Below 20 means the market is ranging/directionless." },
  { term: "R² (R-squared)", cat: "ML", def: "Statistical measure of how well a model explains variance in data (0–1). Used to weight model predictions in the ensemble — higher R² = more weight." },
  { term: "Directional Accuracy", cat: "ML", def: "Percentage of predictions where the model correctly predicted whether price would go up or down, regardless of magnitude." },
  { term: "Ensemble Prediction", cat: "ML", def: "A combined prediction from multiple models (XGBoost, LightGBM, Random Forest, LSTM) weighted by their R² scores. Reduces reliance on any single model." },
];

const CATEGORIES = [
  {
    n: "C1", icon: BarChart2, color: "violet", title: "Profitability",
    rules: ["Gross Margin trend", "Operating Margin", "Net Profit Margin", "Return on Assets", "Return on Equity", "Margin compression"],
    summary: "Profitability rules check whether the company is generating returns from its operations and assets, and whether those returns are improving or deteriorating over time.",
  },
  {
    n: "C2", icon: Shield, color: "blue", title: "Liquidity",
    rules: ["Current Ratio", "Quick Ratio", "Cash Ratio", "Working Capital trend"],
    summary: "Liquidity rules ensure the company has enough short-term assets to cover short-term obligations. Poor liquidity is one of the most common early signs of financial distress.",
  },
  {
    n: "C3", icon: TrendingUp, color: "rose", title: "Solvency & Leverage",
    rules: ["Debt-to-Equity", "Interest Coverage", "Debt-to-Assets", "Equity trend", "Negative equity override"],
    summary: "Solvency rules examine long-term debt sustainability. A company can be profitable but still go bankrupt if it can't service its debt load.",
  },
  {
    n: "C4", icon: Zap, color: "amber", title: "Efficiency",
    rules: ["Asset Turnover", "Inventory Turnover", "Receivables Turnover", "Days Receivables Outstanding"],
    summary: "Efficiency rules measure how well management converts assets into revenue. Declining turnover ratios often signal operational problems before they appear in profit figures.",
  },
  {
    n: "C5", icon: BookOpen, color: "emerald", title: "Earnings Quality",
    rules: ["Accruals ratio", "OCF vs Net Income", "Revenue recognition", "Beneish M-Score inputs", "Earnings smoothing"],
    summary: "These rules detect whether reported earnings are backed by real cash flows. High accruals relative to cash flow is a classic red flag for earnings manipulation.",
  },
  {
    n: "C6", icon: Shield, color: "teal", title: "Cash Flow",
    rules: ["OCF positivity", "FCF generation", "Capex ratio"],
    summary: "Cash flow rules are the most manipulation-resistant checks. Companies can engineer accounting profits, but cash is much harder to fake.",
  },
  {
    n: "C7", icon: TrendingUp, color: "indigo", title: "Growth",
    rules: ["Revenue CAGR", "Earnings CAGR"],
    summary: "Growth rules require at least 2 years of data. They check whether the company is expanding revenue and earnings at a sustainable pace.",
  },
  {
    n: "ML", icon: Brain, color: "purple", title: "ML Technical Signals",
    rules: ["RSI(14)", "MACD histogram", "Bollinger %B", "ADX strength", "Parabolic SAR", "Volatility", "Momentum 5/10/20d"],
    summary: "Four models (XGBoost, LightGBM, Random Forest, LSTM) trained on 2012–2024 NIFTY 50 data. R²-weighted ensemble. Available only for pre-trained NIFTY 50 tickers.",
  },
];

const ICON_COLOR: Record<string, string> = {
  violet: "text-violet-400", blue: "text-blue-400", rose: "text-rose-400",
  amber: "text-amber-400", emerald: "text-emerald-400", teal: "text-teal-400",
  purple: "text-purple-400", indigo: "text-indigo-400",
};
const BADGE_COLOR: Record<string, string> = {
  violet: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  blue:   "bg-blue-500/10 text-blue-300 border-blue-500/20",
  rose:   "bg-rose-500/10 text-rose-300 border-rose-500/20",
  amber:  "bg-amber-500/10 text-amber-300 border-amber-500/20",
  emerald:"bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  teal:   "bg-teal-500/10 text-teal-300 border-teal-500/20",
  purple: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  indigo: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
};

export default function LearnPage() {
  const [search, setSearch] = useState("");
  const [openCat, setOpenCat] = useState<string | null>(null);

  const filtered = GLOSSARY.filter(
    (g) =>
      g.term.toLowerCase().includes(search.toLowerCase()) ||
      g.def.toLowerCase().includes(search.toLowerCase()) ||
      g.cat.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-violet-600 selection:text-white">

      {/* ambient + dot grid */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-violet-600/8 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(circle, #a78bfa 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-24">

        {/* ── Hero ── */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="mb-24">
          <motion.p variants={fadeUp} className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-8">
            FRANK · Educational Literacy Layer
          </motion.p>
          <motion.h1 variants={fadeUp}
            className="text-[clamp(2.8rem,7vw,5.5rem)] font-black text-white leading-[0.95] tracking-tighter mb-6 max-w-3xl">
            Learn the language<br />
            <span className="text-violet-400">of financials.</span>
          </motion.h1>
          <motion.p variants={fadeUp}
            className="text-xl text-slate-400 font-light leading-relaxed max-w-xl mb-10">
            Every metric, rule, and ML signal explained in plain English — the same explanations embedded inside every FRANK analysis report.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
            {[
              { n: "30", label: "forensic rules" },
              { n: "8", label: "rule categories" },
              { n: "4", label: "ML model types" },
              { n: "16", label: "glossary terms" },
            ].map((s) => (
              <div key={s.label}
                className="flex items-baseline gap-1.5 bg-white/5 border border-white/8 px-4 py-2 rounded-full">
                <span className="text-sm font-black text-violet-400">{s.n}</span>
                <span className="text-xs text-slate-500">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Rule Categories — editorial rows ── */}
        <section className="mb-24">
          <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-2">
            Analysis categories
          </motion.p>
          <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="text-2xl font-black text-white tracking-tight mb-12">
            30 rules across 8 categories.
          </motion.p>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.05 }}
            className="space-y-0">
            {CATEGORIES.map((cat) => {
              const isOpen = openCat === cat.n;
              const Icon = cat.icon;
              return (
                <motion.div key={cat.n} variants={fadeUp}>
                  <button
                    onClick={() => setOpenCat(isOpen ? null : cat.n)}
                    className="group w-full flex items-start gap-8 py-7 border-t border-white/5 hover:border-violet-500/20 transition-colors duration-200 text-left">
                    {/* number */}
                    <span className="text-xs font-black text-slate-700 w-8 shrink-0 pt-1 group-hover:text-violet-500 transition-colors">
                      {cat.n}
                    </span>
                    {/* icon */}
                    <div className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 group-hover:bg-violet-600/15 transition-all", ICON_COLOR[cat.color])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {/* title + summary preview */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white mb-0.5">{cat.title}</p>
                      <p className="text-xs text-slate-600 group-hover:text-slate-500 transition-colors line-clamp-1">{cat.summary}</p>
                    </div>
                    {/* rule count */}
                    <span className="text-xs text-slate-700 shrink-0 hidden md:block pt-1">
                      {cat.rules.length} rules
                    </span>
                    {/* expand icon */}
                    <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}
                      className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-slate-600 group-hover:border-violet-500/30 group-hover:text-violet-400 transition-all mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }}
                        className="overflow-hidden">
                        <div className="pl-16 pb-8 space-y-5">
                          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">{cat.summary}</p>
                          <div className="flex flex-wrap gap-2">
                            {cat.rules.map((r) => (
                              <span key={r} className={clsx("text-xs px-2.5 py-1 rounded-full font-medium border", BADGE_COLOR[cat.color])}>
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
            <div className="border-t border-white/5" />
          </motion.div>
        </section>

        {/* ── Progressive Disclosure explainer strip ── */}
        <section className="mb-24">
          <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-12">
            Progressive disclosure — how FRANK teaches
          </motion.p>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {[
              { level: "L1", label: "Inline",     color: "text-violet-400", desc: "Every metric on the report page has a one-line explanation directly beneath it. No clicks required." },
              { level: "L2", label: "Contextual", color: "text-purple-400", desc: "Expand any rule to see its threshold, why it matters, and what your company's number means in context." },
              { level: "L3", label: "Deep dive",  color: "text-blue-400",   desc: "This page — full glossary, category summaries, and the theoretical basis of each analytical approach." },
            ].map((l) => (
              <motion.div key={l.level} variants={fadeUp} className="bg-slate-950 p-8 md:p-10 flex flex-col gap-4">
                <div className="flex items-baseline gap-2">
                  <span className={clsx("text-3xl font-black tracking-tighter", l.color)}>{l.level}</span>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{l.label}</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{l.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Glossary ── */}
        <section>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-10">
            <motion.p variants={fadeUp} className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-6">
              Glossary
            </motion.p>
            <motion.div variants={fadeUp} className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search terms, categories…"
                className="w-full pl-14 pr-5 py-4 bg-slate-900 border border-white/8 rounded-2xl text-sm font-medium text-white placeholder:text-slate-700 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all"
              />
            </motion.div>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.05 }}
            className="space-y-0">
            {filtered.map((g) => (
              <motion.div key={g.term} variants={fadeUp}
                className="group flex items-start gap-8 py-6 border-t border-white/5 hover:border-violet-500/10 transition-colors duration-200">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <p className="text-sm font-bold text-white">{g.term}</p>
                    <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">{g.cat}</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{g.def}</p>
                </div>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <div className="py-20 text-center border-t border-white/5">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 mb-4">
                  <Search className="h-6 w-6 text-slate-700" />
                </div>
                <p className="text-slate-600 font-medium">No matching terms.</p>
              </div>
            )}
            <div className="border-t border-white/5" />
          </motion.div>
        </section>

        {/* ── CTA ── */}
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="mt-24 pt-16 border-t border-white/5 text-center">
          <motion.h2 variants={fadeUp}
            className="text-3xl font-black text-white tracking-tight mb-4">
            Ready to see it in action?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-500 mb-10 max-w-sm mx-auto">
            Every concept above is embedded directly in the analysis report.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/analyze"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-10 py-5 text-base font-bold text-white shadow-2xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all">
              Analyze a Stock <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* disclaimer */}
        <p className="mt-12 text-xs text-slate-700 text-center">
          Educational purposes only · Not investment advice
        </p>
      </div>
    </div>
  );
}
