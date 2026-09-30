"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { deleteGuest, saveGuests } from "@/app/admin/actions";
import { slugify, uniqueSlug } from "@/lib/slug";
import { guestLabel, guestPath, SIDE_BASE, type Guest, type Side } from "@/lib/types";
import { Button, Card, inputCls } from "./ui";

// Longest first so "Cô Chú" wins over "Cô".
const SALUTATIONS = [
  "Gia đình", "Vợ chồng", "Ông Bà", "Cô Chú", "Chú Thím", "Cô Dượng", "Dì Dượng", "Cậu Mợ", "Anh Chị", "Bác",
  "Ông", "Bà", "Cô", "Chú", "Dì", "Dượng", "Thím", "Mợ", "Cậu", "Anh", "Chị", "Em", "Bạn", "Thầy", "Sếp",
].sort((a, b) => b.length - a.length);

/** "Anh Phước Vinh" -> { salutation: "Anh", name: "Phước Vinh" }. Tab-separated columns also work. */
function parseLine(line: string) {
  const cols = line.split("\t").map((s) => s.trim()).filter(Boolean);
  if (cols.length >= 2) return { salutation: cols[0], name: cols.slice(1).join(" ") };
  const text = line.trim().replace(/\s+/g, " ");
  const hit = SALUTATIONS.find((s) => text.toLowerCase().startsWith(s.toLowerCase() + " "));
  return hit ? { salutation: text.slice(0, hit.length), name: text.slice(hit.length).trim() } : { salutation: "", name: text };
}

const SIDE_NAME: Record<Side, string> = { trai: "Nhà trai", gai: "Nhà gái" };

const useOrigin = () =>
  useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );

export function GuestsManager({ initial, inviteLine }: { initial: Guest[]; inviteLine: string }) {
  const [guests, setGuests] = useState(initial);
  const [filter, setFilter] = useState<Side | "all">("all");
  const [query, setQuery] = useState("");
  const origin = useOrigin();

  const merge = (saved: Guest[]) =>
    setGuests((list) => {
      const map = new Map(list.map((g) => [g.id, g]));
      saved.forEach((g) => map.set(g.id, g));
      return [...map.values()];
    });

  const shown = useMemo(() => {
    const q = slugify(query);
    return guests
      .filter((g) => filter === "all" || g.side === filter)
      .filter((g) => !q || slugify(guestLabel(g)).includes(q) || g.slug.includes(q))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [guests, filter, query]);

  const count = (s: Side) => guests.filter((g) => g.side === s).length;

  return (
    <div className="space-y-5">
      <BulkAdd existing={guests} onSaved={merge} />

      <Card title={`Danh sách khách (${guests.length})`}>
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "trai", "gai"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-sm ${filter === f ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-600"}`}
            >
              {f === "all" ? `Tất cả` : `${SIDE_NAME[f]} (${count(f)})`}
            </button>
          ))}
          <input className={`${inputCls} !w-auto flex-1`} placeholder="Tìm tên…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <ul className="divide-y divide-stone-100">
          {shown.map((g) => (
            <GuestRow
              key={g.id}
              guest={g}
              url={`${origin}${guestPath(g)}`}
              inviteLine={inviteLine}
              existing={guests}
              onSaved={(saved) => merge([saved])}
              onDeleted={() => setGuests((list) => list.filter((x) => x.id !== g.id))}
            />
          ))}
        </ul>
        {shown.length === 0 && <p className="py-6 text-center text-sm text-stone-400">Chưa có khách nào</p>}
      </Card>
    </div>
  );
}

type Draft = { salutation: string; name: string; slug: string };

function BulkAdd({ existing, onSaved }: { existing: Guest[]; onSaved: (g: Guest[]) => void }) {
  const [side, setSide] = useState<Side>("trai");
  const [text, setText] = useState("");
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function preview() {
    const taken = new Set(existing.filter((g) => g.side === side).map((g) => g.slug));
    const rows = text
      .split("\n")
      .filter((l) => l.trim())
      .map((line) => {
        const p = parseLine(line);
        const slug = uniqueSlug(p.name, taken);
        taken.add(slug);
        return { ...p, slug };
      });
    setDrafts(rows);
    setError("");
  }

  async function save() {
    if (!drafts?.length) return;
    setBusy(true);
    setError("");
    const now = Date.now();
    const res = await saveGuests(
      drafts.map((d, i) => ({ id: "", ...d, side, createdAt: new Date(now + i).toISOString() })),
    );
    setBusy(false);
    if (!res.ok) return setError(res.error);
    onSaved(res.data ?? []);
    setDrafts(null);
    setText("");
  }

  const setDraft = (i: number, patch: Partial<Draft>) => setDrafts((d) => d!.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const known = new Set(existing.filter((g) => g.side === side).map((g) => slugify(guestLabel(g))));

  return (
    <Card title="Thêm khách mời">
      <div className="flex rounded-full bg-stone-100 p-1 text-sm sm:w-fit">
        {(["trai", "gai"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setSide(s);
              setDrafts(null);
            }}
            className={`flex-1 rounded-full px-4 py-1.5 ${side === s ? "bg-white shadow-sm" : "text-stone-500"}`}
          >
            {SIDE_NAME[s]} <span className="text-stone-400">{s === "trai" ? "/ten" : "/g/ten"}</span>
          </button>
        ))}
      </div>

      {!drafts ? (
        <>
          <textarea
            rows={6}
            className={inputCls}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"Dán danh sách, mỗi dòng một khách:\nAnh Phước Vinh\nCô Chú Tư\nGia đình anh Hùng\n\n(Copy 2 cột Danh xưng | Tên từ Excel cũng được)"}
          />
          <Button variant="primary" onClick={preview} disabled={!text.trim()}>
            Xem trước
          </Button>
        </>
      ) : (
        <>
          <p className="text-xs text-stone-500">Kiểm tra lại danh xưng, tên và link trước khi lưu. Link tự tạo từ tên, bạn sửa được.</p>
          <div className="space-y-2">
            {drafts.map((d, i) => (
              <div key={i} className="grid grid-cols-[5.5rem_1fr] gap-2 rounded-lg bg-stone-50 p-2 sm:grid-cols-[6rem_1fr_1fr_auto]">
                <input className={inputCls} placeholder="Danh xưng" value={d.salutation} onChange={(e) => setDraft(i, { salutation: e.target.value })} />
                <input className={inputCls} placeholder="Tên" value={d.name} onChange={(e) => setDraft(i, { name: e.target.value })} />
                <div className="col-span-2 flex items-center gap-1 sm:col-span-1">
                  <span className="shrink-0 text-xs text-stone-400">{SIDE_BASE[side]}/</span>
                  <input className={inputCls} value={d.slug} onChange={(e) => setDraft(i, { slug: e.target.value })} onBlur={(e) => setDraft(i, { slug: slugify(e.target.value) })} />
                </div>
                <button type="button" aria-label="Bỏ dòng này" className="hidden text-stone-400 hover:text-red-600 sm:block" onClick={() => setDrafts(drafts.filter((_, j) => j !== i))}>
                  ✕
                </button>
                {known.has(slugify(guestLabel(d))) && (
                  <p className="col-span-full text-xs text-amber-700">
                    ⚠ Đã có khách “{guestLabel(d)}” bên {SIDE_NAME[side].toLowerCase()}. Bấm ✕ nếu bị trùng.
                  </p>
                )}
              </div>
            ))}
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={() => setDrafts(null)}>Quay lại</Button>
            <Button variant="primary" onClick={save} disabled={busy || !drafts.length}>
              {busy ? "Đang lưu…" : `Lưu ${drafts.length} khách ${SIDE_NAME[side].toLowerCase()}`}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}

function GuestRow({
  guest,
  url,
  inviteLine,
  existing,
  onSaved,
  onDeleted,
}: {
  guest: Guest;
  url: string;
  inviteLine: string;
  existing: Guest[];
  onSaved: (g: Guest) => void;
  onDeleted: () => void;
}) {
  const [edit, setEdit] = useState<Guest | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  async function copy(kind: string, text: string) {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(kind);
    setTimeout(() => setCopied(""), 1500);
  }

  async function save() {
    if (!edit) return;
    setBusy(true);
    setError("");
    const res = await saveGuests([edit]);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    onSaved(res.data![0]);
    setEdit(null);
  }

  async function remove() {
    if (!confirm(`Xoá khách "${guestLabel(guest)}"? Link của khách sẽ không mở được nữa.`)) return;
    setBusy(true);
    const res = await deleteGuest(guest.id);
    setBusy(false);
    if (res.ok) onDeleted();
    else setError(res.error);
  }

  if (edit) {
    const regenerate = () =>
      setEdit({ ...edit, slug: uniqueSlug(edit.name, existing.filter((g) => g.side === edit.side && g.id !== edit.id).map((g) => g.slug)) });
    return (
      <li className="space-y-2 py-3">
        <div className="grid grid-cols-[5.5rem_1fr] gap-2 sm:grid-cols-[6rem_1fr_9rem]">
          <input className={inputCls} value={edit.salutation} onChange={(e) => setEdit({ ...edit, salutation: e.target.value })} />
          <input className={inputCls} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
          <select className={`${inputCls} col-span-2 sm:col-span-1`} value={edit.side} onChange={(e) => setEdit({ ...edit, side: e.target.value as Side })}>
            <option value="trai">Nhà trai</option>
            <option value="gai">Nhà gái</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs text-stone-400">{SIDE_BASE[edit.side]}/</span>
          <input className={inputCls} value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} onBlur={(e) => setEdit({ ...edit, slug: slugify(e.target.value) })} />
          <Button onClick={regenerate}>Tạo lại</Button>
        </div>
        {edit.slug !== guest.slug && <p className="text-xs text-amber-700">Đổi link thì link cũ đã gửi cho khách sẽ không mở được nữa.</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={() => setEdit(null)}>Huỷ</Button>
          <Button variant="primary" onClick={save} disabled={busy}>
            {busy ? "Đang lưu…" : "Lưu"}
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {guestLabel(guest)}{" "}
          <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${guest.side === "gai" ? "bg-rose-100 text-rose-800" : "bg-sky-100 text-sky-800"}`}>
            {SIDE_NAME[guest.side]}
          </span>
        </p>
        <a href={url} target="_blank" rel="noreferrer" className="block truncate text-xs text-amber-800 hover:underline">
          {url}
        </a>
        {error && <p className="text-xs text-red-700">{error}</p>}
      </div>
      <div className="flex gap-1.5">
        <Button className="!px-2.5 !py-1.5 text-xs" onClick={() => copy("link", url)}>
          {copied === "link" ? "Đã copy ✓" : "Copy link"}
        </Button>
        <Button
          className="!px-2.5 !py-1.5 text-xs"
          onClick={() => copy("msg", `${inviteLine} ${guestLabel(guest)} đến dự lễ cưới của chúng mình 💌\n${url}`)}
        >
          {copied === "msg" ? "Đã copy ✓" : "Copy lời mời"}
        </Button>
        <Button className="!px-2.5 !py-1.5 text-xs" onClick={() => setEdit(guest)}>
          Sửa
        </Button>
        <Button variant="danger" className="!px-2.5 !py-1.5 text-xs" onClick={remove} disabled={busy}>
          Xoá
        </Button>
      </div>
    </li>
  );
}
