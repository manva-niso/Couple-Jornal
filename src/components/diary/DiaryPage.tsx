"use client";

import { useState } from "react";
import type { MockEntry } from "@/types";
import { useSeatStore } from "@/store/useSeatStore";
import { useEntries } from "@/hooks/useEntries";
import { canEdit } from "@/lib/permissions";
import { useStopPageFlipDrag } from "@/hooks/useStopPageFlipDrag";
import EntryCard from "@/components/entries/EntryCard";
import SoundDots from "@/components/entries/SoundDots";
import EntryTags from "@/components/entries/EntryTags";

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
  const editable = canEdit(entry, sessionSeat);

  const [isEditingHeading, setIsEditingHeading] = useState(false);
  const [draftTag, setDraftTag] = useState(entry.tag ?? "");

  const headingRef = useStopPageFlipDrag<HTMLDivElement>();
  const tagsRef = useStopPageFlipDrag<HTMLDivElement>();
  const soundMenuRef = useStopPageFlipDrag<HTMLDivElement>();

  const commitHeading = () => {
    setIsEditingHeading(false);
    const trimmed = draftTag.trim();
    if (trimmed === (entry.tag ?? "")) return;
    updateEntry(entry.id, { tag: trimmed || null });
  };

  const handleRemoveMedia = async (attachmentId: string) => {
    try {
      await fetch(`/api/media/${attachmentId}`, { method: "DELETE" });
      updateEntry(entry.id, { media: entry.media.filter((m) => m.id !== attachmentId) });
    } catch (error) {
      console.error("Failed to delete media:", error);
    }
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

      {/* Heading row: title centered on the page, with the audio-attach
          trigger pinned to the top-right corner, above the entry content
          below. Rendered as a sibling of the scrollable entry area (not
          inside it) so it stays fixed in place rather than scrolling away
          or getting clipped by that area's overflow. */}
      <div className="relative mt-4 px-8">
        {(editable || (entry.media?.filter((m) => !m.keyword).length ?? 0) > 0) && (
          <div ref={soundMenuRef} className="absolute right-0 top-0">
            <SoundDots
              entryId={entry.id}
              media={entry.media ?? []}
              editable={editable}
              onChange={(media) => updateEntry(entry.id, { media })}
              onRemove={handleRemoveMedia}
            />
          </div>
        )}

        <div ref={headingRef}>
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
              className="diary-display w-full bg-transparent text-center text-3xl italic leading-none outline-none placeholder:not-italic placeholder:text-[#a3907c] md:text-4xl"
            />
          ) : isOwner ? (
            <button
              type="button"
              onClick={() => {
                setDraftTag(entry.tag ?? "");
                setIsEditingHeading(true);
              }}
              className="diary-display w-full text-center text-3xl italic leading-none outline-none md:text-4xl"
            >
              {entry.tag ?? "Untitled"}
            </button>
          ) : (
            <p className="diary-display text-center text-3xl italic leading-none md:text-4xl">
              {entry.tag ?? "Untitled"}
            </p>
          )}
        </div>
      </div>

      <p className="mt-2 text-center text-sm tracking-wide text-[#806250]">
        {entry.date} · Written by {entry.ownerSeat === "USER_ONE" ? "User 1" : "User 2"}
      </p>

      <div ref={tagsRef} className="mt-2 px-8">
        <EntryTags
          tags={entry.tags ?? []}
          editable={editable}
          onChange={(tags) => updateEntry(entry.id, { tags })}
        />
      </div>

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