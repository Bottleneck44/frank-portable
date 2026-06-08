"use client";
import { useState } from "react";
import {
  BookOpen, BarChart2, TrendingUp, Shield, Zap, Brain,
  Search, ArrowRight, Droplets, Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const CATEGORIES = [
  { n: "C1", icon: BarChart2, color: "violet",
    title: "Profitability", ruleCount: 6,
    summary: "Checks whether the company generates strong returns and whether margins are improving or eroding.",
    rules: ["Gross Margin trend", "Operating Margin", "Net Profit Margin", "Return on Assets", "Return on Equity", "Margin compression"] },
  { n: "C2", icon: Droplets, color: "blue",
    title: "Liquidity", ruleCount: 4,
    summary: "Ensures short-term obligations can be met. Poor liquidity is one of the earliest distress signals.",
    rules: ["Current Ratio", "Quick Ratio", "Cash Ratio", "Working Capital trend"] },
  { n: "C3", icon: Shield, color: "rose",
    title: "Solvency & Leverage", ruleCount: 5,
    summary: "Examines long-term debt sustainability. A company can be profitable and still fail if debt is unserviceable.",
    rules: ["Debt-to-Equity", "Interest Coverage", "Debt-to-Assets", "Equity trend", "Negative equity override"] },
  { n: "C4", icon: Zap, color: "amber",
    title: "Efficiency", ruleCount: 4,
    summary: "Measures how well management converts assets into revenue. Declining turnover surfaces problems before profits do.",
    rules: ["Asset Turnover", "Inventory Turnover", "Receivables Turnover", "Days Receivables Outstanding"] },
  { n: "C5", icon: BookOpen, color: "emerald",
    title: "Earnings Quality", ruleCount: 5,
    summary: "Detects whether earnings are backed by real cash. High accruals vs cash is a classic manipulation red flag.",
    rules: ["Accruals ratio", "OCF vs Net Income", "Revenue recognition", "Beneish M-Score inputs", "Earnings smoothing"] },
  { n: "C6", icon: Activity, color: "teal",
    title: "Cash Flow", ruleCount: 3,
    summary: "The most manipulation-resistant layer. Actual cash inflows are far harder to engineer than accounting profits.",
    rules: ["OCF positivity", "FCF generation", "Capex ratio"] },
  { n: "C7", icon: TrendingUp, color: "indigo",
    title: "Growth", ruleCount: 2,
    summary: "Requires ≥ 2 years of data. Checks whether revenue and earnings expand at a sustainable pace.",
    rules: ["Revenue CAGR", "Earnings CAGR"] },
  { n: "ML", icon: Brain, color: "purple",
    title: "ML Technical", ruleCount: 7,
    summary: "XGBoost, LightGBM, Random Forest, LSTM — trained on 2012–2024 NIFTY 50 data — ensemble Technical Score.",
    rules: ["RSI(14)", "MACD histogram", "Bollinger %B", "ADX strength", "Parabolic SAR", "Volatility", "Momentum 5/10/20d"] },
];

const GLOSSARY = [
  { term: "Current Ratio",          cat: "Liquidity",     def: "Current assets ÷ current liabilities. Above 1.5 = healthy. Below 1.0 = warning." },
  { term: "Debt-to-Equity (D/E)",   cat: "Solvency",      def: "Total debt ÷ shareholders' equity. Above 2.0 warrants scrutiny in most sectors." },
  { term: "Operating Cash Flow",    cat: "Cash Flow",     def: "Cash from day-to-day operations. Harder to manipulate than net income." },
  { term: "Return on Equity (ROE)", cat: "Profitability", def: "Net income ÷ shareholders' equity. Above 15% is generally considered strong management." },
  { term: "Gross Margin",           cat: "Profitability", def: "Revenue minus COGS as a % of revenue. Reflects pricing power and production efficiency." },
  { term: "Altman Z-Score",         cat: "Solvency",      def: "Bankruptcy predictor: Z < 1.81 = distress, 1.81–2.99 = grey zone, > 2.99 = safe." },
  { term: "Free Cash Flow (FCF)",   cat: "Cash Flow",     def: "Operating cash flow minus capex. Cash available for dividends, debt repayment, or buybacks." },
  { term: "Interest Coverage",      cat: "Solvency",      def: "EBIT ÷ interest expense. Below 1.5 = dangerous. Below 1.0 = company cannot cover interest." },
  { term: "Receivables Turnover",   cat: "Efficiency",    def: "Revenue ÷ accounts receivable. Declining ratio may signal collection problems." },
  { term: "MACD",                   cat: "Technical",     def: "12-day minus 26-day EMA. Histogram crossovers signal potential momentum shifts." },
  { term: "RSI",                    cat: "Technical",     def: "0–100 momentum oscillator. Above 70 = potentially overbought. Below 30 = potentially oversold." },
  { term: "Bollinger Bands",        cat: "Technical",     def: "%B measures price position relative to volatility bands. Bandwidth tracks market volatility." },
  { term: "ADX",                    cat: "Technical",     def: "Trend strength indicator. Above 25 = strong trend. Below 20 = ranging / directionless." },
  { term: "R² (R-squared)",         cat: "ML",            def: "Explains variance (0–1). Higher R² = more weight in the ensemble prediction." },
  { term: "Directional Accuracy",   cat: "ML",            def: "% of times the model correctly predicted price direction, regardless of magnitude." },
  { term: "Ensemble Prediction",    cat: "ML",            def: "R²-weighted combination of XGBoost, LightGBM, Random Forest, and LSTM predictions." },
];

const C = {
  violet:  { bg: "bg-violet-500/12",  icon: "text-violet-400",  border: "border-violet-500/30",  bar: "bg-violet-500",  pill: "bg-violet-500/12 text-violet-300 border-violet-500/25",  num: "text-violet-500",  glow: "shadow-violet-500/25",  accent: "#7c3aed" },
  blue:    { bg: "bg-blue-500/12",    icon: "text-blue-400",    border: "border-blue-500/30",    bar: "bg-blue-500",    pill: "bg-blue-500/12 text-blue-300 border-blue-500/25",        num: "text-blue-500",    glow: "shadow-blue-500/25",    accent: "#3b82f6" },
  rose:    { bg: "bg-rose-500/12",    icon: "text-rose-400",    border: "border-rose-500/30",    bar: "bg-rose-500",    pill: "bg-rose-500/12 text-rose-300 border-rose-500/25",        num: "text-rose-500",    glow: "shadow-rose-500/25",    accent: "#f43f5e" },
  amber:   { bg: "bg-amber-500/12",   icon: "text-amber-400",   border: "border-amber-500/30",   bar: "bg-amber-500",   pill: "bg-amber-500/12 text-amber-300 border-amber-500/25",    num: "text-amber-500",   glow: "shadow-amber-500/25",   accent: "#f59e0b" },
  emerald: { bg: "bg-emerald-500/12", icon: "text-emerald-400", border: "border-emerald-500/30", bar: "bg-emerald-500", pill: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25", num: "text-emerald-500", glow: "shadow-emerald-500/25", accent: "#10b981" },
  teal:    { bg: "bg-teal-500/12",    icon: "text-teal-400",    border: "border-teal-500/30",    bar: "bg-teal-500",    pill: "bg-teal-500/12 text-teal-300 border-teal-500/25",        num: "text-teal-500",    glow: "shadow-teal-500/25",    accent: "#14b8a6" },
  indigo:  { bg: "bg-indigo-500/12",  icon: "text-indigo-400",  border: "border-indigo-500/30",  bar: "bg-indigo-500",  pill: "bg-indigo-500/12 text-indigo-300 border-indigo-500/25",  num: "text-indigo-500",  glow: "shadow-indigo-500/25",  accent: "#6366f1" },
  purple:  { bg: "bg-purple-500/12",  icon: "text-purple-400",  border: "border-purple-500/30",  bar: "bg-purple-500",  pill: "bg-purple-500/12 text-purple-300 border-purple-500/25",  num: "text-purple-500",  glow: "shadow-purple-500/25",  accent: "#a855f7" },
} as const;

const GLOSS_COLOR: Record<string, keyof typeof C> = {
  Liquidity: "blue", Solvency: "rose", Profitability: "violet",
  Efficiency: "amber", "Cash Flow": "teal", Technical: "indigo", ML: "purple",
};

function CategoryCard({ cat }: { cat: typeof CATEGORIES[number] }) {
  const [hovered, setHovered] = useState(false);
  const c = C[cat.color as keyof typeof C];
  const Icon = cat.icon;
  const pct = Math.round((cat.ruleCount / 30) * 100);

  return (
    <motion.div
      variants={fadeUp}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -5, scale: 1.015 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className={clsx(
        "glow-card relative bg-slate-900 rounded-2xl p-6 flex flex-col gap-5 overflow-hidden cursor-default",
        "border transition-colors duration-300",
        hovered ? c.border : "border-white/6"
      )}>

      {/* Top accent sweep */}
      <motion.div className={clsx("absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl", c.bar)}
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.28, ease }} />

      {/* Ambient glow blob */}
      <motion.div className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-2xl pointer-events-none"
        style={{ background: c.accent + "20" }}
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1.15 : 0.7 }}
        transition={{ duration: 0.35 }} />

      {/* Icon + number */}
      <div className="flex items-start justify-between relative z-10">
        <motion.div
          animate={{ scale: hovered ? 1.1 : 1, boxShadow: hovered ? `0 8px 24px -4px ${c.accent}40` : "none" }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          className={clsx("flex h-12 w-12 items-center justify-center rounded-2xl", c.bg)}>
          <Icon className={clsx("h-6 w-6", c.icon)} />
        </motion.div>
        <div className="text-right">
          <span className={clsx("block text-xl font-black tracking-tight leading-none", c.num)}>{cat.n}</span>
          <span className="block text-[10px] font-bold text-slate-700 mt-0.5 tabular-nums">{cat.ruleCount} rules</span>
        </div>
      </div>

      {/* Title + summary */}
      <div className="flex-1 relative z-10">
        <p className="text-sm font-bold text-white mb-2 leading-snug">{cat.title}</p>
        <p className="text-xs text-slate-500 leading-relaxed">{cat.summary}</p>
      </div>

      {/* Coverage bar */}
      <div className="relative z-10 space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-700">of 30 rules</span>
          <span className={clsx("font-black tabular-nums", c.num)}>{pct}%</span>
        </div>
        <div className="h-1 bg-white/6 rounded-full overflow-hidden">
          <motion.div className={clsx("h-full rounded-full", c.bar)}
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }} />
        </div>
      </div>

      {/* Rule badges — reveal on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease }}
            className="overflow-hidden relative z-10">
            <div className="pt-4 border-t border-white/6 flex flex-wrap gap-1.5">
              {cat.rules.map((r, i) => (
                <motion.span key={r}
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={clsx("text-[10px] px-2 py-0.5 rounded-full font-medium border", c.pill)}>
                  {r}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function GlossaryCard({ g }: { g: typeof GLOSSARY[number] }) {
  const ck = GLOSS_COLOR[g.cat] ?? "violet";
  const c = C[ck];
  return (
    <motion.div variants={fadeUp}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="glow-card relative bg-slate-900 border border-white/6 hover:border-white/10 rounded-2xl p-5 flex flex-col gap-3 overflow-hidden transition-colors duration-200">
      {/* Left accent bar */}
      <div className={clsx("absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full", c.bar)} />
      <div className="pl-4">
        <span className={clsx("inline-flex items-center text-[10px] font-black px-2.5 py-0.5 rounded-full border mb-3", c.pill)}>
          {g.cat}
        </span>
        <p className="text-sm font-bold text-white leading-snug mb-2">{g.term}</p>
        <p className="text-xs text-slate-500 leading-relaxed">{g.def}</p>
      </div>
    </motion.div>
  );
}

export default function LearnPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const cats = [...new Set(GLOSSARY.map(g => g.cat))];
  const filtered = GLOSSARY.filter((g) => {
    const matchSearch = !search ||
      g.term.toLowerCase().includes(search.toLowerCase()) ||
      g.def.toLowerCase().includes(search.toLowerCase()) ||
      g.cat.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !activeFilter || g.cat === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-violet-600 selection:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-violet-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-2/3 right-1/4 w-[400px] h-[300px] bg-purple-600/5 rounded-full blur-[80px]" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(circle, #a78bfa 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-24">

        {/* Hero */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="mb-24">
          <motion.p variants={fadeUp} className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-8">
            FRANK · Educational Literacy Layer
          </motion.p>
          <motion.h1 variants={fadeUp}
            className="text-[clamp(2.8rem,7vw,5.5rem)] font-black text-white leading-[0.95] tracking-tighter mb-6 max-w-3xl">
            Learn the language<br /><span className="text-violet-400">of financials.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-slate-400 font-light leading-relaxed max-w-xl mb-10">
            Every metric, rule, and ML signal explained in plain English — the same explanations inside every FRANK report.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
            {[{ n: "30", l: "forensic rules" }, { n: "8", l: "categories" }, { n: "4", l: "ML models" }, { n: "16", l: "glossary terms" }].map(s => (
              <div key={s.l} className="flex items-baseline gap-1.5 bg-white/5 border border-white/8 px-4 py-2 rounded-full">
                <span className="text-sm font-black text-violet-400">{s.n}</span>
                <span className="text-xs text-slate-500">{s.l}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Category cards */}
        <section className="mb-28">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-10">
            <motion.p variants={fadeUp} className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-3">
              Analysis categories
            </motion.p>
            <motion.div variants={fadeUp} className="flex items-end justify-between gap-4 flex-wrap">
              <p className="text-2xl font-black text-white tracking-tight">30 rules across 8 categories.</p>
              <p className="text-sm text-slate-600">Hover any card to reveal the rules inside.</p>
            </motion.div>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.05 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => <CategoryCard key={cat.n} cat={cat} />)}
          </motion.div>
        </section>

        {/* Progressive disclosure */}
        <section className="mb-28">
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
              <motion.div key={l.level} variants={fadeUp} className="glow-card bg-slate-950 p-8 md:p-10 flex flex-col gap-5">
                <div className="flex items-baseline gap-2">
                  <span className={clsx("text-4xl font-black tracking-tighter", l.color)}>{l.level}</span>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{l.label}</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{l.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Glossary */}
        <section>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-8">
            <motion.p variants={fadeUp} className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-3">Glossary</motion.p>
            <motion.p variants={fadeUp} className="text-2xl font-black text-white tracking-tight mb-8">Every term defined.</motion.p>

            <motion.div variants={fadeUp} className="relative mb-4">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search terms or categories…"
                className="w-full pl-14 pr-5 py-4 bg-slate-900 border border-white/8 rounded-2xl text-sm font-medium text-white placeholder:text-slate-700 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all" />
            </motion.div>

            {/* Filter pills */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
              <button onClick={() => setActiveFilter(null)}
                className={clsx("text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all",
                  !activeFilter ? "bg-violet-600 text-white border-violet-600" : "text-slate-500 border-white/8 hover:text-slate-300")}>
                All
              </button>
              {cats.map((cat) => {
                const c = C[GLOSS_COLOR[cat] ?? "violet"];
                const active = activeFilter === cat;
                return (
                  <button key={cat} onClick={() => setActiveFilter(active ? null : cat)}
                    className={clsx("text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all",
                      active ? c.pill : "text-slate-500 border-white/8 hover:text-slate-300")}>
                    {cat}
                  </button>
                );
              })}
            </motion.div>
          </motion.div>

          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((g) => <GlossaryCard key={g.term} g={g} />)}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="py-24 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 mb-4">
                  <Search className="h-7 w-7 text-slate-700" />
                </div>
                <p className="text-slate-600 font-medium">No matching terms.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* CTA */}
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="mt-24 pt-16 border-t border-white/5 text-center">
          <motion.h2 variants={fadeUp} className="text-3xl font-black text-white tracking-tight mb-4">
            Ready to see it in action?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-500 mb-10 max-w-sm mx-auto">
            Every concept above is embedded directly in the analysis report.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/analyze"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-10 py-5 text-base font-bold text-white shadow-2xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Analyze a Stock <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        <p className="mt-12 text-xs text-slate-700 text-center">Educational purposes only · Not investment advice</p>
      </div>
    </div>
  );
}
