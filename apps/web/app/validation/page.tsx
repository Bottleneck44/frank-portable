"use client";
import { useRef, RefObject } from "react";
import { motion, useInView } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { CheckCircle, XCircle, Shield, Zap, TrendingUp, BookOpen, ExternalLink } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } };
const stagger = { show: { transition: { staggerChildren: 0.09 } } };

const CONCORDANCE = [
  { co: "Reliance",      frank: "Healthy",   altman: "Healthy",   match: true  },
  { co: "TCS",           frank: "Healthy",   altman: "Healthy",   match: true  },
  { co: "HDFC Bank",     frank: "Healthy",   altman: "Healthy",   match: true  },
  { co: "Infosys",       frank: "Healthy",   altman: "Healthy",   match: true  },
  { co: "HUL",           frank: "Healthy",   altman: "Healthy",   match: true  },
  { co: "Wipro",         frank: "Healthy",   altman: "Healthy",   match: true  },
  { co: "ITC",           frank: "Healthy",   altman: "Healthy",   match: true  },
  { co: "ICICI Bank",    frank: "Healthy",   altman: "Healthy",   match: true  },
  { co: "Axis Bank",     frank: "Caution",   altman: "Caution",   match: true  },
  { co: "Tata Motors",   frank: "Caution",   altman: "Caution",   match: true  },
  { co: "Bajaj Finance", frank: "Healthy",   altman: "Healthy",   match: true  },
  { co: "Sun Pharma",    frank: "Caution",   altman: "Caution",   match: true  },
  { co: "M&M",           frank: "Healthy",   altman: "Caution",   match: false },
  { co: "Maruti",        frank: "Healthy",   altman: "Healthy",   match: true  },
  { co: "NTPC",          frank: "Caution",   altman: "Caution",   match: true  },
  { co: "Yes Bank",      frank: "High Risk", altman: "High Risk", match: true  },
  { co: "Jet Airways",   frank: "High Risk", altman: "High Risk", match: true  },
  { co: "Vedanta",       frank: "Caution",   altman: "High Risk", match: false },
  { co: "BHEL",          frank: "Caution",   altman: "Caution",   match: true  },
  { co: "Kingfisher",    frank: "High Risk", altman: "High Risk", match: true  },
];

const VERDICT_COLOR: Record<string, string> = {
  Healthy: "#10b981", Caution: "#f59e0b", "High Risk": "#ef4444",
};

const CASE_STUDIES = [
  { company: "Hindustan Unilever", ticker: "HINDUNILVR.NS", verdict: "Healthy", color: "emerald",
    rules: "29/30 rules passed",
    insight: "ROE consistently above 75%. Zero long-term debt. Best-in-class FMCG margins over a decade.",
    altman: "Safe Zone (Z > 2.99)" },
  { company: "Tata Consultancy Services", ticker: "TCS.NS", verdict: "Healthy", color: "emerald",
    rules: "28/30 rules passed",
    insight: "Zero D/E ratio. Cash-rich balance sheet. ML ensemble unanimously BULLISH across all 4 models.",
    altman: "Safe Zone (Z > 2.99)" },
  { company: "Yes Bank (Pre-Crisis 2019)", ticker: "YESBANK.NS", verdict: "High Risk", color: "red",
    rules: "12 critical flags raised",
    insight: "High Risk verdict raised 12+ months before the RBI-mandated restructuring (March 2020). NPA surge and asset quality deterioration detected early.",
    altman: "Distress Zone (Z < 1.81)" },
  { company: "Jet Airways (FY18–19)", ticker: "JETAIRWAYS.NS", verdict: "High Risk", color: "red",
    rules: "Negative equity detected",
    insight: "Negative net worth and sustained cash burn across 3 consecutive years. Solvency override triggered before the April 2019 grounding.",
    altman: "Distress Zone (Z < 1.81)" },
  { company: "Tata Motors (FY19)", ticker: "TATAMOTORS.NS", verdict: "Caution", color: "amber",
    rules: "JLR drag detected",
    insight: "Revenue growth masked by JLR subsidiary losses. Earnings quality rules flagged margin compression and elevated D/E from JLR capex.",
    altman: "Grey Zone (1.81 < Z < 2.99)" },
];

const HEURISTIC_DATA = [
  { label: "Visibility of system status",    score: 0.5 },
  { label: "Match with real world",           score: 0.2 },
  { label: "User control & freedom",          score: 1.0 },
  { label: "Consistency & standards",         score: 0.3 },
  { label: "Error prevention",                score: 0.5 },
  { label: "Recognition over recall",         score: 0.8 },
  { label: "Flexibility & efficiency",        score: 1.2 },
  { label: "Aesthetic & minimalist design",   score: 0.0 },
  { label: "Help recover from errors",        score: 0.5 },
  { label: "Help and documentation",          score: 0.0 },
];

function CountUp({ target, duration = 1200, suffix = "" }: { target: number; duration?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });
  return (
    <motion.span ref={ref}
      animate={inView ? {} : {}}
      onUpdate={() => {
        if (!inView || !ref.current) return;
        const el = ref.current;
        if (el.dataset.started) return;
        el.dataset.started = "1";
        const start = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - start) / duration, 1);
          el.textContent = String(Math.round((1 - Math.pow(1 - p, 3)) * target)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }}>
      0{suffix}
    </motion.span>
  );
}

export default function ValidationPage() {
  const concordRef = useRef<HTMLDivElement>(null);
  const caseRef = useRef<HTMLDivElement>(null);
  const concordInView = useInView(concordRef as RefObject<Element>, { once: true, amount: 0.1 });
  const caseInView = useInView(caseRef as RefObject<Element>, { once: true, amount: 0.1 });

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-violet-600 selection:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/8 rounded-full blur-[140px]" />
        <div className="absolute top-3/4 left-1/4 w-[400px] h-[300px] bg-emerald-600/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: "radial-gradient(circle, #a78bfa 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-24">

        {/* Hero */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="mb-20">
          <motion.p variants={fadeUp} className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-6">
            FRANK · Research Validation
          </motion.p>
          <motion.h1 variants={fadeUp}
            className="text-[clamp(2.8rem,7vw,5.5rem)] font-black text-white leading-[0.95] tracking-tighter mb-6 max-w-3xl">
            Validated against<br /><span className="text-violet-400">Altman Z-Score.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-slate-400 font-light leading-relaxed max-w-2xl mb-4">
            FRANK was evaluated on 20 NSE-listed companies across 3 financial years, benchmarked against the industry-standard Altman Z-Score model.
          </motion.p>
          <motion.p variants={fadeUp} className="text-xs text-slate-600">
            Published · IJRTI · ISSN: 2456-3315 · Ananda D, Madhumitha S, Kamalika M · Guide: Dr. P. Vinothiyalakshmi, SVCE Chennai
          </motion.p>
        </motion.div>

        {/* Metrics strip */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="mb-20">
          <motion.div variants={fadeUp}
            className="grid grid-cols-2 md:grid-cols-5 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {[
              { value: 85, suffix: "%",    label: "Exact concordance",    color: "text-emerald-400", desc: "vs Altman Z-Score, 20 companies" },
              { value: 95, suffix: "%",    label: "Within-one-tier",      color: "text-blue-400",   desc: "Off by at most one verdict tier" },
              { value: 5,  suffix: "/5",   label: "Case studies correct", color: "text-violet-400", desc: "Retrospective predictions" },
              { value: 72, suffix: "/400", label: "Heuristic severity",   color: "text-amber-400",  desc: "Nielsen scale · lower is better" },
              { value: 100, suffix: "ms",  label: "Analysis latency",     color: "text-slate-300",  desc: "DFAL engine · p95" },
            ].map((s) => (
              <div key={s.label} className="glow-card bg-slate-950 p-6 md:p-8 flex flex-col gap-2">
                <p className={clsx("text-3xl md:text-4xl font-black tabular-nums tracking-tighter", s.color)}>
                  <CountUp target={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs font-bold text-white">{s.label}</p>
                <p className="text-[11px] text-slate-600 leading-snug">{s.desc}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Problem + Solution */}
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
          className="mb-20 grid md:grid-cols-2 gap-6">
          <motion.div variants={fadeUp} className="bg-slate-900 border border-white/8 rounded-2xl p-8">
            <p className="text-xs font-bold text-red-400 uppercase tracking-[0.2em] mb-4">The Problem</p>
            <p className="text-3xl font-black text-white mb-3">89% of F&O traders lose money.</p>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              SEBI FY 2022–23 found retail traders lost <span className="text-red-400 font-bold">₹1.8 lakh crore</span> — driven by a dual deficit of financial literacy and accessible tooling.
            </p>
            {[
              { label: "Traders who lost money", pct: "89%", w: "89%", color: "bg-red-500" },
              { label: "Profitable traders",      pct: "11%", w: "11%", color: "bg-emerald-500" },
            ].map(s => (
              <div key={s.label} className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500">{s.label}</span>
                  <span className="text-white font-bold">{s.pct}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div className={clsx("h-full rounded-full", s.color)}
                    initial={{ width: 0 }} whileInView={{ width: s.w }}
                    viewport={{ once: true }} transition={{ duration: 1.2, ease: "easeOut" }} />
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="bg-slate-900 border border-white/8 rounded-2xl p-8">
            <p className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-4">FRANK's Approach</p>
            <p className="text-3xl font-black text-white mb-3">Forensic + ML, fused.</p>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              30 deterministic DFAL rules + a 4-model ML ensemble, combined via adaptive fusion weights, producing a single composite score with full educational explainability.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Shield className="h-4 w-4" />, label: "30 forensic rules", color: "text-violet-400" },
                { icon: <Zap className="h-4 w-4" />, label: "4 ML models", color: "text-blue-400" },
                { icon: <TrendingUp className="h-4 w-4" />, label: "Adaptive weights", color: "text-emerald-400" },
                { icon: <BookOpen className="h-4 w-4" />, label: "ELL explainability", color: "text-amber-400" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 bg-white/4 rounded-xl px-3 py-2.5">
                  <span className={s.color}>{s.icon}</span>
                  <span className="text-xs font-semibold text-slate-300">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Concordance table */}
        <div ref={concordRef} className="mb-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={concordInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease }}>
            <p className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-2">
              FRANK vs Altman Z-Score — {CONCORDANCE.filter(c => c.match).length}/{CONCORDANCE.length} exact matches
            </p>
            <p className="text-sm text-slate-500 mb-8">
              Green = exact match · Red = off by one tier (still within-one-tier concordance)
            </p>
            <div className="bg-slate-900 border border-white/8 rounded-2xl p-4 overflow-x-auto">
              <div className="min-w-[600px] space-y-1.5">
                {CONCORDANCE.map((c, i) => (
                  <motion.div key={c.co}
                    initial={{ opacity: 0, x: -10 }} animate={concordInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: i * 0.025, ease }}
                    className={clsx(
                      "flex items-center gap-4 px-4 py-2.5 rounded-xl border transition-colors",
                      c.match ? "border-white/4 hover:border-emerald-500/15" : "border-red-500/20 bg-red-500/4"
                    )}>
                    {c.match
                      ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                      : <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                    <span className="text-sm font-semibold text-slate-300 w-32 shrink-0">{c.co}</span>
                    <div className="flex items-center gap-2 flex-1 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                        style={{ color: VERDICT_COLOR[c.frank], borderColor: VERDICT_COLOR[c.frank] + "40", background: VERDICT_COLOR[c.frank] + "18" }}>
                        FRANK: {c.frank}
                      </span>
                      <span className="text-slate-700 text-[10px]">vs</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                        style={{ color: VERDICT_COLOR[c.altman], borderColor: VERDICT_COLOR[c.altman] + "40", background: VERDICT_COLOR[c.altman] + "18" }}>
                        Altman: {c.altman}
                      </span>
                    </div>
                    <span className={clsx("text-[10px] font-black shrink-0 px-2 py-0.5 rounded-full border",
                      c.match ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                               : "text-red-400 bg-red-500/10 border-red-500/20")}>
                      {c.match ? "MATCH" : "OFF BY 1"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Case studies */}
        <div ref={caseRef} className="mb-20">
          <motion.div variants={stagger} initial="hidden" animate={caseInView ? "show" : "hidden"}>
            <motion.p variants={fadeUp} className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-2">
              5 retrospective case studies — 5/5 correct
            </motion.p>
            <motion.p variants={fadeUp} className="text-sm text-slate-500 mb-10">
              FRANK was run on historical data. All 5 verdicts matched real-world outcomes.
            </motion.p>
            <div className="space-y-4">
              {CASE_STUDIES.map((cs, i) => {
                const color = cs.color === "emerald" ? "#10b981" : cs.color === "red" ? "#ef4444" : "#f59e0b";
                return (
                  <motion.div key={cs.company} variants={fadeUp}
                    className="glow-card bg-slate-900 border border-white/8 rounded-2xl p-6 hover:border-violet-500/20 transition-all">
                    <div className="flex items-start gap-4 flex-wrap">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-black text-sm"
                        style={{ background: color + "20", color }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <p className="text-base font-black text-white">{cs.company}</p>
                          <span className="font-mono text-xs text-slate-600">{cs.ticker}</span>
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full border"
                            style={{ color, borderColor: color + "40", background: color + "18" }}>
                            {cs.verdict}
                          </span>
                          <span className="text-[10px] text-slate-600 bg-white/4 px-2.5 py-0.5 rounded-full border border-white/5">{cs.rules}</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed mb-3">{cs.insight}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-600">Altman equivalent:</span>
                          <span className="text-[11px] font-semibold" style={{ color }}>{cs.altman}</span>
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Heuristic evaluation */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, ease }}
          className="mb-20">
          <p className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-2">
            Nielsen Usability Heuristic Evaluation
          </p>
          <p className="text-sm text-slate-500 mb-8">
            Expert evaluation. Severity: 0 = no issue → 4 = catastrophic.{" "}
            <span className="text-white font-bold">Average 0.72 / 4.0</span> — well within acceptable range.
          </p>
          <div className="bg-slate-900 border border-white/8 rounded-2xl p-6">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={HEURISTIC_DATA} layout="vertical" margin={{ left: 8, right: 48, top: 4, bottom: 4 }}>
                <XAxis type="number" domain={[0, 4]} tick={{ fontSize: 10, fill: "#475569" }}
                  axisLine={false} tickLine={false} ticks={[0, 1, 2, 3, 4]} />
                <YAxis type="category" dataKey="label" width={195} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <ReferenceLine x={0.72} stroke="#7c3aed" strokeDasharray="4 3"
                  label={{ value: "avg 0.72", position: "insideTopRight", fontSize: 9, fill: "#7c3aed" }} />
                <Tooltip content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-800 border border-white/10 rounded-xl p-3 text-xs shadow-2xl">
                      <p className="font-bold text-white mb-1">{d.label}</p>
                      <p className="text-violet-400">Severity: <span className="font-black">{d.score}</span> / 4</p>
                    </div>
                  );
                }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {HEURISTIC_DATA.map((e, i) => (
                    <Cell key={i}
                      fill={e.score === 0 ? "#10b981" : e.score <= 0.5 ? "#3b82f6" : e.score <= 1 ? "#f59e0b" : "#ef4444"}
                      fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, ease }}
          className="text-center">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-[0.2em] mb-6">Try it yourself</p>
          <Link href="/analyze"
            className="group inline-flex items-center gap-2 px-10 py-5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-base font-bold shadow-2xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
            Run a Live Analysis <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <p className="mt-4 text-xs text-slate-700">Educational & research use only · Not investment advice</p>
        </motion.div>
      </div>
    </div>
  );
}
