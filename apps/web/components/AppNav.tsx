"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, LayoutDashboard, BookOpen, FlaskConical, Maximize, Minimize } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import clsx from "clsx";

const NAV_LINKS = [
  { href: "/analyze",    label: "Analyze",  icon: Search },
  { href: "/dashboard",  label: "Dashboard",icon: LayoutDashboard },
  { href: "/learn",      label: "Learn",    icon: BookOpen },
  { href: "/validation", label: "Research", icon: FlaskConical },
];

export function AppNav() {
  const pathname = usePathname();
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      if (e.key === "d" || e.key === "D") { e.preventDefault(); setDemoMode(p => !p); }
      if (e.key === "Escape") setDemoMode(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("demo-mode", demoMode);
    return () => document.body.classList.remove("demo-mode");
  }, [demoMode]);

  if (pathname === "/") return null;

  return (
    <>
      <nav className={clsx(
        "sticky top-0 z-40 backdrop-blur-lg border-b shadow-lg transition-all duration-300 no-print",
        demoMode ? "bg-slate-950/98 border-violet-500/20" : "bg-slate-900/95 border-slate-800"
      )}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-14 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <Image src="/logo.png" alt="FRANK" width={110} height={48} className="object-contain" priority />
              </motion.div>
              {demoMode && (
                <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-[9px] font-black uppercase tracking-widest text-violet-400 bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-full">
                  DEMO
                </motion.span>
              )}
            </Link>

            <div className="flex items-center gap-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link key={href} href={href}
                    className={clsx(
                      "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                      active ? "text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                    )}>
                    {active && (
                      <motion.div layoutId="nav-pill"
                        className="absolute inset-0 bg-violet-600 rounded-lg shadow-md shadow-violet-500/30"
                        transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5" />{label}
                    </span>
                  </Link>
                );
              })}

              <button onClick={() => setDemoMode(p => !p)}
                title="Press D to toggle demo mode"
                className={clsx(
                  "ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                  demoMode
                    ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20"
                    : "text-slate-600 border-white/8 hover:text-slate-300 hover:border-white/15"
                )}>
                {demoMode ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
                <span className="hidden sm:block">{demoMode ? "Exit Demo" : "Demo"}</span>
                <kbd className="hidden sm:block text-[8px] font-black text-slate-500 border border-white/10 px-1 rounded">D</kbd>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {demoMode && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 no-print">
            <button onClick={() => setDemoMode(false)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/95 backdrop-blur border border-violet-500/30 text-sm font-bold text-violet-300 shadow-2xl shadow-violet-500/20 hover:border-violet-500/60 transition-all">
              <Minimize className="h-4 w-4" /> Exit Demo Mode
              <kbd className="text-[9px] font-black text-slate-600 border border-white/10 px-1.5 py-0.5 rounded ml-1">ESC</kbd>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
