import type { Difficulty } from "@/lib/modules";
import { DifficultyBadge } from "./DifficultyBadge";

export function PageHeader({ title, description, difficulty }: { title: string; description?: string; difficulty?: Difficulty }) {
  return (
    <header className="mb-6 border-b border-slate-200 pb-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {difficulty && <DifficultyBadge difficulty={difficulty} />}
      </div>
      {description && <p className="mt-2 max-w-3xl text-slate-600">{description}</p>}
    </header>
  );
}
