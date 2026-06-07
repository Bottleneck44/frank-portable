"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  motion, useScroll, useTransform, AnimatePresence,
  useMotionValue, useSpring, useInView,
} from "framer-motion";
import {
  BarChart2, ArrowRight, Brain, Shield, BookOpen,
  Search, Menu, X, ChevronDown, FileText, GraduationCap,
  Activity, FlaskConical, Zap, Layers, Terminal,
} from "lucide-react";
import clsx from "clsx";

/* ─── Constants ─── */
const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
};
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

/* ─── Deterministic particles (no Math.random at render) ─── */
const PARTICLES = [
  { x: 12, y: 18, s: 2, d: 5.2 }, { x: 88, y: 22, s: 1.5, d: 7.1 },
  { x: 35, y: 72, s: 2.5, d: 4.8 }, { x: 64, y: 45, s: 1, d: 9.3 },
  { x: 78, y: 80, s: 3, d: 6.0 }, { x: 22, y: 55, s: 1.5, d: 5.7 },
  { x: 50, y: 30, s: 2, d: 8.2 }, { x: 90, y: 60, s: 1, d: 4.4 },
  { x: 8, y: 85, s: 2.5, d: 7.8 }, { x: 45, y: 90, s: 1.5, d: 6.6 },
  { x: 70, y: 15, s: 1, d: 5.1 }, { x: 30, y: 40, s: 2, d: 9.0 },
];

/* ─── NIFTY 50 marquee items ─── */
const NIFTY_ITEMS = [
  { t: "RELIANCE.NS", v: "+1.2%" }, { t: "TCS.NS", v: "+0.8%" },
  { t: "HDFCBANK.NS", v: "-0.3%" }, { t: "INFY.NS", v: "+2.1%" },
  { t: "ICICIBANK.NS", v: "+0.5%" }, { t: "HINDUNILVR.NS", v: "+1.4%" },
  { t: "ITC.NS", v: "+0.9%" }, { t: "KOTAKBANK.NS", v: "-0.6%" },
  { t: "LT.NS", v: "+1.7%" }, { t: "AXISBANK.NS", v: "+0.4%" },
  { t: "BAJFINANCE.NS", v: "-1.1%" }, { t: "WIPRO.NS", v: "+0.7%" },
];

/* ─── Live terminal lines ─── */
const TERMINAL_LINES = [
  { txt: "$ Fetching RELIANCE.NS financials…", delay: 0, color: "text-slate-400" },
  { txt: "✓ 3-year P&L + Balance sheet loaded", delay: 0.6, color: "text-emerald-400" },
  { txt: "Running DFAL: 30 forensic rules…", delay: 1.2, color: "text-slate-400" },
  { txt: "  ROE > 15%          ✓  28.4%", delay: 1.8, color: "text-violet-300" },
  { txt: "  Current ratio ≥ 1  ✓  1.84", delay: 2.2, color: "text-violet-300" },
  { txt: "  D/E ratio < 2      ✓  0.72", delay: 2.6, color: "text-violet-300" },
  { txt: "  OCF > 0            ✓  ₹72,341 Cr", delay: 3.0, color: "text-violet-300" },
  { txt: "  Revenue growth     ✓  +19.3% YoY", delay: 3.4, color: "text-violet-300" },
  { txt: "  Altman Z-Score     ✓  3.82 (safe)", delay: 3.8, color: "text-violet-300" },
  { txt: "28 / 30 rules passed", delay: 4.3, color: "text-emerald-400" },
  { txt: "Running ML ensemble (4 models)…", delay: 4.9, color: "text-slate-400" },
  { txt: "  XGBoost: 76 · LightGBM: 81", delay: 5.5, color: "text-blue-300" },
  { txt: "  RandomForest: 74 · LSTM: 78", delay: 5.9, color: "text-blue-300" },
  { txt: "Technical Score: 77.3 / 100", delay: 6.4, color: "text-emerald-400" },
  { txt: "Fusion — composite score: 82 / 100", delay: 7.0, color: "text-white" },
  { txt: "Verdict: HEALTHY ✓", delay: 7.6, color: "text-emerald-400" },
];

/* ══════════════════════════ Hooks ══════════════════════════ */

/* Text scramble */
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@!";
function useTextScramble(target: string, trigger: boolean, duration = 1400) {
  const [display, setDisplay] = useState(target);
  useEffect(() => {
    if (!trigger) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const revealed = Math.floor(progress * target.length);
      setDisplay(
        target.split("").map((ch, i) =>
          i < revealed ? ch : CHARS[Math.floor(Math.random() * CHARS.length)]
        ).join("")
      );
      if (progress === 1) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [trigger, target, duration]);
  return display;
}

/* Animated counter */
function useAnimatedCounter(target: number, decimals = 0) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const duration = 1200;
    const raf = (ts: number) => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [inView, target, decimals]);
  return { ref, value };
}

/* ══════════════════════════ Sub-components ══════════════════════════ */

/* Custom cursor — desktop only */
function CustomCursor() {
  const dot = useMotionValue(0);
  const dx = useMotionValue(-100);
  const dy = useMotionValue(-100);
  const rx = useSpring(dx, { stiffness: 120, damping: 18 });
  const ry = useSpring(dy, { stiffness: 120, damping: 18 });

  useEffect(() => {
    const move = (e: MouseEvent) => { dx.set(e.clientX); dy.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [dx, dy]);

  return (
    <>
      {/* dot */}
      <motion.div
        className="pointer-events-none fixed z-[9999] h-2 w-2 rounded-full bg-violet-400"
        style={{ left: dx, top: dy, x: "-50%", y: "-50%" }}
      />
      {/* ring */}
      <motion.div
        className="pointer-events-none fixed z-[9998] h-9 w-9 rounded-full border border-violet-400/40"
        style={{ left: rx, top: ry, x: "-50%", y: "-50%" }}
      />
    </>
  );
}

/* Magnetic button wrapper */
function MagneticBtn({ children, className, href, onClick }: {
  children: React.ReactNode; className?: string; href?: string; onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 200, damping: 20 });
  const sy = useSpring(my, { stiffness: 200, damping: 20 });

  const handleMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left - r.width / 2) * 0.3);
    my.set((e.clientY - r.top - r.height / 2) * 0.3);
  };
  const handleLeave = () => { mx.set(0); my.set(0); };

  const inner = (
    <motion.div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }} className={className}>
      {children}
    </motion.div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return <button onClick={onClick}>{inner}</button>;
}

/* Live terminal widget */
function LiveTerminal() {
  const [lines, setLines] = useState<typeof TERMINAL_LINES>([]);
  const [loop, setLoop] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false });

  useEffect(() => {
    if (!inView) return;
    setLines([]);
    const timers: ReturnType<typeof setTimeout>[] = [];
    TERMINAL_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setLines(prev => [...prev, line]), line.delay * 1000));
    });
    const restart = setTimeout(() => setLoop(l => l + 1), 10000);
    return () => { timers.forEach(clearTimeout); clearTimeout(restart); };
  }, [inView, loop]);

  // Scroll only within the terminal box, never the page
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  return (
    <div ref={ref}
      className="rounded-2xl bg-slate-900 border border-white/8 overflow-hidden shadow-2xl shadow-black/50">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-slate-950">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/60" />
          <span className="h-3 w-3 rounded-full bg-amber-500/60" />
          <span className="h-3 w-3 rounded-full bg-emerald-500/60" />
        </div>
        <div className="flex items-center gap-1.5 ml-3">
          <Terminal className="h-3 w-3 text-slate-500" />
          <span className="text-[11px] text-slate-500 font-mono">frank — analysis</span>
        </div>
      </div>
      {/* Output */}
      <div ref={bodyRef} className="h-72 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed space-y-0.5">
        <AnimatePresence>
          {lines.map((line, i) => (
            <motion.p key={`${loop}-${i}`}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className={line.color}>
              {line.txt}
            </motion.p>
          ))}
        </AnimatePresence>
        {/* Blinking cursor */}
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 1.1 }}
          className="inline-block w-2 h-3 bg-violet-400 align-middle ml-0.5"
        />
      </div>
    </div>
  );
}

/* Glow card — forwards mouse position as CSS vars */
function GlowCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    ref.current!.style.setProperty("--mx", `${e.clientX - r.left}px`);
    ref.current!.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onMouseMove={handleMove} className={clsx("glow-card", className)}>
      {children}
    </div>
  );
}

/* Stat card with 3D tilt + animated counter */
function StatCard({
  value, numeric, label, color, prefix = "", suffix = "",
}: { value: string; numeric?: number; label: string; color: string; prefix?: string; suffix?: string }) {
  const ref2 = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18 });

  const { ref: cRef, value: cv } = useAnimatedCounter(numeric ?? 0);

  const handleMove = (e: React.MouseEvent) => {
    const r = ref2.current?.getBoundingClientRect();
    if (!r) return;
    const xPct = ((e.clientX - r.left) / r.width - 0.5) * 14;
    const yPct = ((e.clientY - r.top) / r.height - 0.5) * -14;
    ry.set(xPct); rx.set(yPct);
  };
  const handleLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div ref={ref2} variants={fadeUp} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 600 }}
      className="bg-slate-950 p-8 md:p-10 flex flex-col gap-3">
      <div ref={cRef as React.RefObject<HTMLDivElement>}>
        <p className={clsx("text-4xl md:text-5xl font-black tabular-nums tracking-tighter", color)}>
          {numeric !== undefined ? `${prefix}${cv}${suffix}` : value}
        </p>
      </div>
      <p className="text-xs text-slate-500 leading-snug max-w-[120px]">{label}</p>
    </motion.div>
  );
}

/* ══════════════════════════ Page ══════════════════════════ */

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const [scrambleTrig, setScrambleTrig] = useState(false);
  const headline = useTextScramble("FRANK", scrambleTrig);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: docScroll } = useScroll();
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "18%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);
  const progressScaleX = useSpring(docScroll, { stiffness: 400, damping: 40 });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setHasFinePointer(mq.matches);
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Trigger scramble after mount
  useEffect(() => { const t = setTimeout(() => setScrambleTrig(true), 600); return () => clearTimeout(t); }, []);

  return (
    <div className={clsx("min-h-screen bg-slate-950 selection:bg-violet-600 selection:text-white", hasFinePointer && "no-cursor")}>

      {/* Custom cursor */}
      {hasFinePointer && <CustomCursor />}

      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 inset-x-0 z-[60] h-[2px] bg-gradient-to-r from-violet-600 to-purple-500 origin-left"
        style={{ scaleX: progressScaleX }}
      />

      {/* ─── Nav ─── */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className={clsx(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled ? "bg-slate-950/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
                <BarChart2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-black text-white tracking-tight">FRANK</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {[{ label: "Problem", id: "problem" }, { label: "Approach", id: "approach" },
                { label: "Results", id: "results" }, { label: "Demo", id: "demo" }].map(({ label, id }) => (
                <button key={id} onClick={() => scrollTo(id)}
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200">
                  {label}
                </button>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200">Dashboard</Link>
              <Link href="/analyze"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-all duration-200">
                Try Demo <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white transition-colors">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="md:hidden bg-slate-950 border-t border-white/5">
              <div className="px-6 py-5 space-y-4">
                {[["Problem","problem"],["Approach","approach"],["Results","results"],["Demo","demo"]].map(([l,id]) => (
                  <button key={id} onClick={() => { scrollTo(id!); setMenuOpen(false); }}
                    className="block w-full py-2 text-left text-slate-300 font-medium">{l}</button>
                ))}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <Link href="/learn" onClick={() => setMenuOpen(false)} className="block py-2 text-slate-300">Learn</Link>
                  <Link href="/analyze" onClick={() => setMenuOpen(false)}
                    className="block w-full py-3 text-center rounded-xl bg-violet-600 text-white font-semibold">Try Demo →</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ─── Hero ─── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950">
        {/* Ambient light */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-600/8 rounded-full blur-[80px]" />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "radial-gradient(circle, #a78bfa 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          {/* Beam sweep */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="beam absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-transparent via-violet-400/20 to-transparent" />
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {PARTICLES.map((p, i) => (
            <motion.div key={i}
              className="absolute rounded-full bg-violet-400/20"
              style={{
                left: `${p.x}%`, top: `${p.y}%`,
                width: p.s * 2, height: p.s * 2,
              }}
              animate={{ y: [0, -12, 0], opacity: [0.2, 0.6, 0.2] }}
              transition={{ repeat: Infinity, duration: p.d, ease: "easeInOut", delay: i * 0.3 }}
            />
          ))}
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full px-6 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — headline */}
            <div className="text-left">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease, delay: 0.1 }}
                className="inline-flex items-center gap-3 mb-10">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 tracking-widest uppercase">
                  <GraduationCap className="h-3.5 w-3.5 text-violet-400" />
                  Final Year Project · 2025–26
                </span>
                <span className="w-px h-3.5 bg-slate-700" />
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 tracking-widest uppercase">
                  <FileText className="h-3.5 w-3.5" />
                  IJRTI · ISSN 2456-3315
                </span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease, delay: 0.2 }}
                className="text-[clamp(3rem,9vw,6.5rem)] font-black text-white leading-[0.95] tracking-tighter mb-6 font-mono">
                {headline}
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease, delay: 0.35 }}
                className="text-lg md:text-xl text-slate-400 font-light leading-relaxed max-w-lg mb-4">
                A dual-layer financial intelligence framework for{" "}
                <span className="text-white font-medium">Indian retail investors.</span>
              </motion.p>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-sm text-slate-600 mb-10">
                Forensic accounting · Machine learning ensemble · Progressive disclosure
              </motion.p>

              {/* CTAs — magnetic */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease, delay: 0.55 }}
                className="flex flex-wrap items-center gap-4">
                <MagneticBtn href="/analyze"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-sm font-bold text-white shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300">
                  Launch Live Demo
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </MagneticBtn>
                <MagneticBtn onClick={() => scrollTo("approach")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-4 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200">
                  View Methodology <ChevronDown className="h-4 w-4" />
                </MagneticBtn>
              </motion.div>

              {/* Team */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.9 }}
                className="mt-14 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 text-xs text-slate-600">
                <span>Ananda D · Madhumitha S · Kamalika M</span>
                <span className="hidden sm:block w-px h-3 bg-slate-800" />
                <span>Guide: Dr. P. Vinothiyalakshmi</span>
                <span className="hidden sm:block w-px h-3 bg-slate-800" />
                <span>Dept. of AI & DS · SVCE Chennai</span>
              </motion.div>
            </div>

            {/* Right — live terminal */}
            <motion.div initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.1, ease, delay: 0.7 }}
              className="hidden lg:block">
              <LiveTerminal />
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-px h-10 bg-gradient-to-b from-transparent via-slate-600 to-transparent" />
        </motion.div>
      </section>

      {/* ─── NIFTY Marquee ─── */}
      <div className="bg-slate-900/60 border-y border-white/5 py-3 overflow-hidden">
        <div className="marquee-track flex gap-8 w-max">
          {[...NIFTY_ITEMS, ...NIFTY_ITEMS].map((item, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono font-bold text-slate-300">{item.t}</span>
              <span className={clsx("text-[10px] font-mono font-semibold",
                item.v.startsWith("+") ? "text-emerald-400" : "text-red-400"
              )}>{item.v}</span>
              <span className="text-slate-800 text-xs">·</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Stats Strip ─── */}
      <section className="bg-slate-950 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
            <StatCard value="85%" numeric={85} suffix="%" label="Concordance with Altman Z-Score" color="text-violet-400" />
            <StatCard value="95%" numeric={95} suffix="%" label="Within-one-tier accuracy" color="text-emerald-400" />
            <StatCard value="30" numeric={30} label="Deterministic forensic rules" color="text-blue-400" />
            <StatCard value="<100ms" label="Analysis latency" color="text-amber-400" />
          </motion.div>
        </div>
      </section>

      {/* ─── Problem ─── */}
      <section id="problem" className="bg-white scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6 py-32">
          <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
            className="text-xs font-bold text-violet-600 uppercase tracking-[0.2em] mb-16">
            The Problem
          </motion.p>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}
            className="mb-20">
            <motion.h2 variants={fadeUp}
              className="text-[clamp(2.5rem,6vw,5rem)] font-black text-slate-900 leading-[1.05] tracking-tighter max-w-4xl">
              89% of F&O traders
              <span className="text-red-500"> lose money.</span>
              <br />
              <span className="text-slate-400 font-light">The tools don&apos;t exist yet.</span>
            </motion.h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
              className="space-y-5">
              {[
                { stat: "₹1.8L Cr", label: "lost by retail investors in FY 2022–23", color: "text-red-500" },
                { stat: "15 Cr+", label: "demat accounts — 4× growth in 5 years", color: "text-violet-600" },
                { stat: "0", label: "accessible forensic analysis tools for India", color: "text-slate-400" },
              ].map((s) => (
                <motion.div key={s.stat} variants={fadeUp}
                  className="flex items-center gap-6 py-5 border-b border-slate-100 last:border-0">
                  <p className={clsx("text-3xl font-black tabular-nums shrink-0 w-32", s.color)}>{s.stat}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
              className="space-y-4 pt-2">
              <motion.p variants={fadeUp} className="text-slate-500 text-lg leading-relaxed">
                India&apos;s capital market democratization created a paradox — millions of investors entered markets with <strong className="text-slate-900">trading apps but without financial literacy</strong> or analytical tools to make informed decisions.
              </motion.p>
              <motion.p variants={fadeUp} className="text-slate-500 leading-relaxed">
                This is a <strong className="text-slate-900">dual deficit</strong>: lack of cognitive frameworks to interpret financials, and no tool that systematically diagnoses company health and explains every step in plain language.
              </motion.p>
              <motion.div variants={fadeUp}
                className="mt-8 p-5 rounded-2xl bg-violet-50 border border-violet-100">
                <p className="text-sm font-semibold text-violet-900">Our answer</p>
                <p className="text-sm text-violet-700 mt-1 leading-relaxed">A closed-loop <strong>Learn → Understand → Validate</strong> pipeline where analytical outputs serve as pedagogical anchors — education and analysis in one unified system.</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Contributions ─── */}
      <section className="bg-slate-950 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-32">
          <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-16">
            Research Contributions
          </motion.p>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
            className="space-y-0">
            {[
              { n: "C1", icon: <Zap className="h-4 w-4" />, title: "Web Platform", body: "Real-time forensic analysis for any listed company using live Yahoo Finance data. Sub-100ms latency for 30 rules across 3-year financial histories." },
              { n: "C2", icon: <Shield className="h-4 w-4" />, title: "Forensic Engine — DFAL", body: "30 deterministic rules across 7 categories with severity-weighted verdict algorithm. Validated against Altman Z-Score across 20 Indian companies." },
              { n: "C3", icon: <BookOpen className="h-4 w-4" />, title: "Progressive Disclosure — ELL", body: "Three-level educational model (L1 inline → L2 contextual → L3 deep-dive) grounded in cognitive load theory. Mean heuristic severity 0.72 / 4.0." },
              { n: "C4", icon: <FlaskConical className="h-4 w-4" />, title: "Multi-dimensional Evaluation", body: "Concordance analysis, 5 retrospective case studies with 12+ months advance signaling, expert heuristic evaluation, and performance benchmarking." },
            ].map((c) => (
              <GlowCard key={c.n}>
                <motion.div variants={fadeUp}
                  className="group flex items-start gap-8 py-8 border-t border-white/5 hover:border-violet-500/20 transition-colors duration-300">
                  <span className="text-xs font-black text-slate-700 w-8 shrink-0 pt-1 group-hover:text-violet-500 transition-colors">{c.n}</span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-500 group-hover:bg-violet-600/15 group-hover:text-violet-400 transition-all">{c.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold mb-1">{c.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{c.body}</p>
                  </div>
                </motion.div>
              </GlowCard>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Methodology ─── */}
      <section id="approach" className="bg-white scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6 py-32">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="mb-20">
            <motion.p variants={fadeUp} className="text-xs font-bold text-violet-600 uppercase tracking-[0.2em] mb-6">Methodology</motion.p>
            <motion.h2 variants={fadeUp}
              className="text-[clamp(2rem,5vw,4rem)] font-black text-slate-900 leading-tight tracking-tight max-w-3xl">
              Dual-layer architecture,<br />
              <span className="text-violet-600">extended with ML.</span>
            </motion.h2>
          </motion.div>

          {/* Pipeline */}
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
            className="mb-20">
            <motion.div variants={fadeUp} className="flex items-center gap-2 overflow-x-auto pb-4">
              {[
                { label: "Input", sub: "Ticker / JSON" },
                { label: "Market Data", sub: "Yahoo Finance", accent: true },
                { label: "DFAL", sub: "30 forensic rules", accent: true },
                { label: "ML Ensemble", sub: "4 models", accent: true },
                { label: "Fusion", sub: "Adaptive weights", accent: true },
                { label: "Report + ELL", sub: "Score · Flags · Education", accent: true },
              ].map((s, i) => (
                <div key={s.label} className="flex items-center gap-2 shrink-0">
                  <div className={clsx("rounded-xl px-4 py-3 text-center border",
                    s.accent ? "bg-violet-50 border-violet-100" : "bg-slate-50 border-slate-100")}>
                    <p className={clsx("text-xs font-bold whitespace-nowrap", s.accent ? "text-violet-700" : "text-slate-700")}>{s.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">{s.sub}</p>
                  </div>
                  {i < 5 && <ArrowRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Three layers */}
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}
            className="grid md:grid-cols-3 gap-px bg-slate-100 rounded-2xl overflow-hidden">
            {[
              { icon: <Shield className="h-5 w-5 text-violet-600" />, label: "DFAL", title: "Forensic Rules Engine",
                points: ["30 rules · 7 categories", "Pure deterministic functions", "Healthy / Caution / High Risk", "Hard overrides: negative equity, Altman Z"],
                bg: "bg-white", accent: "bg-violet-50" },
              { icon: <Brain className="h-5 w-5 text-purple-600" />, label: "ML", title: "Technical Ensemble",
                points: ["XGBoost · LightGBM · RF · LSTM", "2012–2024 NIFTY 50 history", "21-feature engineered matrix", "R²-weighted → Technical Score 0–100"],
                bg: "bg-white", accent: "bg-purple-50" },
              { icon: <BookOpen className="h-5 w-5 text-blue-600" />, label: "ELL", title: "Progressive Disclosure",
                points: ["L1: inline on every metric", "L2: contextual per rule", "L3: /learn glossary + articles", "Cognitive load theory · Nielsen"],
                bg: "bg-white", accent: "bg-blue-50" },
            ].map((layer) => (
              <motion.div key={layer.label} variants={fadeUp} className={clsx("p-8", layer.bg)}>
                <div className={clsx("inline-flex h-10 w-10 items-center justify-center rounded-xl mb-5", layer.accent)}>
                  {layer.icon}
                </div>
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">{layer.label}</p>
                <h3 className="font-bold text-slate-900 mb-5">{layer.title}</h3>
                <ul className="space-y-2.5">
                  {layer.points.map((p) => (
                    <li key={p} className="flex gap-2.5 text-sm text-slate-500">
                      <span className="text-violet-400 font-bold shrink-0 mt-0.5">—</span> {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Live Demo ─── */}
      <section id="demo" className="bg-slate-950 border-t border-white/5 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6 py-32">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-20">
            <motion.p variants={fadeUp} className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-6">Live Demo</motion.p>
            <motion.h2 variants={fadeUp}
              className="text-[clamp(2rem,5vw,4rem)] font-black text-white leading-tight tracking-tight">
              Every button opens<br />
              <span className="text-slate-500 font-light">the real application.</span>
            </motion.h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
            className="space-y-0">
            {[
              { n: "01", icon: <Search className="h-4 w-4" />, title: "Stock Ticker Analysis", desc: "Enter any NIFTY 50 ticker — RELIANCE.NS, TCS.NS, HDFCBANK.NS — and get a full forensic + ML report in under 5 seconds.", cta: "Run Analysis", href: "/analyze" },
              { n: "02", icon: <BarChart2 className="h-4 w-4" />, title: "Composite Score Report", desc: "Verdict header, radar chart, ML predictions, red flag table, and progressive disclosure breakdowns. Every score explained in plain English.", cta: "View Report", href: "/analyze" },
              { n: "03", icon: <Brain className="h-4 w-4" />, title: "ML Ensemble Predictions", desc: "4 pre-trained models with R²-weighted consensus. Technical Score 0–100 with directional signal and confidence percentage.", cta: "See ML in Action", href: "/analyze" },
              { n: "04", icon: <BookOpen className="h-4 w-4" />, title: "Educational Glossary", desc: "Three-level progressive disclosure — every financial term and rule explained. The Learn → Understand → Validate pipeline in action.", cta: "Open Learn Module", href: "/learn" },
              { n: "05", icon: <Activity className="h-4 w-4" />, title: "Session Dashboard", desc: "Compare multiple stocks side-by-side. Fundamental vs Technical scatter plot. Session history in browser storage.", cta: "Open Dashboard", href: "/dashboard" },
              { n: "06", icon: <Layers className="h-4 w-4" />, title: "Architecture Overview", desc: "Visual system diagram of the full dual-layer architecture — DFAL rules, ML pipeline, fusion engine, and ELL disclosure levels.", cta: "View Architecture", href: "/architecture" },
            ].map((f) => (
              <motion.div key={f.n} variants={fadeUp}>
                <GlowCard>
                  <Link href={f.href}
                    className="group flex items-start gap-6 md:gap-10 py-7 border-t border-white/5 hover:border-violet-500/20 transition-colors duration-300">
                    <div className="flex items-center gap-4 shrink-0 w-44">
                      <span className="text-xs font-black text-slate-700 group-hover:text-violet-500 transition-colors">{f.n}</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-500 group-hover:bg-violet-600/15 group-hover:text-violet-400 transition-all">{f.icon}</div>
                      <span className="hidden md:block text-sm font-bold text-white">{f.title}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="md:hidden block text-sm font-bold text-white mb-1">{f.title}</span>
                      <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-slate-600 group-hover:text-violet-400 transition-colors whitespace-nowrap">
                      {f.cta} <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                </GlowCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Results ─── */}
      <section id="results" className="bg-white scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6 py-32">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-20">
            <motion.p variants={fadeUp} className="text-xs font-bold text-violet-600 uppercase tracking-[0.2em] mb-6">Evaluation & Results</motion.p>
            <motion.h2 variants={fadeUp}
              className="text-[clamp(2rem,5vw,4rem)] font-black text-slate-900 leading-tight tracking-tight max-w-3xl">
              Multi-dimensional validation<br />
              <span className="text-slate-400 font-light">across 20 Indian companies.</span>
            </motion.h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-3 gap-px bg-slate-100 rounded-2xl overflow-hidden mb-14">
            {[
              { value: "85%", label: "Exact concordance with Altman Z-Score", sub: "across 20 companies, 7 sectors" },
              { value: "95%", label: "Within-one-tier concordance", sub: "all sector divergences explained" },
              { value: "5 / 5", label: "Retrospective case studies", sub: "including distressed firms" },
            ].map((s) => (
              <motion.div key={s.value} variants={fadeUp} className="bg-white p-10">
                <p className="text-5xl font-black text-slate-900 tabular-nums tracking-tighter mb-3">{s.value}</p>
                <p className="text-sm font-semibold text-slate-700 mb-1">{s.label}</p>
                <p className="text-xs text-slate-400">{s.sub}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Case studies */}
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
              <motion.h3 variants={fadeUp} className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-emerald-500" /> Retrospective Case Studies
              </motion.h3>
              <div className="space-y-0">
                {[
                  { company: "HUL", verdict: "Healthy", detail: "29/30 rules passed · ROE 75%+ · AAA aligned", color: "emerald" },
                  { company: "TCS", verdict: "Healthy", detail: "Zero D/E · cash-rich · consistent margins", color: "emerald" },
                  { company: "Yes Bank (pre-crisis)", verdict: "High Risk", detail: "Flagged 12+ months before collapse", color: "red" },
                  { company: "Jet Airways", verdict: "High Risk", detail: "Negative equity · persistent negative OCF", color: "red" },
                  { company: "Tata Motors FY19", verdict: "Caution", detail: "JLR losses · elevated leverage", color: "amber" },
                ].map((cs) => (
                  <motion.div key={cs.company} variants={fadeUp}
                    className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-0">
                    <span className={clsx("text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap",
                      cs.color === "emerald" ? "bg-emerald-50 text-emerald-700" :
                      cs.color === "red" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                    )}>{cs.verdict}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{cs.company}</p>
                      <p className="text-xs text-slate-400 truncate">{cs.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Heuristic + perf */}
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
              className="space-y-6">
              <motion.div variants={fadeUp}
                className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Interface · Heuristic Evaluation</p>
                <div className="flex items-end gap-4 mb-4">
                  <p className="text-6xl font-black text-violet-600 tracking-tighter leading-none">0.72</p>
                  <p className="text-sm text-slate-400 leading-snug mb-1">mean severity<br />Nielsen 0–4 scale</p>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Evaluated by 3 expert evaluators across Nielsen&apos;s 10 usability heuristics. Lowest severity on H3 (user control) and H6 (recognition) — the heuristics most relevant to information architecture.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
                {[
                  { value: "<100ms", label: "Forensic analysis latency" },
                  { value: "<5s", label: "Full pipeline with ML" },
                  { value: "49", label: "NIFTY 50 stocks — full ML" },
                  { value: "4", label: "ML models in ensemble" },
                ].map((p) => (
                  <div key={p.label} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-2xl font-black text-slate-900 tabular-nums tracking-tight mb-1">{p.value}</p>
                    <p className="text-xs text-slate-400">{p.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Tech Stack ─── */}
      <section className="bg-slate-950 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-32">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16">
            <motion.p variants={fadeUp} className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-6">Technology Stack</motion.p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {[
              { layer: "Frontend", items: ["Next.js 16", "React 19", "TypeScript 5", "Tailwind CSS 4", "Framer Motion 12", "Recharts 3"] },
              { layer: "Rules Engine", items: ["Pure TypeScript", "30 forensic rules", "Zod validation", "Zustand state", "Zero server deps"] },
              { layer: "ML Backend", items: ["FastAPI + Pydantic v2", "XGBoost", "LightGBM", "Random Forest", "TensorFlow LSTM", "Python 3.11"] },
              { layer: "Data", items: ["yahoo-finance2", "yfinance (Python)", "21 engineered features", "pandas 2 + numpy"] },
            ].map((g) => (
              <GlowCard key={g.layer}>
                <motion.div variants={fadeUp} className="bg-slate-950 p-8 h-full">
                  <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-5">{g.layer}</p>
                  <ul className="space-y-2.5">
                    {g.items.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-slate-400">
                        <span className="h-1 w-1 rounded-full bg-violet-600 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </GlowCard>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Limitations FAQ ─── */}
      <section className="bg-white border-t border-slate-100">
        <div className="mx-auto max-w-4xl px-6 py-32">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16">
            <motion.p variants={fadeUp} className="text-xs font-bold text-violet-600 uppercase tracking-[0.2em] mb-6">Limitations & Future Work</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-black text-slate-900 tracking-tight">Honest acknowledgements.</motion.h2>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
            className="space-y-0">
            {[
              { q: "Is this investment advice?", a: "No. FRANK is strictly educational and for research purposes. Every analysis output includes an explicit disclaimer. Users make their own decisions." },
              { q: "What are the current limitations?", a: "Rule thresholds are calibrated for non-banking companies — banking/NBFC sectors need separate threshold libraries. The 20-company evaluation dataset is diverse but small versus ~5,000 NSE/BSE-listed companies. Heuristic evaluation used experts, not end-users." },
              { q: "What is planned as future work?", a: "Industry-specific rule calibration; controlled user study (N≥30) with comprehension measurement; generative AI for conversational learning; portfolio-level risk; longitudinal validation tracking verdicts against future financial events." },
              { q: "How do DFAL and ML relate?", a: "Independent layers, fused adaptively. DFAL: deterministic, fully explainable rules. ML: 4 pre-trained models on price history. Fusion weights adapt based on data confidence — typically 60% fundamental, 40% technical." },
            ].map((faq) => <FAQItem key={faq.q} question={faq.q} answer={faq.a} />)}
          </motion.div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative bg-slate-950 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-violet-600/8 rounded-full blur-[100px]" />
          <div className="beam absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-transparent via-violet-400/15 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 py-40 text-center">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp}
              className="text-[clamp(2.5rem,6vw,5.5rem)] font-black text-white leading-[1.05] tracking-tighter mb-6">
              Analyze your<br />
              <span className="text-violet-400">first stock.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              All 49 NIFTY 50 stocks with full ML analysis.<br />Any ticker for fundamental-only mode.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
              <MagneticBtn href="/analyze"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-10 py-5 text-base font-bold text-white shadow-2xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-300">
                Analyze a Stock <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </MagneticBtn>
              <MagneticBtn href="/learn"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-5 text-base font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200">
                <BookOpen className="h-5 w-5" /> Learn Module
              </MagneticBtn>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-slate-950 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                <BarChart2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-black text-white">FRANK</span>
            </Link>
            <div className="flex flex-wrap gap-6 text-sm text-slate-500">
              <Link href="/analyze" className="hover:text-white transition-colors">Analyze</Link>
              <Link href="/learn" className="hover:text-white transition-colors">Learn</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/architecture" className="hover:text-white transition-colors">Architecture</Link>
              <button onClick={() => scrollTo("results")} className="hover:text-white transition-colors">Results</button>
              <button onClick={() => scrollTo("demo")} className="hover:text-white transition-colors">Demo</button>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-700">
            <p>Ananda D · Madhumitha S · Kamalika M · Dr. P. Vinothiyalakshmi · SVCE Chennai · 2025–26</p>
            <p>⚠ Not investment advice · Educational & research use only</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div variants={fadeUp}
      className="border-t border-slate-100 last:border-b last:border-slate-100">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left gap-6">
        <span className="font-semibold text-slate-900">{question}</span>
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}
          className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-violet-300 hover:text-violet-500 transition-colors">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }}
            className="overflow-hidden">
            <p className="text-slate-500 leading-relaxed pb-6">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
