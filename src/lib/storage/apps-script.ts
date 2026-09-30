import type { Guest, SiteContent, Wish } from "../types";
import type { Storage } from "./types";

// Google Sheet (data) + Google Drive (images, music) through the Web App in
// apps-script/Code.gs. Only the server knows the secret.

// Images: lh3.googleusercontent.com/d/<id>. Audio: drive.google.com/uc?export=download&id=<id>.
const DRIVE_ID = /^https:\/\/(?:lh3\.googleusercontent\.com\/d\/|drive\.google\.com\/uc\?export=download&id=)([\w-]+)/;

async function call<T>(action: string, payload?: unknown): Promise<T> {
  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;
  if (!url || !secret) throw new Error("APPS_SCRIPT_URL / APPS_SCRIPT_SECRET chưa được cấu hình");

  // Apps Script answers with a redirect to the result; fetch follows it.
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ secret, action, payload }),
    cache: "no-store",
    redirect: "follow",
  });
  const text = await res.text();
  let body: { ok: boolean; data?: T; error?: string };
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`Apps Script trả về không phải JSON (HTTP ${res.status}). Kiểm tra lại URL triển khai.`);
  }
  if (!body.ok) throw new Error(`Apps Script: ${body.error}`);
  return body.data as T;
}

export const appsScriptDriver: Storage = {
  getContent: () => call<SiteContent | null>("getContent"),
  saveContent: (content) => call("saveContent", { content }),

  async listGuests() {
    const rows = await call<Guest[]>("listGuests");
    return rows.map((g) => ({ ...g, slug: String(g.slug), side: g.side === "gai" ? "gai" : "trai" }));
  },
  saveGuests: (guests) => call("saveGuests", { guests }),
  deleteGuest: (id) => call("deleteGuest", { id }),

  listWishes: () => call<Wish[]>("listWishes"),
  saveWish: (wish) => call("saveWish", { wish }),
  deleteWish: (id) => call("deleteWish", { id }),

  uploadFile: ({ filename, contentType, data }) =>
    call("uploadFile", { filename, contentType, base64: data.toString("base64") }),
  async deleteFile(url) {
    const id = url.match(DRIVE_ID)?.[1];
    if (id) await call("deleteFile", { id });
  },
};
