"use client";

import { useState } from "react";
import type { MockEntry } from "@/types";

const COLS = 4;
const ROWS = 8;
const PER_PAGE = COLS * ROWS;

interface IndexGridProps {
  entries: MockEntry[];
  onSelect: (id: string) => void;
}

export default function IndexGrid({ entries, onSelect }: IndexGridProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(entries.length / PER_PAGE));
  const start = page * PER_PAGE;
  const pageEntries = entries.slice(start, start + PER_PAGE);

  return (
    <>
      <div className="diary-index-grid">
        {pageEntries.map((entry, i) => (
          <button
            key={entry.id}
            className="diary-index-btn"
            onClick={() => onSelect(entry.id)}
          >
            <span className="idx-num">
              {String(start + i + 1).padStart(2, "0")}
            </span>
            <span className="idx-tag">{entry.tag ?? "Untitled"}</span>
            <span className="idx-date">{entry.date}</span>
          </button>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="diary-index-pagination">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
          >
            ‹ Prev
          </button>
          <span className="page-indicator">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
          >
            Next ›
          </button>
        </div>
      )}
    </>
  );
}
