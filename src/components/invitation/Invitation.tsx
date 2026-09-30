import Image from "next/image";
import type { ReactNode } from "react";
import { getContent, getVisibleWishes } from "@/lib/data";
import { longVi, toInstant } from "@/lib/date";
import { lunarLine } from "@/lib/lunar";
import { viewFor, type InviteView, type Section, type Side, type Wish } from "@/lib/types";
import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";
import { Album } from "../sections/Album";
import { Calendar } from "../sections/Calendar";
import { Countdown } from "../sections/Countdown";
import { Couple } from "../sections/Couple";
import { DressCode } from "../sections/DressCode";
import { Events } from "../sections/Events";
import { GiftBox } from "../sections/GiftBox";
import { Hero } from "../sections/Hero";
import { Wishes } from "../sections/Wishes";
import { InvitationShell } from "./InvitationShell";

type Ctx = { view: InviteView; section: Section; wishes: Wish[] };

function Block({ id, children, tone = "cream" }: { id: string; children: ReactNode; tone?: "cream" | "paper" }) {
  return (
    <section id={id} className={`scroll-mt-14 px-5 py-20 ${tone === "paper" ? "bg-paper" : "bg-cream"}`}>
      {children}
    </section>
  );
}

// One renderer per section type; order and visibility come from content.sections.
const RENDERERS: Record<Section["type"], (ctx: Ctx) => ReactNode> = {
  hero: ({ view, section }) => (
    <section id={section.id}>
      <Hero view={view} />
    </section>
  ),
  calendar: ({ view, section }) => (
    <Block id={section.id}>
      {section.title && <SectionHeading eyebrow="" title={section.title} />}
      <Calendar view={view} section={section} />
    </Block>
  ),
  couple: ({ view, section }) => (
    <Block id={section.id}>
      <SectionHeading eyebrow={section.eyebrow} title={section.title} />
      <Couple view={view} />
    </Block>
  ),
  events: ({ view, section }) => (
    <Block id={section.id} tone="paper">
      <SectionHeading eyebrow={section.eyebrow} title={section.title} />
      <Events events={view.info.events} />
    </Block>
  ),
  dresscode: ({ view, section }) => (
    <Block id={section.id} tone="paper">
      <SectionHeading eyebrow={section.eyebrow} title={section.title} />
      <DressCode content={view.content} />
    </Block>
  ),
  album: ({ view, section }) => (
    <Block id={section.id}>
      <SectionHeading eyebrow={section.eyebrow} title={section.title} />
      <Album photos={view.content.album} />
    </Block>
  ),
  wishes: ({ section, wishes }) => (
    <Block id={section.id} tone="paper">
      <SectionHeading eyebrow={section.eyebrow} title={section.title} />
      <Wishes wishes={wishes} />
    </Block>
  ),
  gift: ({ view, section }) => (
    <Block id={section.id}>
      <SectionHeading eyebrow={section.eyebrow} title={section.title} />
      <GiftBox gifts={view.content.gifts} />
    </Block>
  ),
  countdown: ({ view: { content, info }, section }) => (
    <section id={section.id} className="relative scroll-mt-14 overflow-hidden px-5 py-24">
      <Image src={content.countdownPhoto} alt="" fill quality={90} sizes="(max-width: 480px) 100vw, 480px" className="object-cover" />
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} light />
        <Reveal>
          <Countdown target={toInstant(info.mainDateTime).toISOString()} />
        </Reveal>
        <p className="mt-8 text-center font-serif text-white/90 italic">
          {longVi(info.mainDateTime.slice(0, 10))}
          <br />
          <span className="text-sm">({lunarLine(info.mainDateTime.slice(0, 10))})</span>
          <br />
          {info.location}
        </p>
      </div>
    </section>
  ),
  thanks: ({ view: { content, names }, section }) => (
    <Block id={section.id}>
      <Reveal className="text-center">
        <div className="relative mx-auto size-48 overflow-hidden rounded-full shadow-[0_12px_30px_rgba(120,90,60,.15)] ring-8 ring-paper">
          <Image src={content.thanksPhoto} alt="" fill quality={90} sizes="192px" className="object-cover" />
        </div>
        {section.eyebrow && <p className="eyebrow mt-10">{section.eyebrow}</p>}
        {section.title && <h2 className="mt-3 font-serif text-3xl">{section.title}</h2>}
        <p className="mt-5 font-serif text-lg">
          {names[0]} và {names[1]}
        </p>
        <p className="mx-auto mt-2 max-w-xs font-serif leading-relaxed text-ink/85">{content.thanksMessage}</p>
        <p className="mt-4 text-xl">💛💛💛</p>
      </Reveal>
    </Block>
  ),
};

const NAV_FALLBACK: Record<Section["type"], string> = {
  hero: "Trang chủ",
  calendar: "Ngày cưới",
  couple: "Cô dâu & Chú rể",
  events: "Lịch trình",
  dresscode: "Dress code",
  album: "Album ảnh",
  wishes: "Lời chúc",
  gift: "Mừng cưới",
  countdown: "Đếm ngược",
  thanks: "Lời cảm ơn",
};

export async function Invitation({ guest, side }: { guest: string | null; side: Side }) {
  const [content, wishes] = await Promise.all([getContent(), getVisibleWishes()]);
  const view = viewFor(content, side);
  const sections = content.sections.filter((s) => s.visible);

  return (
    <InvitationShell
      monogram={view.monogram}
      musicUrl={content.music.url}
      showWishButton={sections.some((s) => s.type === "wishes")}
      nav={sections.map((s) => ({ id: s.id, label: NAV_FALLBACK[s.type] }))}
      envelope={{
        names: view.names,
        date: view.info.mainDateTime.slice(0, 10),
        inviteLine: content.invite.line,
        guest: guest ?? content.invite.defaultGuest,
      }}
    >
      {sections.map((section) => (
        <div key={section.id}>{RENDERERS[section.type]({ view, section, wishes })}</div>
      ))}
      <footer className="bg-paper py-8 pb-24 text-center text-xs text-muted">
        {view.names[0]} &amp; {view.names[1]} · {view.info.mainDateTime.slice(0, 4)}
      </footer>
    </InvitationShell>
  );
}
