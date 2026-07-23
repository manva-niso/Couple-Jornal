"use client";

interface AddDateButtonProps {
  onAdd: () => void;
}

export default function AddDateButton({ onAdd }: AddDateButtonProps) {
  return (
    <button
      onClick={onAdd}
      aria-label="Add a new entry"
      className="fixed bottom-28 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#3d2f1f] text-2xl text-[#f0e6d2] shadow-lg transition-transform duration-150 hover:scale-105 active:scale-95"
    >
      +
    </button>
  );
}