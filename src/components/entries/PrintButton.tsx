"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-full bg-[#3d2f1f] px-6 py-2 text-sm font-medium text-[#f0e6d2] transition-opacity hover:opacity-90"
    >
      Print / Save as PDF
    </button>
  );
}