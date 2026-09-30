"use client";

import { useState } from "react";
import { saveContent } from "@/app/admin/actions";
import { lunarLine } from "@/lib/lunar";
import type { GiftAccount, Person, Side, SideInfo, SiteContent, WeddingEvent } from "@/lib/types";
import { ImageField, thumb } from "./ImageField";
import { MusicField } from "./MusicField";
import { Button, Card, Field, Grid, inputCls, SaveBar, TextArea, TextInput, type SaveState } from "./ui";

// Fields this tab owns. Album and sections have their own tabs.
const KEYS = [
  "groomName",
  "brideName",
  "invite",
  "sides",
  "groom",
  "bride",
  "heroPhoto",
  "countdownPhoto",
  "thanksPhoto",
  "thanksMessage",
  "dressCode",
  "gifts",
  "music",
  "og",
] as const satisfies readonly (keyof SiteContent)[];

const pick = (c: SiteContent) => Object.fromEntries(KEYS.map((k) => [k, c[k]])) as Pick<SiteContent, (typeof KEYS)[number]>;

export function ContentEditor({ initial }: { initial: SiteContent }) {
  const [c, setC] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(pick(initial)));
  const [state, setState] = useState<SaveState>({ status: "idle" });
  const dirty = JSON.stringify(pick(c)) !== saved;

  const set = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => setC((prev) => ({ ...prev, [key]: value }));

  async function save() {
    setState({ status: "saving" });
    const patch = pick(c);
    const res = await saveContent(patch);
    if (res.ok) {
      setSaved(JSON.stringify(patch));
      setState({ status: "saved" });
    } else setState({ status: "error", error: res.error });
  }

  return (
    <div className="space-y-5">
      <Card title="Cô dâu & chú rể">
        <Grid>
          <TextInput label="Tên chú rể" value={c.groomName} onChange={(e) => set("groomName", e.target.value)} />
          <TextInput label="Tên cô dâu" value={c.brideName} onChange={(e) => set("brideName", e.target.value)} />
        </Grid>
        <Grid>
          <PersonFields title="Chú rể" person={c.groom} album={c.album} onChange={(v) => set("groom", v)} />
          <PersonFields title="Cô dâu" person={c.bride} album={c.album} onChange={(v) => set("bride", v)} />
        </Grid>
      </Card>

      <Card title="Lời mời">
        <Grid>
          <TextInput label="Dòng mời" value={c.invite.line} onChange={(e) => set("invite", { ...c.invite, line: e.target.value })} />
          <TextInput
            label="Tên khách trên thiệp chung (/ và /g)"
            value={c.invite.defaultGuest}
            onChange={(e) => set("invite", { ...c.invite, defaultGuest: e.target.value })}
          />
        </Grid>
      </Card>

      <SidesEditor sides={c.sides} album={c.album} onChange={(v) => set("sides", v)} />

      <Card title="Ảnh chính">
        <Grid>
          <ImageField label="Ảnh bìa (sau khi mở thiệp)" value={c.heroPhoto} album={c.album} onChange={(v) => set("heroPhoto", v)} />
          <ImageField label="Ảnh nền đếm ngược" value={c.countdownPhoto} album={c.album} onChange={(v) => set("countdownPhoto", v)} />
          <ImageField label="Ảnh lời cảm ơn" value={c.thanksPhoto} album={c.album} onChange={(v) => set("thanksPhoto", v)} />
        </Grid>
        <TextArea label="Lời cảm ơn" value={c.thanksMessage} onChange={(e) => set("thanksMessage", e.target.value)} />
      </Card>

      <Card title="Dress code">
        <div className="flex flex-wrap items-center gap-3">
          {c.dressCode.colors.map((color, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                type="color"
                value={color}
                onChange={(e) => set("dressCode", { ...c.dressCode, colors: c.dressCode.colors.map((x, j) => (j === i ? e.target.value : x)) })}
                className="size-10 cursor-pointer rounded-full border border-stone-300"
              />
              <button
                type="button"
                aria-label="Xoá màu"
                className="text-stone-400 hover:text-red-600"
                onClick={() => set("dressCode", { ...c.dressCode, colors: c.dressCode.colors.filter((_, j) => j !== i) })}
              >
                ✕
              </button>
            </div>
          ))}
          <Button onClick={() => set("dressCode", { ...c.dressCode, colors: [...c.dressCode.colors, "#c8b8a0"] })}>+ Thêm màu</Button>
        </div>
        <TextArea label="Ghi chú" value={c.dressCode.note} onChange={(e) => set("dressCode", { ...c.dressCode, note: e.target.value })} />
      </Card>

      <GiftsEditor gifts={c.gifts} album={c.album} onChange={(v) => set("gifts", v)} />

      <MusicField music={c.music} onChange={(v) => set("music", v)} />

      <Card title="Khi chia sẻ link (Zalo, Messenger…)">
        <Grid>
          <TextInput
            label="Tiêu đề thiệp chung"
            hint="{names} = tên hai bạn theo thứ tự của mỗi bên"
            value={c.og.title}
            onChange={(e) => set("og", { ...c.og, title: e.target.value })}
          />
          <TextInput
            label="Tiêu đề link khách"
            hint="{guest} = tên khách, {names} = tên hai bạn"
            value={c.og.guestTitle}
            onChange={(e) => set("og", { ...c.og, guestTitle: e.target.value })}
          />
        </Grid>
        <ImageField label="Ảnh thumbnail" value={c.og.image} album={c.album} onChange={(v) => set("og", { ...c.og, image: v })} />
        <div className="max-w-sm overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
          {c.og.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb(c.og.image, 800)} alt="" className="aspect-[1.91/1] w-full object-cover" />
          )}
          <div className="p-3">
            <p className="text-[11px] text-stone-400 uppercase">Xem trước</p>
            <p className="text-sm font-semibold">
              {c.og.guestTitle.replaceAll("{guest}", "Anh Phước Vinh").replaceAll("{names}", `${c.groomName} & ${c.brideName}`)}
            </p>
          </div>
        </div>
      </Card>

      <SaveBar dirty={dirty} state={state} onSave={save} />
    </div>
  );
}

function PersonFields({ title, person, album, onChange }: { title: string; person: Person; album: SiteContent["album"]; onChange: (p: Person) => void }) {
  const set = (k: keyof Person) => (e: { target: { value: string } }) => onChange({ ...person, [k]: e.target.value });
  return (
    <div className="space-y-3 rounded-xl bg-stone-50 p-3">
      <p className="text-sm font-semibold">{title}</p>
      <TextInput label="Tên hiển thị" value={person.name} onChange={set("name")} />
      <TextInput label="Thứ bậc" placeholder="Trưởng nam" value={person.rank} onChange={set("rank")} />
      <TextInput label="Bố" placeholder="Ông Nguyễn Văn A" value={person.father} onChange={set("father")} />
      <TextInput label="Mẹ" placeholder="Bà Trần Thị B" value={person.mother} onChange={set("mother")} />
      <TextInput label="Địa chỉ gia đình" value={person.address} onChange={set("address")} />
      <TextArea label="Giới thiệu ngắn (tuỳ chọn)" value={person.bio} onChange={set("bio")} />
      <ImageField label="Ảnh" value={person.photo} album={album} onChange={(v) => onChange({ ...person, photo: v })} />
    </div>
  );
}

function SidesEditor({ sides, album, onChange }: { sides: SiteContent["sides"]; album: SiteContent["album"]; onChange: (s: SiteContent["sides"]) => void }) {
  const [tab, setTab] = useState<Side>("trai");
  const info = sides[tab];
  const set = (patch: Partial<SideInfo>) => onChange({ ...sides, [tab]: { ...info, ...patch } });
  const setEvent = (i: number, patch: Partial<WeddingEvent>) => set({ events: info.events.map((e, j) => (j === i ? { ...e, ...patch } : e)) });
  const move = (i: number, d: number) => {
    const list = [...info.events];
    [list[i], list[i + d]] = [list[i + d], list[i]];
    set({ events: list });
  };

  return (
    <Card
      title="Lịch cưới"
      actions={
        <div className="flex rounded-full bg-stone-100 p-1 text-sm">
          {(["trai", "gai"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTab(s)}
              className={`rounded-full px-3 py-1 ${tab === s ? "bg-white shadow-sm" : "text-stone-500"}`}
            >
              {s === "trai" ? "Nhà trai ( / )" : "Nhà gái ( /g )"}
            </button>
          ))}
        </div>
      }
    >
      <Grid>
        <TextInput label="Tên lễ" placeholder="Lễ Tân Hôn" value={info.ceremonyName} onChange={(e) => set({ ceremonyName: e.target.value })} />
        <TextInput label="Nơi tổ chức (dòng ngắn)" value={info.location} onChange={(e) => set({ location: e.target.value })} />
        <Field label="Ngày giờ chính (hiện ở bìa, lịch, đếm ngược)" hint={info.mainDateTime ? lunarLine(info.mainDateTime.slice(0, 10)) : undefined}>
          <input type="datetime-local" className={inputCls} value={info.mainDateTime} onChange={(e) => set({ mainDateTime: e.target.value })} />
        </Field>
      </Grid>

      {info.events.map((ev, i) => (
        <div key={ev.id} className="space-y-3 rounded-xl border border-stone-200 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Sự kiện {i + 1}</p>
            <div className="flex gap-1">
              <Button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Lên">
                ↑
              </Button>
              <Button onClick={() => move(i, 1)} disabled={i === info.events.length - 1} aria-label="Xuống">
                ↓
              </Button>
              <Button variant="danger" onClick={() => set({ events: info.events.filter((_, j) => j !== i) })}>
                Xoá
              </Button>
            </div>
          </div>
          <Grid>
            <TextInput label="Tên sự kiện" value={ev.title} onChange={(e) => setEvent(i, { title: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ngày" hint={ev.date ? lunarLine(ev.date).replace("Nhằm ngày ", "Âm lịch: ") : undefined}>
                <input type="date" className={inputCls} value={ev.date} onChange={(e) => setEvent(i, { date: e.target.value })} />
              </Field>
              <Field label="Giờ">
                <input type="time" className={inputCls} value={ev.time} onChange={(e) => setEvent(i, { time: e.target.value })} />
              </Field>
            </div>
            <TextInput label="Địa điểm" value={ev.venue} onChange={(e) => setEvent(i, { venue: e.target.value })} />
            <TextInput label="Địa chỉ" value={ev.address} onChange={(e) => setEvent(i, { address: e.target.value })} />
          </Grid>
          <TextInput
            label="Link Google Maps (nút Chỉ đường)"
            hint="Mở Google Maps → Chia sẻ → Sao chép đường liên kết, rồi dán vào đây"
            value={ev.mapUrl}
            onChange={(e) => setEvent(i, { mapUrl: e.target.value })}
          />
          <ImageField label="Ảnh" value={ev.photo} album={album} allowEmpty onChange={(v) => setEvent(i, { photo: v })} />
        </div>
      ))}
      <Button
        onClick={() =>
          set({
            events: [
              ...info.events,
              { id: crypto.randomUUID(), title: "", date: info.mainDateTime.slice(0, 10), time: "", venue: "", address: "", mapUrl: "", photo: "" },
            ],
          })
        }
      >
        + Thêm sự kiện
      </Button>
    </Card>
  );
}

function GiftsEditor({ gifts, album, onChange }: { gifts: GiftAccount[]; album: SiteContent["album"]; onChange: (g: GiftAccount[]) => void }) {
  const setGift = (i: number, patch: Partial<GiftAccount>) => onChange(gifts.map((g, j) => (j === i ? { ...g, ...patch } : g)));
  return (
    <Card title="Hộp mừng cưới">
      {gifts.map((g, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-stone-200 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Tài khoản {i + 1}</p>
            <Button variant="danger" onClick={() => onChange(gifts.filter((_, j) => j !== i))}>
              Xoá
            </Button>
          </div>
          <Grid>
            <TextInput label="Tiêu đề" placeholder="Mừng cưới chú rể" value={g.label} onChange={(e) => setGift(i, { label: e.target.value })} />
            <TextInput label="Ngân hàng" value={g.bank} onChange={(e) => setGift(i, { bank: e.target.value })} />
            <TextInput label="Số tài khoản" inputMode="numeric" value={g.accountNumber} onChange={(e) => setGift(i, { accountNumber: e.target.value })} />
            <TextInput label="Chủ tài khoản" value={g.accountName} onChange={(e) => setGift(i, { accountName: e.target.value.toUpperCase() })} />
          </Grid>
          <ImageField label="Mã QR (tuỳ chọn)" value={g.qr} allowEmpty album={album} onChange={(v) => setGift(i, { qr: v })} />
        </div>
      ))}
      <Button onClick={() => onChange([...gifts, { label: "", bank: "", accountNumber: "", accountName: "", qr: "" }])}>+ Thêm tài khoản</Button>
    </Card>
  );
}
