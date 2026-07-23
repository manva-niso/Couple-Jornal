"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MockEntry } from "@/types";
import { useSeatStore } from "@/store/useSeatStore";
import { useEntries } from "@/hooks/useEntries";
import { useViewStore } from "@/store/useViewStore";
import EntryCard from "@/components/entries/EntryCard";
import ScrollStick from "@/components/scroll/ScrollStick";
import AddDateButton from "@/components/scroll/AddDateButton";

export default function ScrollCanvas() {
  const entries = useEntries((s) => s.entries);
  const addEntry = useEntries((s) => s.addEntry);
  const sessionSeat = useSeatStore((s) => s.sessionSeat);
  const viewedSeat = useSeatStore((s) => s.viewedSeat);
  const setCurrentEntryId = useViewStore((s) => s.setCurrentEntryId);
  const registerCurrentEntryGetter = useViewStore((s) => s.registerCurrentEntryGetter);

  const sortedEntries = useMemo(
    () =>
      entries
        .filter((entry) => entry.ownerSeat === viewedSeat)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [entries, viewedSeat]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const activeEntry = sortedEntries[activeIndex] ?? null;

  // Kept for the export button's enabled/disabled UI state.
  useEffect(() => {
    setCurrentEntryId(activeEntry?.id ?? null);
    return () => setCurrentEntryId(null);
  }, [activeEntry?.id, setCurrentEntryId]);

  // Ground truth for the actual export/print action — a ref so the
  // registered function always reads the latest value without needing to
  // re-register (and without risking a stale closure).
  const activeEntryIdRef = useRef<string | null>(null);
  activeEntryIdRef.current = activeEntry?.id ?? null;

  useEffect(() => {
    registerCurrentEntryGetter(() => activeEntryIdRef.current);
    return () => registerCurrentEntryGetter(() => null);
  }, [registerCurrentEntryGetter]);

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
    addEntry({ date: new Date().toISOString().slice(0, 10), tag: null });
  };

  return (
    <div className="scroll-stage">
      <div className="parchment-scroll scroll-drop-in">
        <div className="scroll-roller scroll-top-stick">
          <div className="scroll-paper-coil scroll-paper-coil-top" aria-hidden="true" />
          <ScrollStick
            entries={sortedEntries}
            activeId={activeEntry?.id ?? null}
            onSelect={handleSelectFromIndex}
          />
        </div>

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

        <div className="scroll-roller scroll-bottom-roller" aria-hidden="true">
          <div className="scroll-paper-coil scroll-paper-coil-bottom" aria-hidden="true" />
        </div>
      </div>

      {viewedSeat === sessionSeat && <AddDateButton onAdd={handleAddEntry} />}
    </div>
  );
}