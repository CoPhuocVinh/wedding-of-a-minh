import type { VideoRef } from "./video";

export type SectionType =
  | "hero"
  | "calendar"
  | "couple"
  | "journey"
  | "events"
  | "dresscode"
  | "album"
  | "wishes"
  | "gift"
  | "countdown"
  | "thanks";

export type Section = {
  id: string;
  type: SectionType;
  /** Small uppercase line above the title, e.g. "LỊCH TRÌNH". */
  eyebrow: string;
  title: string;
  visible: boolean;
};

export type Person = {
  name: string;
  /** "Ông Nguyễn Văn Anh" */
  father: string;
  mother: string;
  /** "Trưởng nam", "Thứ nữ"... */
  rank: string;
  /** Parents' home, as printed on the card */
  address: string;
  photo: string;
  bio: string;
};

/** Which family is inviting: groom's (trai, at "/") or bride's (gai, at "/g"). */
export type Side = "trai" | "gai";

/** URL prefix of each side's pages. */
export const SIDE_BASE: Record<Side, string> = { trai: "", gai: "/g" };

export const guestPath = (guest: Pick<Guest, "side" | "slug">) => `${SIDE_BASE[guest.side]}/${guest.slug}`;

export type SideInfo = {
  label: string;
  /** "Lễ Tân Hôn" / "Lễ Vu Quy" */
  ceremonyName: string;
  /** Local Vietnam time, YYYY-MM-DDTHH:mm. Drives hero date, calendar and countdown. */
  mainDateTime: string;
  location: string;
  events: WeddingEvent[];
};

export type WeddingEvent = {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm */
  time: string;
  venue: string;
  address: string;
  mapUrl: string;
  photo: string;
};

/** An album item. Videos keep their thumbnail in `url`. */
export type Photo = {
  id: string;
  url: string;
  alt: string;
  video?: VideoRef;
};

/** One step of the couple's story. */
export type Milestone = {
  id: string;
  /** Free text: "2019", "Tháng 3, 2021", "14.02.2023"... */
  when: string;
  title: string;
  text: string;
  photo: string;
  /** YouTube or Google Drive link; shown instead of the photo when set. */
  video?: string;
};

export type GiftAccount = {
  label: string;
  bank: string;
  accountNumber: string;
  accountName: string;
  qr: string;
};

export type SiteContent = {
  groomName: string;
  brideName: string;
  sides: Record<Side, SideInfo>;
  invite: {
    line: string;
    /** Shown on "/" when no guest is selected. */
    defaultGuest: string;
  };
  bride: Person;
  groom: Person;
  heroPhoto: string;
  countdownPhoto: string;
  thanksPhoto: string;
  thanksMessage: string;
  journey: {
    /** YouTube or Google Drive links, shown above the milestones. */
    videos: string[];
    milestones: Milestone[];
  };
  dressCode: { colors: string[]; note: string };
  gifts: GiftAccount[];
  album: Photo[];
  music: { url: string; title: string };
  og: {
    /** "{names}" is replaced with the couple's names in the side's order. */
    title: string;
    /** Also accepts "{guest}": the guest's salutation + name. */
    guestTitle: string;
    image: string;
  };
  sections: Section[];
};

export type Guest = {
  id: string;
  slug: string;
  /** Anh, Chị, Bạn, Cô Chú, Gia đình... */
  salutation: string;
  name: string;
  side: Side;
  createdAt: string;
};

export type Wish = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
  visible: boolean;
};

export function guestLabel(guest: Pick<Guest, "salutation" | "name">) {
  return [guest.salutation, guest.name].filter(Boolean).join(" ");
}

/** Everything a page needs once the inviting side is known. */
export type InviteView = {
  content: SiteContent;
  side: Side;
  info: SideInfo;
  /** Couple names in this side's order: the inviting family's child first. */
  names: [string, string];
  monogram: string;
};

export function viewFor(content: SiteContent, side: Side): InviteView {
  const names: [string, string] =
    side === "gai" ? [content.brideName, content.groomName] : [content.groomName, content.brideName];
  const initial = (n: string) => n.trim().split(/\s+/).pop()?.[0] ?? "";
  return {
    content,
    side,
    info: content.sides[side],
    names,
    monogram: `${initial(names[0])} & ${initial(names[1])}`,
  };
}
