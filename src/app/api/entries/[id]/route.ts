import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canEdit } from "@/lib/permissions";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { sessionSeat, changes } = await req.json().catch(() => ({}));

  const entry = await prisma.entry.findUnique({ where: { id } });
  if (!entry || entry.accountId !== session.accountId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!canEdit(entry, sessionSeat)) {
    return NextResponse.json({ error: "You don't have permission to edit this entry." }, { status: 403 });
  }

  const updated = await prisma.entry.update({
    where: { id },
    data: {
      ...changes,
      // Server sets this — never trusts a client-supplied timestamp for the window.
      ...(changes?.content !== undefined ? { lastSavedAt: new Date() } : {}),
    },
    include: { media: true },
  });

  return NextResponse.json({ entry: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { sessionSeat } = await req.json().catch(() => ({}));

  const entry = await prisma.entry.findUnique({ where: { id } });
  if (!entry || entry.accountId !== session.accountId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!canEdit(entry, sessionSeat)) {
    return NextResponse.json({ error: "You don't have permission to delete this entry." }, { status: 403 });
  }

  await prisma.entry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}