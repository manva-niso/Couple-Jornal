"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSeatStore } from "@/store/useSeatStore";

export default function RegisterForm() {
  const router = useRouter();
  const setSessionSeat = useSeatStore((s) => s.setSessionSeat);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [pin1, setPin1] = useState("");
  const [pin2, setPin2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, name1, pin1, name2, pin2 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSessionSeat(data.seat);
      router.push("/journal");
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-5">
      {/* Shared Details */}
      <div className="rounded-xl border border-[#e0d5c0] bg-white/50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-[#3d2f1f]">Shared Account</h2>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs text-[#8a7a63]">
            Identifier (Email or Username)
            <input
              required
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. us@example.com"
              className="rounded-lg border border-[#3d2f1f]/20 bg-white/80 px-3 py-1.5 text-sm text-[#3d2f1f] outline-none focus:border-[#3d2f1f]/60"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[#8a7a63]">
            Shared Password
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-lg border border-[#3d2f1f]/20 bg-white/80 px-3 py-1.5 text-sm text-[#3d2f1f] outline-none focus:border-[#3d2f1f]/60"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[#8a7a63]">
            Confirm Password
            <input
              required
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-lg border border-[#3d2f1f]/20 bg-white/80 px-3 py-1.5 text-sm text-[#3d2f1f] outline-none focus:border-[#3d2f1f]/60"
            />
          </label>
        </div>
      </div>

      {/* User 1 Details */}
      <div className="rounded-xl border border-[#e0d5c0] bg-white/50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-[#3d2f1f]">First Person</h2>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs text-[#8a7a63]">
            Your Name
            <input
              required
              type="text"
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              placeholder="e.g. Tara"
              className="rounded-lg border border-[#3d2f1f]/20 bg-white/80 px-3 py-1.5 text-sm text-[#3d2f1f] outline-none focus:border-[#3d2f1f]/60"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[#8a7a63]">
            Your PIN
            <input
              required
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin1}
              onChange={(e) => setPin1(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="rounded-lg border border-[#3d2f1f]/20 bg-white/80 px-3 py-1.5 tracking-widest text-[#3d2f1f] outline-none focus:border-[#3d2f1f]/60"
            />
          </label>
        </div>
      </div>

      {/* User 2 Details */}
      <div className="rounded-xl border border-[#e0d5c0] bg-white/50 p-4">
        <h2 className="mb-1 text-sm font-semibold text-[#3d2f1f]">Second Person</h2>
        <p className="mb-3 text-[10px] text-[#8a7a63]">You can set this up now or they can do it later.</p>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs text-[#8a7a63]">
            Their Name
            <input
              type="text"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              placeholder="e.g. John"
              className="rounded-lg border border-[#3d2f1f]/20 bg-white/80 px-3 py-1.5 text-sm text-[#3d2f1f] outline-none focus:border-[#3d2f1f]/60"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[#8a7a63]">
            Their PIN
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin2}
              onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="rounded-lg border border-[#3d2f1f]/20 bg-white/80 px-3 py-1.5 tracking-widest text-[#3d2f1f] outline-none focus:border-[#3d2f1f]/60"
            />
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-lg bg-[#3d2f1f] px-4 py-3 font-medium text-[#f0e6d2] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
      >
        {loading ? "Creating…" : "Create Journal"}
      </button>
    </form>
  );
}
