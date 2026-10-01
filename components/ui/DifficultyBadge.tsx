import type { Difficulty } from "@/lib/modules";

const STYLES: Record<Difficulty, string> = {
  fácil: "bg-emerald-100 text-emerald-800",
  médio: "bg-amber-100 text-amber-800",
  difícil: "bg-rose-100 text-rose-800",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${STYLES[difficulty]}`}>
      {difficulty}
    </span>
  );
}
