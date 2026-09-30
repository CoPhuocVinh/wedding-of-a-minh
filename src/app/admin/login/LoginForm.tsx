"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { inputCls } from "@/components/admin/ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-lg font-semibold text-stone-800">Quản trị thiệp cưới</h1>
        <p className="text-sm text-stone-500">Đăng nhập để tiếp tục</p>
      </div>
      <input name="username" defaultValue={state?.username} key={state?.username} required autoFocus autoComplete="username" autoCapitalize="none" placeholder="Tên đăng nhập" className={inputCls} />
      <input name="password" type="password" required autoComplete="current-password" placeholder="Mật khẩu" className={inputCls} />
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-amber-800 py-2.5 text-sm font-medium text-white hover:bg-amber-900 disabled:opacity-60"
      >
        {pending ? "Đang kiểm tra…" : "Đăng nhập"}
      </button>
    </form>
  );
}
