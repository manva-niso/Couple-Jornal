// src/store/useThemeStore.ts
//
// Pure client-side preference — never touches the backend, ever (per the spec:
// theme is a display toggle, not account data). Persisted to localStorage so
// it survives a refresh while you're testing.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode } from "@/types";

interface ThemeState {
  themeMode: ThemeMode;
  lastViewedEntryId: string | null;
  setThemeMode: (mode: ThemeMode) => void;
  setLastViewedEntryId: (id: string | null) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: "SCROLL",
      lastViewedEntryId: null,
      setThemeMode: (mode) => set({ themeMode: mode }),
      setLastViewedEntryId: (id) => set({ lastViewedEntryId: id }),
    }),
    { name: "chitthiya-theme" } // localStorage key
  )
);