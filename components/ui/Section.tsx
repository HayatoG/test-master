export function Section({ title, description, children, id }: { title: string; description?: string; children: React.ReactNode; id?: string }) {
  const headingId = id ? `${id}-titulo` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 id={headingId} className="text-lg font-semibold">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}
