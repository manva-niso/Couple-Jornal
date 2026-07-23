import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canToggleUnlock } from "@/lib/permissions";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { sessionSeat } = await req.json().catch(() => ({}));

  const entry = await prisma.entry.findUnique({ where: { id } });
  if (!entry || entry.accountId !== session.accountId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!canToggleUnlock(entry, sessionSeat)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  const updated = await prisma.entry.update({
    where: { id },
    data: { unlockedForOwnerEdit: !entry.unlockedForOwnerEdit },
  });

  return NextResponse.json({ entry: updated });
}