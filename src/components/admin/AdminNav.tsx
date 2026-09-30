"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Nội dung" },
  { href: "/admin/photos", label: "Ảnh" },
  { href: "/admin/sections", label: "Các phần" },
  { href: "/admin/guests", label: "Khách mời" },
  { href: "/admin/wishes", label: "Lời chúc" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {TABS.map((t) => {
        const active = t.href === "/admin" ? path === "/admin" : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition ${active ? "bg-amber-800 text-white" : "text-stone-600 hover:bg-stone-200/60"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
