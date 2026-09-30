"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { VIDEO_EVENT } from "@/lib/video";
import { CloseIcon, MenuIcon } from "../icons";
import { Envelope } from "./Envelope";

type NavItem = { id: string; label: string };

type Props = {
  children: ReactNode;
  envelope: Omit<Parameters<typeof Envelope>[0], "onOpen">;
  monogram: string;
  nav: NavItem[];
  musicUrl: string;
  showWishButton: boolean;
};

export function InvitationShell({ children, envelope, monogram, nav, musicUrl, showWishButton }: Props) {
  const [envelopeGone, setEnvelopeGone] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    document.body.style.overflow = envelopeGone && !menuOpen ? "" : "hidden";
  }, [envelopeGone, menuOpen]);

  // Step aside while an album video plays; resume only if we were playing.
  useEffect(() => {
    let resume = false;
    const onVideo = (e: Event) => {
      const a = audio.current;
      if (!a) return;
      if ((e as CustomEvent<boolean>).detail) {
        resume = !a.paused;
        a.pause();
        setPlaying(false);
      } else if (resume) {
        resume = false;
        a.play().then(() => setPlaying(true), () => {});
      }
    };
    window.addEventListener(VIDEO_EVENT, onVideo);
    return () => window.removeEventListener(VIDEO_EVENT, onVideo);
  }, []);

  function handleOpen() {
    // Browsers only allow audio after a user gesture, which this tap is.
    audio.current?.play().then(() => setPlaying(true), () => {});
    setTimeout(() => setEnvelopeGone(true), 1600);
  }

  function toggleMusic() {
    const a = audio.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setPlaying(true), () => {});
    else {
      a.pause();
      setPlaying(false);
    }
  }

  return (
    <>
      {musicUrl && <audio ref={audio} src={musicUrl} loop preload="auto" />}

      <header className="fixed inset-x-0 top-0 z-30 mx-auto flex h-14 max-w-[480px] items-center justify-between border-b border-line/60 bg-cream/85 px-5 backdrop-blur">
        <span className="font-serif text-lg tracking-[0.2em] text-ink">{monogram}</span>
        <button type="button" aria-label="Mở menu" onClick={() => setMenuOpen(true)} className="p-1 text-ink">
          <MenuIcon width={22} height={22} />
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 mx-auto max-w-[480px] bg-cream/97 backdrop-blur-sm">
          <div className="flex h-14 items-center justify-between px-5">
            <span className="font-serif text-lg tracking-[0.2em]">{monogram}</span>
            <button type="button" aria-label="Đóng menu" onClick={() => setMenuOpen(false)} className="p-1">
              <CloseIcon width={22} height={22} />
            </button>
          </div>
          <nav className="mt-8 flex flex-col items-center gap-6">
            {nav.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMenuOpen(false)}
                className="font-serif text-2xl text-ink hover:text-accent"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}

      <main className="mx-auto min-h-svh max-w-[480px] overflow-x-clip bg-cream shadow-[0_0_40px_rgba(90,60,30,.08)]">
        {children}
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 mx-auto flex max-w-[480px] items-end justify-end gap-3 px-4">
        {showWishButton && (
          <a
            href="#wishes"
            className="pointer-events-auto rounded-full bg-card/95 px-4 py-2 text-sm text-ink shadow-md ring-1 ring-line"
          >
            Gửi lời chúc 💌
          </a>
        )}
        {musicUrl && (
          <button
            type="button"
            onClick={toggleMusic}
            aria-label={playing ? "Tắt nhạc" : "Bật nhạc"}
            className="pointer-events-auto flex size-12 items-center justify-center gap-[3px] rounded-full bg-accent shadow-lg"
          >
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-4 w-[3px] origin-bottom rounded-full bg-white"
                style={{
                  animation: playing ? `eq 0.9s ${i * 0.15}s ease-in-out infinite` : "none",
                  transform: playing ? undefined : "scaleY(0.35)",
                }}
              />
            ))}
          </button>
        )}
      </div>

      {!envelopeGone && <Envelope {...envelope} onOpen={handleOpen} />}
    </>
  );
}
