"use client";
import { useRef, useState } from "react";

export default function ArchitecturePage() {
  const ref = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  async function downloadPng() {
    if (!ref.current) return;
    setExporting(true);
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(ref.current, {
      backgroundColor: "#020617", // slate-950
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const link = document.createElement("a");
    link.download = "frank-architecture.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    setExporting(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Sticky export button */}
      <div className="sticky top-0 z-50 flex justify-end px-8 py-3 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <button
          onClick={downloadPng}
          disabled={exporting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-sm font-bold text-white transition-colors shadow-lg"
        >
          {exporting ? "⏳ Exporting…" : "⬇ Download PNG"}
        </button>
      </div>

    <div ref={ref} className="p-8">
    <div className="max-w-6xl mx-auto space-y-6">

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">FRANK — System Architecture</h1>
          <p className="text-slate-400 text-sm">Full-stack stock analysis platform · Next.js + FastAPI + ML Ensemble</p>
        </div>

        {/* Row 1: User Browser */}
        <Layer label="CLIENT" color="violet">
          <Box icon="🖥️" title="Browser" subtitle="Next.js 16 · React 19" wide>
            <Pills items={["Landing /", "Analyze /analyze", "Report /report/[ticker]", "Dashboard /dashboard", "Learn /learn"]} color="violet" />
          </Box>
        </Layer>

        <Arrows count={3} label="HTTP / fetch()" />

        {/* Row 2: Next.js App */}
        <Layer label="NEXT.JS APP ROUTER  (Vercel)" color="blue">
          <Box icon="⚡" title="Server Components" subtitle="Static pages">
            <Pills items={["/ (landing)", "/learn", "/dashboard"]} color="blue" />
          </Box>
          <Box icon="🔄" title="Client Components" subtitle="Dynamic UI">
            <Pills items={["VerdictHeader", "FundamentalBreakdown", "TechnicalBreakdown", "RedFlagsTable", "ScoreGauge", "RadarChart", "PriceChart"]} color="blue" />
          </Box>
          <Box icon="🗄️" title="Zustand Store" subtitle="Client-side state">
            <Pills items={["currentResult", "history[]", "addToHistory()"]} color="blue" />
          </Box>
          <Box icon="🔌" title="API Routes" subtitle="/api/*">
            <Pills items={["POST /api/analyze", "POST /api/fundamentals", "POST /api/fusion", "GET /api/market-data"]} color="blue" />
          </Box>
        </Layer>

        <Arrows count={3} label="Internal calls within Next.js" />

        {/* Row 3: Core Engine */}
        <Layer label="ANALYSIS ENGINE  (lib/engine)" color="emerald">
          <Box icon="📐" title="Rules Engine" subtitle="rules-engine.ts · 30+ rules">
            <Pills items={["Profitability", "Liquidity", "Solvency", "Efficiency", "Earnings Quality", "Cash Flow", "Growth", "Red Flags"]} color="emerald" />
          </Box>
          <Box icon="⚖️" title="Fusion Engine" subtitle="fusion.ts">
            <Pills items={["Weight adaptation", "Critical penalty", "Signal conflict detection", "Composite score"]} color="emerald" />
          </Box>
          <Box icon="🛡️" title="Risk Overrides" subtitle="risk-overrides.ts">
            <Pills items={["Negative equity", "Going concern", "Fraud indicators"]} color="emerald" />
          </Box>
          <Box icon="🔍" title="Edge Case Handler" subtitle="hks.ts">
            <Pills items={["Single year data", "Missing fields", "No ML model", "Stale data"]} color="emerald" />
          </Box>
        </Layer>

        <Arrows count={3} label="Parallel calls" />

        {/* Row 4: Data Sources + ML */}
        <div className="grid grid-cols-2 gap-6">
          {/* External Data */}
          <div>
            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">EXTERNAL DATA</p>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📈</span>
                <div>
                  <p className="text-sm font-bold text-white">Yahoo Finance API</p>
                  <p className="text-xs text-slate-400">yahoo-finance2 v3</p>
                </div>
              </div>
              <Pills items={["fetchFinancialStatements()", "fetchPriceHistory() · 2y daily", "searchCompanies()", "Auto .NS suffix for Indian stocks"]} color="amber" />
            </div>
          </div>

          {/* ML Backend */}
          <div>
            <p className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-3">ML BACKEND  (FastAPI · Render)</p>
            <div className="rounded-2xl border border-pink-500/30 bg-pink-950/30 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <MiniBox icon="🔧" title="Feature Engineering" items={["RSI 14", "MACD 12/26/9", "Bollinger Bands", "ADX + DI", "Parabolic SAR", "21 features total"]} color="pink" />
                <MiniBox icon="🤖" title="ML Models" items={["XGBoost", "Random Forest", "LightGBM", "LSTM (TensorFlow)", "Lookback: 20 days"]} color="pink" />
              </div>
              <div className="rounded-xl border border-pink-500/20 bg-pink-900/20 p-3">
                <p className="text-xs font-bold text-pink-300 mb-2">Ensemble Output → Next.js</p>
                <Pills items={["ensemblePredictedPrice", "directionalConsensus", "technicalScore", "signal: BULLISH / BEARISH / NEUTRAL", "49 NIFTY 50 stocks"]} color="pink" />
              </div>
            </div>
          </div>
        </div>

        <Arrows count={3} label="Deploy / host" />

        {/* Row 5: Infrastructure */}
        <Layer label="INFRASTRUCTURE" color="slate">
          <Box icon="▲" title="Vercel" subtitle="Next.js hosting">
            <Pills items={["Edge CDN", "Serverless API routes", "Auto-deploy from GitHub"]} color="slate" />
          </Box>
          <Box icon="🚂" title="Render" subtitle="Python API hosting">
            <Pills items={["Python 3.11", "Free tier", "Auto-sleep 15 min"]} color="slate" />
          </Box>
          <Box icon="🐙" title="GitHub" subtitle="Bottleneck44/finsight">
            <Pills items={["main branch", "CI via Vercel hook"]} color="slate" />
          </Box>
        </Layer>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          {[
            { color: "violet",  label: "Client / Browser" },
            { color: "blue",    label: "Next.js App (Vercel)" },
            { color: "emerald", label: "Analysis Engine" },
            { color: "amber",   label: "External Data" },
            { color: "pink",    label: "ML Backend (Render)" },
            { color: "slate",   label: "Infrastructure" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${DOT[color]}`} />
              <span>{label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
    </div>
  );
}

/* ── Colour tokens ───────────────────────────────────────────────── */
const BORDER: Record<string, string> = {
  violet: "border-violet-500/40", blue: "border-blue-500/40",
  emerald: "border-emerald-500/40", amber: "border-amber-500/40",
  pink: "border-pink-500/40", slate: "border-slate-500/40",
};
const BG: Record<string, string> = {
  violet: "bg-violet-950/40", blue: "bg-blue-950/40",
  emerald: "bg-emerald-950/40", amber: "bg-amber-950/40",
  pink: "bg-pink-950/40", slate: "bg-slate-800/40",
};
const BADGE: Record<string, string> = {
  violet: "bg-violet-800/60 text-violet-200", blue: "bg-blue-800/60 text-blue-200",
  emerald: "bg-emerald-800/60 text-emerald-200", amber: "bg-amber-800/60 text-amber-200",
  pink: "bg-pink-800/60 text-pink-200", slate: "bg-slate-700/60 text-slate-200",
};
const LABEL: Record<string, string> = {
  violet: "text-violet-400", blue: "text-blue-400", emerald: "text-emerald-400",
  amber: "text-amber-400", pink: "text-pink-400", slate: "text-slate-400",
};
const DOT: Record<string, string> = {
  violet: "bg-violet-400", blue: "bg-blue-400", emerald: "bg-emerald-400",
  amber: "bg-amber-400", pink: "bg-pink-400", slate: "bg-slate-400",
};

/* ── Sub-components ─────────────────────────────────────────────── */
function Layer({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border ${BORDER[color]} ${BG[color]} p-4`}>
      <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${LABEL[color]}`}>{label}</p>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

function Box({ icon, title, subtitle, wide, children }: {
  icon: string; title: string; subtitle: string; wide?: boolean; children?: React.ReactNode
}) {
  return (
    <div className={`flex-1 min-w-[160px] ${wide ? "min-w-[260px]" : ""} bg-slate-900/60 rounded-xl border border-slate-700/50 p-3 space-y-2`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <div>
          <p className="text-sm font-bold text-white leading-tight">{title}</p>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function MiniBox({ icon, title, items, color }: { icon: string; title: string; items: string[]; color: string }) {
  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-700/50 p-3 space-y-1">
      <p className="text-xs font-bold text-white mb-1.5">{icon} {title}</p>
      {items.map(i => (
        <p key={i} className={`text-[11px] ${LABEL[color]}`}>· {i}</p>
      ))}
    </div>
  );
}

function Pills({ items, color }: { items: string[]; color: string }) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map(item => (
        <span key={item} className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${BADGE[color]}`}>{item}</span>
      ))}
    </div>
  );
}

function Arrows({ count, label }: { count: number; label: string }) {
  return (
    <div className="flex items-center justify-center gap-4 py-1">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-slate-600 text-xl leading-none">⇅</span>
      ))}
      <span className="text-xs text-slate-500 font-mono px-2">{label}</span>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-slate-600 text-xl leading-none">⇅</span>
      ))}
    </div>
  );
}
