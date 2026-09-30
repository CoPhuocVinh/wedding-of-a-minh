"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { VIDEO_EVENT } from "@/lib/video";
import { LightboxProvider } from "../Lightbox";
import { CloseIcon, MenuIcon } from "../icons";
import { usePresence } from "../usePresence";
import { Envelope, type CardInfo, type Entrance } from "./Envelope";

type NavItem = { id: string; label: string };

type Props = {
  children: ReactNode;
  envelope: CardInfo;
  monogram: string;
  nav: NavItem[];
  musicUrl: string;
  showWishButton: boolean;
};

// How long the page must rest at the top (or bottom) before pulling further
// brings the card back, so the momentum of a fast scroll doesn't do it by accident.
const SETTLE_MS = 600;
const WHEEL_PULL = 150;
const TOUCH_PULL = 80;

export function InvitationShell({ children, envelope, monogram, nav, musicUrl, showWishButton }: Props) {
  // The closed card covering the page, named by how it arrived; null once opened.
  const [card, setCard] = useState<Entrance | null>("fade");
  // True from the tap that opens the card until it is shut again; starts the
  // hero's entrance (see `data-revealed` in globals.css).
  const [revealed, setRevealed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = usePresence(menuOpen);
  const audio = useRef<HTMLAudioElement>(null);
  const firstOpen = useRef(true);

  useEffect(() => {
    document.body.style.overflow = card || menuOpen ? "hidden" : "";
  }, [card, menuOpen]);

  // Scrolling past either end of the page brings the card back: past the top
  // it folds shut; past the bottom the page rolls up like a scroll (a hidden
  // ending for guests who read all the way down).
  useEffect(() => {
    if (card) return;
    const edgeNow = () => {
      if (window.scrollY <= 0) return "top";
      const end = document.documentElement.scrollHeight - window.innerHeight;
      return window.scrollY >= end - 2 ? "bottom" : null;
    };
    let edge = edgeNow();
    let since = edge ? Date.now() : 0;
    let pull = 0;
    let touchY: number | null = null;
    const settled = () => edge !== null && Date.now() - since > SETTLE_MS;
    const bring = () => setCard(edge === "top" ? "fold" : "roll");

    const onScroll = () => {
      const now = edgeNow();
      if (now === edge) return;
      edge = now;
      since = Date.now();
      pull = 0;
    };
    const onWheel = (e: WheelEvent) => {
      // Only scrolling further out of the page counts: up at the top, down at the bottom.
      const outward = edge === "top" ? -e.deltaY : e.deltaY;
      if (outward <= 0 || !settled()) return void (pull = 0);
      pull += outward;
      if (pull > WHEEL_PULL) bring();
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = settled() ? e.touches[0].clientY : null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchY === null) return;
      const dy = e.touches[0].clientY - touchY;
      if ((edge === "top" ? dy : -dy) > TOUCH_PULL) bring();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [card]);

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

  function onStart() {
    setRevealed(true);
    // Music starts on the first opening only; later a guest may have muted it.
    if (!firstOpen.current) return;
    firstOpen.current = false;
    // Browsers only allow audio after a user gesture, which this tap is.
    audio.current?.play().then(() => setPlaying(true), () => {});
  }

  function closeCard() {
    window.scrollTo({ top: 0, behavior: "instant" });
    setCard("fold");
  }

  // The card now covers the page: rewind it for the next opening.
  function onClosed() {
    window.scrollTo({ top: 0, behavior: "instant" });
    setRevealed(false);
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
    <LightboxProvider>
      {musicUrl && <audio ref={audio} src={musicUrl} loop preload="auto" />}

      <header className="fixed inset-x-0 top-0 z-30 mx-auto flex h-14 max-w-[480px] items-center justify-between border-b border-line/60 bg-cream/85 px-5 backdrop-blur">
        <span className="font-serif text-lg tracking-[0.2em] text-ink">{monogram}</span>
        <button type="button" aria-label="Mở menu" onClick={() => setMenuOpen(true)} className="p-1 text-ink">
          <MenuIcon width={22} height={22} />
        </button>
      </header>

      {menu.mounted && (
        <div data-state={menu.state} className="ov fixed inset-0 z-40 mx-auto max-w-[480px] bg-cream/97 backdrop-blur-sm">
          <div className="flex h-14 items-center justify-between px-5">
            <span className="font-serif text-lg tracking-[0.2em]">{monogram}</span>
            <button type="button" aria-label="Đóng menu" onClick={() => setMenuOpen(false)} className="p-1">
              <CloseIcon width={22} height={22} />
            </button>
          </div>
          <nav className="mt-8 flex flex-col items-center gap-6">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                closeCard();
              }}
              className="rise font-serif text-2xl text-ink hover:text-accent"
            >
              Thiệp mời
            </button>
            {nav.map((item, i) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMenuOpen(false)}
                className="rise font-serif text-2xl text-ink hover:text-accent"
                style={{ animationDelay: `${(i + 1) * 45}ms` }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}

      <main
        data-revealed={revealed}
        className="mx-auto min-h-svh max-w-[480px] overflow-x-clip bg-cream shadow-[0_0_40px_rgba(90,60,30,.08)]"
      >
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

      {card && (
        <Envelope
          key={card}
          {...envelope}
          entrance={card}
          onStart={onStart}
          onDone={() => setCard(null)}
          onClosed={onClosed}
        />
      )}
    </LightboxProvider>
  );
}
