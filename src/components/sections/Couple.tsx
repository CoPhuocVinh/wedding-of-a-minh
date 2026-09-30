import Image from "next/image";
import { Reveal } from "../Reveal";
import type { InviteView, Person } from "@/lib/types";

function Profile({ person, role }: { person: Person; role: string }) {
  return (
    <Reveal className="text-center">
      <div className="relative mx-auto aspect-[3/4] w-56 overflow-hidden rounded-t-full shadow-[0_12px_30px_rgba(120,90,60,.15)]">
        <Image src={person.photo} alt={person.name} fill quality={90} sizes="224px" className="object-cover" />
      </div>
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
  const groom = <Profile person={content.groom} role="Chú rể" />;
  const bride = <Profile person={content.bride} role="Cô dâu" />;
  // The inviting family's child comes first.
  const [first, second] = side === "gai" ? [bride, groom] : [groom, bride];
  return (
    <div className="space-y-14">
      {first}
      <div className="mx-auto h-px w-16 bg-line" />
      {second}
    </div>
  );
}
