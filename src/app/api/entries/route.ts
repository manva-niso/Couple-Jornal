import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Seat } from "@/app/generated/prisma/client";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const entries = await prisma.entry.findMany({
    where: { accountId: session.accountId },
    include: { media: true },
    orderBy: { position: "asc" },
  });
  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const { date, tag, sessionSeat } = body as { date: string; tag: string | null; sessionSeat: Seat };
  if (sessionSeat !== Seat.USER_ONE && sessionSeat !== Seat.USER_TWO) {
    return NextResponse.json({ error: "Invalid seat." }, { status: 400 });
  }

  const position = await prisma.entry.count({ where: { accountId: session.accountId } });

  const entry = await prisma.entry.create({
    data: {
      date: new Date(date),
      tag: tag || null,
      content: "",
      position,
      ownerSeat: sessionSeat,
      accountId: session.accountId,
    },
    include: { media: true },
  });

  return NextResponse.json({ entry });
}