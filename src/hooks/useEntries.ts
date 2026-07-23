// src/hooks/useEntries.ts
//
// Module 3.3 — real persistence. Same method names as before (addEntry,
// updateEntry, deleteEntry) so most components don't need to change, but
// addEntry's signature shrank to just { date, tag } since the server now
// decides id/ownerSeat/position, not the client.

import { create } from "zustand";
import type { MockEntry } from "@/types";
import { useSeatStore } from "@/store/useSeatStore";

interface EntriesState {
  entries: MockEntry[];
  loading: boolean;
  error: string | null;
  fetchEntries: () => Promise<void>;
  addEntry: (input: { date: string; tag: string | null }) => Promise<void>;
  updateEntry: (id: string, changes: Partial<MockEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  toggleUnlock: (id: string) => Promise<void>;
}

export const useEntries = create<EntriesState>()((set, get) => ({
  entries: [],
  loading: false,
  error: null,

  fetchEntries: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/entries");
      if (!res.ok) throw new Error("Failed to load entries.");
      const data = await res.json();
      set({ entries: data.entries, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addEntry: async ({ date, tag }) => {
    const sessionSeat = useSeatStore.getState().sessionSeat;
    const res = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, tag, sessionSeat }),
    });
    if (!res.ok) return;
    const { entry } = await res.json();
    set((state) => ({ entries: [...state.entries, entry] }));
  },

  updateEntry: async (id, changes) => {
    const sessionSeat = useSeatStore.getState().sessionSeat;
    const previous = get().entries;
    // Optimistic update — snappy typing/saving, rolled back below on failure.
    set((state) => ({
      entries: state.entries.map((e) => (e.id === id ? { ...e, ...changes } : e)),
    }));
    const res = await fetch(`/api/entries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionSeat, changes }),
    });
    if (res.ok) {
      const { entry } = await res.json();
      set((state) => ({ entries: state.entries.map((e) => (e.id === id ? entry : e)) }));
    } else {
      set({ entries: previous }); // rollback
    }
  },

  deleteEntry: async (id) => {
    const sessionSeat = useSeatStore.getState().sessionSeat;
    const previous = get().entries;
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
    const res = await fetch(`/api/entries/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionSeat }),
    });
    if (!res.ok) set({ entries: previous }); // rollback
  },

  toggleUnlock: async (id) => {
    const sessionSeat = useSeatStore.getState().sessionSeat;
    const res = await fetch(`/api/entries/${id}/permission`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionSeat }),
    });
    if (!res.ok) return;
    const { entry } = await res.json();
    set((state) => ({ entries: state.entries.map((e) => (e.id === id ? entry : e)) }));
  },
}));