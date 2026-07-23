"use client";

import { useState } from "react";

interface EntryTagsProps {
  tags: string[];
  editable: boolean;
  onChange: (tags: string[]) => void;
}

export default function EntryTags({ tags, editable, onChange }: EntryTagsProps) {
  const [draft, setDraft] = useState("");

  const commitDraft = () => {
    const cleaned = draft.trim().replace(/^#/, "");
    if (!cleaned) {
      setDraft("");
      return;
    }
    if (!tags.some((t) => t.toLowerCase() === cleaned.toLowerCase())) {
      onChange([...tags, cleaned]);
    }
    setDraft("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  if (!editable && tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {tags.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 rounded-full bg-[#3d2f1f]/10 px-2 py-0.5 text-xs font-medium text-[#3d2f1f]"
        >
          #{t}
          {editable && (
            <button
              type="button"
              onClick={() => removeTag(t)}
              className="text-[#3d2f1f]/50 hover:text-[#3d2f1f]"
              aria-label={`Remove tag ${t}`}
            >
              ×
            </button>
          )}
        </span>
      ))}

      {editable && (
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commitDraft();
            }
          }}
          placeholder={tags.length === 0 ? "add tags…" : "add another…"}
          className="w-24 rounded-full bg-transparent px-2 py-0.5 text-xs text-[#3d2f1f] outline-none placeholder:text-[#3d2f1f]/40 hover:bg-[#3d2f1f]/5 focus:bg-white/70"
        />
      )}
    </div>
  );
}