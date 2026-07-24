"use client";

import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import type { MockMediaAttachment } from "@/types";

// A warm, varied palette so each attached sound is visually distinct at a
// glance, cycling by position rather than every dot being the same color.
const DOT_COLORS = [
  "#c9a227", // gold
  "#8a4b2e", // rust brown
  "#2f6f6a", // teal
  "#a13d1f", // burnt orange
  "#6b4226", // dark brown
  "#c17a3d", // amber
  "#4c6b52", // olive green
  "#9c3b4f", // wine
];

interface SoundDotProps {
  media: MockMediaAttachment;
  color: string;
  editable: boolean;
  onRemove: () => void;
}

function SoundDot({ media, color, editable, onRemove }: SoundDotProps) {
  const howlRef = useRef<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const sound = new Howl({
      src: [`/api/media/${media.id}.mp3`],
      html5: true,
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
      onend: () => setIsPlaying(false),
      onloaderror: () => setLoadError(true),
      onplayerror: () => setLoadError(true),
    });
    howlRef.current = sound;
    return () => {
      sound.unload();
      if (howlRef.current === sound) howlRef.current = null;
    };
  }, [media.id]);

  const toggle = () => {
    const sound = howlRef.current;
    if (!sound) return;
    if (sound.playing()) sound.pause();
    else sound.play();
  };

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={toggle}
        title={media.label ?? "Untitled sound"}
        aria-label={`${isPlaying ? "Pause" : "Play"} ${media.label ?? "sound"}`}
        disabled={loadError}
        style={{ backgroundColor: loadError ? "#dc2626" : color }}
        className={`h-2.5 w-2.5 rounded-full ring-offset-1 transition-all ${
          isPlaying ? "scale-125 ring-2 ring-[#3d2f1f]/40 ring-offset-[#faf6ec]" : "hover:scale-110"
        }`}
      />
      {editable && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${media.label ?? "sound"}`}
          className="absolute -bottom-1.5 -right-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#faf6ec] text-[7px] leading-none text-[#8a7a63] opacity-0 shadow-sm transition-opacity hover:text-[#3d2f1f] group-hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
}

interface SoundDotsProps {
  entryId: string;
  media: MockMediaAttachment[];
  editable: boolean;
  onChange: (media: MockMediaAttachment[]) => void;
  onRemove: (attachmentId: string) => void | Promise<void>;
}

export default function SoundDots({ entryId, media, editable, onChange, onRemove }: SoundDotsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const generalMedia = media.filter((m) => !m.keyword);

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entryId", entryId);
      formData.append("mediaType", "SOUND");

      const response = await fetch("/api/media/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Failed to upload media");
      const data = await response.json();

      onChange([
        ...media,
        { id: data.id, keyword: null, url: `/api/media/${data.id}.mp3`, type: "SOUND", label: file.name },
      ]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload sound.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  if (!editable && generalMedia.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {generalMedia.map((m, i) => (
        <SoundDot
          key={m.id}
          media={m}
          color={DOT_COLORS[i % DOT_COLORS.length]}
          editable={editable}
          onRemove={() => onRemove(m.id)}
        />
      ))}

      {editable && (
        <label
          title="Attach audio"
          aria-label="Attach audio"
          className={`relative flex h-4 w-4 items-center justify-center rounded-full bg-[#3d2f1f] text-[#f0e6d2] shadow-sm transition-transform ${
            isUploading ? "cursor-wait opacity-50" : "cursor-pointer hover:scale-110"
          }`}
        >
          <span className="pointer-events-none select-none text-[11px] font-semibold leading-none">+</span>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileSelected}
            disabled={isUploading}
            className="sr-only"
          />
        </label>
      )}
    </div>
  );
}