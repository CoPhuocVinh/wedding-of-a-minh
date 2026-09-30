"use server";

import { randomUUID } from "node:crypto";
import { updateTag } from "next/cache";
import { TAGS } from "@/lib/data";
import { storage } from "@/lib/storage";

export type WishState = { ok: boolean; error?: string } | null;

export async function sendWish(_prev: WishState, form: FormData): Promise<WishState> {
  // Honeypot: bots fill every field, people never see this one.
  if (form.get("website")) return { ok: true };

  const name = String(form.get("name") ?? "").trim().slice(0, 60);
  const message = String(form.get("message") ?? "").trim().slice(0, 500);
  if (!name || !message) return { ok: false, error: "Vui lòng nhập tên và lời chúc." };

  try {
    await storage.saveWish({
      id: randomUUID(),
      name,
      message,
      createdAt: new Date().toISOString(),
      visible: true,
    });
  } catch {
    return { ok: false, error: "Gửi chưa được, bạn thử lại giúp mình nhé." };
  }
  updateTag(TAGS.wishes);
  return { ok: true };
}
