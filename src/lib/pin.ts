// src/lib/pin.ts
//
// The PIN is the seat decider (build-guide-v4): each account has exactly
// two SeatCredential rows (one per Seat), each with its own hashed PIN and
// its own independent lockout counter — a lockout on Seat 1's PIN must
// never block Seat 2 from logging in, which is why lockout state lives on
// SeatCredential, not on Account or AuthIdentifier.
//
// This file does NOT decide login success/failure by itself — the login
// route (Module 3.2's API layer, not built yet) is expected to:
//   1. look up the account via findAccountByIdentifier() (auth.ts)
//   2. for each of that account's SeatCredentials, checkPinLockout() first
//   3. if not locked, verifyPin() the submitted PIN against that credential
//   4. on success: resetPinAttempts() and bind the session to that seat
//   5. on failure of every credential: recordFailedPinAttempt() on all of
//      them (never reveal which seat, if any, the PIN was "close" to)

import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { SeatCredential } from "@/app/generated/prisma/client";

export const MAX_PIN_ATTEMPTS = 5;
export const PIN_LOCKOUT_MS = 60 * 1000;

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(pin: string, pinHash: string): Promise<boolean> {
  return bcrypt.compare(pin, pinHash);
}

export type PinLockoutStatus = { locked: boolean; lockedForSeconds: number };

/**
 * Pure — takes lockout fields already loaded from the DB and answers
 * whether this credential is currently locked, with no query of its own.
 * Kept pure/testable the same way lib/permissions.ts is.
 */
export function checkPinLockout(
  credential: Pick<SeatCredential, "lockedUntil">,
  now: number = Date.now()
): PinLockoutStatus {
  if (!credential.lockedUntil) return { locked: false, lockedForSeconds: 0 };
  const remainingMs = credential.lockedUntil.getTime() - now;
  if (remainingMs <= 0) return { locked: false, lockedForSeconds: 0 };
  return { locked: true, lockedForSeconds: Math.ceil(remainingMs / 1000) };
}

/**
 * Increments the failure counter for one seat's PIN and locks it once
 * MAX_PIN_ATTEMPTS is reached. Does the DB read + write itself (unlike
 * checkPinLockout above) since recording a failure is inherently a mutation.
 */
export async function recordFailedPinAttempt(
  credentialId: string
): Promise<PinLockoutStatus> {
  const credential = await prisma.seatCredential.findUniqueOrThrow({
    where: { id: credentialId },
  });

  const attempts = credential.failedPinAttempts + 1;
  const shouldLock = attempts >= MAX_PIN_ATTEMPTS;

  const updated = await prisma.seatCredential.update({
    where: { id: credentialId },
    data: {
      failedPinAttempts: shouldLock ? 0 : attempts,
      lockedUntil: shouldLock ? new Date(Date.now() + PIN_LOCKOUT_MS) : null,
    },
  });

  return checkPinLockout(updated);
}

/**
 * NOTE: not in the original 4-function list from the architecture diagram —
 * added because the login route needs *some* way to clear a seat's failure
 * counter after a correct PIN, and folding it into verifyPin() would make
 * that function do DB writes on a "just checking" call. Flagging this
 * addition explicitly rather than silently growing the file's surface area.
 */
export async function resetPinAttempts(credentialId: string): Promise<void> {
  await prisma.seatCredential.update({
    where: { id: credentialId },
    data: { failedPinAttempts: 0, lockedUntil: null },
  });
}