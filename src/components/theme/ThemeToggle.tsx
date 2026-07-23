"use client";

import { useThemeStore } from "@/store/useThemeStore";
import type { ThemeMode } from "@/types";

// Simple inline icons — swap for real SVG art later if you want something
// more illustrated (a rolled scroll / a closed book glyph).
function ScrollIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 6c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2-2H6a2 2 0 0 1-2-2V6z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DiaryIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5a2 2 0 0 1 2-2h5v18H6a2 2 0 0 1-2-2V5zM19 3h-5v18h5a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

const OPTIONS: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { mode: "SCROLL", label: "Scroll", icon: <ScrollIcon /> },
  { mode: "DIARY", label: "Diary", icon: <DiaryIcon /> },
];

export default function ThemeToggle() {
  const { themeMode, setThemeMode } = useThemeStore();

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
      {OPTIONS.map(({ mode, label, icon }) => {
        const isActive = themeMode === mode;
        return (
          <button
            key={mode}
            onClick={() => setThemeMode(mode)}
            aria-label={`Switch to ${label} view`}
            aria-pressed={isActive}
            className={`
              group relative flex items-center justify-center
              h-24 w-24 rounded-r-full border border-[#f8e9c9]/35
              transition-all duration-300 ease-out
              ${isActive
                ? "bg-gradient-to-br from-[#5f3725] to-[#2c1715] text-[#f9e8bf] translate-x-4 shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
                : "bg-gradient-to-br from-[#eed5a4] to-[#ba7b49] text-[#48271d] translate-x-0 shadow-[0_7px_18px_rgba(0,0,0,0.22)] hover:translate-x-2"}
            `}
            style={{ marginLeft: "-48px" }}
          >
            <span className="ml-12">{icon}</span>
            <span
              className="
                absolute left-full ml-2 whitespace-nowrap rounded px-2 py-1 text-xs
                bg-[#3d2f1f] text-[#f0e6d2] opacity-0 pointer-events-none
                group-hover:opacity-100 transition-opacity
              "
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
