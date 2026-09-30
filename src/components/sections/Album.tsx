"use client";

import { useEffect, useState } from "react";
import { MediaThumb, useLightbox } from "../Lightbox";
import { Reveal } from "../Reveal";
import { CloseIcon } from "../icons";
import { usePresence } from "../usePresence";
import type { Photo } from "@/lib/types";

// The page only ever shows a few photos; the rest live in a full-screen
// gallery, so a 200-photo album doesn't push the wishes and gift sections
// far down the page.
const PREVIEW = 5;

export function Album({ photos }: { photos: Photo[] }) {
  const [gallery, setGallery] = useState(false);
  const galleryUi = usePresence(gallery);
  const { view, viewing } = useLightbox();
  const hidden = photos.length - PREVIEW;
  const videos = photos.filter((p) => p.video).length;
  const summary = videos ? `${photos.length - videos} ảnh & ${videos} video` : `${photos.length} ảnh`;

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {photos.slice(0, PREVIEW).map((p, i) => {
          const more = i === PREVIEW - 1 && hidden > 0;
          return (
            <Reveal key={p.id} className={i === 0 ? "col-span-2" : ""} delay={i * 90} variant="zoom">
              <button
                type="button"
                onClick={() => (more ? setGallery(true) : view(photos, i))}
                className={`relative block w-full overflow-hidden rounded-2xl bg-[#2e2822] ${i === 0 ? "aspect-[4/3]" : "aspect-[3/4]"}`}
              >
                <MediaThumb photo={p} sizes={i === 0 ? "(max-width: 480px) 100vw, 440px" : "(max-width: 480px) 50vw, 220px"} />
                {more && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/45 font-serif text-4xl text-white">
                    +{hidden}
                  </span>
                )}
              </button>
            </Reveal>
          );
        })}
      </div>
      {hidden > 0 && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setGallery(true)}
            className="rounded-full bg-accent px-6 py-2.5 text-sm tracking-wide text-white shadow-md"
          >
            XEM TẤT CẢ {summary.toUpperCase()}
          </button>
        </div>
      )}
      {galleryUi.mounted && (
        <Gallery
          photos={photos}
          title={summary}
          onPick={(i) => view(photos, i)}
          onClose={() => setGallery(false)}
          paused={viewing}
          state={galleryUi.state}
        />
      )}
    </>
  );
}

/** Full-screen grid of every item; tapping one opens the lightbox on top. */
function Gallery({
  photos,
  title,
  onPick,
  onClose,
  paused,
  state,
}: {
  photos: Photo[];
  title: string;
  onPick: (i: number) => void;
  onClose: () => void;
  /** The lightbox is open and owns the Escape key. */
  paused: boolean;
  state: "open" | "closed";
}) {
  useEffect(() => {
    if (paused) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused, onClose]);

  return (
    <div data-state={state} className="sheet fixed inset-0 z-[55] flex flex-col bg-cream" role="dialog" aria-label="Album ảnh cưới">
      <div className="mx-auto flex h-14 w-full max-w-[480px] shrink-0 items-center justify-between border-b border-line px-4">
        <p className="font-serif text-lg">
          Album cưới <span className="text-sm text-muted">· {title}</span>
        </p>
        <button type="button" aria-label="Đóng album" onClick={onClose} className="p-1">
          <CloseIcon width={24} height={24} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto grid max-w-[480px] grid-cols-3 gap-1 p-1 pb-8">
          {photos.map((p, i) => (
            <button key={p.id} type="button" onClick={() => onPick(i)} className="relative aspect-square overflow-hidden bg-[#2e2822]">
              <MediaThumb photo={p} sizes="(max-width: 480px) 33vw, 160px" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
