"use client";

import { Howl } from "howler";
import { useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  url: string;
  label?: string | null;
  onRemove?: () => void;
}

function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

/**
 * Browser-only audio controls for a local object URL in Module 2. In Module 3
 * the exact same component receives the durable URL returned by media storage.
 */
export default function AudioPlayer({ url, label, onRemove }: AudioPlayerProps) {
  const howlRef = useRef<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const sound = new Howl({
      src: [url],
      html5: true,
      onload: () => {
        setDuration(sound.duration());
        setCurrentTime(0);
        setLoadError(false);
      },
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
      onend: () => {
        setIsPlaying(false);
        setCurrentTime(0);
      },
      onloaderror: () => setLoadError(true),
      onplayerror: () => setLoadError(true),
    });

    howlRef.current = sound;

    return () => {
      sound.unload();
      if (howlRef.current === sound) howlRef.current = null;
    };
  }, [url]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setInterval(() => {
      const position = howlRef.current?.seek();
      if (typeof position === "number") setCurrentTime(position);
    }, 250);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const togglePlayback = () => {
    const sound = howlRef.current;
    if (!sound) return;

    if (sound.playing()) sound.pause();
    else sound.play();
  };

  const handleSeek = (value: number) => {
    howlRef.current?.seek(value);
    setCurrentTime(value);
  };

  if (loadError) {
    return <p className="text-xs text-red-700">This audio file could not be played.</p>;
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-[#3d2f1f]/5 px-3 py-2">
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3d2f1f] text-xs text-[#f0e6d2]"
      >
        {isPlaying ? "II" : "▶"}
      </button>

      <div className="min-w-0 flex-1">
        {label && <p className="truncate text-xs font-medium text-[#3d2f1f]">{label}</p>}
        <div className="flex items-center gap-2 text-xs text-[#8a7a63]">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(currentTime, duration || currentTime)}
            onChange={(event) => handleSeek(Number(event.target.value))}
            aria-label="Audio playback position"
            className="min-w-0 flex-1 accent-[#5b3a4f]"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-[#8a7a63] underline underline-offset-2 hover:text-[#3d2f1f]"
        >
          Remove
        </button>
      )}
    </div>
  );
}
