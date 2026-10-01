"use client";

import { useBugs } from "@/lib/bugs/BugsProvider";

export function BugToggle() {
  const { enabled, setEnabled } = useBugs();
  return (
    <div className="flex items-center gap-2">
      <span id="bug-toggle-label" className="text-sm text-slate-200">
        Modo Bugs
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-labelledby="bug-toggle-label"
        data-testid="bug-toggle"
        onClick={() => setEnabled(!enabled)}
        className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? "bg-red-500" : "bg-slate-600"}`}
      >
        <span aria-hidden="true" className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}
