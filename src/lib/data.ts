import "server-only";
import { unstable_cache } from "next/cache";
import { withDefaults } from "./defaults";
import { storage } from "./storage";
import type { Side, SiteContent } from "./types";

// Guests read through this cache so the backend (slow Apps Script) is only hit
// after an admin edit invalidates the tag.
export const TAGS = { content: "content", guests: "guests", wishes: "wishes" } as const;

// In dev the data cache survives restarts, which hides edits to seed data and
// the local JSON file. Skip it there. In production, admin edits invalidate
// tags right away; the 5-minute revalidate picks up edits made directly in the
// Google Sheet.
const cache: typeof unstable_cache = (fn, keys, opts) =>
  process.env.NODE_ENV === "development" ? fn : unstable_cache(fn, keys, { revalidate: 300, ...opts });

/** Uncached. Used by admin. */
export async function loadContent(): Promise<SiteContent> {
  return withDefaults(await storage.getContent());
}

export const getContent = cache(
  loadContent,
  ["content"],
  { tags: [TAGS.content] },
);

/** Slugs are unique per side: "/an" (nhà trai) and "/g/an" (nhà gái) are different guests. */
export const getGuest = cache(
  async (side: Side, slug: string) =>
    (await storage.listGuests()).find((g) => g.side === side && g.slug === slug) ?? null,
  ["guest-by-slug"],
  { tags: [TAGS.guests] },
);

export const getVisibleWishes = cache(
  async () =>
    (await storage.listWishes())
      .filter((w) => w.visible)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  ["visible-wishes"],
  { tags: [TAGS.wishes] },
);
