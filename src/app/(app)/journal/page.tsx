import { getSession } from "@/lib/auth";
import SessionBootstrap from "@/components/auth/SessionBootstrap";
import JournalClient from "@/components/journal/JournalClient";

export default async function JournalPage() {
  // (app)/layout.tsx already redirects to /login if there's no session at
  // all — this fallback is just defensive, it should never actually be hit.
  const session = await getSession();
  const seat = session?.seat ?? "USER_ONE";

  return (
    <>
      <SessionBootstrap seat={seat} />
      <JournalClient />
    </>
  );
}
