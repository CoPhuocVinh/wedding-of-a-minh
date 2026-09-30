import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Invitation } from "@/components/invitation/Invitation";
import { getContent, getGuest } from "./data";
import { inviteMetadata } from "./meta";
import { guestLabel, guestPath, type Side } from "./types";

// Shared by "/", "/[slug]", "/g" and "/g/[slug]".

export async function sideMetadata(side: Side): Promise<Metadata> {
  return inviteMetadata(await getContent(), side);
}

export async function guestMetadata(side: Side, slug: string): Promise<Metadata> {
  const [guest, content] = await Promise.all([getGuest(side, slug), getContent()]);
  return guest ? inviteMetadata(content, side, guestLabel(guest)) : {};
}

export async function GuestInvitation({ side, slug }: { side: Side; slug: string }) {
  const guest = await getGuest(side, slug);
  if (!guest) {
    // Link sent under the wrong side's prefix: send them to the right one.
    const other = await getGuest(side === "trai" ? "gai" : "trai", slug);
    if (other) redirect(guestPath(other));
    notFound();
  }
  return <Invitation guest={guestLabel(guest)} side={side} />;
}
