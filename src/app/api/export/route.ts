import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    // Fetch all entries for this account along with their media attachments
    const entries = await prisma.entry.findMany({
      where: { accountId: session.accountId },
      include: { media: true },
      orderBy: { date: "asc" },
    });

    const backupData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      accountId: session.accountId,
      totalEntries: entries.length,
      entries,
    };

    return NextResponse.json(backupData, {
      headers: {
        "Content-Disposition": `attachment; filename="chitthiya-backup-${new Date().toISOString().split("T")[0]}.json"`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Export backup error:", error);
    return NextResponse.json({ error: "Failed to generate export backup." }, { status: 500 });
  }
}