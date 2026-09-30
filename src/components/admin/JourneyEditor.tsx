"use client";

import type { Milestone, SiteContent } from "@/lib/types";
import { parseVideoUrl } from "@/lib/video";
import { ImageField } from "./ImageField";
import { Button, Card, Field, Grid, inputCls, TextArea, TextInput } from "./ui";

type Journey = SiteContent["journey"];

/** Says right away whether a pasted link is a video the site can play. */
function videoHint(url: string, empty: string) {
  if (!url.trim()) return empty;
  const v = parseVideoUrl(url);
  return v
    ? `✓ Đã nhận video ${v.provider === "youtube" ? "YouTube" : "Google Drive"}${v.vertical ? " (dọc)" : ""}`
    : "⚠ Chưa nhận ra link. Cần link YouTube (youtu.be/…, youtube.com/watch?v=…) hoặc Google Drive (drive.google.com/file/d/…).";
}

export function JourneyEditor({ journey, album, onChange }: { journey: Journey; album: SiteContent["album"]; onChange: (j: Journey) => void }) {
  const { videos, milestones } = journey;

  const setVideos = (list: string[]) => onChange({ ...journey, videos: list });
  const setAll = (list: Milestone[]) => onChange({ ...journey, milestones: list });
  const setOne = (i: number, patch: Partial<Milestone>) => setAll(milestones.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  const move = (i: number, d: number) => {
    const list = [...milestones];
    [list[i], list[i + d]] = [list[i + d], list[i]];
    setAll(list);
  };

  return (
    <Card title="Hành trình của chúng tôi">
      <div className="space-y-3">
        <p className="text-sm font-semibold">Video</p>
        <p className="text-xs text-stone-500">
          Tải video lên YouTube (chế độ Không công khai) hoặc Google Drive (chia sẻ “Bất kỳ ai có đường liên kết”), rồi dán link vào đây. Các video hiện ở
          đầu phần Hành trình, theo thứ tự từ trên xuống.
        </p>
        {videos.map((url, i) => (
          <Field key={i} label={`Video ${i + 1}`} hint={videoHint(url, "Dán link YouTube hoặc Google Drive")}>
            <div className="flex gap-2">
              <input
                className={inputCls}
                placeholder="https://youtu.be/…"
                value={url}
                onChange={(e) => setVideos(videos.map((v, j) => (j === i ? e.target.value : v)))}
              />
              <Button variant="danger" onClick={() => setVideos(videos.filter((_, j) => j !== i))}>
                Xoá
              </Button>
            </div>
          </Field>
        ))}
        <Button onClick={() => setVideos([...videos, ""])}>+ Thêm video</Button>
      </div>

      <div className="space-y-3 border-t border-stone-200 pt-4">
        <p className="text-sm font-semibold">Các cột mốc</p>
        <p className="text-xs text-stone-500">Hiện theo thứ tự từ trên xuống, kết thúc bằng ngày cưới. Ô nào để trống thì không hiện.</p>
        {milestones.map((m, i) => (
          <div key={m.id} className="space-y-3 rounded-xl border border-stone-200 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Cột mốc {i + 1}</p>
              <div className="flex gap-1">
                <Button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Lên">
                  ↑
                </Button>
                <Button onClick={() => move(i, 1)} disabled={i === milestones.length - 1} aria-label="Xuống">
                  ↓
                </Button>
                <Button variant="danger" onClick={() => setAll(milestones.filter((_, j) => j !== i))}>
                  Xoá
                </Button>
              </div>
            </div>
            <Grid>
              <TextInput label="Thời gian" placeholder="2019 · Tháng 3, 2021 · 14.02.2023" value={m.when} onChange={(e) => setOne(i, { when: e.target.value })} />
              <TextInput label="Tiêu đề" placeholder="Lần đầu gặp gỡ" value={m.title} onChange={(e) => setOne(i, { title: e.target.value })} />
            </Grid>
            <TextArea label="Kể đôi dòng" value={m.text} onChange={(e) => setOne(i, { text: e.target.value })} />
            <ImageField label="Ảnh" value={m.photo} album={album} allowEmpty onChange={(v) => setOne(i, { photo: v })} />
            <TextInput
              label="Video của cột mốc này (tuỳ chọn)"
              placeholder="https://youtu.be/…"
              hint={videoHint(m.video ?? "", "Nếu dán link video, video sẽ hiện thay cho ảnh.")}
              value={m.video ?? ""}
              onChange={(e) => setOne(i, { video: e.target.value })}
            />
          </div>
        ))}
        <Button onClick={() => setAll([...milestones, { id: crypto.randomUUID(), when: "", title: "", text: "", photo: "", video: "" }])}>
          + Thêm cột mốc
        </Button>
      </div>
    </Card>
  );
}
