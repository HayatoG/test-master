import Link from "next/link";
import type { SessionPayload } from "@/lib/auth/session";
import { BugToggle } from "./BugToggle";
import { ResetButton } from "./ResetButton";
import { UserMenu } from "./UserMenu";

export function Header({ session, bugsOn }: { session: SessionPayload | null; bugsOn: boolean }) {
  return (
    <header className="bg-ink text-white">
      {bugsOn && (
        <p role="note" data-testid="bug-mode-banner" className="bg-red-600 px-4 py-1 text-center text-xs font-semibold tracking-widest uppercase">
          Modo Bugs ativo — o comportamento do site está intencionalmente errado
        </p>
      )}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-mono text-lg font-semibold tracking-tight">
          <span aria-hidden="true" className="rounded bg-brand-500 px-1.5 text-ink">
            QA
          </span>
          Playground
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <BugToggle />
          <ResetButton />
          <UserMenu session={session} />
        </div>
      </div>
    </header>
  );
}
