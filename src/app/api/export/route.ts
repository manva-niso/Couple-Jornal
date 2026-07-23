import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import JSZip from "jszip";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const entries = await prisma.entry.findMany({
      where: { accountId: session.accountId },
      include: { media: true },
      orderBy: { date: "asc" },
    });

    const zip = new JSZip();

    // Raw data — enough to rebuild everything exactly if you ever add an
    // "import backup" feature later.
    zip.file(
      "journal.json",
      JSON.stringify(
        {
          version: "1.0",
          exportDate: new Date().toISOString(),
          accountId: session.accountId,
          entries,
        },
        null,
        2
      )
    );

    // Human-readable version, openable in any browser with no app needed.
    zip.file("journal.html", buildReadableHtml(entries));

    // The actual audio files, not just links — a real backup shouldn't
    // depend on Vercel Blob still being reachable months from now.
    const mediaFolder = zip.folder("media");
    for (const entry of entries) {
      for (const attachment of entry.media) {
        try {
          const blobResponse = await fetch(attachment.url, {
            headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
          });
          if (!blobResponse.ok) continue;
          const arrayBuffer = await blobResponse.arrayBuffer();
          const extension = attachment.label?.split(".").pop() || "mp3";
          mediaFolder?.file(`${attachment.id}.${extension}`, arrayBuffer);
        } catch {
          // Skip one failed file rather than aborting the whole export.
          continue;
        }
      }
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      headers: {
        "Content-Disposition": `attachment; filename="chitthiya-backup-${
          new Date().toISOString().split("T")[0]
        }.zip"`,
        "Content-Type": "application/zip",
      },
    });
  } catch (error) {
    console.error("Export backup error:", error);
    return NextResponse.json({ error: "Failed to generate export backup." }, { status: 500 });
  }
}

function buildReadableHtml(
  entries: Array<{ date: Date; tag: string | null; content: string; ownerSeat: string }>
): string {
  const rows = entries
    .map(
      (entry) => `
        <section style="margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid #ddd;">
          <p style="font-size:0.85rem;color:#8a7a63;">
            ${new Date(entry.date).toLocaleDateString()} — ${
        entry.ownerSeat === "USER_ONE" ? "User 1" : "User 2"
      }${entry.tag ? ` · #${entry.tag}` : ""}
          </p>
          <div style="font-family:Georgia,serif;line-height:1.7;color:#3d2f1f;">${entry.content}</div>
        </section>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><title>Chitthiya — Journal Backup</title></head>
  <body style="max-width:700px;margin:2rem auto;font-family:sans-serif;">
    <h1>Chitthiya — Journal Backup</h1>
    <p style="color:#8a7a63;">Exported ${new Date().toLocaleDateString()}</p>
    ${rows}
  </body>
</html>`;
}