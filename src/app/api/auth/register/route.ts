// src/app/api/auth/register/route.ts
//
// Confirmed model: ONE shared identifier + password for the account. Each
// person gets a displayName + PIN (SeatCredential), not their own login
// username. The second person is optional at signup time — "they can do it
// later" per RegisterForm's own copy — since seatCredentials is a list,
// an account can exist with just USER_ONE's row for now.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { hashPin } from "@/lib/pin";
import { Seat } from "@/app/generated/prisma/client";

const PIN_PATTERN = /^\d{4,6}$/;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { identifier, password, name1, pin1, name2, pin2 } = body as Record<string, unknown>;

  if (typeof identifier !== "string" || identifier.trim().length === 0) {
    return NextResponse.json({ error: "An identifier is required." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }
  if (typeof name1 !== "string" || name1.trim().length === 0) {
    return NextResponse.json({ error: "The first person's name is required." }, { status: 400 });
  }
  if (typeof pin1 !== "string" || !PIN_PATTERN.test(pin1)) {
    return NextResponse.json({ error: "The first PIN must be 4-6 digits." }, { status: 400 });
  }

  const hasName2 = typeof name2 === "string" && name2.trim().length > 0;
  const hasPin2 = typeof pin2 === "string" && pin2.trim().length > 0;
  if (hasName2 !== hasPin2) {
    return NextResponse.json(
      { error: "Provide both a name and a PIN for the second person, or leave both blank." },
      { status: 400 }
    );
  }
  if (hasPin2 && !PIN_PATTERN.test(pin2 as string)) {
    return NextResponse.json({ error: "The second PIN must be 4-6 digits." }, { status: 400 });
  }
  const includesSecondSeat = hasName2 && hasPin2;

  const existing = await prisma.authIdentifier.findUnique({ where: { identifier } });
  if (existing) {
    return NextResponse.json({ error: "That identifier is already in use." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const pin1Hash = await hashPin(pin1);
  const pin2Hash = includesSecondSeat ? await hashPin(pin2 as string) : null;

  const account = await prisma.account.create({
    data: {
      passwordHash,
      identifiers: { create: [{ identifier }] },
      seatCredentials: {
        create: [
          { seat: Seat.USER_ONE, displayName: name1, pinHash: pin1Hash },
          ...(includesSecondSeat
            ? [{ seat: Seat.USER_TWO, displayName: name2 as string, pinHash: pin2Hash as string }]
            : []),
        ],
      },
    },
  });

  await createSession({ accountId: account.id, seat: Seat.USER_ONE });

  return NextResponse.json({ ok: true, accountId: account.id, seat: Seat.USER_ONE });
}
