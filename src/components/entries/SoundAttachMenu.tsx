"use client";

import { useRef } from "react";
import type { MockMediaAttachment } from "@/types";
import AudioPlayer from "@/components/entries/AudioPlayer";

interface SoundAttachMenuProps {
  media: MockMediaAttachment[];
  editable: boolean;
  onChange: (media: MockMediaAttachment[]) => void;
}

/**
 * Module 2 entry-level audio attachments. Files never leave the browser here:
 * each selected file is represented by an object URL. Module 3 replaces only
 * the URL-creation path with the media-upload API.
 */
export default function SoundAttachMenu({ media, editable, onChange }: SoundAttachMenuProps) {
  const createdUrls = useRef(new Set<string>());

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    createdUrls.current.add(url);
    onChange([
      ...media,
      {
        id: `media-${crypto.randomUUID()}`,
        keyword: null,
        url,
        type: "SOUND",
        label: file.name,
      },
    ]);

    // Permit choosing the same file again after removing it.
    event.target.value = "";
  };

  const removeAttachment = (attachment: MockMediaAttachment) => {
    if (createdUrls.current.delete(attachment.url)) {
      URL.revokeObjectURL(attachment.url);
    }
    onChange(media.filter((item) => item.id !== attachment.id));
  };

  return (
    <section className="flex flex-col gap-2" aria-label="Entry audio attachments">
      {media.map((attachment) => (
        <AudioPlayer
          key={attachment.id}
          url={attachment.url}
          label={
            attachment.keyword
              ? `${attachment.label ?? "Audio"} · “${attachment.keyword}”`
              : attachment.label
          }
          onRemove={editable ? () => removeAttachment(attachment) : undefined}
        />
      ))}

      {editable && (
        <label className="w-fit cursor-pointer rounded-full border border-[#3d2f1f]/20 px-3 py-1.5 text-xs font-medium text-[#3d2f1f] transition-colors hover:bg-[#3d2f1f]/5">
          Attach audio
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileSelected}
            className="sr-only"
          />
        </label>
      )}
    </section>
  );
}
