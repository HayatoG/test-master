"use client";

import { usePathname } from "next/navigation";

export function ResetButton() {
  const pathname = usePathname();
  return (
    <a
      href={`/reset?next=${encodeURIComponent(pathname)}`}
      className="rounded-md border border-slate-500 px-3 py-1.5 text-sm text-slate-100 hover:bg-slate-700"
    >
      Resetar estado
    </a>
  );
}
