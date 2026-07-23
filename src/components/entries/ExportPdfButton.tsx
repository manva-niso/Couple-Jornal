"use client";

import { useState } from "react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { useEntries } from "@/hooks/useEntries";
import { useViewStore } from "@/store/useViewStore";
import type { MockEntry } from "@/types";

// Tiptap gives us HTML. React-PDF can't render arbitrary HTML, so we reduce
// it to plain paragraphs — good enough for a clean printed page without
// pulling in a full HTML-to-PDF renderer.
function htmlToParagraphs(html: string): string[] {
  return html
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 72,
    paddingBottom: 60,
    paddingHorizontal: 72, // 1in margins on US Letter
    fontFamily: "Times-Roman",
  },
  title: { fontSize: 22, fontStyle: "italic", marginBottom: 6 },
  meta: { fontSize: 10, color: "#6b5744", marginBottom: 28 },
  paragraph: { fontSize: 12, lineHeight: 1.6, marginBottom: 12 },
  soundHeading: { fontSize: 10, marginTop: 24, marginBottom: 6, color: "#6b5744" },
  soundLabel: { fontSize: 10, marginBottom: 3, color: "#6b5744" },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 72,
    right: 72,
    fontSize: 9,
    color: "#a3907c",
    textAlign: "center",
  },
});

function EntryPdfDocument({ entry, includeSoundLabels }: { entry: MockEntry; includeSoundLabels: boolean }) {
  const formattedDate = new Date(entry.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const ownerLabel = entry.ownerSeat === "USER_ONE" ? "User 1" : "User 2";
  const paragraphs = htmlToParagraphs(entry.content || "");
  const sounds = includeSoundLabels ? entry.media ?? [] : [];
  const title = entry.tag || "Untitled";

  return (
    <Document>
      {/* No fixed page count/height here — react-pdf automatically flows
          content that overflows one page onto additional pages on its own,
          as long as nothing below sets wrap={false}. The `fixed` footer
          repeats identically on every page that gets created this way. */}
      <Page size="LETTER" style={styles.page} wrap>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{formattedDate} · Written by {ownerLabel}</Text>

        {paragraphs.length > 0 ? (
          paragraphs.map((p, i) => (
            <Text key={i} style={styles.paragraph}>{p}</Text>
          ))
        ) : (
          <Text style={styles.paragraph}>(No content yet.)</Text>
        )}

        {sounds.length > 0 && (
          <View wrap={false}>
            <Text style={styles.soundHeading}>Attached sounds</Text>
            {sounds.map((m) => (
              <Text key={m.id} style={styles.soundLabel}>
                ♪ {m.label ?? "Untitled sound"}{m.keyword ? ` — attached to "${m.keyword}"` : ""}
              </Text>
            ))}
          </View>
        )}

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            totalPages > 1 ? `${title} · page ${pageNumber} of ${totalPages}` : null
          }
        />
      </Page>
    </Document>
  );
}

export default function ExportPdfButton() {
  const currentEntryId = useViewStore((s) => s.currentEntryId); // for UI enable/disable only
  const getCurrentEntryId = useViewStore((s) => s.getCurrentEntryId); // ground truth at click time
  const entries = useEntries((s) => s.entries);
  const entry = entries.find((e) => e.id === currentEntryId);
  const [includeSoundLabels, setIncludeSoundLabels] = useState(true);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    // Re-resolve at the moment of the click, ignoring whatever the reactive
    // `currentEntryId` happened to be — this is what actually fixes the
    // wrong-entry export, since it can never drift out of sync with the
    // page really on screen.
    const id = getCurrentEntryId() ?? currentEntryId;
    const targetEntry = entries.find((e) => e.id === id);
    if (!targetEntry) return;

    setExporting(true);
    try {
      const blob = await pdf(
        <EntryPdfDocument entry={targetEntry} includeSoundLabels={includeSoundLabels} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${targetEntry.tag || targetEntry.date || "entry"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed right-4 top-4 z-40 flex flex-col items-end gap-1.5">
      <button
        onClick={handleExport}
        disabled={!entry || exporting}
        className="rounded-full bg-[#3d2f1f] px-3 py-1.5 text-xs font-medium text-[#f0e6d2] shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {exporting ? "Exporting…" : "Export as PDF"}
      </button>
      <label className="flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-[#3d2f1f] shadow-sm">
        <input
          type="checkbox"
          checked={includeSoundLabels}
          onChange={(e) => setIncludeSoundLabels(e.target.checked)}
          className="h-3 w-3"
        />
        Include sound labels
      </label>
    </div>
  );
}