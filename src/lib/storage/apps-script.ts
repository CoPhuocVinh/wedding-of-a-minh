import type { Guest, SiteContent, Wish } from "../types";
import type { Storage } from "./types";

// Google Sheet (data) + Google Drive (images, music) through the Web App in
// apps-script/Code.gs. Only the server knows the secret.

// Images: lh3.googleusercontent.com/d/<id>. Audio: drive.google.com/uc?export=download&id=<id>.
const DRIVE_ID = /^https:\/\/(?:lh3\.googleusercontent\.com\/d\/|drive\.google\.com\/uc\?export=download&id=)([\w-]+)/;

// Apps Script normally answers in 2-5s. When Google stalls, give up and retry
// rather than hang for a minute. Uploads carry a file, so they get longer.
const TIMEOUT_MS = 20_000;
const UPLOAD_TIMEOUT_MS = 60_000;

async function callOnce<T>(url: string, secret: string, action: string, payload?: unknown): Promise<T> {
  // Apps Script answers with a redirect to the result; fetch follows it.
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ secret, action, payload }),
    cache: "no-store",
    redirect: "follow",
    signal: AbortSignal.timeout(action === "uploadFile" ? UPLOAD_TIMEOUT_MS : TIMEOUT_MS),
  });
  const text = await res.text();
  let body: { ok: boolean; data?: T; error?: string };
  try {
    body = JSON.parse(text);
  } catch {
    throw new Transient(`Apps Script trả về không phải JSON (HTTP ${res.status}). Kiểm tra lại URL triển khai.`);
  }
  if (!body.ok) throw new Error(`Apps Script: ${body.error}`);
  // Every action answers with a `data` field (even `null`). Without one, the
  // POST was bounced to the script's GET health check: not a real answer.
  if (!("data" in body)) throw new Transient("Apps Script trả lời thiếu dữ liệu (yêu cầu bị chuyển hướng).");
  return body.data as T;
}

/** Google hiccups (HTML error pages, bounced requests) worth retrying. */
class Transient extends Error {}

/** Dropped connections and timeouts are worth retrying too. */
const isTransient = (e: unknown) =>
  e instanceof Transient ||
  (e instanceof TypeError && e.message === "fetch failed") ||
  (e instanceof DOMException && (e.name === "TimeoutError" || e.name === "AbortError"));

// Every action except uploads is safe to repeat (reads, upserts by id, deletes).
const RETRY_DELAYS = [400, 1200];

async function call<T>(action: string, payload?: unknown): Promise<T> {
  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;
  if (!url || !secret) throw new Error("APPS_SCRIPT_URL / APPS_SCRIPT_SECRET chưa được cấu hình");

  const retries = action === "uploadFile" ? [] : RETRY_DELAYS;
  for (let attempt = 0; ; attempt++) {
    try {
      return await callOnce<T>(url, secret, action, payload);
    } catch (e) {
      if (!isTransient(e) || attempt >= retries.length) throw e;
      await new Promise((r) => setTimeout(r, retries[attempt]));
    }
  }
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
