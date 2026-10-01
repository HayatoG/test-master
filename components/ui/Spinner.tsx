export function Spinner({ label = "Carregando", className = "" }: { label?: string; className?: string }) {
  return (
    <span role="status" aria-live="polite" className={`inline-flex items-center gap-2 text-sm text-slate-600 ${className}`}>
      <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
      <span>{label}…</span>
    </span>
  );
}
