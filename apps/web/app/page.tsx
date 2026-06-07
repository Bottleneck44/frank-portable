"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2, ArrowRight, Brain, Shield, BookOpen,
  Search, Menu, X, ChevronDown, ChevronUp,
  Cpu, AlertTriangle, Users, FileText, GraduationCap, Layers,
  Activity, Target, FlaskConical, BarChart3, Zap,
} from "lucide-react";
import clsx from "clsx";

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const NAV_SECTIONS = [
    { label: "Problem", id: "problem" },
    { label: "Approach", id: "approach" },
    { label: "Results", id: "results" },
    { label: "Demo", id: "demo" },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ── Sticky Nav ── */}
      <nav className={clsx(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled ? "bg-slate-900/95 backdrop-blur-lg shadow-lg" : "bg-slate-900"
      )}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <motion.div whileHover={{ rotate: 6, scale: 1.05 }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                <BarChart2 className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-xl font-black text-white tracking-tight">FinSight</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {NAV_SECTIONS.map(({ label, id }) => (
                <button key={id} onClick={() => scrollTo(id)}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  {label}
                </button>
              ))}
              <Link href="/learn" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Learn</Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">Dashboard</Link>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/analyze"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all">
                  Try Demo <ArrowRight className="h-4 w-4" />
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
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="md:hidden bg-slate-900 border-t border-slate-800">
              <div className="px-6 py-4 space-y-3">
                {NAV_SECTIONS.map(({ label, id }) => (
                  <button key={id} onClick={() => { scrollTo(id); setMenuOpen(false); }}
                    className="block w-full py-2 text-left text-slate-300 font-medium">{label}</button>
                ))}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <Link href="/learn" onClick={() => setMenuOpen(false)} className="block py-2 text-slate-300">Learn</Link>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 text-slate-300">Dashboard</Link>
                  <Link href="/analyze" onClick={() => setMenuOpen(false)}
                    className="block w-full py-3 text-center rounded-xl bg-violet-600 text-white font-semibold">
                    Try Demo →
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Hero: Project Cover ── */}
      <section className="relative bg-slate-900 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-900/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "radial-gradient(circle, #a78bfa 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-3 mb-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-600/20 border border-violet-500/30 px-4 py-1.5 text-sm font-semibold text-violet-300">
              <GraduationCap className="h-4 w-4" /> Final Year Project — 2025–26
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-800 border border-slate-700 px-4 py-1.5 text-sm font-medium text-slate-300">
              <FileText className="h-4 w-4" /> Published · IJRTI | ISSN: 2456-3315
            </span>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                FinIntelli
                <span className="block text-2xl md:text-3xl font-bold text-violet-400 mt-2 tracking-normal">
                  A Dual-Layer Financial Intelligence Framework
                </span>
              </h1>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-xl">
                Integrating Educational Literacy and Deterministic Forensic Analysis for Indian Retail Investors — extended with a 4-model ML Ensemble for NIFTY 50 technical signals.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                  <p className="text-slate-400 text-xs mb-1 uppercase tracking-wide">Team</p>
                  <p className="text-white font-semibold leading-relaxed">Ananda D<br />Madhumitha S<br />Kamalika M</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                  <p className="text-slate-400 text-xs mb-1 uppercase tracking-wide">Guide</p>
                  <p className="text-white font-semibold">Dr. P. Vinothiyalakshmi</p>
                  <p className="text-slate-400 text-xs mt-2">Dept. of AI & Data Science<br />SVCE, Chennai</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/analyze"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all">
                    Launch Live Demo <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
                <button onClick={() => scrollTo("approach")}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-600 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition-all">
                  View Methodology <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </motion.div>

            {/* Key metrics grid */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="grid grid-cols-2 gap-4">
              {[
                { value: "85%", label: "Concordance with Altman Z-Score", color: "violet" },
                { value: "95%", label: "Within-one-tier concordance", color: "emerald" },
                { value: "30", label: "Deterministic forensic rules", color: "blue" },
                { value: "0.72", label: "Heuristic severity (0–4 Nielsen scale)", color: "amber" },
                { value: "4", label: "ML models — XGBoost · LSTM · RF · LGB", color: "violet" },
                { value: "<100ms", label: "Analysis latency, 30 rules / 3yr history", color: "emerald" },
              ].map((m, i) => (
                <motion.div key={m.label}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.07 }}
                  className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 hover:border-violet-500/40 transition-colors">
                  <p className={clsx("text-2xl font-black mb-1",
                    m.color === "violet" ? "text-violet-400" :
                    m.color === "emerald" ? "text-emerald-400" :
                    m.color === "blue" ? "text-blue-400" : "text-amber-400"
                  )}>{m.value}</p>
                  <p className="text-xs text-slate-400 leading-snug">{m.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Problem Statement ── */}
      <section id="problem" className="py-24 bg-white scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-4">| THE PROBLEM</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
              The Indian Retail Investor Crisis
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="space-y-6 text-slate-600 leading-relaxed">
              <p>
                India&apos;s demat accounts grew from <strong className="text-slate-900">4 crore (2019) to 15+ crore (2024)</strong> — yet SEBI&apos;s 2023 study revealed that <strong className="text-red-600">89% of individual F&O traders incur net losses</strong>, collectively losing <strong className="text-red-600">₹1.8 lakh crore</strong> (~USD 21.6 billion) in a single fiscal year.
              </p>
              <p>This is not a technology problem. Trading apps are widely available. It is a <strong className="text-slate-900">dual deficit</strong>:</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">Literacy Deficit</p>
                    <p className="text-sm text-red-600 mt-0.5">Retail investors lack the cognitive frameworks to interpret financial statements, balance sheets, and accounting signals.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800">Tooling Deficit</p>
                    <p className="text-sm text-amber-600 mt-0.5">No accessible tool systematically analyzes company health using forensic accounting methods and explains every step in plain English.</p>
                  </div>
                </div>
              </div>
              <p>Existing platforms separate education from analysis, forcing context-switching — and use opaque methodologies that reduce investor trust.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="space-y-4">
              {[
                { stat: "15 Cr+", desc: "Demat accounts as of 2024 (up 4× since 2019)", color: "violet" },
                { stat: "89%", desc: "F&O traders with net losses — SEBI 2023 study", color: "red" },
                { stat: "₹1.8L Cr", desc: "Aggregate retail losses in a single fiscal year", color: "red" },
                { stat: "0", desc: "Accessible forensic analysis tools for Indian retail investors", color: "amber" },
              ].map((s, i) => (
                <motion.div key={s.stat} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-5 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <p className={clsx("text-3xl font-black shrink-0 w-28",
                    s.color === "violet" ? "text-violet-600" :
                    s.color === "red" ? "text-red-600" : "text-amber-600"
                  )}>{s.stat}</p>
                  <p className="text-sm text-slate-600 leading-snug">{s.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Research Contributions ── */}
      <section className="py-20 bg-slate-900">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <p className="text-sm font-bold text-violet-400 uppercase tracking-wider mb-4">| RESEARCH CONTRIBUTIONS</p>
            <h2 className="text-4xl font-black text-white">Four core contributions</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { id: "C1", icon: <Cpu className="h-5 w-5" />, title: "Web Platform", body: "Real-time forensic analysis for any listed company using live Yahoo Finance data. Sub-100ms latency for 30 rules across 3-year financial histories." },
              { id: "C2", icon: <Shield className="h-5 w-5" />, title: "Forensic Engine (DFAL)", body: "30 deterministic rules across 7 analytical categories with a severity-weighted verdict algorithm. Validated against Altman Z-Score across 20 Indian companies." },
              { id: "C3", icon: <BookOpen className="h-5 w-5" />, title: "Progressive Disclosure (ELL)", body: "Three-level educational model (L1: inline → L2: contextual → L3: deep-dive) grounded in cognitive load theory. Mean heuristic severity 0.72/4.0." },
              { id: "C4", icon: <FlaskConical className="h-5 w-5" />, title: "Multi-dimensional Evaluation", body: "Concordance analysis, 5 retrospective case studies (distressed firms with 12+ months advance signaling), expert heuristic evaluation, and performance benchmarking." },
            ].map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-violet-500/40 transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 group-hover:bg-violet-600/30 transition-colors">
                    {c.icon}
                  </div>
                  <span className="text-xs font-black text-violet-400 tracking-wider">{c.id}</span>
                  <h3 className="font-bold text-white">{c.title}</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{c.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Methodology / Architecture ── */}
      <section id="approach" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
            <p className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-4">| METHODOLOGY</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              Dual-layer architecture +<br />
              <span className="text-violet-600">ML ensemble</span>
            </h2>
            <p className="mt-6 text-xl text-slate-600 max-w-2xl">
              FinSight is the full-stack implementation of FinIntelli — adding a 4-model ML ensemble on top of the DFAL + ELL layers.
            </p>
          </motion.div>

          {/* Pipeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-white border border-slate-200 rounded-3xl p-8 mb-10 shadow-sm">
            <h3 className="text-base font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Layers className="h-5 w-5 text-violet-500" /> Analysis Pipeline
            </h3>
            <div className="flex flex-col md:flex-row items-stretch gap-2">
              {[
                { label: "Input", sub: "Ticker / JSON / Manual", border: "border-slate-200" },
                { label: "Market Data", sub: "Yahoo Finance (live)", border: "border-blue-200", text: "text-blue-700", bg: "bg-blue-50" },
                { label: "Forensic Rules (DFAL)", sub: "30 rules · 7 categories", border: "border-violet-200", text: "text-violet-700", bg: "bg-violet-50" },
                { label: "ML Ensemble", sub: "XGBoost · LSTM · RF · LGB", border: "border-purple-200", text: "text-purple-700", bg: "bg-purple-50" },
                { label: "Fusion Engine", sub: "Adaptive weight blending", border: "border-indigo-200", text: "text-indigo-700", bg: "bg-indigo-50" },
                { label: "Verdict + ELL", sub: "Score · Flags · Education", border: "border-emerald-200", text: "text-emerald-700", bg: "bg-emerald-50" },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-2 flex-1">
                  <div className={clsx("flex-1 rounded-xl p-3 border text-center", step.bg ?? "bg-slate-100", step.border)}>
                    <p className={clsx("text-xs font-bold", step.text ?? "text-slate-700")}>{step.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.sub}</p>
                  </div>
                  {i < 5 && <ArrowRight className="h-4 w-4 text-slate-300 shrink-0 hidden md:block" />}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Layer details */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Shield className="h-5 w-5 text-violet-600" />, bg: "bg-violet-100", border: "border-violet-200",
                title: "DFAL — Forensic Rules", accent: "text-violet-400",
                points: [
                  "30 deterministic rules; pure functions (no ML)",
                  "7 categories: Profitability, Liquidity, Solvency, Efficiency, Earnings Quality, Cash Flow, Growth",
                  "Severity-weighted verdict: Healthy / Caution / High Risk",
                  "Hard overrides: negative equity, Altman Z < 1.81",
                ],
              },
              {
                icon: <Brain className="h-5 w-5 text-purple-600" />, bg: "bg-purple-100", border: "border-purple-200",
                title: "ML Ensemble — Technical", accent: "text-purple-400",
                points: [
                  "4 models: XGBoost, LightGBM, Random Forest, LSTM",
                  "Trained on 2012–2024 NIFTY 50 price history",
                  "21-feature matrix from technical indicators",
                  "R²-weighted ensemble → Technical Score 0–100",
                ],
              },
              {
                icon: <BookOpen className="h-5 w-5 text-blue-600" />, bg: "bg-blue-100", border: "border-blue-200",
                title: "ELL — Progressive Disclosure", accent: "text-blue-400",
                points: [
                  "L1: Inline explanations on every metric",
                  "L2: Contextual deep-dives per rule",
                  "L3: Glossary & topic articles (/learn)",
                  "Grounded in cognitive load theory + Nielsen heuristics",
                ],
              },
            ].map((layer, i) => (
              <motion.div key={layer.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={clsx("bg-white border rounded-2xl p-6 shadow-sm", layer.border)}>
                <div className={clsx("flex h-10 w-10 items-center justify-center rounded-xl mb-4", layer.bg)}>
                  {layer.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-3">{layer.title}</h3>
                <ul className="text-sm text-slate-600 space-y-1.5 leading-relaxed">
                  {layer.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className={clsx("font-bold shrink-0", layer.accent)}>·</span> {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Demo Features ── */}
      <section id="demo" className="py-24 bg-slate-900 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <p className="text-sm font-bold text-violet-400 uppercase tracking-wider mb-4">| LIVE DEMO</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">Explore each feature</h2>
            <p className="mt-4 text-slate-400 text-lg">Every button below opens the real, working application.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <Search className="h-6 w-6" />, title: "Stock Ticker Analysis",
                desc: "Enter any NIFTY 50 ticker and get a full forensic + ML report in under 5 seconds. Try RELIANCE.NS, TCS.NS, or HDFCBANK.NS.",
                cta: "Run Analysis", href: "/analyze", badge: "Core Feature", badgeColor: "violet",
              },
              {
                icon: <BarChart3 className="h-6 w-6" />, title: "Composite Score Report",
                desc: "Full report: Verdict header, category radar, ML predictions, red flag table, and progressive disclosure breakdowns. Every score explained.",
                cta: "View Sample Report", href: "/analyze", badge: "DFAL + ELL", badgeColor: "purple",
              },
              {
                icon: <Brain className="h-6 w-6" />, title: "ML Ensemble Predictions",
                desc: "4 pre-trained models produce individual predictions; R²-weighted ensemble gives a Technical Score 0–100 with directional consensus.",
                cta: "See ML in Action", href: "/analyze", badge: "Technical Layer", badgeColor: "blue",
              },
              {
                icon: <BookOpen className="h-6 w-6" />, title: "Educational Glossary",
                desc: "Three-level progressive disclosure — every financial term and rule explained in plain English. The Learn → Understand → Validate pipeline.",
                cta: "Open Learn Module", href: "/learn", badge: "ELL · L1–L3", badgeColor: "emerald",
              },
              {
                icon: <Activity className="h-6 w-6" />, title: "Session Dashboard",
                desc: "Compare multiple stocks side-by-side. Fundamental vs Technical scatter plot. Session history preserved in browser storage.",
                cta: "Open Dashboard", href: "/dashboard", badge: "Dashboard", badgeColor: "amber",
              },
              {
                icon: <Shield className="h-6 w-6" />, title: "Edge Case Handling",
                desc: "IPO stocks, penny stocks, missing data, stale financials — every anomaly detected, disclosed, and mitigated. Never silently broken.",
                cta: "Try with JSON Data", href: "/analyze", badge: "Reliability", badgeColor: "violet",
              },
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-violet-500/50 transition-all group flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 group-hover:bg-violet-600/30 transition-colors">
                    {f.icon}
                  </div>
                  <span className={clsx("text-xs font-bold px-2.5 py-1 rounded-full border",
                    f.badgeColor === "violet" ? "bg-violet-900/30 text-violet-300 border-violet-700/50" :
                    f.badgeColor === "purple" ? "bg-purple-900/30 text-purple-300 border-purple-700/50" :
                    f.badgeColor === "blue" ? "bg-blue-900/30 text-blue-300 border-blue-700/50" :
                    f.badgeColor === "emerald" ? "bg-emerald-900/30 text-emerald-300 border-emerald-700/50" :
                    "bg-amber-900/30 text-amber-300 border-amber-700/50"
                  )}>{f.badge}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-5">{f.desc}</p>
                <Link href={f.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors group/link">
                  {f.cta} <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Results ── */}
      <section id="results" className="py-24 bg-white scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
            <p className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-4">| EVALUATION & RESULTS</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">Multi-dimensional validation</h2>
            <p className="mt-6 text-xl text-slate-600 max-w-2xl">
              Evaluated across 20 Indian listed companies spanning 7 sectors, with 4 complementary validation dimensions.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Concordance */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100">
                  <Target className="h-5 w-5 text-violet-600" />
                </div>
                <h3 className="font-bold text-slate-900">Analytical Validity</h3>
              </div>
              <div className="space-y-4">
                <ResultBar label="Exact concordance with Altman Z-Score" value={85} color="violet" />
                <ResultBar label="Within-one-tier concordance" value={95} color="emerald" />
                <ResultBar label="Case studies correctly classified (5/5)" value={100} color="blue" />
              </div>
              <p className="mt-5 text-xs text-slate-500 leading-relaxed">
                20 companies: Technology (4), Banking (4), Oil & Gas (2), FMCG (4), Pharma (3), Auto (3). Banking divergences are intentional — D/E threshold tuned for non-banking sectors.
              </p>
            </motion.div>

            {/* Case Studies */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                  <FlaskConical className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900">Retrospective Case Studies</h3>
              </div>
              <div className="space-y-3">
                {[
                  { company: "HUL", verdict: "Healthy", detail: "29/30 rules passed · AAA credit aligned · ROE 75%+", color: "emerald" },
                  { company: "TCS", verdict: "Healthy", detail: "Cash-rich, zero D/E, consistent profitability", color: "emerald" },
                  { company: "Yes Bank (pre-crisis)", verdict: "High Risk", detail: "Flagged 12+ months before collapse · Altman Z critical", color: "red" },
                  { company: "Jet Airways", verdict: "High Risk", detail: "Negative equity & persistent OCF losses — correctly flagged", color: "red" },
                  { company: "Tata Motors (FY19)", verdict: "Caution", detail: "JLR losses, elevated leverage — Caution correctly assigned", color: "amber" },
                ].map((cs) => (
                  <div key={cs.company} className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-3.5">
                    <span className={clsx("text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5",
                      cs.color === "emerald" ? "bg-emerald-100 text-emerald-700" :
                      cs.color === "red" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    )}>{cs.verdict}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{cs.company}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{cs.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Heuristic */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900">Interface — Heuristic Evaluation</h3>
              </div>
              <div className="flex items-center gap-6 mb-5">
                <div className="text-center shrink-0">
                  <p className="text-5xl font-black text-violet-600">0.72</p>
                  <p className="text-xs text-slate-500 mt-1">Mean severity<br />(0–4 Nielsen scale)</p>
                </div>
                <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
                  <p>Evaluated using <strong>Nielsen&apos;s 10 Usability Heuristics</strong> by 3 expert evaluators with dual UX + finance expertise.</p>
                  <p>Lowest severity on <strong>H3 (user control)</strong> and <strong>H6 (recognition)</strong> — the most relevant heuristics for information architecture.</p>
                </div>
              </div>
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-3.5 text-xs text-violet-700">
                <strong>Key finding:</strong> Progressive disclosure effectively manages financial information complexity without overwhelming non-expert users.
              </div>
            </motion.div>

            {/* Performance */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                  <Zap className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-slate-900">System Performance</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "<100ms", label: "Forensic analysis latency (30 rules · 3yr history)" },
                  { value: "<5s", label: "Full pipeline including ML inference" },
                  { value: "30", label: "Deterministic rules run in parallel" },
                  { value: "49", label: "NIFTY 50 stocks with full ML support" },
                ].map((p) => (
                  <div key={p.label} className="bg-white border border-slate-200 rounded-xl p-4">
                    <p className="text-2xl font-black text-slate-900 mb-1">{p.value}</p>
                    <p className="text-xs text-slate-500 leading-snug">{p.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="py-20 bg-slate-900">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <p className="text-sm font-bold text-violet-400 uppercase tracking-wider mb-4">| TECHNOLOGY STACK</p>
            <h2 className="text-3xl font-black text-white">Built with</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { layer: "Frontend", items: ["Next.js 16", "React 19", "TypeScript 5", "Tailwind CSS 4", "Framer Motion 12", "Recharts 3"] },
              { layer: "Rules Engine", items: ["Pure TypeScript", "30 forensic rules", "Zod validation", "Zustand state", "Zero server deps"] },
              { layer: "ML Backend", items: ["FastAPI + Pydantic v2", "XGBoost", "LightGBM", "Random Forest", "TensorFlow LSTM", "Python 3.11"] },
              { layer: "Data", items: ["yahoo-finance2 (Node)", "yfinance (Python)", "21 engineered features", "pandas 2 + numpy"] },
            ].map((group, i) => (
              <motion.div key={group.layer} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <p className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-3">{group.layer}</p>
                <ul className="space-y-1.5">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Limitations & Future Work ── */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-4">| LIMITATIONS & FUTURE WORK</p>
          <h2 className="text-4xl font-black text-slate-900 mb-12">Honest acknowledgements</h2>
          <div className="space-y-4">
            {[
              { q: "Is this investment advice?", a: "No. FinSight is strictly educational and for research purposes. It surfaces forensic accounting signals and ML predictions. All analysis outputs include explicit disclaimers. Users make their own decisions." },
              { q: "What are the current limitations?", a: "Rule thresholds are calibrated for non-banking companies — banking and NBFC sectors need separate threshold libraries. The 20-company evaluation dataset is diverse but represents a small fraction of ~5,000 NSE/BSE-listed companies. The heuristic evaluation used expert evaluators, not end-users." },
              { q: "What is planned as future work?", a: "Industry-specific rule calibration for banking/NBFCs; controlled user study (N≥30) with pre/post comprehension measurement; generative AI integration for conversational learning; portfolio-level risk assessment; longitudinal validation tracking verdicts against future financial events." },
              { q: "How does the ML layer relate to the DFAL?", a: "They are independent layers fused by the adaptive Fusion Engine. The DFAL runs deterministic forensic rules (explainable, rule-based). The ML layer runs 4 pre-trained models on technical price indicators. Fusion weights adapt based on data confidence — typically 60% fundamental, 40% technical." },
            ].map((faq) => <FAQItem key={faq.q} question={faq.q} answer={faq.a} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-gradient-to-br from-violet-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Try the live demo</h2>
            <p className="text-xl text-violet-100 mb-10">
              Analyze any NIFTY 50 stock with full forensic + ML analysis.<br />
              All 49 tickers supported. Results in under 5 seconds.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/analyze"
                  className="inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-lg font-bold text-violet-700 hover:bg-slate-50 transition-all shadow-2xl">
                  Analyze a Stock <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/learn"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-8 py-5 text-lg font-bold text-white hover:bg-white/20 transition-all">
                  <BookOpen className="h-5 w-5" /> Learn Module
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
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
              <p className="text-slate-400 text-sm mb-3">FinIntelli implementation — final year project.</p>
              <p className="text-slate-500 text-xs">Dept. of AI & Data Science<br />SVCE, Chennai · 2025–26</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Application</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/analyze" className="hover:text-white transition-colors">Analyze</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/learn" className="hover:text-white transition-colors">Learn</Link></li>
                <li><Link href="/architecture" className="hover:text-white transition-colors">Architecture</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Research</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><button onClick={() => scrollTo("problem")} className="hover:text-white transition-colors">Problem Statement</button></li>
                <li><button onClick={() => scrollTo("approach")} className="hover:text-white transition-colors">Methodology</button></li>
                <li><button onClick={() => scrollTo("results")} className="hover:text-white transition-colors">Results</button></li>
                <li><button onClick={() => scrollTo("demo")} className="hover:text-white transition-colors">Live Demo</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Publication</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li className="text-slate-400 font-medium">IJRTI | ISSN: 2456-3315</li>
                <li>Ananda D, Madhumitha S,</li>
                <li>Kamalika M</li>
                <li className="pt-1">Guide: Dr. P. Vinothiyalakshmi</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">© 2026 FinSight · Final Year Project · SVCE Chennai</p>
            <p className="text-sm text-slate-500">⚠ Not investment advice · Educational & research use only</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ResultBar({ label, value, color }: { label: string; value: number; color: "violet" | "emerald" | "blue" }) {
  const barColor = { violet: "bg-violet-500", emerald: "bg-emerald-500", blue: "bg-blue-500" }[color];
  const textColor = { violet: "text-violet-600", emerald: "text-emerald-600", blue: "text-blue-600" }[color];
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-700 font-medium">{label}</span>
        <span className={clsx("font-black", textColor)}>{value}%</span>
      </div>
      <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <motion.div className={clsx("h-full rounded-full", barColor)}
          initial={{ width: 0 }} whileInView={{ width: `${value}%` }}
          viewport={{ once: true }} transition={{ duration: 1, ease: "easeOut" }} />
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-violet-200 transition-colors">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-6 text-left">
        <span className="font-bold text-slate-900">{question}</span>
        <div className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
          open ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600")}>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-6 pb-6"><p className="text-slate-600 leading-relaxed">{answer}</p></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
