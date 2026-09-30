"use client";

import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

export const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-700/15";

export function Card({ title, children, actions }: { title?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-semibold text-stone-800">{title}</h2>}
          {actions}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-stone-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-400">{hint}</span>}
    </label>
  );
}

export function TextInput({ label, hint, ...props }: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} hint={hint}>
      <input {...props} className={inputCls} />
    </Field>
  );
}

export function TextArea({ label, hint, ...props }: { label: string; hint?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} hint={hint}>
      <textarea rows={3} {...props} className={inputCls} />
    </Field>
  );
}

export function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

type Variant = "primary" | "ghost" | "danger";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-amber-800 text-white hover:bg-amber-900 disabled:bg-stone-400",
  ghost: "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
};

export function Button({ variant = "ghost", className = "", ...props }: { variant?: Variant } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
    />
  );
}

export type SaveState = { status: "idle" | "saving" | "saved" | "error"; error?: string };

/** Sticky bottom bar; also warns before leaving with unsaved changes. */
export function SaveBar({ dirty, state, onSave }: { dirty: boolean; state: SaveState; onSave: () => void }) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const message =
    state.status === "saving"
      ? "Đang lưu…"
      : state.status === "error"
        ? `Lỗi: ${state.error}`
        : dirty
          ? "Có thay đổi chưa lưu"
          : state.status === "saved"
            ? "Đã lưu ✓"
            : "";

  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <span className={`text-sm ${state.status === "error" ? "text-red-700" : "text-stone-500"}`}>{message}</span>
        <Button variant="primary" onClick={onSave} disabled={!dirty || state.status === "saving"}>
          Lưu thay đổi
        </Button>
      </div>
    </div>
  );
}
