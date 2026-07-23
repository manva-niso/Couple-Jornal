"use client";

import type { MockEntry } from "@/types";
import IndexGrid from "@/components/entries/IndexGrid";

interface DiaryIndexPageProps {
  entries: MockEntry[];
  onSelect: (id: string) => void;
}

export default function DiaryIndexPage({ entries, onSelect }: DiaryIndexPageProps) {
  return (
    <div className="diary-single-page flex min-h-0 flex-col">
      <p className="diary-kicker">Contents</p>
      <h3 className="diary-display mt-2 text-3xl italic">Index</h3>
      <div className="diary-rule" />
      <IndexGrid entries={entries} onSelect={onSelect} />
    </div>
  );
}