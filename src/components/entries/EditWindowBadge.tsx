"use client";

import { useEffect, useState } from "react";
import { msRemainingInWindow, formatCountdown } from "@/lib/permissions";

interface EditWindowBadgeProps {
  lastSavedAt: string | null;
}

export default function EditWindowBadge({ lastSavedAt }: EditWindowBadgeProps) {
  const [, setTick] = useState(0);
  const remainingMs = msRemainingInWindow(lastSavedAt);

  useEffect(() => {
    if (!lastSavedAt) return; // draft, nothing to count down

    const interval = setInterval(() => {
      // The current time is read during render so a fresh save resets the
      // countdown immediately; this state update simply schedules each tick.
      setTick((tick) => tick + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastSavedAt]);

  if (remainingMs <= 0) return null; // window closed (or draft) — parent shows the lock state instead

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#e8ddc7] px-2 py-0.5 text-xs font-medium text-[#3d2f1f]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#7a9b6e]" />
      Editable for {formatCountdown(remainingMs)} more
    </span>
  );
}
