"use client";

import { useState } from "react";
import type { MockMediaAttachment } from "@/types";

interface SoundAttachMenuProps {
  entryId: string; 
  media: MockMediaAttachment[];
  editable: boolean;
  onChange: (media: MockMediaAttachment[]) => void;
  wrapperClassName?: string;
}

export default function SoundAttachMenu({
  entryId,
  media,
  editable,
  onChange,
  wrapperClassName = "pt-2",
}: SoundAttachMenuProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entryId", entryId);
      formData.append("mediaType", "SOUND");

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload media");
      }

      const data = await response.json();

      onChange([
        ...media,
        {
          id: data.id,
          keyword: null,
          url: `/api/media/${data.id}.mp3`,
          type: "SOUND",
          label: file.name,
        },
      ]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload sound.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  // If not editable, we don't need to show the upload button at all
  if (!editable) return null;

  return (
    <div className={wrapperClassName}>
      <label
        className={`w-fit cursor-pointer rounded-full border border-[#3d2f1f]/20 px-3 py-1.5 text-xs font-medium text-[#3d2f1f] transition-colors ${
          isUploading ? "opacity-50 cursor-wait" : "hover:bg-[#3d2f1f]/5"
        }`}
      >
        {isUploading ? "Uploading..." : "Attach audio"}
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileSelected}
          disabled={isUploading}
          className="sr-only"
        />
      </label>
    </div>
  );
}