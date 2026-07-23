import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canEdit } from "@/lib/permissions";
import { del } from "@vercel/blob"; // <-- Import Vercel Blob delete utility

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { sessionSeat, changes } = await req.json().catch(() => ({}));

  const entry = await prisma.entry.findUnique({ where: { id } });
  if (!entry || entry.accountId !== session.accountId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const { media, ...safeChanges } = changes || {};

  // The tag (rendered as the entry's heading) is just a label — the owner
  // can rename it any time, unrestricted by the 15-minute editing window
  // that gates the written content. Only require the full canEdit() check
  // (window + unlock) when content itself is part of this update.
  const isOwner = entry.ownerSeat === sessionSeat;
  const changingGatedField = Object.prototype.hasOwnProperty.call(safeChanges, "content");
  const allowed = changingGatedField ? canEdit(entry, sessionSeat) : isOwner;

  if (!allowed) {
    return NextResponse.json({ error: "You don't have permission to edit this entry." }, { status: 403 });
  }

  const updated = await prisma.entry.update({
    where: { id },
    data: {
      ...safeChanges,
      ...(safeChanges.content !== undefined ? { lastSavedAt: new Date() } : {}),
    },
    include: { media: true },
  });

  return NextResponse.json({ entry: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const sessionSeat = body.sessionSeat;

  const entry = await prisma.entry.findUnique({ 
    where: { id },
    include: { media: true }, // Include media attachments to get their blob URLs
  });

  if (!entry || entry.accountId !== session.accountId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // RULE: An entry owner can ALWAYS delete their own entries anytime.
  if (sessionSeat && entry.ownerSeat !== sessionSeat) {
    return NextResponse.json({ error: "You don't have permission to delete this entry." }, { status: 403 });
  }

  // 1. Delete all physical files from Vercel Blob storage
  for (const item of entry.media) {
    if (item.url) {
      try {
        await del(item.url);
      } catch (err) {
        console.error(`Failed to delete blob for media ID ${item.id}:`, err);
      }
    }
  }

  // 2. Delete media attachment records and the entry from the database
  await prisma.mediaAttachment.deleteMany({ where: { entryId: id } }).catch(() => {});
  await prisma.entry.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}