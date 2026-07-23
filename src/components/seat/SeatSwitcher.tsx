"use client";

import { useSeatStore } from "@/store/useSeatStore";
import type { Seat } from "@/types";

const SEATS: { seat: Seat; label: string; initial: string }[] = [
  { seat: "USER_ONE", label: "User 1", initial: "1" },
  { seat: "USER_TWO", label: "User 2", initial: "2" },
];

export default function SeatSwitcher() {
  const { viewedSeat, setViewedSeat } = useSeatStore();

  // Switching seats is intentionally unrestricted — no re-auth here, ever.
  // It changes only the viewing context. The server-authorized sessionSeat is
  // set by the login PIN and is never changed by this control.
  const handleClick = (seat: Seat) => {
    setViewedSeat(seat);
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 flex gap-2">
      {SEATS.map(({ seat, label, initial }) => {
        const isActive = viewedSeat === seat;
        return (
          <button
            key={seat}
            onClick={() => handleClick(seat)}
            aria-label={`Switch to ${label}`}
            aria-pressed={isActive}
            className={`
              group relative flex items-center justify-center
              h-24 w-24 rounded-t-full border border-[#f8e9c9]/30
              transition-all duration-300 ease-out
              ${isActive
                ? "bg-gradient-to-br from-[#6e405a] to-[#321e2c] text-[#f7e6ed] -translate-y-3 shadow-[0_-9px_24px_rgba(0,0,0,0.35)]"
                : "bg-gradient-to-br from-[#e7cfda] to-[#b27e98] text-[#4d2c41] translate-y-0 shadow-[0_-6px_16px_rgba(0,0,0,0.2)] hover:-translate-y-2"}
            `}
            style={{ marginBottom: "-48px" }}
          >
            <span className="-mb-12 text-base font-semibold tracking-wide">{initial}</span>
            <span
              className="
                absolute bottom-full mb-2 whitespace-nowrap rounded px-2 py-1 text-xs
                bg-[#5b3a4f] text-[#f5e9ee] opacity-0 pointer-events-none
                group-hover:opacity-100 transition-opacity
              "
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
