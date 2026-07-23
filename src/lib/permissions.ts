import type { Seat } from "@/types";

// Works with both MockEntry and Prisma's real Entry (Date vs string,
// doesn't matter — only these three fields are ever actually checked).
interface EditableEntry {
  ownerSeat: Seat;
  lastSavedAt: string | Date | null;
  unlockedForOwnerEdit: boolean;
}

const WINDOW_DURATION_MS = 15 * 60 * 1000;

export function isWindowOpen(lastSavedAt: string | Date | null): boolean {
  if (!lastSavedAt) return false;
  const savedTime = new Date(lastSavedAt).getTime();
  return Date.now() - savedTime < WINDOW_DURATION_MS;
}

export function canEdit(entry: EditableEntry, activeSeat: Seat): boolean {
  if (activeSeat !== entry.ownerSeat) return false;
  if (entry.lastSavedAt === null) return true;
  if (isWindowOpen(entry.lastSavedAt)) return true;
  return entry.unlockedForOwnerEdit;
}

export function canToggleUnlock(entry: EditableEntry, activeSeat: Seat): boolean {
  return activeSeat !== entry.ownerSeat;
}

export function msRemainingInWindow(lastSavedAt: string | null): number {
  if (!lastSavedAt) return 0;
  const savedTime = new Date(lastSavedAt).getTime();
  const remaining = WINDOW_DURATION_MS - (Date.now() - savedTime);
  return Math.max(0, remaining);
}

/** Formats milliseconds as "12:41" for the countdown badge. */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}