// src/lib/auth.ts
//
// One shared password per ACCOUNT (build-guide-v4's correction) — there is
// no per-identifier or per-seat password. An identifier is purely a lookup
// key into the account; it never determines a seat. Seat resolution is
// entirely lib/pin.ts's job, against that account's two SeatCredential rows.
//
// Session note: createSession() binds {accountId, seat} into a signed
// cookie once, at login. That `seat` value is only ever the LOGIN-TIME
// DEFAULT — used to seed the client's useSeatStore when the page first
// loads. Once switching seats is unrestricted (SeatSwitcher.tsx), the
// client is trusted to say which seat it's currently acting as on each
// request to the Module 3.3 entries API — the session's original seat is
// never re-checked or used to reject a switch. Re-deriving "current seat"
// from this cookie on every request would silently reintroduce the
// re-auth-like behavior build-guide-v4 explicitly removed.
//
// Requires `jose` for signed cookies — not yet in package.json:
//   npm install jose

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Seat } from "@/app/generated/prisma/client";

const COOKIE_NAME = "chitthiya_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-only-insecure-secret-change-me"
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

/**
 * Resolves an account from whichever of its two identifiers was typed.
 * Deliberately does NOT determine a seat — includes seatCredentials so the
 * caller (the login route) can try the submitted PIN against each one.
 */
export async function findAccountByIdentifier(identifier: string) {
  const authIdentifier = await prisma.authIdentifier.findUnique({
    where: { identifier },
    include: {
      account: {
        include: { seatCredentials: true },
      },
    },
  });
  return authIdentifier?.account ?? null;
}

export type SessionPayload = {
  accountId: string;
  seat: Seat; // login-time default only — see file header note
};

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}