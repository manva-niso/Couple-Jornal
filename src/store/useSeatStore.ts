// src/store/useSeatStore.ts
//
// Session-only, deliberately NOT persisted to localStorage. The PIN establishes
// sessionSeat once at login; viewedSeat is the unrestricted, read-only view
// selected by the seat switcher. Module 3 sets sessionSeat from the server
// session and must never let viewedSeat affect authorization.

import { create } from "zustand";
import type { Seat } from "@/types";
import { mockActiveSeat } from "@/lib/mockData";

interface SeatState {
  sessionSeat: Seat;
  viewedSeat: Seat;
  setSessionSeat: (seat: Seat) => void;
  setViewedSeat: (seat: Seat) => void;
}

export const useSeatStore = create<SeatState>()((set) => ({
  // Module 1/2 starts with the mock login seat. Module 3 replaces this with
  // the seat authenticated by the identifier + password + PIN login request.
  sessionSeat: mockActiveSeat,
  viewedSeat: mockActiveSeat,
  setSessionSeat: (seat) => set({ sessionSeat: seat, viewedSeat: seat }),
  setViewedSeat: (seat) => set({ viewedSeat: seat }),
}));
