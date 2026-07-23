"use client";

import React, { useEffect, useState } from "react";

type MediaItem = {
  id: string;
  type: "SOUND" | "MUSIC";
  url: string;
};

export default function MediaSettingsPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/media")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setMedia(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this media file?")) return;
    
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMedia((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Failed to delete media.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while deleting.");
    }
  };

  return (
    <div className="flex max-w-2xl flex-col gap-8 pb-12">
      <div>
        <h1 className="text-2xl font-semibold text-[#3d2f1f]">Media Library</h1>
        <p className="mt-1 text-sm text-[#3d2f1f]/70">
          Manage your uploaded sounds and background music.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <p className="text-sm text-[#3d2f1f]/60 animate-pulse">Loading media...</p>
        ) : media.length === 0 ? (
          <div className="rounded-2xl border border-[#3d2f1f]/10 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-[#3d2f1f]/60">No media files uploaded yet.</p>
          </div>
        ) : (
          media.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl border border-[#3d2f1f]/10 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-[#3d2f1f]">
                  {item.type === 'MUSIC' ? 'Background Music' : 'Sound Attachment'}
                </span>
                <span className="text-xs text-[#3d2f1f]/50 font-mono">
                  ID: {item.id}
                </span>
              </div>
              <button 
                onClick={() => handleDelete(item.id)}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}