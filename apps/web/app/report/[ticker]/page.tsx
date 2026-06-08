"use client";
import { useEffect, useState, useRef, RefObject } from "react";
import { useParams, useRouter } from "next/navigation";
import { FusionResult, RuleResult, CategoryScore, EnsemblePrediction } from "@/lib/engine/types";
import { useAnalysisStore } from "@/store/analysis-store";
import { FundamentalRadarChart } from "@/components/charts/RadarChart";
import { Spinner } from "@/components/ui";
import {
  ArrowLeft, LayoutDashboard, AlertTriangle, Search, BookOpen,
  CheckCircle, XCircle, ChevronDown, ChevronUp, Info,
  BrainCircuit, TrendingUp, TrendingDown, Building2, AlertCircle,
  BarChart3, Shield, Zap, Activity, Droplets, Printer, HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import clsx from "clsx";

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

// ─── Colour helpers ──────────────────────────────────────────────────────────
function scoreColor(s: number) {
  if (s >= 70) return { text: "text-emerald-400", bg: "bg-emerald-500", pill: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" };
  if (s >= 45) return { text: "text-amber-400",   bg: "bg-amber-500",   pill: "bg-amber-500/15  text-amber-400  border-amber-500/25" };
  return         { text: "text-red-400",    bg: "bg-red-500",    pill: "bg-red-500/15    text-red-400    border-red-500/25" };
}

const VERDICT_STYLE: Record<string, string> = {
  Healthy:            "bg-emerald-500/12 text-emerald-400 border-emerald-500/30",
  Caution:            "bg-amber-500/12  text-amber-400  border-amber-500/30",
  "High Risk":        "bg-red-500/12    text-red-400    border-red-500/30",
  "Insufficient Data":"bg-slate-500/12  text-slate-400  border-slate-500/30",
};
const SIGNAL_STYLE: Record<string, string> = {
  BULLISH:    "bg-emerald-500/12 text-emerald-400 border-emerald-500/30",
  BEARISH:    "bg-red-500/12    text-red-400    border-red-500/30",
  NEUTRAL:    "bg-slate-500/12  text-slate-400  border-slate-500/30",
  CONFLICTED: "bg-amber-500/12  text-amber-400  border-amber-500/30",
};
const SEVERITY_STYLE: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  warning:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  caution:  "bg-slate-500/10 text-slate-400 border-slate-500/20",
  info:     "bg-blue-500/10 text-blue-400 border-blue-500/20",
};
const CAT_LABELS: Record<string, string> = {
  profitability: "Profitability", liquidity: "Liquidity", solvency: "Solvency",
  efficiency: "Efficiency", earnings_quality: "Earnings Quality",
  cash_flow: "Cash Flow", growth: "Growth", red_flags: "Red Flags",
};
const CAT_ICONS: Record<string, React.ReactNode> = {
  profitability:    <BarChart3 className="h-4 w-4" />,
  liquidity:        <Droplets className="h-4 w-4" />,
  solvency:         <Shield className="h-4 w-4" />,
  efficiency:       <Zap className="h-4 w-4" />,
  earnings_quality: <BookOpen className="h-4 w-4" />,
  cash_flow:        <Activity className="h-4 w-4" />,
  growth:           <TrendingUp className="h-4 w-4" />,
  red_flags:        <AlertTriangle className="h-4 w-4" />,
};

function Pill({ label, style }: { label: string; style: string }) {
  return <span className={clsx("text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest", style)}>{label}</span>;
}

// ─── Animated count-up number ────────────────────────────────────────────────
function CountUp({ target, className, duration = 1000 }: { target: number; className?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });
  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);
  return <span ref={ref} className={className}>{val}</span>;
}

// ─── Uncertainty ring (SVG arc = blended confidence) ─────────────────────────
function UncertaintyRing({ score, confidence, children }: { score: number; confidence: number; children: React.ReactNode }) {
  const r = 88;
  const circ = 2 * Math.PI * r;
  const strokeColor = score >= 70 ? "#10b981" : score >= 45 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="absolute pointer-events-none" width={200} height={200} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={100} cy={100} r={r} fill="none" stroke="#1e293b" strokeWidth="2.5" strokeDasharray="3 5" />
        <motion.circle cx={100} cy={100} r={r} fill="none" stroke={strokeColor} strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${confidence * circ} ${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.6, ease: "easeOut", delay: 0.4 }}
          opacity={0.5}
        />
      </svg>
      <div className="w-[200px] h-[200px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// ─── Altman Z-Score equivalent badge ─────────────────────────────────────────
function AltmanBadge({ compositeScore }: { compositeScore: number }) {
  const zone = compositeScore >= 70
    ? { label: "Safe Zone",     range: "Z > 2.99",        color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/8" }
    : compositeScore >= 45
    ? { label: "Grey Zone",     range: "1.81 < Z < 2.99", color: "text-amber-400",   border: "border-amber-500/20",   bg: "bg-amber-500/8" }
    : { label: "Distress Zone", range: "Z < 1.81",        color: "text-red-400",     border: "border-red-500/20",     bg: "bg-red-500/8" };
  return (
    <div className={clsx("flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs", zone.bg, zone.border)}>
      <span className="text-slate-500 shrink-0">Altman Z equivalent:</span>
      <span className={clsx("font-black", zone.color)}>{zone.label}</span>
      <span className={clsx("font-mono opacity-60", zone.color)}>{zone.range}</span>
    </div>
  );
}

// ─── Live pipeline animation ─────────────────────────────────────────────────
function PipelineStep({ label, icon, delay, active }: { label: string; icon: React.ReactNode; delay: number; active: boolean }) {
  const [lit, setLit] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLit(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <motion.div
        animate={lit ? { scale: [1, 1.2, 1], opacity: 1 } : { opacity: 0.3 }}
        transition={{ duration: 0.4 }}
        className={clsx(
          "flex h-10 w-10 items-center justify-center rounded-2xl border-2 transition-all",
          lit ? "border-violet-500/60 bg-violet-500/20 text-violet-300" : "border-white/10 bg-white/4 text-slate-600"
        )}>
        {icon}
      </motion.div>
      <span className={clsx("text-[10px] font-bold text-center leading-tight transition-colors", lit ? "text-slate-300" : "text-slate-700")}>
        {label}
      </span>
    </div>
  );
}

function LoadingStep({ label, delay }: { label: string; delay: number }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="flex items-center gap-2.5 text-xs">
      <AnimatePresence mode="wait">
        {done
          ? <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            </motion.div>
          : <motion.div key="dot" className="h-3.5 w-3.5 shrink-0 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
            </motion.div>
        }
      </AnimatePresence>
      <span className={done ? "text-slate-400" : "text-slate-600"}>{label}</span>
    </motion.div>
  );
}

// ─── Animated score bar ──────────────────────────────────────────────────────
function ScoreBar({ score, delay = 0 }: { score: number; delay?: number }) {
  const c = scoreColor(score);
  return (
    <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
      <motion.div className={clsx("h-full rounded-full", c.bg)}
        initial={{ width: 0 }} animate={{ width: `${score}%` }}
        transition={{ duration: 1.2, ease: "easeOut", delay }} />
    </div>
  );
}

// ─── Category score card ─────────────────────────────────────────────────────
function CatCard({ cs }: { cs: CategoryScore }) {
  const c = scoreColor(cs.score);
  const pct = cs.score;
  const circumference = 2 * Math.PI * 20;
  const arc = (pct / 100) * circumference;
  const strokeColor = cs.score >= 70 ? "#10b981" : cs.score >= 45 ? "#f59e0b" : "#ef4444";

  return (
    <motion.div variants={fadeUp}
      className="bg-slate-900 border border-white/6 rounded-2xl p-5 flex flex-col gap-4 hover:border-violet-500/20 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/6 text-slate-400">
          {CAT_ICONS[cs.category]}
        </div>
        {/* Mini donut */}
        <svg width="44" height="44" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="20" fill="none" stroke="#1e293b" strokeWidth="4" />
          <motion.circle cx="22" cy="22" r="20" fill="none" stroke={strokeColor} strokeWidth="4"
            strokeLinecap="round" strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - arc }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            transform="rotate(-90 22 22)" />
        </svg>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">
          {CAT_LABELS[cs.category]}
        </p>
        <p className={clsx("text-3xl font-black tabular-nums tracking-tighter", c.text)}>{cs.score}</p>
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-700">
        <span>{cs.rulesApplied} rules</span>
        {cs.criticalFails > 0 && (
          <span className="text-red-500 font-bold">{cs.criticalFails} critical</span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Rule accordion row ──────────────────────────────────────────────────────
function RuleRow({ rule }: { rule: RuleResult }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/4 last:border-0">
      <div className="flex items-start gap-3 py-3.5 px-4">
        {rule.passed
          ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
          : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-200">{rule.ruleName}</span>
            {!rule.passed && (
              <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full border", SEVERITY_STYLE[rule.severity])}>
                {rule.severity}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{rule.message}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {rule.value !== null && (
            <span className="font-mono text-xs bg-white/6 text-slate-400 px-1.5 py-0.5 rounded">
              {typeof rule.value === "number" ? rule.value.toFixed(2) : rule.value}
            </span>
          )}
          <button onClick={() => setOpen(!open)}
            className={clsx("h-6 w-6 flex items-center justify-center rounded-full transition-colors",
              open ? "bg-violet-500/20 text-violet-400" : "bg-white/6 text-slate-500 hover:text-slate-300")}>
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
            <div className="px-4 pb-4 ml-7 space-y-2">
              <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <BookOpen className="h-3 w-3" /><p className="font-bold">What this means</p>
                </div>
                <p className="leading-relaxed text-blue-400/80">{rule.educationalNote}</p>
              </div>
              {!rule.passed && rule.recommendation && (
                <div className="bg-violet-500/8 border border-violet-500/20 rounded-xl p-3 text-xs text-violet-300">
                  <span className="font-bold">Recommendation: </span>{rule.recommendation}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Category accordion ──────────────────────────────────────────────────────
function CategoryAccordion({ cs, rules }: { cs: CategoryScore; rules: RuleResult[] }) {
  const [open, setOpen] = useState(false);
  const c = scoreColor(cs.score);
  return (
    <div className={clsx("border rounded-xl overflow-hidden transition-all",
      open ? "border-violet-500/25" : "border-white/6")}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/3 transition-colors text-left">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/6 text-slate-500 shrink-0">
          {CAT_ICONS[cs.category]}
        </div>
        <span className="flex-1 font-semibold text-slate-200 text-sm">{CAT_LABELS[cs.category]}</span>
        <span className="text-xs text-slate-600">{cs.rulesApplied} rules</span>
        {cs.criticalFails > 0 && (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full border bg-red-500/10 text-red-400 border-red-500/20">
            {cs.criticalFails} crit
          </span>
        )}
        <span className={clsx("font-black text-lg tabular-nums w-10 text-right", c.text)}>{cs.score}</span>
        <div className={clsx("flex h-6 w-6 items-center justify-center rounded-full transition-colors shrink-0",
          open ? "bg-violet-500/20 text-violet-400" : "bg-white/6 text-slate-500")}>
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="border-t border-white/5 bg-slate-950/40">
              {rules.map((r) => <RuleRow key={r.ruleId} rule={r} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ML / Technical panel ─────────────────────────────────────────────────────
function MLPanel({ ml }: { ml: EnsemblePrediction }) {
  const isPredUp = ml.ensemblePredictedPrice >= ml.actualPrice;
  const pct = (ml.ensemblePredictedReturn * 100).toFixed(2);
  const sigStyle = SIGNAL_STYLE[ml.signal] ?? SIGNAL_STYLE.NEUTRAL;

  return (
    <div className="space-y-6">
      {/* Signal header row */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15">
            <BrainCircuit className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">ML Ensemble Prediction</p>
            <p className="text-xs text-slate-600">{ml.predictionDate} · 4 models</p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <Pill label={ml.signal} style={sigStyle} />
          <span className="text-xs text-slate-600 bg-white/4 border border-white/6 rounded-full px-3 py-1">
            {Math.round(ml.technicalConfidence * 100)}% confidence
          </span>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
        {[
          { label: "Technical Score", value: ml.technicalScore.toFixed(0), sub: "/ 100",   color: "text-violet-400" },
          { label: "Dir. Consensus",  value: `${Math.round(ml.directionalConsensus * 100)}%`, sub: "bullish", color: "text-emerald-400" },
          { label: "Signal Strength", value: `${Math.round(ml.signalStrength * 100)}%`,    sub: "strength", color: "text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-950 px-5 py-4">
            <p className={clsx("text-2xl font-black tabular-nums tracking-tight", s.color)}>{s.value}<span className="text-sm text-slate-600 font-normal ml-1">{s.sub}</span></p>
            <p className="text-xs text-slate-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Price cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/4 border border-white/8 rounded-2xl p-4">
          <p className="text-xs text-slate-600 mb-2">Current Price</p>
          <p className="text-2xl font-black text-white tabular-nums">₹{ml.actualPrice.toFixed(2)}</p>
        </div>
        <div className={clsx("rounded-2xl p-4 border", isPredUp ? "bg-emerald-500/8 border-emerald-500/20" : "bg-red-500/8 border-red-500/20")}>
          <p className={clsx("text-xs mb-2", isPredUp ? "text-emerald-600" : "text-red-600")}>Predicted (next day)</p>
          <p className={clsx("text-2xl font-black tabular-nums", isPredUp ? "text-emerald-400" : "text-red-400")}>
            ₹{ml.ensemblePredictedPrice.toFixed(2)}
          </p>
        </div>
        <div className={clsx("rounded-2xl p-4 border flex flex-col items-center justify-center gap-2",
          isPredUp ? "bg-emerald-500/8 border-emerald-500/20" : "bg-red-500/8 border-red-500/20")}>
          {isPredUp ? <TrendingUp className="h-6 w-6 text-emerald-400" /> : <TrendingDown className="h-6 w-6 text-red-400" />}
          <span className={clsx("text-xl font-black tabular-nums", isPredUp ? "text-emerald-400" : "text-red-400")}>
            {isPredUp ? "+" : ""}{pct}%
          </span>
        </div>
      </div>

      {/* Per-model table */}
      <div>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.15em] mb-3">Per-model breakdown</p>
        <div className="space-y-0">
          {ml.predictions.map((p, i) => {
            const up = p.predictedPrice >= ml.actualPrice;
            return (
              <div key={p.modelName}
                className="flex items-center gap-4 py-3.5 border-t border-white/5 first:border-0">
                <span className="text-xs font-black text-slate-700 w-6 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm font-bold text-slate-300 w-28 shrink-0">{p.modelName}</span>
                <span className={clsx("font-mono text-sm font-black tabular-nums flex-1", up ? "text-emerald-400" : "text-red-400")}>
                  ₹{p.predictedPrice.toFixed(2)}
                </span>
                <div className="flex gap-4 text-xs text-slate-600 shrink-0">
                  <span>R² <span className="text-slate-400 font-semibold">{p.r2.toFixed(3)}</span></span>
                  <span>DA <span className="text-slate-400 font-semibold">{(p.directionalAccuracy * 100).toFixed(0)}%</span></span>
                  <span>MAE <span className="text-slate-400 font-semibold">{p.mae.toFixed(2)}</span></span>
                </div>
                <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0",
                  up ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                     : "bg-red-500/10 text-red-400 border-red-500/20")}>
                  {up ? "▲" : "▼"}
                </span>
              </div>
            );
          })}
          <div className="border-t border-white/5" />
        </div>
      </div>

      <div className="flex items-start gap-2.5 bg-amber-500/8 border border-amber-500/20 rounded-xl p-3.5 text-xs text-amber-400/80">
        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
        <p>Based on historical NIFTY 50 data (2012–2024). Past patterns do not guarantee future results. Not investment advice.</p>
      </div>
    </div>
  );
}

// ─── Red flags panel ──────────────────────────────────────────────────────────
function RedFlagsPanel({ flags }: { flags: RuleResult[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const critCount = flags.filter((f) => f.severity === "critical").length;

  if (flags.length === 0) return (
    <div className="py-10 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 mb-3">
        <CheckCircle className="h-6 w-6 text-emerald-400" />
      </div>
      <p className="text-sm font-semibold text-emerald-400">No red flags detected</p>
      <p className="text-xs text-slate-600 mt-1">All forensic checks passed or flagged at info level only.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/15">
          <AlertTriangle className="h-4 w-4 text-red-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">{flags.length} issue{flags.length !== 1 ? "s" : ""} flagged</p>
          {critCount > 0 && <p className="text-xs text-red-400">{critCount} critical</p>}
        </div>
      </div>
      {flags.map((flag) => {
        const isCrit = flag.severity === "critical";
        const isOpen = openId === flag.ruleId;
        return (
          <div key={flag.ruleId} className={clsx(
            "border rounded-xl overflow-hidden transition-all",
            isCrit ? "border-red-500/25" : "border-amber-500/20")}>
            <button onClick={() => setOpenId(isOpen ? null : flag.ruleId)}
              className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-white/3 transition-colors">
              <div className={clsx("flex h-7 w-7 shrink-0 items-center justify-center rounded-xl mt-0.5",
                isCrit ? "bg-red-500/15" : "bg-amber-500/15")}>
                <AlertCircle className={clsx("h-3.5 w-3.5", isCrit ? "text-red-400" : "text-amber-400")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-200">{flag.ruleName}</span>
                  <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    isCrit ? "bg-red-500/10 text-red-400 border-red-500/20"
                           : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>{flag.severity}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{flag.message}</p>
              </div>
              <div className={clsx("shrink-0 h-6 w-6 flex items-center justify-center rounded-full transition-colors",
                isOpen ? "bg-violet-500/20 text-violet-400" : "bg-white/6 text-slate-500")}>
                {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 ml-10 space-y-2">
                    <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-3.5 text-xs text-blue-300">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <BookOpen className="h-3 w-3" /><p className="font-bold">What this means</p>
                      </div>
                      <p className="leading-relaxed text-blue-400/80">{flag.educationalNote}</p>
                    </div>
                    {flag.recommendation && (
                      <div className="bg-violet-500/8 border border-violet-500/20 rounded-xl p-3 text-xs text-violet-300">
                        <span className="font-bold">Recommendation: </span>{flag.recommendation}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────
const TABS = ["Overview", "Red Flags", "ML Signals", "Deep Dive"] as const;
type Tab = typeof TABS[number];

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = decodeURIComponent(params.ticker as string);
  const { currentResult, history } = useAnalysisStore();
  const [result, setResult] = useState<FusionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  useEffect(() => {
    if (currentResult?.ticker === ticker) { setResult(currentResult); return; }
    const fromHistory = history.find((h) => h.ticker === ticker);
    if (fromHistory) { setResult(fromHistory.result); return; }
    setLoading(true);
    fetch("/api/analyze", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setResult(data.result);
        useAnalysisStore.getState().setCurrentResult(data.result);
        useAnalysisStore.getState().addToHistory(data.result);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [ticker, currentResult, history]);

  // ── Loading ────────────────────────────────────────────────────────────────
  const LOAD_STEPS = [
    { label: "Fetching financial statements", ms: 600 },
    { label: "Applying DFAL rule engine",     ms: 1400 },
    { label: "Running ML ensemble",           ms: 2400 },
    { label: "Computing composite score",     ms: 3200 },
  ];

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-600/8 rounded-full blur-[120px]" />
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 relative px-6 max-w-sm w-full">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-2xl shadow-violet-500/30 relative">
          <Spinner size="lg" />
          <div className="absolute inset-0 rounded-3xl border-2 border-violet-400/30 animate-ping" style={{ animationDuration: "2s" }} />
        </div>
        <div>
          <p className="text-lg font-black text-white tracking-tight">Analyzing {ticker}</p>
          <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }}
            className="text-sm text-slate-600 mt-2">Running 30 forensic rules + 4 ML models…</motion.p>
        </div>
        {/* Pipeline nodes */}
        <div className="w-full max-w-sm">
          <div className="flex items-start gap-2 mb-4">
            {[
              { label: "Yahoo\nFinance", icon: <Activity className="h-4 w-4" />, delay: 200 },
              { label: "DFAL\nEngine",  icon: <Shield className="h-4 w-4" />,   delay: 900 },
              { label: "ML\nEnsemble", icon: <BrainCircuit className="h-4 w-4" />, delay: 2000 },
              { label: "Fusion\nScore", icon: <Zap className="h-4 w-4" />,       delay: 3300 },
            ].map(({ label, icon, delay }, i) => (
              <div key={label} className="flex items-center flex-1">
                <PipelineStep label={label} icon={icon} delay={delay} active={true} />
                {i < 3 && (
                  <motion.div className="h-px bg-gradient-to-r from-violet-500/40 to-transparent flex-1 mx-1 mt-[-16px]"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: delay / 1000 + 0.3, duration: 0.5 }} />
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 mt-4">
            {LOAD_STEPS.map(({ label, ms }) => (
              <LoadingStep key={label} label={label} delay={ms} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-10 max-w-md text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>
          <p className="text-lg font-black text-white mb-2 tracking-tight">Analysis failed</p>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">{error}</p>
          <button onClick={() => router.push("/analyze")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to analyze
          </button>
        </div>
      </motion.div>
    </div>
  );

  if (!result) return null;

  const comp = scoreColor(result.compositeScore);
  const fund = scoreColor(result.fundamentalScore);
  const tech = scoreColor(result.technicalScore);
  const activeEdgeCases = result.edgeCaseFlags.filter((f) => f.detected && f.type !== "STALE_FINANCIAL_DATA");

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-violet-600 selection:text-white">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-violet-600/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.018]"
          style={{ backgroundImage: "radial-gradient(circle, #a78bfa 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-20">

        {/* ── Top nav ── */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8">
          <button onClick={() => router.push("/analyze")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-white/8 text-sm font-semibold text-slate-400 hover:text-violet-400 hover:border-violet-500/30 transition-all">
            <ArrowLeft className="h-4 w-4" /> Analyze Another
          </button>
          <div className="flex items-center gap-3">
            <p className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] hidden sm:block">FRANK · Report</p>
            <button onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-white/8 text-sm font-semibold text-slate-400 hover:text-violet-400 hover:border-violet-500/30 transition-all">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </button>
          </div>
        </motion.div>

        {/* ── Edge case banners ── */}
        {activeEdgeCases.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 mb-6">
            {activeEdgeCases.map((f, i) => (
              <motion.div key={f.type} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-amber-300 text-sm">{f.description}</p>
                  <p className="text-xs text-amber-500/70 mt-0.5">{f.mitigationApplied}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ══ HERO SECTION ══ */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          className="mb-8">

          {/* Company identity */}
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl shadow-violet-500/20">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em]">
                FRANK · Forensic Report
              </p>
              <h1 className="text-xl font-black text-white tracking-tight leading-tight">{result.companyName}</h1>
              <p className="text-xs text-slate-600 font-mono mt-0.5">{result.ticker} · {result.analysisDate}</p>
            </div>
            <div className="ml-auto flex gap-2 flex-wrap justify-end">
              <Pill label={result.verdict} style={VERDICT_STYLE[result.verdict] ?? VERDICT_STYLE["Insufficient Data"]} />
              <Pill label={result.signal}  style={SIGNAL_STYLE[result.signal]   ?? SIGNAL_STYLE.NEUTRAL} />
            </div>
          </motion.div>

          {/* Score hero — 3-column */}
          <motion.div variants={fadeUp}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

            {/* Composite — big focal */}
            <div className="lg:col-span-1 glow-card score-glow bg-slate-900 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.15em]">Composite Score</p>
                <div className="frank-tooltip relative">
                  <HelpCircle className="h-3.5 w-3.5 text-slate-700 hover:text-slate-400 transition-colors cursor-help" />
                  <div className="frank-tooltip-content absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 bg-slate-800 border border-white/10 rounded-xl p-3 text-xs text-slate-300 shadow-2xl z-50">
                    <p className="font-bold text-white mb-1">Score guide</p>
                    <p className="text-emerald-400 font-semibold">70–100 · Healthy</p>
                    <p className="text-amber-400 font-semibold">45–69 · Caution</p>
                    <p className="text-red-400 font-semibold">0–44 · High Risk</p>
                    <p className="text-slate-500 mt-1.5 leading-relaxed">Outer ring = blended confidence. Solid arc = how certain FRANK is.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center py-2">
                <UncertaintyRing score={result.compositeScore} confidence={result.blendedConfidence}>
                  <div className="text-center">
                    <CountUp target={Math.round(result.compositeScore)} duration={1200}
                      className={clsx("text-[4.5rem] font-black tabular-nums leading-none tracking-tighter", comp.text)} />
                    <p className="text-xs text-slate-600 mt-1">/ 100</p>
                  </div>
                </UncertaintyRing>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed text-center">{result.verdictReason}</p>
              <AltmanBadge compositeScore={result.compositeScore} />
              <ScoreBar score={result.compositeScore} />
            </div>

            {/* Fundamental + Technical */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fundamental */}
              <div className="glow-card bg-slate-900 border border-white/8 rounded-2xl p-6">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.15em] mb-1">Fundamental</p>
                <p className="text-xs text-violet-500 font-semibold mb-4">
                  {Math.round(result.adaptedFundamentalWeight * 100)}% weight
                </p>
                <p className={clsx("text-5xl font-black tabular-nums tracking-tighter mb-2", fund.text)}>
                  {Math.round(result.fundamentalScore)}
                </p>
                <p className="text-xs text-slate-600 mb-4">
                  {Math.round(result.fundamentalConfidence * 100)}% confidence
                </p>
                <ScoreBar score={result.fundamentalScore} delay={0.2} />
              </div>

              {/* Technical */}
              <div className="glow-card bg-slate-900 border border-white/8 rounded-2xl p-6">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.15em] mb-1">Technical (ML)</p>
                <p className="text-xs text-blue-500 font-semibold mb-4">
                  {Math.round(result.adaptedTechnicalWeight * 100)}% weight
                </p>
                <p className={clsx("text-5xl font-black tabular-nums tracking-tighter mb-2", tech.text)}>
                  {Math.round(result.technicalScore)}
                </p>
                <p className="text-xs text-slate-600 mb-4">
                  {Math.round(result.technicalConfidence * 100)}% confidence
                </p>
                <ScoreBar score={result.technicalScore} delay={0.3} />
              </div>

              {/* Confidence + signal explanation */}
              <div className="sm:col-span-2 bg-slate-900 border border-white/8 rounded-2xl px-5 py-4 flex items-start gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15">
                    <Activity className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-0.5">Blended Confidence</p>
                    <p className="text-sm font-black text-white">{Math.round(result.blendedConfidence * 100)}%</p>
                  </div>
                </div>
                {result.signalConflict && (
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                    <AlertTriangle className="h-4 w-4" /> Signal conflict detected
                  </div>
                )}
                <p className="flex-1 text-xs text-slate-500 leading-relaxed">{result.signalExplanation}</p>
              </div>
            </div>
          </motion.div>

          {/* Risk override */}
          {result.riskOverrideApplied && (
            <motion.div variants={fadeUp}
              className="flex items-start gap-3 bg-red-500/8 border border-red-500/25 rounded-xl px-4 py-3.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-red-500/15">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              </div>
              <p className="text-sm text-red-300">
                <span className="font-bold">Risk Override Applied: </span>{result.riskOverrideReason}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* ── Weight adaptation banner ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, ease }}
          className="bg-white/3 border border-white/5 rounded-xl px-5 py-3.5 flex items-center gap-4 flex-wrap mb-10">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.15em] shrink-0">Weight Adaptation</p>
          <p className="text-xs text-slate-500 flex-1">{result.weightAdaptationReason}</p>
          <div className="flex gap-2 shrink-0">
            <span className="text-[10px] font-black px-3 py-1 rounded-full border bg-violet-500/10 text-violet-400 border-violet-500/20">
              Fund {Math.round(result.adaptedFundamentalWeight * 100)}%
            </span>
            <span className="text-[10px] font-black px-3 py-1 rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20">
              Tech {Math.round(result.adaptedTechnicalWeight * 100)}%
            </span>
          </div>
        </motion.div>

        {/* ══ TAB NAV ══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="no-print flex gap-1 bg-slate-900 border border-white/6 rounded-2xl p-1 mb-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={clsx(
                "relative flex-1 min-w-max px-4 py-2.5 rounded-xl text-sm font-bold transition-colors duration-200 whitespace-nowrap",
                activeTab === tab ? "text-white" : "text-slate-500 hover:text-slate-300"
              )}>
              {activeTab === tab && (
                <motion.div layoutId="tab-pill"
                  className="absolute inset-0 bg-violet-600 rounded-xl shadow-lg shadow-violet-500/25"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }} />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                {tab}
                {tab === "Red Flags" && result.redFlags.length > 0 && (
                  <span className={clsx("text-[10px] font-black px-1.5 py-0.5 rounded-full",
                    activeTab === tab ? "bg-white/20 text-white" : "bg-red-500/20 text-red-400")}>
                    {result.redFlags.length}
                  </span>
                )}
              </span>
            </button>
          ))}
        </motion.div>

        {/* ══ TAB PANELS ══ */}
        <AnimatePresence mode="wait">
          {/* ── Overview ── */}
          {activeTab === "Overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease }}
              className="space-y-8">

              {/* Category scores grid */}
              <div>
                <p className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-5">
                  Category scores — {result.categoryScores.length} categories
                </p>
                <motion.div variants={stagger} initial="hidden" animate="show"
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {result.categoryScores.map((cs) => <CatCard key={cs.category} cs={cs} />)}
                </motion.div>
              </div>

              {/* Radar chart + category breakdown side by side */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-white/8 rounded-2xl p-6">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.15em] mb-4">Radar Overview</p>
                  <FundamentalRadarChart categoryScores={result.categoryScores} />
                </div>
                <div className="bg-slate-900 border border-white/8 rounded-2xl p-6">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.15em] mb-4">Score breakdown</p>
                  <div className="space-y-4">
                    {result.categoryScores.map((cs) => {
                      const c = scoreColor(cs.score);
                      return (
                        <div key={cs.category}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-400 font-medium flex items-center gap-1.5">
                              <span className="text-slate-600">{CAT_ICONS[cs.category]}</span>
                              {CAT_LABELS[cs.category]}
                            </span>
                            <span className={clsx("font-black tabular-nums", c.text)}>{cs.score}</span>
                          </div>
                          <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                            <motion.div className={clsx("h-full rounded-full", c.bg)}
                              initial={{ width: 0 }} animate={{ width: `${cs.score}%` }}
                              transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Red Flags ── */}
          {activeTab === "Red Flags" && (
            <motion.div key="flags" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease }}
              className="bg-slate-900 border border-white/8 rounded-2xl p-6">
              <RedFlagsPanel flags={result.redFlags} />
            </motion.div>
          )}

          {/* ── ML Signals ── */}
          {activeTab === "ML Signals" && (
            <motion.div key="ml" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease }}
              className="bg-slate-900 border border-white/8 rounded-2xl p-6">
              {result.mlPredictions ? (
                <MLPanel ml={result.mlPredictions} />
              ) : (
                <div className="py-16 text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 mb-4">
                    <BrainCircuit className="h-7 w-7 text-slate-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-400 mb-2">ML predictions not available</p>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    Only NIFTY 50 stocks have pre-trained models. Fundamental analysis is still complete.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Deep Dive ── */}
          {activeTab === "Deep Dive" && (
            <motion.div key="deepdive" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease }}
              className="space-y-2">
              <p className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-5">
                All {result.ruleResults.length} rules — click any category to expand
              </p>
              {result.categoryScores.map((cs) => (
                <CategoryAccordion
                  key={cs.category}
                  cs={cs}
                  rules={result.ruleResults.filter((r) => r.category === cs.category)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Actions ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="no-print mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-3 items-center">
          <button onClick={() => router.push("/analyze")}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-bold shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Search className="h-4 w-4" /> Analyze Another
          </button>
          <button onClick={() => router.push("/learn")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 border border-white/8 text-slate-300 text-sm font-semibold hover:border-violet-500/30 hover:text-violet-300 transition-all">
            <BookOpen className="h-4 w-4" /> Learn metrics
          </button>
          <button onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 border border-white/8 text-slate-300 text-sm font-semibold hover:border-violet-500/30 hover:text-violet-300 transition-all">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </button>
          <button onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 border border-white/8 text-slate-300 text-sm font-semibold hover:border-violet-500/30 hover:text-violet-300 active:scale-[0.98] transition-all">
            <Printer className="h-4 w-4" /> Export PDF
          </button>
          <p className="ml-auto text-xs text-slate-700 max-w-xs text-right hidden sm:block">
            Educational purposes only · Not investment advice · Always consult a qualified financial advisor
          </p>
        </motion.div>

      </div>
    </div>
  );
}
