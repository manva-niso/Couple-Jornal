import { create } from "zustand";

interface ViewState {
  currentEntryId: string | null;
  setCurrentEntryId: (id: string | null) => void;
  /** Ground-truth lookup, called at the moment of an action (like export)
   * instead of trusting whatever `currentEntryId` was last pushed by an
   * event — the Diary book's onFlip doesn't always fire in perfect sync
   * with what page is actually showing, so this asks the real source
   * (Scroll's own state, or the flipbook's live page index) directly. */
  getCurrentEntryId: () => string | null;
  registerCurrentEntryGetter: (fn: () => string | null) => void;
}

export const useViewStore = create<ViewState>()((set) => ({
  currentEntryId: null,
  setCurrentEntryId: (id) => set({ currentEntryId: id }),
  getCurrentEntryId: () => null,
  registerCurrentEntryGetter: (fn) => set({ getCurrentEntryId: fn }),
}));