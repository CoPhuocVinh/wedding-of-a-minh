"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "../Reveal";
import { ChevronIcon, CloseIcon } from "../icons";
import type { Photo } from "@/lib/types";
import { announceVideo, videoEmbedUrl } from "@/lib/video";

// The page only ever shows a few photos; the rest live in a full-screen
// gallery, so a 200-photo album doesn't push the wishes and gift sections
// far down the page.
const PREVIEW = 5;

function Thumb({ photo, sizes }: { photo: Photo; sizes: string }) {
  return (
    <>
      <Image
        src={photo.url}
        alt={photo.alt}
        fill
        quality={90}
        // Video thumbnails come from YouTube/Drive CDNs as is.
        unoptimized={!!photo.video}
        // A Drive video's thumbnail can take a few minutes to exist.
        onError={(e) => (e.currentTarget.style.visibility = "hidden")}
        sizes={sizes}
        className="object-cover transition duration-500 hover:scale-105"
      />
      {photo.video && <PlayBadge />}
    </>
  );
}

export function Album({ photos }: { photos: Photo[] }) {
  const [gallery, setGallery] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const hidden = photos.length - PREVIEW;
  const videos = photos.filter((p) => p.video).length;
  const summary = videos ? `${photos.length - videos} ảnh & ${videos} video` : `${photos.length} ảnh`;

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {photos.slice(0, PREVIEW).map((p, i) => {
          const more = i === PREVIEW - 1 && hidden > 0;
          return (
            <Reveal key={p.id} className={i === 0 ? "col-span-2" : ""} delay={i * 60}>
              <button
                type="button"
                onClick={() => (more ? setGallery(true) : setActive(i))}
                className={`relative block w-full overflow-hidden rounded-2xl bg-[#2e2822] ${i === 0 ? "aspect-[4/3]" : "aspect-[3/4]"}`}
              >
                <Thumb photo={p} sizes={i === 0 ? "(max-width: 480px) 100vw, 440px" : "(max-width: 480px) 50vw, 220px"} />
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
      {gallery && <Gallery photos={photos} title={summary} onPick={setActive} onClose={() => setGallery(false)} paused={active !== null} />}
      {active !== null && <Lightbox photos={photos} index={active} onChange={setActive} />}
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
}: {
  photos: Photo[];
  title: string;
  onPick: (i: number) => void;
  onClose: () => void;
  /** The lightbox is open and owns the Escape key. */
  paused: boolean;
}) {
  useEffect(() => {
    if (paused) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused, onClose]);

  return (
    <div className="fixed inset-0 z-[55] flex flex-col bg-cream" role="dialog" aria-label="Album ảnh cưới">
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
              <Thumb photo={p} sizes="(max-width: 480px) 33vw, 160px" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Lightbox({
  photos,
  index,
  onChange,
}: {
  photos: Photo[];
  index: number;
  onChange: (i: number | null) => void;
}) {
  const touchX = useRef<number | null>(null);
  const item = photos[index];
  const isVideo = !!item.video;

  // Pause the background music while a video is on screen.
  useEffect(() => {
    if (!isVideo) return;
    announceVideo(true);
    return () => announceVideo(false);
  }, [isVideo]);

  const go = useCallback(
    (step: number) => onChange((index + step + photos.length) % photos.length),
    [index, photos.length, onChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onChange(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onChange]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      {item.video ? (
        <iframe
          key={item.id}
          src={videoEmbedUrl(item.video)}
          title={item.alt || "Video cưới"}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className={item.video.vertical ? "aspect-[9/16] h-[80svh] max-w-full" : "aspect-video w-full max-w-3xl"}
        />
      ) : (
        <div className="relative h-[80svh] w-full max-w-3xl">
          <Image src={item.url} alt={item.alt} fill quality={90} sizes="100vw" className="object-contain" />
        </div>
      )}
      <button type="button" aria-label="Đóng" onClick={() => onChange(null)} className="absolute top-4 right-4 p-2 text-white">
        <CloseIcon width={26} height={26} />
      </button>
      <button type="button" aria-label="Ảnh trước" onClick={() => go(-1)} className="absolute left-2 p-3 text-white/80">
        <ChevronIcon width={28} height={28} className="rotate-180" />
      </button>
      <button type="button" aria-label="Ảnh sau" onClick={() => go(1)} className="absolute right-2 p-3 text-white/80">
        <ChevronIcon width={28} height={28} />
      </button>
      <p className="absolute bottom-5 text-sm text-white/70">
        {index + 1} / {photos.length}
      </p>
    </div>
  );
}

function PlayBadge() {
  return (
    <span className="absolute inset-0 flex items-center justify-center bg-black/15">
      <span className="flex size-14 items-center justify-center rounded-full bg-white/85 shadow-lg backdrop-blur-sm">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="#a8704a" aria-hidden>
          <path d="M8 5.5v13l11-6.5z" />
        </svg>
      </span>
    </span>
  );
}
