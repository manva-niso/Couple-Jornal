import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PrintButton from "@/components/entries/PrintButton";

export default async function PrintEntryPage({
  params,
}: {
  params: Promise<{ entryId: string }>;
}) {
  const { entryId } = await params;

  const session = await getSession();
  if (!session) return notFound();

  const entry = await prisma.entry.findUnique({ where: { id: entryId } });
  if (!entry || entry.accountId !== session.accountId) return notFound();

  const formattedDate = new Date(entry.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const ownerLabel = entry.ownerSeat === "USER_ONE" ? "User 1" : "User 2";

  return (
    <div className="min-h-screen bg-[#e9e2d0] py-10 print:bg-white print:py-0">
      <div className="letter-page mx-auto max-w-2xl bg-[#fdfbf5] px-12 py-14 shadow-lg print:max-w-none print:shadow-none">
        <p className="mb-1 text-center text-xs uppercase tracking-[0.25em] text-[#8a7a63]">
          Chitthiya
        </p>
        <div className="mx-auto mb-6 h-px w-16 bg-[#3d2f1f]/30" />

        <h1 className="diary-display mb-2 text-center text-4xl italic leading-tight text-[#3d2f1f]">
          {entry.tag || "Untitled"}
        </h1>
        <p className="mb-10 text-center text-sm tracking-wide text-[#8a7a63]">
          {formattedDate} · Written by {ownerLabel}
        </p>

        <div
          className="prose prose-lg mx-auto max-w-none font-serif leading-8 text-[#3d2f1f]"
          dangerouslySetInnerHTML={{ __html: entry.content || "<em>This letter is empty.</em>" }}
        />

        <div className="mt-16 flex justify-center print:hidden">
          <PrintButton />
        </div>
      </div>
    </div>
  );
}