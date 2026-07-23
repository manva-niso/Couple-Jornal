"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect, useRef } from "react";
import type { MockMediaAttachment } from "@/types";
import KeywordSoundBinder from "@/components/entries/KeywordSoundBinder";
import { AudioKeywordExtension } from "./AudioKeywordExtension";

interface EntryEditorProps {
  entryId: string;
  content: string; // HTML string
  editable: boolean;
  media: MockMediaAttachment[];
  onSave: (html: string) => void;
  onMediaChange: (media: MockMediaAttachment[]) => void;
  onFlipNext?: () => void;
  onFlipPrev?: () => void;
}

// Global variables to prevent overlapping audio instances during editing
let currentInlineAudio: HTMLAudioElement | null = null;
let currentInlineAudioId: string | null = null;

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
    extensions: [
      StarterKit,
      AudioKeywordExtension,
      Link.configure({
        openOnClick: false,
        autolink: false, 
        HTMLAttributes: {
          class:
            "cursor-pointer text-[#5b3a4f] underline decoration-[#5b3a4f]/30 underline-offset-4 font-medium transition-colors hover:text-[#3d2f1f]",
        },
      }),
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none whitespace-pre-wrap leading-relaxed text-[#3d2f1f]",
      },
      // Intercept clicks on keyword audio elements inside the editor
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement;
        const audioElement = target.closest("[data-audio-id]") as HTMLElement;
        
        if (audioElement) {
          const audioId = audioElement.getAttribute("data-audio-id");
          if (audioId) {
            event.preventDefault();
            
            if (currentInlineAudio) {
              currentInlineAudio.pause();
              if (currentInlineAudioId === audioId) {
                currentInlineAudio = null;
                currentInlineAudioId = null;
                return true;
              }
            }

            currentInlineAudio = new Audio(`/api/media/${audioId}.mp3`);
            currentInlineAudioId = audioId;
            currentInlineAudio.play().catch(err => console.error("Audio play failed:", err));
            
            currentInlineAudio.onended = () => {
              currentInlineAudio = null;
              currentInlineAudioId = null;
            };
            
            return true;
          }
        }
        return false;
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const stop = (e: Event) => e.stopPropagation();
    const types = ["mousedown", "touchstart", "pointerdown"] as const;
    for (const type of types) el.addEventListener(type, stop);
    return () => {
      for (const type of types) el.removeEventListener(type, stop);
    };
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

    const reset = () => { start = null; };

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

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [entryId, content]);

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
          entryId={entryId}
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