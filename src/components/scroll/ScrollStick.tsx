"use client";

import { useEffect, useRef, useState } from "react";
import type { MockEntry } from "@/types";
import IndexGrid from "@/components/entries/IndexGrid";

interface ScrollStickProps {
  entries: MockEntry[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export default function ScrollStick({ entries, activeId, onSelect }: ScrollStickProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  // Close panel when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={panelRef}>
      {/* Left knob — clickable */}
      <button
        className="scroll-stick-knob scroll-stick-knob-left"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open entry index"
      />
      {/* Right knob — clickable */}
      <button
        className="scroll-stick-knob scroll-stick-knob-right"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open entry index"
      />

      {open && entries.length > 0 && (
        <div className="scroll-indexer-panel">
          <p className="scroll-indexer-title">Select an Entry</p>
          <IndexGrid entries={entries} onSelect={handleSelect} />
        </div>
      )}
    </div>
  );
}