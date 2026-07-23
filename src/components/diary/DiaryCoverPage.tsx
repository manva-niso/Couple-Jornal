"use client";

export default function DiaryCoverPage() {
  return (
    <div className="diary-single-page diary-cover-leaf">
      <div className="diary-cover-frame">
        <div className="flex flex-col items-center pt-8 text-center">
          <p className="diary-kicker">A shared keepsake</p>
          <div className="diary-rule w-24" style={{ background: "linear-gradient(90deg, transparent, #785b49, transparent)" }} />
          <h2 className="diary-display text-balance text-5xl italic leading-none md:text-7xl">Chitthiya</h2>
          <p className="mt-6 max-w-xs font-serif text-sm leading-relaxed text-[#684f40] text-pretty">
            A collection of small days, held carefully and returned to whenever they matter.
          </p>
        </div>
        <div className="mx-auto max-w-[16rem] pb-6 text-center text-xs leading-5 text-[#81614f] text-pretty">
          Choose a page from the index to read, remember, or add to the story.
        </div>
      </div>
    </div>
  );
}
