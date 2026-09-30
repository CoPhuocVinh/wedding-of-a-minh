"use client";

import Image from "next/image";
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Photo } from "@/lib/types";
import { announceVideo, videoEmbedUrl } from "@/lib/video";
import { ChevronIcon, CloseIcon } from "./icons";
import { usePresence } from "./usePresence";

// One full-screen viewer for the whole invitation. Any photo or video opens in
// it through <Zoomable>; the items passed along are what swiping walks through.

type LightboxApi = {
  view: (items: Photo[], index: number) => void;
  /** True while the viewer is open (it then owns the Escape key). */
  viewing: boolean;
};

const LightboxContext = createContext<LightboxApi | null>(null);

export function useLightbox() {
  const api = use(LightboxContext);
  if (!api) throw new Error("useLightbox needs <LightboxProvider>");
  return api;
}

export function LightboxProvider({ children }: { children: ReactNode }) {
  // Items and index outlive `viewing`, so the photo is still there as it fades out.
  const [items, setItems] = useState<Photo[]>([]);
  const [index, setIndex] = useState(0);
  const [viewing, setViewing] = useState(false);
  const ui = usePresence(viewing);

  const view = useCallback((next: Photo[], at: number) => {
    setItems(next);
    setIndex(at);
    setViewing(true);
  }, []);
  const close = useCallback(() => setViewing(false), []);
  const api = useMemo(() => ({ view, viewing }), [view, viewing]);

  return (
    <LightboxContext value={api}>
      {children}
      {ui.mounted && items[index] && <Lightbox photos={items} index={index} onChange={setIndex} onClose={close} state={ui.state} />}
    </LightboxContext>
  );
}

/** Makes its children open `items[index]` in the viewer. */
export function Zoomable({
  items,
  index = 0,
  className = "",
  label,
  children,
}: {
  items: Photo[];
  index?: number;
  className?: string;
  label?: string;
  children: ReactNode;
}) {
  const { view } = useLightbox();
  return (
    <button
      type="button"
      onClick={() => view(items, index)}
      aria-label={label ?? (items[index]?.video ? "Phát video" : "Xem ảnh lớn")}
      className={`cursor-zoom-in ${className}`}
    >
      {children}
    </button>
  );
}

/** A photo (or a video's thumbnail with a play badge) filling its positioned parent. */
export function MediaThumb({ photo, sizes, className = "" }: { photo: Photo; sizes: string; className?: string }) {
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
        className={`object-cover transition duration-500 hover:scale-105 ${className}`}
      />
      {photo.video && <PlayBadge />}
    </>
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

function Lightbox({
  photos,
  index,
  onChange,
  onClose,
  state,
}: {
  photos: Photo[];
  index: number;
  onChange: (i: number) => void;
  onClose: () => void;
  state: "open" | "closed";
}) {
  const touchX = useRef<number | null>(null);
  const item = photos[index];
  const isVideo = !!item.video;
  const many = photos.length > 1;

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
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  return (
    <div
      data-state={state}
      role="dialog"
      aria-label={isVideo ? "Xem video" : "Xem ảnh"}
      className="ov fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
      // Tapping the dark area outside the photo frame closes the viewer.
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null || !many) return;
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
          className={`zoom-in ${item.video.vertical ? "aspect-[9/16] h-[80svh] max-w-full" : "aspect-video w-full max-w-3xl"}`}
        />
      ) : (
        // Re-keyed per photo so each one eases in as you swipe.
        <div key={item.id} className="zoom-in relative h-[80svh] w-full max-w-3xl">
          <Image src={item.url} alt={item.alt} fill quality={90} sizes="100vw" className="object-contain" />
        </div>
      )}
      <button type="button" aria-label="Đóng" onClick={onClose} className="absolute top-4 right-4 p-2 text-white">
        <CloseIcon width={26} height={26} />
      </button>
      {many && (
        <>
          <button type="button" aria-label="Ảnh trước" onClick={() => go(-1)} className="absolute left-2 p-3 text-white/80">
            <ChevronIcon width={28} height={28} className="rotate-180" />
          </button>
          <button type="button" aria-label="Ảnh sau" onClick={() => go(1)} className="absolute right-2 p-3 text-white/80">
            <ChevronIcon width={28} height={28} />
          </button>
          <p className="pointer-events-none absolute bottom-5 text-sm text-white/70">
            {index + 1} / {photos.length}
          </p>
        </>
      )}
    </div>
  );
}
