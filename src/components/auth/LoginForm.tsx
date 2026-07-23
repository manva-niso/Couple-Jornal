"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSeatStore } from "@/store/useSeatStore";

export default function LoginForm() {
  const router = useRouter();
  const setSessionSeat = useSeatStore((s) => s.setSessionSeat);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, pin }),
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
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="identifier" className="text-sm font-medium text-[#3d2f1f]">
          Identifier
        </label>
        <input
          id="identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="username or email"
          className="rounded-lg border border-[#3d2f1f]/20 bg-white/80 px-4 py-2 text-[#3d2f1f] outline-none focus:border-[#3d2f1f]/60"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-[#3d2f1f]">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="rounded-lg border border-[#3d2f1f]/20 bg-white/80 px-4 py-2 text-[#3d2f1f] outline-none focus:border-[#3d2f1f]/60"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="pin" className="text-sm font-medium text-[#3d2f1f]">
          PIN
        </label>
        <input
          id="pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          placeholder="••••"
          className="rounded-lg border border-[#3d2f1f]/20 bg-white/80 px-4 py-2 tracking-widest text-[#3d2f1f] outline-none focus:border-[#3d2f1f]/60"
        />
        <p className="text-xs text-[#8a7a63]">
          This decides which seat you land as — not who you&apos;re logging in as.
        </p>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-lg bg-[#3d2f1f] px-4 py-2 font-medium text-[#f0e6d2] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
      >
        {loading ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
