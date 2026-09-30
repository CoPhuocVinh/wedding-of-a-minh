"use client";

import Image from "next/image";
import { useState } from "react";
import { Reveal } from "../Reveal";
import { CloseIcon, CopyIcon, GiftIcon } from "../icons";
import type { GiftAccount } from "@/lib/types";

export function GiftBox({ gifts }: { gifts: GiftAccount[] }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  }

  return (
    <>
      <Reveal className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-36 animate-[float_3s_ease-in-out_infinite] items-center justify-center rounded-full bg-paper text-accent shadow-[0_18px_40px_rgba(168,112,74,.25)]"
          aria-label="Mở hộp mừng cưới"
        >
          <GiftIcon width={64} height={64} strokeWidth={1.2} />
        </button>
        <span className="mt-4 rounded-full bg-card px-4 py-1.5 text-sm shadow ring-1 ring-line">🎁 Chạm để mở</span>
      </Reveal>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center" onClick={() => setOpen(false)}>
          <div
            className="max-h-[90svh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-cream p-6 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="font-serif text-2xl">Hộp Mừng Cưới</p>
              <button type="button" aria-label="Đóng" onClick={() => setOpen(false)} className="p-1">
                <CloseIcon width={22} height={22} />
              </button>
            </div>
            <div className="mt-5 space-y-4">
              {gifts.map((g, i) => (
                <div key={i} className="rounded-2xl bg-card p-5 text-center ring-1 ring-line">
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
