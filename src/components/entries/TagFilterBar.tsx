"use client";

import { useMemo } from "react";
import { useFilterStore } from "@/store/useFilterStore";
import type { MockEntry } from "@/types";

interface TagFilterBarProps {
  entries: MockEntry[];
}

export default function TagFilterBar({ entries }: TagFilterBarProps) {
  const query = useFilterStore((s) => s.query);
  const setQuery = useFilterStore((s) => s.setQuery);

  const distinctTags = useMemo(() => {
    const tags = new Set<string>();
    entries.forEach((entry) => entry.tag && tags.add(entry.tag));
    return Array.from(tags).sort();
  }, [entries]);

  if (distinctTags.length === 0 && !query) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-1 pb-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by tag…"
        className="rounded-full border border-[#3d2f1f]/20 bg-white/60 px-3 py-1 text-xs text-[#3d2f1f] placeholder:text-[#8a7a63] focus:outline-none focus:ring-1 focus:ring-[#3d2f1f]/30"
      />
      {distinctTags.map((tag) => (
        <button
          key={tag}
          onClick={() => setQuery(tag)}
          className={`rounded-full px-2 py-1 text-xs font-medium transition-colors ${
            query === tag
              ? "bg-[#3d2f1f] text-[#f0e6d2]"
              : "bg-[#3d2f1f]/10 text-[#3d2f1f] hover:bg-[#3d2f1f]/20"
          }`}
        >
          #{tag}
        </button>
      ))}
      {query && (
        <button
          onClick={() => setQuery("")}
          className="text-xs text-[#8a7a63] underline underline-offset-2 hover:text-[#3d2f1f]"
        >
          Clear
        </button>
      )}
    </div>
  );
}