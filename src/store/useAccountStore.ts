// src/store/useAccountStore.ts
//
// Mock stand-in for Account + AuthIdentifier data. Module 3 replaces this
// with real API calls (/api/account/identifier, hashed PINs server-side) —
// this store exists purely so the settings UI has something to read/write
// to right now, without a backend.

import { create } from "zustand";
import type { Seat } from "@/types";

interface SeatCredentials {
  identifier: string; // email or username, empty string = not set yet
  pin: string; // plain text for now — Module 3 hashes this server-side, never stores it plain
}

interface AccountState {
  credentials: Record<Seat, SeatCredentials>;
  setIdentifier: (seat: Seat, identifier: string) => void;
  setPin: (seat: Seat, pin: string) => void;
}

export const useAccountStore = create<AccountState>()((set) => ({
  credentials: {
    USER_ONE: { identifier: "user1@example.com", pin: "1234" }, // pre-filled mock seat 1
    USER_TWO: { identifier: "", pin: "" }, // seat 2 starts empty — this is what the form fills in
  },
  setIdentifier: (seat, identifier) =>
    set((state) => ({
      credentials: {
        ...state.credentials,
        [seat]: { ...state.credentials[seat], identifier },
      },
    })),
  setPin: (seat, pin) =>
    set((state) => ({
      credentials: {
        ...state.credentials,
        [seat]: { ...state.credentials[seat], pin },
      },
    })),
}));