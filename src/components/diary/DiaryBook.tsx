"use client";

import { useEffect, useMemo, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import { useEntries } from "@/hooks/useEntries";
import { useSeatStore } from "@/store/useSeatStore";
import { useViewStore } from "@/store/useViewStore";
import DiaryCoverPage from "@/components/diary/DiaryCoverPage";
import DiaryIndexPage from "@/components/diary/DiaryIndexPage";
import DiaryPage from "@/components/diary/DiaryPage";
import AddDateButton from "@/components/scroll/AddDateButton";

const INDEX_PAGE = 1;
const FIRST_ENTRY_PAGE = 2;

export default function DiaryBook() {
  const entries = useEntries((s) => s.entries);
  const addEntry = useEntries((s) => s.addEntry);
  const viewedSeat = useSeatStore((s) => s.viewedSeat);
  const sessionSeat = useSeatStore((s) => s.sessionSeat);
  const setCurrentEntryId = useViewStore((s) => s.setCurrentEntryId);
  const registerCurrentEntryGetter = useViewStore((s) => s.registerCurrentEntryGetter);
  const bookRef = useRef<any>(null);

  const sortedEntries = useMemo(
    () =>
      entries
        .filter((entry) => entry.ownerSeat === viewedSeat)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [entries, viewedSeat]
  );

  // Kept fresh via a ref (not state) so the getter below always reads the
  // latest list without needing to re-register on every entries change.
  const sortedEntriesRef = useRef(sortedEntries);
  sortedEntriesRef.current = sortedEntries;

  useEffect(() => {
    return () => setCurrentEntryId(null);
  }, [setCurrentEntryId]);

  // Ground truth for export/print: ask the flipbook instance directly what
  // page it's actually showing right now, rather than trusting whatever
  // onFlip last pushed (which can lag or mis-map in double-page/"spread"
  // layouts). getCurrentPageIndex() is react-pageflip's own live API for
  // exactly this.
  useEffect(() => {
    registerCurrentEntryGetter(() => {
      const idx = bookRef.current?.pageFlip()?.getCurrentPageIndex();
      if (typeof idx !== "number") return null;
      return sortedEntriesRef.current[idx - FIRST_ENTRY_PAGE]?.id ?? null;
    });
    return () => registerCurrentEntryGetter(() => null);
  }, [registerCurrentEntryGetter]);

  const goToPage = (page: number) => {
    bookRef.current?.pageFlip()?.flip(page);
  };

  const goToEntry = (id: string) => {
    const idx = sortedEntries.findIndex((e) => e.id === id);
    if (idx >= 0) goToPage(FIRST_ENTRY_PAGE + idx);
  };

  const handleFlip = (e: { data: number }) => {
    const entry = sortedEntries[e.data - FIRST_ENTRY_PAGE];
    setCurrentEntryId(entry?.id ?? null); // null on cover/index pages
  };

  const handleAddEntry = () => {
    addEntry({ date: new Date().toISOString().slice(0, 10), tag: null });
  };

  return (
    <div className="diary-stage flex min-h-screen items-center justify-center p-5 md:p-10">
      <HTMLFlipBook
        key={viewedSeat}
        ref={bookRef}
        onFlip={handleFlip}
        width={420}
        height={560}
        size="stretch"
        minWidth={280}
        maxWidth={550}
        minHeight={400}
        maxHeight={733}
        showCover={false}
        className="diary-book"
        showPageCorners={false}
        disableFlipByClick
        mobileScrollSupport
      >
        <div key="cover"><DiaryCoverPage /></div>
        <div key="index"><DiaryIndexPage entries={sortedEntries} onSelect={goToEntry} /></div>
        {sortedEntries.map((entry) => (
          <div key={entry.id}>
            <DiaryPage
              entry={entry}
              onBackToIndex={() => goToPage(INDEX_PAGE)}
              onFlipNext={() => bookRef.current?.pageFlip()?.flipNext()}
              onFlipPrev={() => bookRef.current?.pageFlip()?.flipPrev()}
            />
          </div>
        ))}
      </HTMLFlipBook>

      {viewedSeat === sessionSeat && <AddDateButton onAdd={handleAddEntry} />}
    </div>
  );
}