"use client";

import { useMemo, useState } from "react";
import type { MockEntry } from "@/types";
import { useSeatStore } from "@/store/useSeatStore";
import { useEntries } from "@/hooks/useEntries";
import EntryCard from "@/components/entries/EntryCard";
import ScrollStick from "@/components/scroll/ScrollStick";
import AddDateButton from "@/components/scroll/AddDateButton";

export default function ScrollCanvas() {
  const entries = useEntries((s) => s.entries);
  const addEntry = useEntries((s) => s.addEntry);
  const sessionSeat = useSeatStore((s) => s.sessionSeat);
  const viewedSeat = useSeatStore((s) => s.viewedSeat);

  const sortedEntries = useMemo(
    () =>
      entries
        .filter((entry) => entry.ownerSeat === viewedSeat)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [entries, viewedSeat]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const activeEntry = sortedEntries[activeIndex] ?? null;

  const goToPrev = activeIndex > 0
    ? () => setActiveIndex((i) => i - 1)
    : undefined;
  const goToNext = activeIndex < sortedEntries.length - 1
    ? () => setActiveIndex((i) => i + 1)
    : undefined;

  const handleSelectFromIndex = (id: string) => {
    const idx = sortedEntries.findIndex((e) => e.id === id);
    if (idx >= 0) setActiveIndex(idx);
  };

  const handleAddEntry = () => {
    // Server now decides id / ownerSeat / position — we just send date + tag.
    addEntry({ date: new Date().toISOString().slice(0, 10), tag: null });
    // Note: no goToPage() call here anymore — addEntry() is now async (it
    // awaits a real API call), so the new entry isn't in `entries` yet at
    // this exact line. Once addEntry resolves and the store updates,
    // sortedEntries re-renders with the new page — but we can't flip to it
    // synchronously anymore the way the old mock version could.
  };

  return (
    <div className="scroll-stage">
      <div className="parchment-scroll scroll-drop-in">
        {/* ── Top rod (interactive — indexer knobs) ── */}
        <div className="scroll-roller scroll-top-stick">
          {/* Coil of rolled paper wrapped around the top rod */}
          <div className="scroll-paper-coil scroll-paper-coil-top" aria-hidden="true" />
          <ScrollStick
            entries={sortedEntries}
            activeId={activeEntry?.id ?? null}
            onSelect={handleSelectFromIndex}
          />
        </div>

        {/* ── Parchment body (unfurls downward on load) ── */}
        <div className="scroll-unfurl">
          <div className="scroll-unfurl-inner">
            <div className="scroll-parchment-body">
              <div className="scroll-single-entry">
                {activeEntry ? (
                  <>
                    <EntryCard entry={activeEntry} variant="scroll" />
                    <div className="scroll-entry-nav">
                      <button onClick={goToPrev} disabled={!goToPrev}>
                        ← Previous
                      </button>
                      <button onClick={goToNext} disabled={!goToNext}>
                        Next →
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="py-12 text-center font-serif text-sm text-[#806250]">
                    No entries yet. Add one to begin your scroll.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom rod (decorative) ── */}
        <div className="scroll-roller scroll-bottom-roller" aria-hidden="true">
          <div className="scroll-paper-coil scroll-paper-coil-bottom" aria-hidden="true" />
        </div>
      </div>

      {viewedSeat === sessionSeat && <AddDateButton onAdd={handleAddEntry} />}
    </div>
  );
}
