"use client";

import { closestCenter, DndContext, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef, useState } from "react";
import { saveContent } from "@/app/admin/actions";
import type { Photo, SiteContent } from "@/lib/types";
import { parseVideoUrl, videoThumbnail } from "@/lib/video";
import { thumb } from "./ImageField";
import { Button, Card, inputCls, SaveBar, type SaveState } from "./ui";
import { uploadImage } from "./upload";

type Slots = Pick<SiteContent, "heroPhoto" | "countdownPhoto" | "thanksPhoto"> & { ogImage: string };
type State = { album: Photo[] } & Slots;

const SLOT_LABELS: Record<keyof Slots, string> = {
  heroPhoto: "Ảnh bìa",
  countdownPhoto: "Nền đếm ngược",
  thanksPhoto: "Ảnh cảm ơn",
  ogImage: "Thumbnail link",
};

const fromContent = (c: SiteContent): State => ({
  album: c.album,
  heroPhoto: c.heroPhoto,
  countdownPhoto: c.countdownPhoto,
  thanksPhoto: c.thanksPhoto,
  ogImage: c.og.image,
});

export function PhotosManager({ initial }: { initial: SiteContent }) {
  const [s, setS] = useState(() => fromContent(initial));
  const [saved, setSaved] = useState(() => JSON.stringify(fromContent(initial)));
  const [state, setState] = useState<SaveState>({ status: "idle" });
  const [uploading, setUploading] = useState<{ done: number; total: number; errors: string[] } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }));
  const dirty = JSON.stringify(s) !== saved;

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = [...files];
    const progress = { done: 0, total: list.length, errors: [] as string[] };
    setUploading({ ...progress });
    // Two at a time: fast enough without overwhelming Apps Script.
    const queue = [...list];
    const worker = async () => {
      for (let file = queue.shift(); file; file = queue.shift()) {
        try {
          const url = await uploadImage(file);
          setS((prev) => ({ ...prev, album: [...prev.album, { id: crypto.randomUUID(), url, alt: "" }] }));
        } catch (e) {
          progress.errors.push(e instanceof Error ? e.message : String(e));
        }
        progress.done++;
        setUploading({ ...progress });
      }
    };
    await Promise.all([worker(), worker()]);
    if (input.current) input.current.value = "";
    if (!progress.errors.length) setUploading(null);
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    setS((prev) => {
      const from = prev.album.findIndex((p) => p.id === active.id);
      const to = prev.album.findIndex((p) => p.id === over.id);
      return { ...prev, album: arrayMove(prev.album, from, to) };
    });
  }

  async function save() {
    setState({ status: "saving" });
    const og = { ...initial.og, image: s.ogImage };
    const res = await saveContent({ album: s.album, heroPhoto: s.heroPhoto, countdownPhoto: s.countdownPhoto, thanksPhoto: s.thanksPhoto, og });
    if (res.ok) {
      setSaved(JSON.stringify(s));
      setState({ status: "saved" });
    } else setState({ status: "error", error: res.error });
  }

  const slotsOf = (url: string) => (Object.keys(SLOT_LABELS) as (keyof Slots)[]).filter((k) => s[k] === url);

  return (
    <div className="space-y-5">
      <Card
        title={`Album ảnh cưới (${s.album.length})`}
        actions={
          <Button variant="primary" onClick={() => input.current?.click()} disabled={!!uploading && uploading.done < uploading.total}>
            + Tải ảnh lên
          </Button>
        }
      >
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
        <AddVideo onAdd={(v) => setS((prev) => ({ ...prev, album: [...prev.album, { id: crypto.randomUUID(), url: videoThumbnail(v), alt: "", video: v }] }))} />
        <p className="text-xs text-stone-500">
          Kéo thả để sắp xếp (trên điện thoại: giữ ảnh một chút rồi kéo). Ảnh đầu tiên hiện to nhất trong album. Ảnh lớn được tự nén còn tối đa 2400px.
        </p>
        {uploading && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            Đang tải {uploading.done}/{uploading.total} ảnh…
            {uploading.errors.map((e, i) => (
              <p key={i} className="text-red-700">
                {e}
              </p>
            ))}
            {uploading.done === uploading.total && (
              <button type="button" className="ml-2 underline" onClick={() => setUploading(null)}>
                Đóng
              </button>
            )}
          </div>
        )}
        <DndContext id="album-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={s.album.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {s.album.map((p, i) => (
                <SortablePhoto
                  key={p.id}
                  photo={p}
                  index={i}
                  slots={slotsOf(p.url).map((k) => SLOT_LABELS[k])}
                  onAssign={(slot) => setS((prev) => ({ ...prev, [slot]: p.url }))}
                  onRemove={() => {
                    if (confirm(p.video ? "Xoá video này khỏi album? (Video gốc trên YouTube/Drive vẫn giữ nguyên)" : "Xoá ảnh này khỏi album?")) setS((prev) => ({ ...prev, album: prev.album.filter((x) => x.id !== p.id) }));
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        {s.album.length === 0 && <p className="py-8 text-center text-sm text-stone-400">Chưa có ảnh nào</p>}
      </Card>
      <SaveBar dirty={dirty} state={state} onSave={save} />
    </div>
  );
}

function SortablePhoto({
  photo,
  index,
  slots,
  onAssign,
  onRemove,
}: {
  photo: Photo;
  index: number;
  slots: string[];
  onAssign: (slot: keyof Slots) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });
  const [menu, setMenu] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative overflow-hidden rounded-xl border border-stone-200 bg-white ${isDragging ? "z-10 opacity-80 shadow-lg" : ""}`}
    >
      <div {...attributes} {...listeners} className="relative aspect-square cursor-grab touch-none active:cursor-grabbing">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumb(photo.url)} alt="" draggable={false} className="size-full object-cover" />
        {photo.video && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-black/60 px-3 py-1 text-xs text-white">▶ {photo.video.provider === "youtube" ? "YouTube" : "Drive"}</span>
          </span>
        )}
      </div>
      <span className="absolute top-1.5 left-1.5 rounded-full bg-black/55 px-2 text-xs text-white">{index + 1}</span>
      {slots.length > 0 && (
        <div className="absolute inset-x-1.5 bottom-12 flex flex-wrap gap-1">
          {slots.map((l) => (
            <span key={l} className="rounded-full bg-amber-800/90 px-2 py-0.5 text-[10px] text-white">
              {l}
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-1 p-1.5">
        {!photo.video && (
          <Button className="flex-1 !px-2 !py-1 text-xs" onClick={() => setMenu((m) => !m)}>
            Đặt làm…
          </Button>
        )}
        <Button variant="danger" className={`!px-2 !py-1 text-xs ${photo.video ? "flex-1" : ""}`} onClick={onRemove}>
          Xoá
        </Button>
      </div>
      {menu && (
        <div className="absolute inset-x-1.5 bottom-11 z-10 rounded-lg border border-stone-200 bg-white p-1 shadow-lg">
          {(Object.keys(SLOT_LABELS) as (keyof Slots)[]).map((k) => (
            <button
              key={k}
              type="button"
              className="block w-full rounded px-2 py-1.5 text-left text-xs hover:bg-stone-100"
              onClick={() => {
                onAssign(k);
                setMenu(false);
              }}
            >
              {SLOT_LABELS[k]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AddVideo({ onAdd }: { onAdd: (v: NonNullable<Photo["video"]>) => void }) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  function add() {
    const v = parseVideoUrl(link);
    if (!v) return setError("Chưa nhận ra link. Dán link YouTube (youtu.be/…, youtube.com/watch?v=…, Shorts) hoặc Google Drive (drive.google.com/file/d/…).");
    onAdd(v);
    setLink("");
    setError("");
    setOpen(false);
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
        + Thêm video (YouTube / Google Drive)
      </Button>
    );
  }
  return (
    <div className="space-y-2 rounded-xl bg-stone-50 p-3">
      <div className="flex gap-2">
        <input autoFocus className={inputCls} placeholder="Dán link video…" value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <Button variant="primary" onClick={add} disabled={!link.trim()}>
          Thêm
        </Button>
        <Button onClick={() => setOpen(false)}>Huỷ</Button>
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
      <p className="text-xs text-stone-500">
        YouTube: tải video lên ở chế độ <b>Không công khai</b> rồi bấm Chia sẻ → Sao chép. Google Drive: chuột phải video → Chia sẻ → “Bất kỳ ai có đường liên kết” → Sao chép đường liên kết. Video Drive mới tải lên cần vài phút để Google xử lý xong mới có ảnh đại diện.
      </p>
    </div>
  );
}
