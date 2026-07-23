"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccountStore } from "@/store/useAccountStore";
import { useSeatStore } from "@/store/useSeatStore";
import type { Seat } from "@/types";
import PasswordChangeForm from "@/components/settings/PasswordChangeForm";

function SeatCredentialForm({ seat }: { seat: Seat }) {
  const sessionSeat = useSeatStore((s) => s.sessionSeat);
  const credentials = useAccountStore((s) => s.credentials[seat]);
  const setIdentifier = useAccountStore((s) => s.setIdentifier);
  const setPin = useAccountStore((s) => s.setPin);

  const [identifierInput, setIdentifierInput] = useState(credentials.identifier);
  const [pinInput, setPinInput] = useState("");
  const [saved, setSaved] = useState(false);

  const canEditThisSeat = sessionSeat === seat;
  const label = seat === "USER_ONE" ? "User 1" : "User 2";

  const handleSave = () => {
    setIdentifier(seat, identifierInput);
    if (pinInput.trim().length > 0) setPin(seat, pinInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-xl border border-[#e0d5c0] bg-white/70 p-5">
      <h3 className="mb-3 text-sm font-semibold text-[#3d2f1f]">{label}</h3>

      {!canEditThisSeat && (
        <p className="mb-3 text-xs italic text-[#b08a5a]">
          You&apos;re signed in as the other seat — switch to {label} to edit these.
        </p>
      )}

      <label className="mb-3 block text-xs text-[#8a7a63]">
        Email or username
        <input
          type="text"
          value={identifierInput}
          onChange={(e) => setIdentifierInput(e.target.value)}
          disabled={!canEditThisSeat}
          placeholder={seat === "USER_TWO" ? "Add the second identifier" : ""}
          className="mt-1 w-full rounded-md border border-[#e0d5c0] px-3 py-1.5 text-sm text-[#3d2f1f] disabled:bg-[#f5f0e6] disabled:text-[#b0a58f]"
        />
      </label>

      <label className="mb-4 block text-xs text-[#8a7a63]">
        {credentials.pin ? "Change PIN" : "Set PIN"}
        <input
          type="password"
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value)}
          disabled={!canEditThisSeat}
          placeholder={credentials.pin ? "••••" : "Set a 4-6 digit PIN"}
          maxLength={6}
          className="mt-1 w-full rounded-md border border-[#e0d5c0] px-3 py-1.5 text-sm text-[#3d2f1f] disabled:bg-[#f5f0e6] disabled:text-[#b0a58f]"
        />
      </label>

      {canEditThisSeat && (
        <button
          onClick={handleSave}
          className="w-full rounded-full bg-[#3d2f1f] py-1.5 text-sm font-medium text-[#f0e6d2] transition-opacity hover:opacity-90"
        >
          {saved ? "Saved ✓" : "Save"}
        </button>
      )}
    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <main className="min-h-screen bg-[#faf6ec] p-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/journal"
          className="mb-6 inline-block text-xs font-medium uppercase tracking-[0.1em] text-[#8a7a63] hover:text-[#3d2f1f]"
        >
          ← Back to journal
        </Link>
        <h1 className="mb-1 text-2xl font-semibold text-[#3d2f1f]">Account</h1>
        <p className="mb-6 text-sm text-[#8a7a63]">
          Each identifier and PIN can only be set by that seat, switch to the other seat to edit theirs.
        </p>

        <PasswordChangeForm />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SeatCredentialForm seat="USER_ONE" />
          <SeatCredentialForm seat="USER_TWO" />
        </div>
      </div>
    </main>
  );
}