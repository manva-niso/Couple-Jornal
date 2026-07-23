"use client";
import { useEffect } from "react";
import { useEntries } from "@/hooks/useEntries";
import ThemeToggle from "@/components/theme/ThemeToggle";
import SeatSwitcher from "@/components/seat/SeatSwitcher";
import ProfileWindow from "@/components/profile/ProfileWindow";
import ScrollCanvas from "@/components/scroll/ScrollCanvas";
import DiaryBook from "@/components/diary/DiaryBook";
import { useThemeStore } from "@/store/useThemeStore";

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

      {themeMode === "SCROLL" ? <ScrollCanvas /> : <DiaryBook />}
    </main>
  );
}
