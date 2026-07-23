"use client";

import { useMemo, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import { useEntries } from "@/hooks/useEntries";
import { useSeatStore } from "@/store/useSeatStore";
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
  const bookRef = useRef<any>(null);

  const sortedEntries = useMemo(
    () =>
      entries
        .filter((entry) => entry.ownerSeat === viewedSeat)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [entries, viewedSeat]
  );

  const goToPage = (page: number) => {
    bookRef.current?.pageFlip()?.flip(page);
  };

  const goToEntry = (id: string) => {
    const idx = sortedEntries.findIndex((e) => e.id === id);
    if (idx >= 0) goToPage(FIRST_ENTRY_PAGE + idx);
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
    <div className="diary-stage flex min-h-screen items-center justify-center p-5 md:p-10">
      <HTMLFlipBook
        key={viewedSeat}
        ref={bookRef}
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