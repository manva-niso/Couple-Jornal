"use client";

import { useEffect } from "react";
import { useSeatStore } from "@/store/useSeatStore";
import type { Seat } from "@/types";

/**
 * Renders nothing — just seeds sessionSeat from whatever the server session
 * actually says on mount. Needed because useSeatStore is intentionally
 * session-only/in-memory (never persisted), so a page refresh or a fresh
 * tab has no idea what the real authenticated seat is unless something
 * tells it. LoginForm's redirect works without this (client-side nav keeps
 * the store alive in memory), but a hard refresh or opening /journal
 * directly did not, before this existed.
 */
export default function SessionBootstrap({ seat }: { seat: Seat }) {
  const setSessionSeat = useSeatStore((s) => s.setSessionSeat);

  useEffect(() => {
    setSessionSeat(seat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seat]);

  return null;
}
