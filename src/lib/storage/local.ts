import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { seedContent, seedGuests, seedWishes } from "../seed";
import type { Guest, SiteContent, Wish } from "../types";
import type { Storage } from "./types";

// Development-only driver: a JSON file plus images under public/uploads.
// Vercel's filesystem is read-only, so production uses a remote driver.

type Db = { content: SiteContent; guests: Guest[]; wishes: Wish[] };

const DB_FILE = path.join(process.cwd(), "data", "db.local.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

async function read(): Promise<Db> {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, "utf8"));
  } catch {
    return { content: seedContent, guests: seedGuests, wishes: seedWishes };
  }
}

async function write(db: Db) {
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

async function update(fn: (db: Db) => void) {
  const db = await read();
  fn(db);
  await write(db);
}

function upsert<T extends { id: string }>(list: T[], item: T) {
  const i = list.findIndex((x) => x.id === item.id);
  if (i === -1) list.push(item);
  else list[i] = item;
}

export const localDriver: Storage = {
  async getContent() {
    return (await read()).content;
  },
  saveContent: (content) => update((db) => void (db.content = content)),

  async listGuests() {
    return (await read()).guests;
  },
  saveGuests: (guests) => update((db) => guests.forEach((g) => upsert(db.guests, g))),
  deleteGuest: (id) => update((db) => void (db.guests = db.guests.filter((g) => g.id !== id))),

  async listWishes() {
    return (await read()).wishes;
  },
  saveWish: (wish) => update((db) => upsert(db.wishes, wish)),
  deleteWish: (id) => update((db) => void (db.wishes = db.wishes.filter((w) => w.id !== id))),

  async uploadFile({ filename, data }) {
    const ext = path.extname(filename).toLowerCase() || ".jpg";
    const id = `${randomUUID()}${ext}`;
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, id), data);
    return { id, url: `/uploads/${id}` };
  },
  async deleteFile(url) {
    if (!url.startsWith("/uploads/")) return;
    await fs.rm(path.join(UPLOAD_DIR, path.basename(url)), { force: true });
  },
};
