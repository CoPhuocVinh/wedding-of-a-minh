import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";

export const metadata: Metadata = { title: "Quản trị thiệp cưới", robots: { index: false } };

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="min-h-svh bg-stone-100 text-stone-800">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-stone-100/95 backdrop-blur">
        <div className="mx-auto max-w-4xl space-y-3 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Quản trị thiệp cưới</p>
            <div className="flex items-center gap-3 text-sm">
              <Link href="/" target="_blank" className="text-amber-800 hover:underline">
                Xem thiệp ↗
              </Link>
              <form action={logout}>
                <button className="text-stone-500 hover:text-stone-800">Đăng xuất</button>
              </form>
            </div>
          </div>
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-5 sm:px-6">{children}</main>
    </div>
  );
}
