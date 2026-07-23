"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSeatStore } from "@/store/useSeatStore";
import { useEntries } from "@/hooks/useEntries";

export default function ProfileWindow() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const viewedSeat = useSeatStore((s) => s.viewedSeat);
  const entries = useEntries((s) => s.entries);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  // Local dashboard stats — Module 3 replaces these with database aggregates.
  const totalEntries = entries.length;
  const viewedEntries = entries.filter((e) => e.ownerSeat === viewedSeat).length;
  const draftCount = entries.filter((e) => !e.lastSavedAt).length;

  return (
    <div className="fixed left-6 top-6 z-50">
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? "Collapse profile" : "Expand profile"}
        aria-expanded={expanded}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5b3a4f] text-sm font-semibold text-[#f5e9ee] shadow-md transition-transform hover:scale-105"
      >
        {viewedSeat === "USER_ONE" ? "1" : "2"}
      </button>

      {expanded && (
        <div className="mt-3 w-56 rounded-xl bg-[#f5e9ee] p-4 text-[#5b3a4f] shadow-xl ring-1 ring-black/5">
          <p className="mb-2 text-sm font-semibold">
            Viewing {viewedSeat === "USER_ONE" ? "User 1" : "User 2"}
          </p>
          <dl className="space-y-1 text-xs">
            <div className="flex justify-between">
              <dt>Total entries</dt>
              <dd className="font-medium">{totalEntries}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Entries</dt>
              <dd className="font-medium">{viewedEntries}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Drafts</dt>
              <dd className="font-medium">{draftCount}</dd>
            </div>
          </dl>
          <div className="mt-4 border-t border-[#5b3a4f]/10 pt-3 space-y-1.5">
            <Link
              href="/settings/account"
              className="block w-full rounded-md bg-[#5b3a4f]/10 py-1.5 text-center text-xs font-semibold hover:bg-[#5b3a4f]/20 transition-colors"
            >
              Account Settings
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full rounded-md bg-[#5b3a4f]/10 py-1.5 text-center text-xs font-semibold hover:bg-[#5b3a4f]/20 transition-colors"
            >
              Log Out
            </button>
          </div>
          <p className="mt-3 text-[10px] italic text-[#5b3a4f]/60">
            Local stats for now — real numbers come from the database in Module 3.
          </p>
        </div>
      )}
    </div>
  );
}
