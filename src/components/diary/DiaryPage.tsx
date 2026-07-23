"use client";

import { useState } from "react";
import type { MockEntry } from "@/types";
import { useSeatStore } from "@/store/useSeatStore";
import { useEntries } from "@/hooks/useEntries";
import EntryCard from "@/components/entries/EntryCard";

interface DiaryPageProps {
  entry: MockEntry;
  onBackToIndex: () => void;
  onFlipNext?: () => void;
  onFlipPrev?: () => void;
}

export default function DiaryPage({ entry, onBackToIndex, onFlipNext, onFlipPrev }: DiaryPageProps) {
  const sessionSeat = useSeatStore((s) => s.sessionSeat);
  const updateEntry = useEntries((s) => s.updateEntry);
  const isOwner = sessionSeat === entry.ownerSeat;

  const [isEditingHeading, setIsEditingHeading] = useState(false);
  const [draftTag, setDraftTag] = useState(entry.tag ?? "");

  const commitHeading = () => {
    setIsEditingHeading(false);
    const trimmed = draftTag.trim();
    if (trimmed === (entry.tag ?? "")) return;
    updateEntry(entry.id, { tag: trimmed || null });
  };

  return (
    <div className="diary-single-page relative flex min-h-0 flex-col">
      <div className="diary-flip-edge diary-flip-edge-left" aria-hidden="true" />
      <div className="diary-flip-edge diary-flip-edge-right" aria-hidden="true" />
      <button
        onClick={onBackToIndex}
        className="w-fit text-xs font-medium uppercase tracking-[0.16em] text-[#806250] transition-colors hover:text-[#3d2f1f]"
      >
        ← Index
      </button>

      <p className="diary-kicker mt-4">A dated memory</p>
      <div className="diary-rule" />

      {/* react-pageflip only forwards real clicks to <a>/<button> tags — a
          bare <input> never gets the click, so it can't be focused this way
          inside the book. We use a <button> (which IS forwarded) to enter
          edit mode, then autoFocus the input programmatically on mount. */}
      {isEditingHeading ? (
        <input
          autoFocus
          value={draftTag}
          placeholder="Untitled"
          onChange={(e) => setDraftTag(e.target.value)}
          onBlur={commitHeading}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") {
              setDraftTag(entry.tag ?? "");
              setIsEditingHeading(false);
            }
          }}
          className="diary-display w-full bg-transparent text-3xl italic leading-none outline-none placeholder:not-italic placeholder:text-[#a3907c] md:text-4xl"
        />
      ) : isOwner ? (
        <button
          type="button"
          onClick={() => {
            setDraftTag(entry.tag ?? "");
            setIsEditingHeading(true);
          }}
          className="diary-display w-full text-left text-3xl italic leading-none outline-none md:text-4xl"
        >
          {entry.tag ?? "Untitled"}
        </button>
      ) : (
        <p className="diary-display text-3xl italic leading-none md:text-4xl">
          {entry.tag ?? "Untitled"}
        </p>
      )}

      <p className="mt-2 text-sm tracking-wide text-[#806250]">
        {entry.date} · Written by {entry.ownerSeat === "USER_ONE" ? "User 1" : "User 2"}
      </p>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        <EntryCard
          entry={entry}
          variant="diary"
          onFlipNext={onFlipNext}
          onFlipPrev={onFlipPrev}
        />
      </div>
    </div>
  );
}