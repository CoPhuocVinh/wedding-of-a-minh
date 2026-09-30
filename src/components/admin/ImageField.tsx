"use client";

import { useRef, useState } from "react";
import type { Photo } from "@/lib/types";
import { Zoomable } from "../Lightbox";
import { Button } from "./ui";
import { uploadImage } from "./upload";

/** Small preview URL: Drive images accept a size suffix. */
export function thumb(url: string, width = 400) {
  return url.startsWith("https://lh3.googleusercontent.com/") ? `${url}=w${width}` : url;
}

export function ImageField({
  label,
  value,
  onChange,
  album = [],
  allowEmpty = false,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  album?: Photo[];
  allowEmpty?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [picking, setPicking] = useState(false);
  const photos = album.filter((p) => !p.video);

  async function onFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await uploadImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-stone-600">{label}</span>
      <div className="flex items-center gap-3">
        {value ? (
          <Zoomable
            items={[{ id: "preview", url: value, alt: label }]}
            label={`Xem ảnh lớn: ${label}`}
            className="size-20 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumb(value, 200)} alt="" className="size-full object-cover" />
          </Zoomable>
        ) : (
          <div className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-100">
            <span className="text-xs text-stone-400">Chưa có</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => input.current?.click()} disabled={busy}>
            {busy ? "Đang tải…" : "Tải ảnh lên"}
          </Button>
          {photos.length > 0 && <Button onClick={() => setPicking(true)}>Chọn từ album</Button>}
          {allowEmpty && value && (
            <Button variant="danger" onClick={() => onChange("")}>
              Bỏ ảnh
            </Button>
          )}
        </div>
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}

      {picking && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={() => setPicking(false)}>
          <div className="max-h-[85svh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-4 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">Chọn ảnh từ album</p>
              <Button onClick={() => setPicking(false)}>Đóng</Button>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onChange(p.url);
                    setPicking(false);
                  }}
                  className={`aspect-square overflow-hidden rounded-lg ring-2 ${p.url === value ? "ring-amber-700" : "ring-transparent"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb(p.url)} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
