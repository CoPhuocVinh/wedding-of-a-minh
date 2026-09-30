"use client";

import { useState } from "react";
import { deleteWish, saveWish } from "@/app/admin/actions";
import type { Wish } from "@/lib/types";
import { Button, Card } from "./ui";

const when = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short" });

export function WishesManager({ initial }: { initial: Wish[] }) {
  const [wishes, setWishes] = useState(() => [...initial].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function toggle(w: Wish) {
    setBusy(w.id);
    const next = { ...w, visible: !w.visible };
    const res = await saveWish(next);
    setBusy(null);
    if (res.ok) setWishes((list) => list.map((x) => (x.id === w.id ? next : x)));
    else setError(res.error);
  }

  async function remove(w: Wish) {
    if (!confirm(`Xoá lời chúc của "${w.name}"?`)) return;
    setBusy(w.id);
    const res = await deleteWish(w.id);
    setBusy(null);
    if (res.ok) setWishes((list) => list.filter((x) => x.id !== w.id));
    else setError(res.error);
  }

  return (
    <Card title={`Lời chúc (${wishes.length})`}>
      <p className="text-xs text-stone-500">Lời chúc hiện lên thiệp ngay khi khách gửi. Bấm “Ẩn” để giấu lời chúc không phù hợp.</p>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <ul className="divide-y divide-stone-100">
        {wishes.map((w) => (
          <li key={w.id} className={`flex gap-3 py-3 ${w.visible ? "" : "opacity-50"}`}>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {w.name} <span className="text-xs font-normal text-stone-400">· {when(w.createdAt)}</span>
                {!w.visible && <span className="ml-2 rounded-full bg-stone-200 px-2 text-[10px]">Đang ẩn</span>}
              </p>
              <p className="mt-1 text-sm whitespace-pre-line text-stone-600">{w.message}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-start">
              <Button className="!px-2.5 !py-1.5 text-xs" onClick={() => toggle(w)} disabled={busy === w.id}>
                {w.visible ? "Ẩn" : "Hiện"}
              </Button>
              <Button variant="danger" className="!px-2.5 !py-1.5 text-xs" onClick={() => remove(w)} disabled={busy === w.id}>
                Xoá
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {wishes.length === 0 && <p className="py-6 text-center text-sm text-stone-400">Chưa có lời chúc nào</p>}
    </Card>
  );
}
