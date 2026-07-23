"use client";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useEntries } from "@/hooks/useEntries";
import ThemeToggle from "@/components/theme/ThemeToggle";
import SeatSwitcher from "@/components/seat/SeatSwitcher";
import ProfileWindow from "@/components/profile/ProfileWindow";
import ScrollCanvas from "@/components/scroll/ScrollCanvas";
import DiaryBook from "@/components/diary/DiaryBook";
import { useThemeStore } from "@/store/useThemeStore";

// @react-pdf/renderer isn't SSR-safe — loading it eagerly could throw during
// Next's server render pass and take the whole page down with it. ssr:false
// guarantees it only ever loads and runs in the browser.
const ExportPdfButton = dynamic(() => import("@/components/entries/ExportPdfButton"), {
  ssr: false,
});

export default function JournalClient() {
  const themeMode = useThemeStore((s) => s.themeMode);
  const fetchEntries = useEntries((s) => s.fetchEntries);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);
  
  return (
    <main className="min-h-screen bg-[#faf6ec]">
      <ProfileWindow />
      <ThemeToggle />
      <SeatSwitcher />
      <ExportPdfButton />

      {themeMode === "SCROLL" ? <ScrollCanvas /> : <DiaryBook />}
    </main>
  );
}
