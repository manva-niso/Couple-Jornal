"use client";

import type { Editor } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MockMediaAttachment } from "@/types";
import { useViewStore } from "@/store/useViewStore";

interface KeywordSoundBinderProps {
  entryId: string;
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

  // --- Recording state ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!editor) return;

    const updateSelection = () => {
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
      const POPUP_WIDTH_ESTIMATE = 260;
      const POPUP_HEIGHT_ESTIMATE = 44;
      setKeyword(selectedText);
      setSelectionRange({ from, to });
      setPosition({
        top: Math.min(coordinates.bottom + 8, window.innerHeight - POPUP_HEIGHT_ESTIMATE - 12),
        left: Math.max(12, Math.min(coordinates.left, window.innerWidth - POPUP_WIDTH_ESTIMATE - 12)),
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

  // Shared upload logic — used by both the file picker and the recorder,
  // so there's exactly one place that talks to /api/media/upload.
  const uploadAndAttach = async (file: File) => {
    if (!keyword || !selectionRange) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entryId", entryId);
      formData.append("mediaType", "SOUND");
      formData.append("keyword", keyword);

      const response = await fetch("/api/media/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Failed to upload media");

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
          .setMark("audioKeyword", { audioId: data.id })
          .run();
      }

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

  const handleFilePicked = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadAndAttach(file);
    event.target.value = "";
  };

  const startRecording = async () => {
    // Capture the current selection BEFORE the browser's mic permission
    // prompt steals focus — otherwise the editor's blur handler can clear
    // `selectionRange` while the user is still answering the prompt.
    const capturedRange = selectionRange;
    const capturedKeyword = keyword;
    if (!capturedRange || !capturedKeyword) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if (recordTimerRef.current) window.clearInterval(recordTimerRef.current);
        setRecordSeconds(0);

        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: "audio/webm" });

        // Restore the captured selection so uploadAndAttach's checks pass,
        // since editor focus/selection may have shifted during recording.
        setSelectionRange(capturedRange);
        setKeyword(capturedKeyword);
        await uploadAndAttach(file);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = window.setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (error) {
      console.error("Microphone access error:", error);
      alert("Couldn't access the microphone. Check your browser's permission settings.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const closeMenu = () => {
    setKeyword("");
    setPosition(null);
    setSelectionRange(null);
  };

  // Close (and cancel any in-progress recording) the instant the page
  // turns away from this entry — the popup is portaled to document.body,
  // so it's otherwise invisible to react-pageflip's page transitions and
  // would just keep floating over whatever entry you flip to next.
  const currentEntryId = useViewStore((s) => s.currentEntryId);
  useEffect(() => {
    if (currentEntryId === entryId) return;
    if (isRecording) stopRecording();
    closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEntryId, entryId]);

  useEffect(() => {
    // Cleanup if the component unmounts mid-recording.
    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (recordTimerRef.current) window.clearInterval(recordTimerRef.current);
    };
  }, []);

  if (!position || !keyword) return null;

  const popup = (
    <div
      className="fixed z-50 flex items-center gap-2 rounded-lg bg-[#3d2f1f] px-3 py-2 text-xs text-[#f0e6d2] shadow-lg transition-all"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(event) => event.preventDefault()}
    >
      {isRecording ? (
        <>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            Recording… {String(Math.floor(recordSeconds / 60)).padStart(1, "0")}:
            {String(recordSeconds % 60).padStart(2, "0")}
          </span>
          <button
            onClick={stopRecording}
            className="rounded bg-red-600 px-2 py-1 font-medium text-white hover:bg-red-700 transition-colors"
          >
            Stop
          </button>
        </>
      ) : (
        <>
          <span className="max-w-40 truncate">
            {isUploading ? "Uploading…" : `Attach audio to "${keyword}"`}
          </span>
          {!isUploading && (
            <>
              <button
                onClick={startRecording}
                className="rounded bg-[#5b3a4f] px-2 py-1 font-medium text-[#f0e6d2] hover:opacity-90 transition-opacity"
              >
                🎙 Record
              </button>
              <label className="cursor-pointer rounded bg-[#f0e6d2] px-2 py-1 font-medium text-[#3d2f1f] hover:bg-[#e0d6c2] transition-colors">
                Choose file
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFilePicked}
                  disabled={isUploading}
                  className="sr-only"
                />
              </label>
            </>
          )}
        </>
      )}
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(popup, document.body);
}