"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2, ArrowRight, Brain, Shield, TrendingUp, Zap, BookOpen,
  Search, Menu, X, Sparkles, ChevronDown, ChevronUp, CheckCircle,
  Clock, Globe, Cpu, Star,
} from "lucide-react";
import clsx from "clsx";

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className={clsx(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled ? "bg-slate-900/95 backdrop-blur-lg shadow-lg" : "bg-slate-900"
      )}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <motion.div
                whileHover={{ rotate: 6, scale: 1.05 }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30"
              >
                <BarChart2 className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-xl font-black text-white tracking-tight">FinSight</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {[
                { label: "Why?", id: "why" },
                { label: "Features", id: "features" },
                { label: "How It Works", id: "how-it-works" },
                { label: "FAQ", id: "faq" },
              ].map(({ label, id }) => (
                <button key={label} onClick={() => scrollTo(id)}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  {label}
                </button>
              ))}
              <Link href="/learn" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Learn</Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/analyze"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all">
                  Analyze Now <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-white">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-900 border-t border-slate-800"
            >
              <div className="px-6 py-4 space-y-3">
                {[{ label: "Why?", id: "why" }, { label: "Features", id: "features" }, { label: "How It Works", id: "how-it-works" }, { label: "FAQ", id: "faq" }].map(({ label, id }) => (
                  <button key={label} onClick={() => { scrollTo(id); setMenuOpen(false); }}
                    className="block w-full py-2 text-left text-slate-300 font-medium">{label}</button>
                ))}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <Link href="/learn" onClick={() => setMenuOpen(false)} className="block py-2 text-slate-300">Learn</Link>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 text-slate-300">Dashboard</Link>
                  <Link href="/analyze" onClick={() => setMenuOpen(false)}
                    className="block w-full py-3 text-center rounded-xl bg-violet-600 text-white font-semibold">
                    Analyze Now →
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-white to-slate-50 pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-200 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-200 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-100 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-sm font-medium text-violet-700 mb-6"
              >
                <Sparkles className="h-4 w-4" /> Fundamental + ML Technical Analysis
              </motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                Understand stocks,
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 text-violet-600">not just prices.</span>
                  <motion.span
                    initial={{ width: 0 }} animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="absolute bottom-2 left-0 h-4 bg-violet-200 -z-10"
                  />
                </span>
              </h1>

              <p className="mt-8 text-xl text-slate-600 max-w-lg leading-relaxed">
                FinSight blends <span className="font-semibold text-slate-800">forensic accounting analysis</span> with
                machine learning signals into one composite score — and explains every step in plain English.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/analyze"
                    className="inline-flex items-center gap-3 rounded-full bg-slate-900 px-8 py-4 text-base font-semibold text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">
                    Analyze a Company <ArrowRight className="h-5 w-5" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/learn"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-6 py-4 text-base font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all">
                    <BookOpen className="h-4 w-4" /> Learn How It Works
                  </Link>
                </motion.div>
              </div>

              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {["A", "B", "C", "D"].map((l) => (
                    <div key={l} className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 border-2 border-white flex items-center justify-center text-white font-bold text-xs">
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm text-slate-500">Used by 500+ retail investors</p>
                </div>
              </div>
            </motion.div>

            {/* Right: Score Preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative"
            >
              <div className="relative rounded-3xl bg-white p-6 shadow-2xl shadow-slate-900/10 border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-violet-500/30">
                      R
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Reliance Industries</p>
                      <p className="text-sm text-slate-500">NSE: RELIANCE.NS</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-emerald-600">68</p>
                    <p className="text-xs text-slate-500">Composite</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <AnimatedScoreBar label="Fundamental" score={72} color="violet" delay={0.7} />
                  <AnimatedScoreBar label="Technical (ML)" score={61} color="blue" delay={0.9} />
                  <AnimatedScoreBar label="Composite" score={68} color="emerald" delay={1.1} />
                </div>

                <div className="mt-6 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-violet-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-violet-800 text-sm">28 / 32 rules passed</p>
                      <p className="text-xs text-violet-600 mt-0.5">All NIFTY 50 ML models available</p>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="absolute -top-6 -right-6 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 px-5 py-4 text-white shadow-xl shadow-violet-500/30"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-4 w-4" />
                  <p className="text-xs font-semibold opacity-90">ML ENSEMBLE</p>
                </div>
                <p className="text-2xl font-black">4 Models</p>
                <p className="text-xs opacity-80">XGBoost · LSTM · RF · LGB</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
                className="absolute -bottom-4 -left-4 rounded-xl bg-white px-4 py-3 shadow-xl border border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Healthy</p>
                    <p className="text-xs text-slate-500">Verdict: Strong</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-slate-900">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatItem value="32+" label="Forensic Rules" sublabel="Industry-standard" />
            <StatItem value="4" label="ML Models" sublabel="XGBoost · LSTM · RF · LGB" />
            <StatItem value="50" label="NIFTY Stocks" sublabel="Full ML coverage" />
            <StatItem value="<5s" label="Analysis Time" sublabel="Real-time results" />
          </div>
        </div>
      </section>

      {/* Why */}
      <section id="why" className="py-24 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-4">| WHY FINSIGHT?</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              Understand a company&apos;s
              <br />
              <span className="text-violet-600">financial health in minutes</span>
            </h2>
            <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
              Stop drowning in spreadsheets. FinSight automates the forensic analysis that analysts do manually — and explains every number.
            </p>
          </motion.div>
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <ValueCard icon={<Clock className="h-6 w-6" />} title="Save 10+ Hours"
              description="What takes analysts hours, FinSight does in seconds. Instant scoring across 32 accounting rules." />
            <ValueCard icon={<Brain className="h-6 w-6" />} title="ML-Powered Signals"
              description="4 models trained on 2012–2024 NIFTY 50 data deliver a technical ensemble score alongside fundamentals." />
            <ValueCard icon={<Globe className="h-6 w-6" />} title="Plain-English Explanations"
              description="Every score, flag, and weight is explained so you understand — not just see — the analysis." />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-slate-900 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-violet-400 uppercase tracking-wider mb-4">| FEATURES</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">Everything under the hood</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<BarChart2 className="h-6 w-6" />} title="32 Forensic Rules"
              description="Profitability, liquidity, solvency, efficiency, earnings quality, cash flow — every dimension scored." />
            <FeatureCard icon={<Brain className="h-6 w-6" />} title="4 ML Models"
              description="XGBoost, LightGBM, Random Forest, LSTM ensemble trained on NIFTY 50 price history." />
            <FeatureCard icon={<Zap className="h-6 w-6" />} title="Composite Score"
              description="Fundamental + technical fused with adaptive weights. One number, full transparency." />
            <FeatureCard icon={<BookOpen className="h-6 w-6" />} title="Learn As You Go"
              description="Every rule comes with a plain-English explanation. No jargon left unexplained." />
            <FeatureCard icon={<Shield className="h-6 w-6" />} title="Risk Overrides"
              description="Hard caps for negative equity, Altman Z &lt; 1.81, and other critical conditions." />
            <FeatureCard icon={<TrendingUp className="h-6 w-6" />} title="Edge Case Handling"
              description="IPOs, penny stocks, missing data — detected and disclosed, never silently broken." />
          </div>
          <div className="mt-12 text-center">
            <Link href="/analyze" className="inline-flex items-center gap-2 text-violet-400 font-semibold hover:text-violet-300 transition-colors">
              Start analyzing now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-4">| HOW IT WORKS</p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-16">Four simple steps</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "01", icon: <Search className="h-5 w-5" />, title: "Input", desc: "Paste a NIFTY 50 ticker or upload financial statements as JSON." },
              { n: "02", icon: <Cpu className="h-5 w-5" />, title: "Analyze", desc: "32 accounting rules + 4 ML models run in parallel." },
              { n: "03", icon: <BarChart2 className="h-5 w-5" />, title: "Understand", desc: "Every score, flag, and weight explained in plain English." },
              { n: "04", icon: <CheckCircle className="h-5 w-5" />, title: "Decide", desc: "You decide — we never tell you what to buy." },
            ].map((step, i) => (
              <motion.div key={step.n}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex flex-col gap-4 rounded-2xl bg-white border border-slate-200 p-6 hover:border-violet-200 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
                    {step.icon}
                  </div>
                  <span className="text-xs font-black text-violet-600">{step.n}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 scroll-mt-20">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-4">| FAQ</p>
          <h2 className="text-4xl font-black text-slate-900 mb-12">Common questions</h2>
          <div className="space-y-4">
            {[
              { q: "Is this investment advice?", a: "No. FinSight is strictly educational. It shows forensic accounting signals and ML predictions. You make the final decision — always consult a qualified financial advisor." },
              { q: "Which stocks support full ML analysis?", a: "All 50 NIFTY 50 stocks have pre-trained models. Any ticker can run fundamental-only analysis using live Yahoo Finance data." },
              { q: "Can I upload my own financial data?", a: "Yes — paste JSON in the format { years: [...] } or type a ticker. Manual entry form is coming soon." },
              { q: "How are the ML models trained?", a: "XGBoost, LightGBM, Random Forest, and LSTM are trained on 2012–2024 NIFTY 50 price and technical indicator history. Predictions are R²-weighted into an ensemble." },
              { q: "What does the Composite Score mean?", a: "It blends the Fundamental Score and Technical Score using adaptive weights — typically 60/40, but adjusted if data confidence is low or strong trends exist." },
              { q: "Is my data stored?", a: "No. Analyses run in-memory during your session and are cleared when you close the browser tab. Nothing is persisted server-side." },
            ].map((faq) => <FAQItem key={faq.q} question={faq.q} answer={faq.a} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-violet-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to analyze your first stock?</h2>
            <p className="text-xl text-violet-100 mb-10">
              Supports all NIFTY 50 stocks with full ML analysis. Any ticker works for fundamental-only mode.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/analyze"
                className="inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-lg font-bold text-violet-700 hover:bg-slate-50 transition-all shadow-2xl">
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                  <BarChart2 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black text-white">FinSight</span>
              </Link>
              <p className="text-slate-400 text-sm">Forensic + ML financial analysis for retail investors.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/analyze" className="hover:text-white transition-colors">Analyze</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/learn" className="hover:text-white transition-colors">Learn</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Analysis</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><button onClick={() => scrollTo("features")} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollTo("how-it-works")} className="hover:text-white transition-colors">How It Works</button></li>
                <li><button onClick={() => scrollTo("faq")} className="hover:text-white transition-colors">FAQ</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>Not SEBI registered.</li>
                <li>Educational use only.</li>
                <li>Not investment advice.</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">© 2026 FinSight. Educational platform.</p>
            <p className="text-sm text-slate-500">⚠️ Not investment advice. Consult a qualified financial advisor.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sub-components

function AnimatedScoreBar({ label, score, color, delay }: { label: string; score: number; color: "violet" | "blue" | "emerald"; delay: number }) {
  const bars = {
    violet: "bg-gradient-to-r from-violet-500 to-purple-500",
    blue: "bg-gradient-to-r from-blue-500 to-sky-500",
    emerald: "bg-gradient-to-r from-emerald-500 to-teal-500",
  };
  const texts = { violet: "text-violet-600", blue: "text-blue-600", emerald: "text-emerald-600" };
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className={`text-sm font-bold ${texts[color]}`}>{score}</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay }}
          className={`h-full rounded-full ${bars[color]}`}
        />
      </div>
    </div>
  );
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="rounded-2xl bg-white border border-slate-200 p-8 text-center hover:shadow-xl hover:border-violet-200 hover:-translate-y-1 transition-all"
    >
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 mb-6">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="rounded-2xl bg-slate-800 border border-slate-700 p-6 hover:border-violet-500/50 transition-all group"
    >
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 mb-4 group-hover:bg-violet-600/30 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </motion.div>
  );
}

function StatItem({ value, label, sublabel }: { value: string; label: string; sublabel: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <p className="text-5xl md:text-6xl font-black text-white mb-2">{value}</p>
      <p className="text-lg font-semibold text-slate-300">{label}</p>
      <p className="text-sm text-slate-500">{sublabel}</p>
    </motion.div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-violet-200 transition-colors"
    >
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-6 text-left">
        <span className="font-bold text-slate-900">{question}</span>
        <div className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
          open ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600")}>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6"><p className="text-slate-600">{answer}</p></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
