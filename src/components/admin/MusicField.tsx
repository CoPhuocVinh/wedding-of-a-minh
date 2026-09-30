"use client";

import { useRef, useState } from "react";
import type { SiteContent } from "@/lib/types";
import { Button, Card, TextInput } from "./ui";
import { MAX_AUDIO_MB, uploadAudio } from "./upload";

type Music = SiteContent["music"];

export const DEFAULT_MUSIC = "/music/nhac-nen.mp3";

export function MusicField({ music, onChange }: { music: Music; onChange: (m: Music) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [advanced, setAdvanced] = useState(false);

  async function onFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange({ url: await uploadAudio(file), title: file.name.replace(/\.\w+$/, "") });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  const label = !music.url ? "Không có nhạc" : music.url === DEFAULT_MUSIC ? "Nhạc mặc định (tách từ video mẫu, 38 giây)" : music.title || "File đã tải lên";

  return (
    <Card title="Nhạc nền">
      <p className="text-sm">
        Đang dùng: <span className="font-medium">{label}</span>
      </p>
      {music.url && <audio key={music.url} src={music.url} controls preload="none" className="w-full" />}
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? "Đang tải nhạc lên…" : "Tải nhạc lên"}
        </Button>
        {music.url !== DEFAULT_MUSIC && <Button onClick={() => onChange({ url: DEFAULT_MUSIC, title: "Nhạc nền" })}>Dùng nhạc mặc định</Button>}
        {music.url && (
          <Button variant="danger" onClick={() => onChange({ url: "", title: "" })}>
            Tắt nhạc
          </Button>
        )}
      </div>
      <input ref={input} type="file" accept="audio/*,.mp3,.m4a" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <p className="text-xs text-stone-400">
        File mp3 hoặc m4a, tối đa {MAX_AUDIO_MB}MB (bài ~4 phút ở 128kbps). Nhạc phát lặp lại khi khách mở thiệp. Nhớ bấm “Lưu thay đổi”.
      </p>
      <button type="button" className="text-xs text-stone-500 underline" onClick={() => setAdvanced((a) => !a)}>
        {advanced ? "Ẩn" : "Nâng cao: dán đường dẫn nhạc"}
      </button>
      {advanced && <TextInput label="Đường dẫn file nhạc" value={music.url} onChange={(e) => onChange({ ...music, url: e.target.value })} />}
    </Card>
  );
}
