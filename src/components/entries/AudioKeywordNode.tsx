"use client";

import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import { useState } from 'react';

let currentInlineAudio: HTMLAudioElement | null = null;
let currentInlineAudioId: string | null = null;

export default function AudioKeywordNode(props: NodeViewProps) {
  const { audioId } = props.node.attrs;
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentInlineAudio) {
      currentInlineAudio.pause();
      if (currentInlineAudioId === audioId) {
        currentInlineAudio = null;
        currentInlineAudioId = null;
        return;
      }
    }

    currentInlineAudio = new Audio(`/api/media/${audioId}.mp3`);
    currentInlineAudioId = audioId;
    currentInlineAudio.play().catch(err => console.error("Audio play failed:", err));
    
    currentInlineAudio.onended = () => {
      currentInlineAudio = null;
      currentInlineAudioId = null;
    };
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDeleting) return;
    
    const currentText = props.node.textContent;
    const confirmDelete = window.confirm(`Remove audio from "${currentText}"?`);
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      // 1. Delete physical file from the server
      await fetch(`/api/media/${audioId}`, { method: 'DELETE' });
      
      // 2. Unwrap the text content back into normal plain text
      const pos = props.getPos();
      if (typeof pos === 'number') {
        props.editor
          .chain()
          .focus()
          .deleteRange({ from: pos, to: pos + props.node.nodeSize })
          .insertContentAt(pos, currentText)
          .run();
      }
    } catch (err) {
      console.error("Failed to delete media", err);
      setIsDeleting(false);
      alert("Failed to delete audio.");
    }
  };

  return (
    <NodeViewWrapper as="div" className="inline-flex items-baseline mx-0.5 group">
      <span 
        onClick={handlePlay} 
        className="cursor-pointer text-[#5b3a4f] underline decoration-[#5b3a4f]/30 underline-offset-4 font-medium transition-colors hover:text-[#3d2f1f]"
      >
        {/* Changed to as="div" with inline class to satisfy TypeScript */}
        <NodeViewContent as="div" className="inline" />
      </span>
      <button 
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        title="Remove audio"
        className="ml-0.5 text-[9px] text-red-500/70 hover:text-red-600 transition-colors cursor-pointer"
        style={{ verticalAlign: 'sub', transform: 'translateY(1px)' }}
      >
        {isDeleting ? '...' : '❌'}
      </button>
    </NodeViewWrapper>
  );
}