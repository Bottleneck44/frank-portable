"use client";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ReactNode } from "react";
import { motion } from "framer-motion";

export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(...inputs));
}

export function Badge({ children, color = "slate" }: { children: ReactNode; color?: "slate" | "emerald" | "amber" | "red" | "violet" | "blue" }) {
  const colors = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border", colors[color])}>
      {children}
    </span>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(
      "bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200",
      className
    )}>
      {children}
    </div>
  );
}

export function Button({ children, onClick, variant = "primary", className, disabled, type = "button" }: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost";
  className?: string; disabled?: boolean; type?: "button" | "submit";
}) {
  const variants = {
    primary: "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  };
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
    >
      {children}
    </motion.button>
  );
}

export function Alert({ children, type = "info", className }: { children: ReactNode; type?: "info" | "warning" | "error" | "success"; className?: string }) {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("border rounded-xl p-4 text-sm", styles[type], className)}
    >
      {children}
    </motion.div>
  );
}

export function Spinner({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <div className={cn(
      "animate-spin rounded-full border-2 border-violet-200 border-t-violet-600",
      size === "sm" ? "h-4 w-4" : "h-8 w-8"
    )} />
  );
}
