"use client";

import type { Editor } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MockMediaAttachment } from "@/types";

interface KeywordSoundBinderProps {
  entryId: string; // Ties the upload to the database record
  editor: Editor | null;
  onAttach: (attachment: MockMediaAttachment) => void;
}

interface MenuPosition {
  top: number;
  left: number;
}

export default function KeywordSoundBinder({ entryId, editor, onAttach }: KeywordSoundBinderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [keyword, setKeyword] = useState("");
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number } | null>(null);

  useEffect(() => {
    if (!editor) return;

    const updateSelection = () => {
      // If the editor loses focus (like when the file picker opens), 
      // DO NOT update the selection to prevent grabbing the whole paragraph.
      if (!editor.isFocused) return;

      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, " ").trim();

      if (!selectedText) {
        setKeyword("");
        setPosition(null);
        setSelectionRange(null);
        return;
      }

      const coordinates = editor.view.coordsAtPos(from);
      const POPUP_WIDTH_ESTIMATE = 220;
      const POPUP_HEIGHT_ESTIMATE = 44;
      setKeyword(selectedText);
      setSelectionRange({ from, to });
      setPosition({
        top: Math.min(
          coordinates.bottom + 8,
          window.innerHeight - POPUP_HEIGHT_ESTIMATE - 12
        ),
        left: Math.max(
          12,
          Math.min(coordinates.left, window.innerWidth - POPUP_WIDTH_ESTIMATE - 12)
        ),
      });
    };

    const handleBlur = () => window.setTimeout(updateSelection, 0);

    editor.on("selectionUpdate", updateSelection);
    editor.on("blur", handleBlur);

    return () => {
      editor.off("selectionUpdate", updateSelection);
      editor.off("blur", handleBlur);
    };
  }, [editor]);

  const attachAudio = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !keyword || !selectionRange) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entryId", entryId);
      formData.append("mediaType", "SOUND");
      formData.append("keyword", keyword);

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload media");
      }

      const data = await response.json();

      onAttach({
        id: data.id, 
        keyword,     
        url: `/api/media/${data.id}.mp3`,
        type: "SOUND",
        label: file.name,
      });

      if (editor) {
        editor
          .chain()
          .focus()
          .setTextSelection(selectionRange)
          .setMark('audioKeyword', { audioId: data.id })
          .run();
      }

      event.target.value = "";
      setKeyword("");
      setPosition(null);
      setSelectionRange(null);
    } catch (error) {
      console.error("Keyword upload error:", error);
      alert("Failed to upload keyword sound.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!position || !keyword) return null;

  // The book/scroll ancestors use `transform`, `filter`, and `perspective`
  // for the page-flip and parchment effects. Any of those on an ancestor
  // creates a new containing block for `position: fixed` descendants, so
  // this popup would otherwise be positioned relative to the (small,
  // rotated) page instead of the real viewport — pushing it off-screen.
  // Rendering through a portal into document.body escapes that chain so
  // `position: fixed` measures from the actual viewport again.
  const popup = (
    <div
      className="fixed z-50 flex items-center gap-2 rounded-lg bg-[#3d2f1f] px-3 py-2 text-xs text-[#f0e6d2] shadow-lg transition-all"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(event) => event.preventDefault()}
    >
      <span className="max-w-40 truncate">
        {isUploading ? "Uploading..." : `Attach audio to “${keyword}”`}
      </span>
      {!isUploading && (
        <label className="cursor-pointer rounded bg-[#f0e6d2] px-2 py-1 font-medium text-[#3d2f1f] hover:bg-[#e0d6c2] transition-colors">
          Choose file
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={attachAudio}
            disabled={isUploading}
            className="sr-only"
          />
        </label>
      )}
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(popup, document.body);
}