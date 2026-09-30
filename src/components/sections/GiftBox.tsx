"use client";

import Image from "next/image";
import { useState } from "react";
import { HeartBurst } from "../HeartBurst";
import { Reveal } from "../Reveal";
import { CloseIcon, CopyIcon } from "../icons";
import { usePresence } from "../usePresence";
import type { GiftAccount } from "@/lib/types";

/** Shake, then the lid pops, then the sheet slides up. */
const LID_MS = 650;

export function GiftBox({ gifts }: { gifts: GiftAccount[] }) {
  // "opening": the box is animating; "open": the sheet is showing.
  const [stage, setStage] = useState<"closed" | "opening" | "open">("closed");
  const [copied, setCopied] = useState<string | null>(null);
  const sheet = usePresence(stage === "open");

  function open() {
    if (stage !== "closed") return;
    setStage("opening");
    setTimeout(() => setStage("open"), LID_MS);
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  }

  const lifted = stage !== "closed";

  return (
    <>
      <Reveal className="flex flex-col items-center" variant="zoom">
        <button
          type="button"
          onClick={open}
          className={`relative flex size-36 items-center justify-center rounded-full bg-paper text-accent shadow-[0_18px_40px_rgba(168,112,74,.25)] ${lifted ? "" : "animate-[float_3s_ease-in-out_infinite]"}`}
          aria-label="Mở hộp mừng cưới"
        >
          <svg
            viewBox="0 0 64 64"
            width="92"
            height="92"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            // overflow-visible: the lid and bow rise past the top of the viewBox.
            className={`overflow-visible ${stage === "opening" ? "animate-[seal-shake_.3s_ease-in-out]" : ""}`}
            aria-hidden
          >
            {/* Box */}
            <path d="M12 30v22a2 2 0 0 0 2 2h36a2 2 0 0 0 2-2V30" />
            <path d="M32 30v24" />
            {/* Lid + bow, which pop up together */}
            <g
              style={{
                transformBox: "fill-box",
                transformOrigin: "15% 100%",
                transform: lifted ? "translateY(-11px) rotate(-9deg)" : "none",
                transition: "transform .45s .25s cubic-bezier(.34,1.56,.64,1)",
              }}
            >
              <rect x="8" y="20" width="48" height="10" rx="2" />
              <path d="M32 20v10" />
              <path d="M32 20s-3-11-9-10-3 10 9 10Zm0 0s3-11 9-10 3 10-9 10Z" />
            </g>
          </svg>
          {/* Mounted for the whole time the box is open, so the hearts finish their flight. */}
          {lifted && <HeartBurst scale={0.7} />}
        </button>
        <span className="mt-4 rounded-full bg-card px-4 py-1.5 text-sm shadow ring-1 ring-line">🎁 Chạm để mở</span>
      </Reveal>

      {sheet.mounted && (
        <div
          data-state={sheet.state}
          className="ov fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setStage("closed")}
        >
          <div
            data-state={sheet.state}
            className="sheet max-h-[90svh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-cream p-6 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="font-serif text-2xl">Hộp Mừng Cưới</p>
              <button type="button" aria-label="Đóng" onClick={() => setStage("closed")} className="p-1">
                <CloseIcon width={22} height={22} />
              </button>
            </div>
            <div className="mt-5 space-y-4">
              {gifts.map((g, i) => (
                <div key={i} className="rise rounded-2xl bg-card p-5 text-center ring-1 ring-line" style={{ animationDelay: `${0.12 + i * 0.1}s` }}>
                  <p className="eyebrow">{g.label}</p>
                  {g.qr && (
                    <div className="relative mx-auto mt-4 size-48">
                      <Image src={g.qr} alt={`QR ${g.label}`} fill sizes="192px" className="object-contain" />
                    </div>
                  )}
                  <p className="mt-4 text-sm text-muted">{g.bank}</p>
                  <button
                    type="button"
                    onClick={() => copy(g.accountNumber)}
                    className="mt-1 inline-flex items-center gap-2 font-serif text-2xl tracking-wider"
                  >
                    {g.accountNumber}
                    <CopyIcon width={16} height={16} className="text-accent" />
                  </button>
                  <p className="mt-1 text-sm font-medium">{g.accountName}</p>
                  {copied === g.accountNumber && <p className="mt-2 text-xs text-accent-dark">Đã sao chép số tài khoản</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
