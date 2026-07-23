"use client";

import { useState } from "react";

export default function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }
    setStatus("saving");
    const res = await fetch("/api/account/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setStatus("error");
      return;
    }
    setStatus("saved");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#e0d5c0] bg-white/70 p-5">
      <h3 className="mb-3 text-sm font-semibold text-[#3d2f1f]">Shared Password</h3>
      <p className="mb-3 text-xs text-[#8a7a63]">
        Changes the one password both of you use to log in.
      </p>
      <div className="flex flex-col gap-3">
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current password"
          className="rounded-md border border-[#e0d5c0] px-3 py-1.5 text-sm text-[#3d2f1f]"
        />
        <input
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password (min. 8 characters)"
          className="rounded-md border border-[#e0d5c0] px-3 py-1.5 text-sm text-[#3d2f1f]"
        />
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          className="rounded-md border border-[#e0d5c0] px-3 py-1.5 text-sm text-[#3d2f1f]"
        />
      </div>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={status === "saving"}
        className="mt-4 w-full rounded-full bg-[#3d2f1f] py-1.5 text-sm font-medium text-[#f0e6d2] disabled:opacity-50"
      >
        {status === "saved" ? "Saved ✓" : status === "saving" ? "Saving…" : "Update Password"}
      </button>
    </form>
  );
}