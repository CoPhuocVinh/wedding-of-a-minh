import { Reveal } from "../Reveal";
import { QuoteIcon } from "../icons";
import { WishForm } from "./WishForm";
import type { Wish } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function Wishes({ wishes }: { wishes: Wish[] }) {
  return (
    <div className="space-y-6">
      {wishes.length > 0 && (
        <Reveal>
          <div className="max-h-[420px] space-y-4 overflow-y-auto rounded-3xl bg-card p-5 shadow-[0_12px_30px_rgba(120,90,60,.08)]">
            {wishes.map((w) => (
              <div key={w.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                <span className="flex size-8 items-center justify-center rounded-full bg-accent text-white">
                  <QuoteIcon width={14} height={14} />
                </span>
                <p className="mt-3 text-[0.95rem] leading-relaxed whitespace-pre-line italic">{w.message}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-medium">{w.name}</span>
                  <span className="text-xs text-muted">{formatDate(w.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      )}
      <Reveal>
        <WishForm />
      </Reveal>
    </div>
  );
}
