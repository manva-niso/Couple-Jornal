import { create } from "zustand";

interface FilterState {
  query: string;
  setQuery: (query: string) => void;
}

// Shared across Scroll and Diary so switching themes doesn't reset your search.
export const useFilterStore = create<FilterState>()((set) => ({
  query: "",
  setQuery: (query) => set({ query }),
}));