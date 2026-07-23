"use client";

export default function DiaryCoverPage() {
  return (
    <div className="diary-single-page flex flex-col justify-between">
      <div>
        <p className="diary-kicker">A shared keepsake</p>
        <div className="diary-rule" />
        <h2 className="diary-display text-5xl italic leading-none md:text-7xl">Chitthiya</h2>
        <p className="mt-5 max-w-xs font-serif text-sm leading-7 text-[#684f40]">
          A collection of small days, held carefully and returned to whenever they matter.
        </p>
      </div>
      <div className="border-l-2 border-[#81614f] pl-4 text-xs leading-5 text-[#81614f]">
        Choose a page from the index to read, remember, or add to the story.
      </div>
    </div>
  );
}