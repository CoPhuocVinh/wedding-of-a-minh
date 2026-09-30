import type { Metadata } from "next";
import { dotted, weekday } from "./date";
import { lunarLine } from "./lunar";
import { viewFor, type Side, type SiteContent } from "./types";

/** Link-preview title/description for Zalo, Messenger, etc. */
export function inviteMetadata(content: SiteContent, side: Side, guest?: string): Metadata {
  const { info, names } = viewFor(content, side);
  const fill = (tpl: string) =>
    tpl.replaceAll("{names}", `${names[0]} & ${names[1]}`).replaceAll("{guest}", guest ?? "");
  const date = info.mainDateTime.slice(0, 10);
  const title = fill(guest ? content.og.guestTitle : content.og.title);
  const description = `${info.ceremonyName} · ${weekday(date)}, ${dotted(date)} (${lunarLine(date)}) · ${info.location}`;
  return {
    title,
    description,
    openGraph: { title, description, images: content.og.image ? [content.og.image] : [] },
  };
}
