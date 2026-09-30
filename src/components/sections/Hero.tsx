import Image from "next/image";
import { dotted } from "@/lib/date";
import type { InviteView } from "@/lib/types";

export function Hero({ view: { content, info, names } }: { view: InviteView }) {
  return (
    <div className="relative h-svh min-h-[560px] overflow-hidden">
      <Image
        src={content.heroPhoto}
        alt={`${names[0]} & ${names[1]}`}
        fill
        priority
        // Portrait photo filling a full-height box: width follows the height.
        sizes="(max-width: 480px) max(100vw, 72vh), max(480px, 72vh)"
        quality={90}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/55" />
      <div className="absolute inset-x-0 bottom-20 px-6 text-center text-white">
        <h1 className="font-serif text-[2.6rem] leading-tight italic drop-shadow">
          {names[0]}
          <br />
          <span className="text-3xl">&amp;</span> {names[1]}
        </h1>
        <p className="mt-5 font-serif text-2xl tracking-[0.15em]">
          {dotted(info.mainDateTime.slice(0, 10))}
        </p>
        <p className="mt-2 text-[0.7rem] tracking-[0.35em] uppercase opacity-85">{info.location}</p>
      </div>
    </div>
  );
}
