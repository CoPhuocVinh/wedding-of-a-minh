"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendWish, type WishState } from "@/app/actions";
import { SendIcon } from "../icons";

const field =
  "w-full rounded-xl border border-line bg-cream px-4 py-3 text-[0.95rem] outline-none placeholder:text-muted/70 focus:border-accent";

export function WishForm() {
  const [state, action, pending] = useActionState<WishState, FormData>(sendWish, null);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) form.current?.reset();
  }, [state]);

  return (
    <form ref={form} action={action} className="space-y-3 rounded-3xl bg-card p-5 shadow-[0_12px_30px_rgba(120,90,60,.08)]">
      <input name="name" required maxLength={60} placeholder="Tên của bạn" className={field} />
      <textarea name="message" required maxLength={500} rows={4} placeholder="Gửi lời chúc đến cô dâu chú rể…" className={field} />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="text-sm text-accent-dark">Cảm ơn bạn đã gửi lời chúc! 💛</p>}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-medium tracking-wide text-white shadow-md transition hover:bg-accent-dark disabled:opacity-60"
      >
        <SendIcon width={16} height={16} />
        {pending ? "ĐANG GỬI…" : "GỬI LỜI CHÚC"}
      </button>
    </form>
  );
}
