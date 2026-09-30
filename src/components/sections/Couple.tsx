import { MediaThumb, Zoomable } from "../Lightbox";
import { Reveal, type RevealVariant } from "../Reveal";
import type { InviteView, Person, Photo } from "@/lib/types";

type ProfileProps = { person: Person; role: string; from: RevealVariant; portraits: Photo[]; at: number };

function Profile({ person, role, from, portraits, at }: ProfileProps) {
  return (
    <Reveal className="text-center" variant={from}>
      <Zoomable
        items={portraits}
        index={at}
        className="relative mx-auto block aspect-[3/4] w-56 overflow-hidden rounded-t-full shadow-[0_12px_30px_rgba(120,90,60,.15)]"
      >
        <MediaThumb photo={portraits[at]} sizes="224px" />
      </Zoomable>
      <p className="eyebrow mt-6">
        {role} · {person.rank}
      </p>
      <p className="mt-2 font-serif text-3xl">{person.name}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Con {person.father}
        <br />
        và {person.mother}
      </p>
      {person.bio && <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed">{person.bio}</p>}
    </Reveal>
  );
}

export function Couple({ view: { content, side } }: { view: InviteView }) {
  // The inviting family's child comes first, entering from the left.
  const order = side === "gai" ? (["bride", "groom"] as const) : (["groom", "bride"] as const);
  const portraits = order.map((who) => ({ id: who, url: content[who].photo, alt: content[who].name }));
  const [first, second] = order.map((who, i) => (
    <Profile
      key={who}
      person={content[who]}
      role={who === "groom" ? "Chú rể" : "Cô dâu"}
      from={i === 0 ? "left" : "right"}
      portraits={portraits}
      at={i}
    />
  ));
  return (
    <div className="space-y-14">
      {first}
      <div className="mx-auto h-px w-16 bg-line" />
      {second}
    </div>
  );
}
