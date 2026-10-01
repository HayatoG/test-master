"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MODULES } from "@/lib/modules";

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = [{ href: "/", title: "Início", paths: [] as string[] }, ...MODULES.map((m) => ({ href: m.href, title: m.title, paths: [m.href, ...(m.relatedPaths ?? [])] }))];

  return (
    <nav aria-label="Módulos" className="md:w-60 md:shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="menu-modulos"
        onClick={() => setOpen((o) => !o)}
        className="mb-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm font-medium md:hidden"
      >
        {open ? "Fechar menu" : "Abrir menu"}
      </button>
      <ul id="menu-modulos" className={`${open ? "block" : "hidden"} space-y-1 md:sticky md:top-4 md:block`}>
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : item.paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm ${active ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-700 hover:bg-slate-100"}`}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
