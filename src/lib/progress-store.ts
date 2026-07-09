"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Confidence } from "@/types";

export interface ProblemProgress {
  solved: boolean;
  confidence: Confidence | null;
  note: string;
  updatedAt: number;
}

export type ProgressMap = Record<string, ProblemProgress>;

interface ProgressState {
  items: ProgressMap;
  toggleSolved: (slug: string) => void;
  setConfidence: (slug: string, confidence: Confidence | null) => void;
  setNote: (slug: string, note: string) => void;
  clearOne: (slug: string) => void;
  resetAll: () => void;
  replaceAll: (items: ProgressMap) => void;
}

const EMPTY: ProblemProgress = {
  solved: false,
  confidence: null,
  note: "",
  updatedAt: 0,
};

function patch(
  state: ProgressState,
  slug: string,
  changes: Partial<ProblemProgress>,
): { items: ProgressMap } {
  const prev = state.items[slug] ?? EMPTY;
  return {
    items: {
      ...state.items,
      [slug]: { ...prev, ...changes, updatedAt: Date.now() },
    },
  };
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      items: {},
      toggleSolved: (slug) =>
        set((s) => patch(s, slug, { solved: !(s.items[slug]?.solved ?? false) })),
      setConfidence: (slug, confidence) =>
        set((s) => patch(s, slug, { confidence })),
      setNote: (slug, note) => set((s) => patch(s, slug, { note })),
      clearOne: (slug) =>
        set((s) => {
          const next = { ...s.items };
          delete next[slug];
          return { items: next };
        }),
      resetAll: () => set({ items: {} }),
      replaceAll: (items) => set({ items }),
    }),
    {
      name: "better-taro75:progress",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // We rehydrate manually after mount to avoid SSR/CSR mismatches.
      skipHydration: true,
    },
  ),
);

/**
 * Rehydrate the persisted store once on the client, and report when the store
 * is safe to read. Gate any progress-dependent UI behind this to avoid
 * hydration mismatches in the static export.
 */
export function useHydratedProgress(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useProgressStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}

export const selectProgress = (slug: string) => (s: ProgressState) =>
  s.items[slug] ?? EMPTY;
