"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FusionResult } from "@/lib/engine/types";

interface AnalysisEntry {
  id: string;
  ticker: string;
  companyName: string;
  compositeScore: number;
  verdict: string;
  analysisDate: string;
  result: FusionResult;
}

interface AnalysisStore {
  history: AnalysisEntry[];
  currentResult: FusionResult | null;
  setCurrentResult: (r: FusionResult) => void;
  clearCurrentResult: () => void;
  addToHistory: (r: FusionResult) => void;
  clearHistory: () => void;
}

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set) => ({
      history: [],
      currentResult: null,
      setCurrentResult: (r) => set({ currentResult: r }),
      clearCurrentResult: () => set({ currentResult: null }),
      addToHistory: (r) =>
        set((state) => ({
          history: [
            {
              id: `${r.ticker}-${Date.now()}`,
              ticker: r.ticker,
              companyName: r.companyName,
              compositeScore: r.compositeScore,
              verdict: r.verdict,
              analysisDate: r.analysisDate,
              result: r,
            },
            ...state.history.filter((h) => h.ticker !== r.ticker),
          ].slice(0, 20),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    { name: "finsight-history", skipHydration: true }
  )
);
