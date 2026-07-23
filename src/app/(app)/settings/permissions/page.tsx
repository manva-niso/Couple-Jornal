import React from "react";

export default function PermissionsSettingsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-8 pb-12">
      <div>
        <h1 className="text-2xl font-semibold text-[#3d2f1f]">Permissions & Rules</h1>
        <p className="mt-1 text-sm text-[#3d2f1f]/70">
          Understanding how seats, editing, and locking work across the journal.
        </p>
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-[#3d2f1f]/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-[#3d2f1f]">The 15-Minute Edit Window</h2>
        <p className="text-sm leading-relaxed text-[#3d2f1f]/80">
          When an entry is created, it remains unlocked and editable by its author for exactly <strong>15 minutes</strong> after the last save. Every time you save the entry, the 15-minute countdown resets.
        </p>
        <p className="text-sm leading-relaxed text-[#3d2f1f]/80">
          Once the window expires with no further saves, the entry permanently locks. It can no longer be edited by the author unless the other seat explicitly unlocks it.
        </p>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-[#3d2f1f]/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-[#3d2f1f]">Seat Roles & Unlocking</h2>
        <p className="text-sm leading-relaxed text-[#3d2f1f]/80">
          The journal consists of two seats (Seat 1 and Seat 2). The seat you occupy is determined securely by the PIN you enter at login.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm text-[#3d2f1f]/80">
          <li>
            <strong className="text-[#3d2f1f]">Authorship:</strong> You are the owner of any entry you create. Only the owner can edit an entry while its 15-minute window is open.
          </li>
          <li>
            <strong className="text-[#3d2f1f]">Unlocking:</strong> If your entry locks, only the <em>other</em> seat can unlock it for you. You cannot unlock your own entries.
          </li>
          <li>
            <strong className="text-[#3d2f1f]">Viewing:</strong> Both seats can view all entries and play all attached sounds and music, regardless of who authored them.
          </li>
        </ul>
      </section>
    </div>
  );
}