"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Search, LayoutDashboard, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

const NAV_LINKS = [
  { href: "/analyze",   label: "Analyze",   icon: Search },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learn",     label: "Learn",     icon: BookOpen },
];

export function AppNav() {
  const pathname = usePathname();

  // Landing page has its own inline nav
  if (pathname === "/") return null;

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800 shadow-lg">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: 6, scale: 1.05 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/30"
            >
              <BarChart2 className="h-4 w-4 text-white" />
            </motion.div>
            <span className="text-lg font-black text-white tracking-tight">FRANK</span>
          </Link>

          <div className="flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all",
                    active
                      ? "bg-violet-600 text-white shadow-md shadow-violet-500/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
