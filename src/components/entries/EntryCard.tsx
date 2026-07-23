"use client";

import { useState } from "react";
import type { MockEntry } from "@/types";
import { canEdit, isWindowOpen } from "@/lib/permissions";
import { useSeatStore } from "@/store/useSeatStore";
import { useEntries } from "@/hooks/useEntries";
import EntryEditor from "@/components/entries/EntryEditor";
import EditWindowBadge from "@/components/entries/EditWindowBadge";
import UnlockToggle from "@/components/entries/UnlockToggle";
import SoundAttachMenu from "@/components/entries/SoundAttachMenu";

interface EntryCardProps {
  entry: MockEntry;
  variant?: "scroll" | "diary";
  onFlipNext?: () => void;
  onFlipPrev?: () => void;
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7h16M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3m2 0v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function EntryCard({
  entry,
  variant = "scroll",
  onFlipNext,
  onFlipPrev,
}: EntryCardProps) {
  const sessionSeat = useSeatStore((s) => s.sessionSeat);
  const updateEntry = useEntries((s) => s.updateEntry);
  const deleteEntry = useEntries((s) => s.deleteEntry);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [tagDraft, setTagDraft] = useState(entry.tag ?? "");

  const handleTagCommit = () => {
    setIsEditingTag(false);
    const trimmed = tagDraft.trim();
    if (trimmed === (entry.tag ?? "")) return;
    updateEntry(entry.id, { tag: trimmed || null });
  };

  const formattedDate = new Date(entry.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const ownerLabel = entry.ownerSeat === "USER_ONE" ? "User 1" : "User 2";

  const editable = canEdit(entry, sessionSeat);
  const isOwner = sessionSeat === entry.ownerSeat;
  const windowOpen = isWindowOpen(entry.lastSavedAt);

  const handleSave = (html: string) => {
    updateEntry(entry.id, { content: html, lastSavedAt: new Date().toISOString() });
  };

  const handleDelete = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    deleteEntry(entry.id);
  };

  return (
    <div
      className={
        variant === "diary"
          ? "flex h-full flex-col gap-3"
          : "scroll-entry flex flex-col gap-2"
      }
    >
      <div className="flex items-center justify-between text-sm text-[#8a7a63]">
        <span>{formattedDate}</span>
        <span className="rounded-full bg-[#e8ddc7] px-2 py-0.5 text-xs">{ownerLabel}</span>
      </div>

      {/* react-pageflip only forwards real clicks to <a>/<button> tags — a
          bare <input> never gets the click inside the book, so it can't be
          focused that way. A <button> toggles edit mode, then the input
          autoFocuses programmatically on mount. */}
      {isEditingTag ? (
        <div className="flex w-fit items-center gap-1 rounded-full bg-[#3d2f1f]/10 px-2 py-0.5 text-xs font-medium text-[#3d2f1f] focus-within:bg-[#3d2f1f]/15">
          <span>#</span>
          <input
            autoFocus
            value={tagDraft}
            placeholder="add a tag"
            onChange={(e) => setTagDraft(e.target.value)}
            onBlur={handleTagCommit}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setTagDraft(entry.tag ?? "");
                setIsEditingTag(false);
              }
            }}
            size={Math.max((tagDraft || "add a tag").length, 4)}
            className="min-w-0 bg-transparent font-medium text-[#3d2f1f] outline-none placeholder:font-normal placeholder:text-[#3d2f1f]/50"
          />
        </div>
      ) : isOwner ? (
        <button
          type="button"
          onClick={() => {
            setTagDraft(entry.tag ?? "");
            setIsEditingTag(true);
          }}
          className="w-fit rounded-full bg-[#3d2f1f]/10 px-2 py-0.5 text-left text-xs font-medium text-[#3d2f1f] hover:bg-[#3d2f1f]/15"
        >
          {entry.tag ? `#${entry.tag}` : "+ add a tag"}
        </button>
      ) : (
        entry.tag && (
          <span className="w-fit rounded-full bg-[#3d2f1f]/10 px-2 py-0.5 text-xs font-medium text-[#3d2f1f]">
            #{entry.tag}
          </span>
        )
      )}

      {/* Content: real editor if this seat can edit right now, otherwise a
          read-only render of the saved HTML. Both owner and non-owner can
          always READ — editable only ever gates the edit affordance. */}
      {editable ? (
        <EntryEditor
          entryId={entry.id}
          content={entry.content}
          editable={true}
          media={entry.media}
          onSave={handleSave}
          onMediaChange={(media) => updateEntry(entry.id, { media })}
          onFlipNext={onFlipNext}
          onFlipPrev={onFlipPrev}
        />
      ) : (
        <div
          className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed text-[#3d2f1f]"
          dangerouslySetInnerHTML={{ __html: entry.content || "<em>Empty draft.</em>" }}
        />
      )}

      <SoundAttachMenu
        media={entry.media}
        editable={editable}
        onChange={(media) => updateEntry(entry.id, { media })}
      />

      {!entry.lastSavedAt && (
        <span className="text-xs italic text-[#b08a5a]">Draft — not saved yet</span>
      )}

      {/* Status row: countdown for the owner while open, lock note once closed,
          delete + unlock toggle on the right. */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div>
          {isOwner && windowOpen && <EditWindowBadge lastSavedAt={entry.lastSavedAt} />}
          {isOwner && entry.lastSavedAt && !windowOpen && !entry.unlockedForOwnerEdit && (
            <span className="inline-flex items-center gap-1 text-xs text-[#8a7a63]">
              <LockIcon /> Editing window closed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {editable && (
            <button
              onClick={handleDelete}
              onBlur={() => setConfirmingDelete(false)}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors ${
                confirmingDelete
                  ? "bg-red-600 text-white"
                  : "text-[#8a7a63] hover:bg-red-50 hover:text-red-600"
              }`}
            >
              <TrashIcon /> {confirmingDelete ? "Confirm delete?" : "Delete"}
            </button>
          )}
          <UnlockToggle
            key={`${entry.id}-${entry.unlockedForOwnerEdit}`}
            entry={entry}
            activeSeat={sessionSeat}
          />
        </div>
      </div>
    </div>
  );
}