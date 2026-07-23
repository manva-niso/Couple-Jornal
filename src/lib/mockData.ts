// src/lib/mockData.ts
//
// Fakes what Prisma/Postgres will eventually provide (Module 3).
// Field names deliberately match the real `Entry` model in schema.prisma,
// so swapping this for a real API call later is a drop-in replacement,
// not a rewrite.

import type { Seat, MediaType } from "@/app/generated/prisma/client";
export type { Seat, MediaType };


export interface MockMediaAttachment {
  id: string;
  keyword: string | null; // null = attached to the whole entry, not a specific word
  url: string;
  type: MediaType;
  label: string | null;
}

export interface MockEntry {
  id: string;
  date: string; // ISO date string, e.g. "2026-07-20"
  tag: string | null; // one-word description for the stick/index
  content: string; // plain text for now — real Tiptap JSON comes in Module 2
  position: number; // sort order
  ownerSeat: Seat;
  lastSavedAt: string | null; // ISO datetime, null = draft never saved
  unlockedForOwnerEdit: boolean;
  media: MockMediaAttachment[];
}

export const mockEntries: MockEntry[] = [
  {
    id: "entry-1",
    date: "2026-06-01",
    tag: "beginning",
    content: "The first page. Everything starts somewhere.",
    position: 0,
    ownerSeat: "USER_ONE",
    lastSavedAt: "2026-06-01T10:00:00Z",
    unlockedForOwnerEdit: false,
    media: [],
  },
  {
    id: "entry-2",
    date: "2026-06-15",
    tag: "trip",
    content: "Wrote this one on the train. Still can't believe that view.",
    position: 1,
    ownerSeat: "USER_TWO",
    lastSavedAt: "2026-06-15T18:30:00Z",
    unlockedForOwnerEdit: false,
    media: [],
  },
  {
    id: "entry-3",
    date: "2026-07-01",
    tag: null,
    content: "Just a regular day. Nothing special, but wanted to write anyway.",
    position: 2,
    ownerSeat: "USER_ONE",
    lastSavedAt: null, // still a draft — hasn't been saved yet
    unlockedForOwnerEdit: false,
    media: [],
  },
];

// Temporary stand-in for the real session/auth state (Module 3 replaces this)
export const mockActiveSeat: Seat = "USER_ONE";