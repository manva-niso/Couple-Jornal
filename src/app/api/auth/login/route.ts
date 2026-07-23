// src/app/api/auth/login/route.ts
//
// identifier resolves the ACCOUNT only. password is checked once, against
// the account. Then the PIN is tried against every one of that account's
// SeatCredentials (usually 2, sometimes 1 if the second seat hasn't been
// set up yet) — whichever one it matches decides the seat the session
// binds to. Never reveals which field (identifier/password/PIN) was wrong,
// or which seat a wrong PIN was "close" to.

import { NextResponse } from "next/server";
import {
  findAccountByIdentifier,
  verifyPassword,
  createSession,
} from "@/lib/auth";
import {
  checkPinLockout,
  verifyPin,
  recordFailedPinAttempt,
  resetPinAttempts,
} from "@/lib/pin";

const GENERIC_ERROR = "Incorrect identifier, password, or PIN.";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const { identifier, password, pin } = body as Record<string, unknown>;
  if (
    typeof identifier !== "string" ||
    typeof password !== "string" ||
    typeof pin !== "string" ||
    !identifier ||
    !password ||
    !pin
  ) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const account = await findAccountByIdentifier(identifier);
  if (!account) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const passwordOk = await verifyPassword(password, account.passwordHash);
  if (!passwordOk) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  if (account.seatCredentials.length === 0) {
    // Shouldn't happen (register always creates at least USER_ONE), but
    // don't 500 on it.
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const unlocked = account.seatCredentials.filter((c) => !checkPinLockout(c).locked);

  if (unlocked.length === 0) {
    const soonest = Math.min(
      ...account.seatCredentials.map((c) => checkPinLockout(c).lockedForSeconds)
    );
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${soonest}s.`, lockedForSeconds: soonest },
      { status: 401 }
    );
  }

  for (const credential of unlocked) {
    const matches = await verifyPin(pin, credential.pinHash);
    if (matches) {
      await resetPinAttempts(credential.id);
      await createSession({ accountId: account.id, seat: credential.seat });
      return NextResponse.json({ ok: true, seat: credential.seat });
    }
  }

  // No credential matched — record a failed attempt on every one that was
  // tried, so submitting a PIN can't be used to fish for which seat (if
  // any) it was close to.
  const lockoutResults = await Promise.all(unlocked.map((c) => recordFailedPinAttempt(c.id)));
  const anyLocked = lockoutResults.find((r) => r.locked);

  return NextResponse.json(
    {
      error: anyLocked
        ? `Too many attempts. Try again in ${anyLocked.lockedForSeconds}s.`
        : GENERIC_ERROR,
      lockedForSeconds: anyLocked?.lockedForSeconds ?? 0,
    },
    { status: 401 }
  );
}