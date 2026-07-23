"use client";

import { MarkViewContent, MarkViewProps } from '@tiptap/react';
import { useRef, useState } from 'react';

// Single global audio instance to prevent HTML5 audio pool exhaustion
let sharedAudioPlayer: HTMLAudioElement | null = null;
let activeAudioId: string | null = null;

export default function AudioKeywordMarkView(props: MarkViewProps) {
  const audioId = props.mark.attrs.audioId;
  const [isDeleting, setIsDeleting] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Initialize the singleton player once
    if (!sharedAudioPlayer) {
      sharedAudioPlayer = new Audio();
    }

    // If clicking the currently playing audio, toggle pause
    if (activeAudioId === audioId && !sharedAudioPlayer.paused) {
      sharedAudioPlayer.pause();
      activeAudioId = null;
      return;
    }

    // Otherwise, switch source and play using the existing pool element
    sharedAudioPlayer.pause();
    sharedAudioPlayer.src = `/api/media/${audioId}.mp3`;
    activeAudioId = audioId;
    
    sharedAudioPlayer.play().catch(err => console.error("Audio play failed:", err));
    
    sharedAudioPlayer.onended = () => {
      activeAudioId = null;
    };
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDeleting) return;
    
    const confirmDelete = window.confirm(`Remove audio attachment?`);
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      // Stop playback if this specific audio is currently playing
      if (activeAudioId === audioId && sharedAudioPlayer) {
        sharedAudioPlayer.pause();
        activeAudioId = null;
      }

      // 1. Delete physical file from the server
      await fetch(`/api/media/${audioId}`, { method: 'DELETE' });
      
      // 2. Locate position and unwrap the mark back into plain text
      if (containerRef.current) {
        const pos = props.editor.view.posAtDOM(containerRef.current, 0);
        if (typeof pos === 'number') {
          props.editor
            .chain()
            .focus()
            .setTextSelection(pos)
            .extendMarkRange('audioKeyword')
            .unsetMark('audioKeyword')
            .run();
        }
      }
    } catch (err) {
      console.error("Failed to delete media", err);
      setIsDeleting(false);
      alert("Failed to delete audio.");
    }
  };

  return (
    <span ref={containerRef} className="inline-flex items-baseline mx-0.5 group">
      <span 
        onClick={handlePlay} 
        className="cursor-pointer text-[#5b3a4f] underline decoration-[#5b3a4f]/30 underline-offset-4 font-medium transition-colors hover:text-[#3d2f1f]"
      >
        <MarkViewContent />
      </span>
      <button 
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        title="Remove audio"
        contentEditable={false}
        className="ml-0.5 text-[9px] text-red-500/70 hover:text-red-600 transition-colors cursor-pointer select-none"
        style={{ verticalAlign: 'sub', transform: 'translateY(1px)' }}
      >
        {isDeleting ? '...' : '❌'}
      </button>
    </span>
  );
}