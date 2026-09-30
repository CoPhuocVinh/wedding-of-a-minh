"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { checkLogin, endSession, requireAdmin, startSession } from "@/lib/auth";
import { loadContent, TAGS } from "@/lib/data";
import { seedContent } from "@/lib/seed";
import { RESERVED_SLUGS, slugify } from "@/lib/slug";
import { storage } from "@/lib/storage";
import type { Guest, SiteContent, Wish } from "@/lib/types";

export type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const fail = (e: unknown): { ok: false; error: string } => ({
  ok: false,
  error: e instanceof Error ? e.message : String(e),
});

// ---------- Session ----------

export async function login(_prev: { error?: string; username?: string } | null, form: FormData) {
  const username = String(form.get("username") ?? "");
  if (!checkLogin(username, String(form.get("password") ?? ""))) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    // React resets the form after an action; hand the username back to refill it.
    return { error: "Sai tên đăng nhập hoặc mật khẩu", username };
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

// ---------- Content ----------

const CONTENT_KEYS = new Set(Object.keys(seedContent));
const URLS = /"(https?:\/\/[^"]+|\/uploads\/[^"]+)"/g;
const urlsIn = (value: unknown) => new Set([...JSON.stringify(value).matchAll(URLS)].map((m) => m[1]));

/** Saves the given top-level fields, keeping the rest as stored. */
export async function saveContent(patch: Partial<SiteContent>): Promise<Result> {
  await requireAdmin();
  try {
    const before = await loadContent();
    const after = { ...before };
    for (const [key, value] of Object.entries(patch)) {
      if (CONTENT_KEYS.has(key)) Object.assign(after, { [key]: value });
    }
    await storage.saveContent(after);

    // Uploaded files no longer referenced anywhere go to the Drive trash.
    const kept = urlsIn(after);
    const dropped = [...urlsIn(before)].filter((u) => !kept.has(u));
    await Promise.allSettled(dropped.map((u) => storage.deleteFile(u)));

    updateTag(TAGS.content);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ---------- Guests ----------

export async function saveGuests(input: Guest[]): Promise<Result<Guest[]>> {
  await requireAdmin();
  try {
    const existing = await storage.listGuests();
    const guests = input.map((g) => ({
      id: g.id || crypto.randomUUID(),
      salutation: g.salutation.trim(),
      name: g.name.trim(),
      side: g.side === "gai" ? ("gai" as const) : ("trai" as const),
      slug: slugify(g.slug) || slugify(g.name),
      createdAt: g.createdAt || new Date().toISOString(),
    }));

    const incoming = new Set(guests.map((g) => g.id));
    const taken = new Map<string, string>(); // "side/slug" -> id
    for (const g of existing) if (!incoming.has(g.id)) taken.set(`${g.side}/${g.slug}`, g.id);
    for (const g of guests) {
      if (!g.name) return { ok: false, error: "Có khách chưa nhập tên." };
      if (!g.slug) return { ok: false, error: `Link của "${g.name}" đang trống.` };
      if (g.side === "trai" && RESERVED_SLUGS.has(g.slug))
        return { ok: false, error: `Link "/${g.slug}" trùng với đường dẫn của hệ thống, hãy đổi link khác.` };
      const key = `${g.side}/${g.slug}`;
      if (taken.has(key)) return { ok: false, error: `Link "${g.slug}" đã có khách khác dùng (${g.side === "gai" ? "nhà gái" : "nhà trai"}).` };
      taken.set(key, g.id);
    }

    await storage.saveGuests(guests);
    updateTag(TAGS.guests);
    return { ok: true, data: guests };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteGuest(id: string): Promise<Result> {
  await requireAdmin();
  try {
    await storage.deleteGuest(id);
    updateTag(TAGS.guests);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ---------- Wishes ----------

export async function saveWish(wish: Wish): Promise<Result> {
  await requireAdmin();
  try {
    await storage.saveWish(wish);
    updateTag(TAGS.wishes);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteWish(id: string): Promise<Result> {
  await requireAdmin();
  try {
    await storage.deleteWish(id);
    updateTag(TAGS.wishes);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
