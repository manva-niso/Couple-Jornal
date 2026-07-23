"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";
import type { MockMediaAttachment } from "@/types";
import KeywordSoundBinder from "@/components/entries/KeywordSoundBinder";

interface EntryEditorProps {
  entryId: string;
  content: string; // HTML string — Tiptap reads/writes HTML via getHTML()
  editable: boolean;
  media: MockMediaAttachment[];
  onSave: (html: string) => void;
  onMediaChange: (media: MockMediaAttachment[]) => void;
  onFlipNext?: () => void;
  onFlipPrev?: () => void;
}

export default function EntryEditor({
  entryId,
  content,
  editable,
  media,
  onSave,
  onMediaChange,
  onFlipNext,
  onFlipPrev,
}: EntryEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none whitespace-pre-wrap leading-relaxed text-[#3d2f1f]",
      },
    },
    // Tiptap's SSR content check can complain in Next.js if this isn't set —
    // safe to disable since we always render this inside a "use client" component.
    immediatelyRender: false,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const stop = (e: Event) => {
      e.stopPropagation();
    };

    const types = ["mousedown", "touchstart", "pointerdown"] as const;
    for (const type of types) {
      el.addEventListener(type, stop);
    }

    return () => {
      for (const type of types) {
        el.removeEventListener(type, stop);
      }
    };
    // `editor` starts null (immediatelyRender: false) and this component
    // returns null until it's ready, so containerRef isn't attached to any
    // DOM node on the effect's first run. Re-run once `editor` flips to
    // truthy so we actually grab the real element instead of silently
    // no-op'ing forever.
  }, [editor]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || (!onFlipNext && !onFlipPrev)) return;

    const DRAG_THRESHOLD = 24;
    let start: { x: number; y: number } | null = null;
    let flipped = false;

    const onDown = (clientX: number, clientY: number) => {
      start = { x: clientX, y: clientY };
      flipped = false;
    };

    const onMove = (clientX: number, clientY: number) => {
      if (!start || flipped) return;

      const dx = clientX - start.x;
      const dy = clientY - start.y;
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      if (Math.abs(dx) <= Math.abs(dy)) return;

      flipped = true;
      if (dx > 0) onFlipNext?.();
      else onFlipPrev?.();
    };

    const reset = () => {
      start = null;
    };

    const onMouseDown = (e: MouseEvent) => onDown(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onDown(t.clientX, t.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", reset);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", reset);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", reset);
      el.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", reset);
    };
  }, [onFlipNext, onFlipPrev]);

  // Keep the editor's actual content in sync if a different entry gets
  // swapped in without this component unmounting (e.g. navigating between
  // stick/index selections quickly).
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId]);

  // Keep editability in sync with the permission check from the parent
  // (e.g. the window closing mid-session while this stays mounted).
  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  if (!editor) return null;

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-2"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <EditorContent editor={editor} />
      {editable && (
        <KeywordSoundBinder
          editor={editor}
          onAttach={(attachment) => onMediaChange([...media, attachment])}
        />
      )}
      {editable && (
        <button
          onClick={() => onSave(editor.getHTML())}
          className="w-fit rounded-full bg-[#3d2f1f] px-4 py-1.5 text-sm font-medium text-[#f0e6d2] transition-opacity hover:opacity-90"
        >
          Save
        </button>
      )}
    </div>
  );
}