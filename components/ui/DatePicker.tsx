"use client";

import { useEffect, useId, useRef, useState } from "react";
import { inputClass, labelClass } from "./form";

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const WEEKDAYS = [
  { short: "D", long: "domingo" },
  { short: "S", long: "segunda-feira" },
  { short: "T", long: "terça-feira" },
  { short: "Q", long: "quarta-feira" },
  { short: "Q", long: "quinta-feira" },
  { short: "S", long: "sexta-feira" },
  { short: "S", long: "sábado" },
];

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayIso = () => {
  const t = new Date();
  return toIso(t.getFullYear(), t.getMonth(), t.getDate());
};

/**
 * Date picker customizado (sem input nativo). Mais difícil de automatizar:
 * é preciso abrir o calendário, navegar entre meses e clicar no dia.
 * Datas anteriores a hoje ficam desabilitadas.
 */
export function DatePicker({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  errorId,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (iso: string) => void;
  onBlur?: () => void;
  error?: string;
  errorId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<{ y: number; m: number }>({ y: 2000, m: 0 });
  const popoverId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);

  function openCalendar() {
    const base = value ? new Date(`${value}T12:00:00`) : new Date();
    setView({ y: base.getFullYear(), m: base.getMonth() });
    setOpen(true);
  }

  function close() {
    setOpen(false);
    onBlur?.();
  }

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  });

  const shift = (delta: number) =>
    setView(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const firstWeekday = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  const today = open ? todayIso() : "";

  const display = value ? value.split("-").reverse().join("/") : "";

  return (
    <div ref={wrapperRef} className="relative">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="mt-1 flex gap-2">
        <input
          id={id}
          readOnly
          value={display}
          placeholder="dd/mm/aaaa"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onClick={openCalendar}
          className={`${inputClass} cursor-pointer`}
        />
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? popoverId : undefined}
          onClick={() => (open ? close() : openCalendar())}
          className="shrink-0 rounded-md border border-slate-300 bg-white px-3 text-sm hover:bg-slate-50"
        >
          Abrir calendário
        </button>
      </div>
      {open && (
        <div
          id={popoverId}
          role="dialog"
          aria-label={`Escolher ${label.toLowerCase()}`}
          onKeyDown={(e) => e.key === "Escape" && close()}
          className="absolute z-20 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
        >
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => shift(-1)} aria-label="Mês anterior" className="rounded px-2 py-1 hover:bg-slate-100">
              ‹
            </button>
            <p aria-live="polite" className="text-sm font-semibold capitalize" data-testid="calendar-month">
              {MONTHS[view.m]} de {view.y}
            </p>
            <button type="button" onClick={() => shift(1)} aria-label="Próximo mês" className="rounded px-2 py-1 hover:bg-slate-100">
              ›
            </button>
          </div>
          <table className="w-full text-center text-sm">
            <thead>
              <tr>
                {WEEKDAYS.map((w) => (
                  <th key={w.long} scope="col" abbr={w.long} className="py-1 text-xs font-medium text-slate-500">
                    {w.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, wi) => (
                <tr key={wi}>
                  {week.map((day, di) => {
                    if (day === null) return <td key={di} />;
                    const iso = toIso(view.y, view.m, day);
                    const selected = iso === value;
                    const past = iso < today;
                    return (
                      <td key={di} className="p-0.5">
                        <button
                          type="button"
                          disabled={past}
                          aria-pressed={selected}
                          aria-label={`${day} de ${MONTHS[view.m]} de ${view.y}`}
                          onClick={() => {
                            onChange(iso);
                            setOpen(false);
                          }}
                          className={`h-8 w-8 rounded-full ${selected ? "bg-brand-600 text-white" : "hover:bg-slate-100"} ${iso === today ? "font-bold" : ""} disabled:text-slate-300 disabled:hover:bg-transparent`}
                        >
                          {day}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
