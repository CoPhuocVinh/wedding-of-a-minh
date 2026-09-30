/** Paths the guest slug must never shadow. */
export const RESERVED_SLUGS = new Set(["admin", "api", "g", "uploads", "sample", "music", "card", "_next"]);

/** "Phước Vinh" -> "phuoc-vinh" */
export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Appends -2, -3... until the slug is free. */
export function uniqueSlug(base: string, taken: Iterable<string>) {
  const used = new Set(taken);
  const root = slugify(base) || "khach";
  let slug = root;
  for (let n = 2; used.has(slug) || RESERVED_SLUGS.has(slug); n++) {
    slug = `${root}-${n}`;
  }
  return slug;
}
