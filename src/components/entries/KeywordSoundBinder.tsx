"use client";

import type { Editor } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import type { MockMediaAttachment } from "@/types";

interface KeywordSoundBinderProps {
  editor: Editor | null;
  onAttach: (attachment: MockMediaAttachment) => void;
}

interface MenuPosition {
  top: number;
  left: number;
}

/**
 * A small selection toolbar for Module 2. It records the selected text in the
 * attachment's `keyword` field; Module 3 will preserve that same metadata when
 * it uploads the selected audio file.
 */
export default function KeywordSoundBinder({ editor, onAttach }: KeywordSoundBinderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [keyword, setKeyword] = useState("");
  const [position, setPosition] = useState<MenuPosition | null>(null);

  useEffect(() => {
    if (!editor) return;

    const updateSelection = () => {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, " ").trim();

      if (!selectedText) {
        setKeyword("");
        setPosition(null);
        return;
      }

      const coordinates = editor.view.coordsAtPos(from);
      setKeyword(selectedText);
      setPosition({
        top: coordinates.bottom + 8,
        left: Math.max(12, coordinates.left),
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

  const attachAudio = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !keyword) return;

    const url = URL.createObjectURL(file);
    onAttach({
      id: `media-${crypto.randomUUID()}`,
      keyword,
      url,
      type: "SOUND",
      label: file.name,
    });
    event.target.value = "";
    setKeyword("");
    setPosition(null);
  };

  if (!position || !keyword) return null;

  return (
    <div
      className="fixed z-50 flex items-center gap-2 rounded-lg bg-[#3d2f1f] px-3 py-2 text-xs text-[#f0e6d2] shadow-lg"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(event) => event.preventDefault()}
    >
      <span className="max-w-40 truncate">Attach audio to “{keyword}”</span>
      <label className="cursor-pointer rounded bg-[#f0e6d2] px-2 py-1 font-medium text-[#3d2f1f]">
        Choose file
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={attachAudio}
          className="sr-only"
        />
      </label>
    </div>
  );
}
