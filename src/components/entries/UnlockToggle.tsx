"use client";

import { canToggleUnlock } from "@/lib/permissions";
import { useEntries } from "@/hooks/useEntries";
import type { MockEntry, Seat } from "@/types";

interface UnlockToggleProps {
  entry: MockEntry;
  activeSeat: Seat;
}

export default function UnlockToggle({ entry, activeSeat }: UnlockToggleProps) {
  const updateEntry = useEntries((s) => s.updateEntry);

  // Self-contained safety check: even if a parent forgets to gate this,
  // the component itself refuses to render for the owner's own seat.
  if (!canToggleUnlock(entry, activeSeat)) return null;

  const toggleUnlock = useEntries((s) => s.toggleUnlock);
  // ...
  const handleToggle = () => {
    toggleUnlock(entry.id);
  };

  const ownerLabel = entry.ownerSeat === "USER_ONE" ? "User 1" : "User 2";

  return (
    <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-[#8a7a63]">
      <span>Unlock this entry for {ownerLabel}&apos;s edits</span>
      <button
        type="button"
        role="switch"
        aria-checked={entry.unlockedForOwnerEdit}
        onClick={handleToggle}
        className={`
          relative h-5 w-9 rounded-full transition-colors duration-150
          ${entry.unlockedForOwnerEdit ? "bg-[#7a9b6e]" : "bg-[#d9cdb8]"}
        `}
      >
        <span
          className={`
            absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150
            ${entry.unlockedForOwnerEdit ? "translate-x-4" : "translate-x-0.5"}
          `}
        />
      </button>
    </label>
  );
}