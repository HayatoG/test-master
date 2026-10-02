"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass } from "@/components/ui/form";
import { Modal } from "@/components/ui/Modal";
import { Section } from "@/components/ui/Section";
import { useBugs } from "@/lib/bugs/BugsProvider";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { useLocalStore } from "@/lib/storage/useLocalStore";

/* ---------------------------------------------------------------- Kanban */

type ColumnId = "todo" | "doing" | "done";
type Board = Record<ColumnId, string[]>;

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: "todo", title: "A fazer" },
  { id: "doing", title: "Em andamento" },
  { id: "done", title: "Concluído" },
];

const BOARD_SEED: Board = {
  todo: ["Escrever casos de teste", "Configurar CI", "Revisar requisitos"],
  doing: ["Automatizar login"],
  done: ["Instalar Playwright"],
};

/** Kanban com drag-and-drop HTML5 nativo (draggable + dataTransfer). */
export function Kanban() {
  const [board, setBoard, hydrated] = useLocalStore<Board>(STORAGE_KEYS.kanban, BOARD_SEED);
  const [over, setOver] = useState<ColumnId | null>(null);

  function move(card: string, to: ColumnId) {
    setBoard((b) => {
      const next = { todo: b.todo.filter((c) => c !== card), doing: b.doing.filter((c) => c !== card), done: b.done.filter((c) => c !== card) };
      next[to] = [...next[to], card];
      return next;
    });
  }

  return (
    <Section id="kanban" title="Kanban (drag-and-drop HTML5)" description="Arraste os cartões entre as colunas. Funciona com locator.dragTo().">
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(col.id);
            }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              const card = e.dataTransfer.getData("text/plain");
              if (card) move(card, col.id);
              setOver(null);
            }}
            className={`min-h-48 rounded-lg border-2 p-3 ${over === col.id ? "border-brand-500 bg-brand-50" : "border-dashed border-slate-200 bg-slate-50"}`}
          >
            <h3 id={`coluna-${col.id}`} className="mb-2 text-sm font-semibold">
              {col.title} <span className="font-normal text-slate-500">({hydrated ? board[col.id].length : 0})</span>
            </h3>
            <ul aria-labelledby={`coluna-${col.id}`} className="space-y-2">
              {hydrated &&
                board[col.id].map((card) => (
                  <li
                    key={card}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", card);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className="cursor-grab rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm active:cursor-grabbing"
                  >
                    {card}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------- Lista ordenável */

const LIST_SEED = ["Planejar", "Escrever testes", "Revisar código", "Executar CI", "Publicar"];

/**
 * Lista reordenável com pointer events (sem a API de drag-and-drop do HTML5).
 * Pode ser movida com dragTo() ou com mouse.down/move/up.
 */
export function SortableList() {
  const { enabled: bugs } = useBugs();
  const [stored, setStored, hydrated] = useLocalStore<string[]>(STORAGE_KEYS.sortableList, LIST_SEED);
  const [display, setDisplay] = useState<string[] | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  // Refs espelham o estado: eventos de ponteiro podem chegar antes do próximo render.
  const drag = useRef<{ from: number; over: number } | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const order = display ?? stored;

  /** Índice do item sob o ponteiro (soltar sobre um item ocupa a posição dele). */
  function indexAt(clientY: number) {
    const rects = itemRefs.current.slice(0, order.length).map((el) => el!.getBoundingClientRect());
    if (clientY < rects[0].top) return 0;
    const hit = rects.findIndex((r) => clientY >= r.top && clientY <= r.bottom);
    if (hit !== -1) return hit;
    const below = rects.findIndex((r) => clientY < r.top);
    return below === -1 ? rects.length - 1 : below;
  }

  function start(i: number) {
    drag.current = { from: i, over: i };
    setDragIndex(i);
    setOverIndex(i);
  }

  function moveTo(clientY: number) {
    if (!drag.current) return;
    drag.current.over = indexAt(clientY);
    setOverIndex(drag.current.over);
  }

  function finish(clientY: number) {
    if (!drag.current) return;
    const from = drag.current.from;
    const to = indexAt(clientY);
    drag.current = null;
    setDragIndex(null);
    setOverIndex(null);
    if (from === to) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setDisplay(next);
    // B16: com bug, a nova ordem aparece na tela mas não é salva.
    if (!bugs) setStored(next);
  }

  return (
    <Section id="lista-ordenavel" title="Lista ordenável (pointer events)" description="Arraste um item para cima ou para baixo. A ordem é salva e sobrevive ao recarregar.">
      <ol aria-label="Etapas do processo" className="space-y-2">
        {hydrated &&
          order.map((item, i) => (
            <li
              key={item}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                start(i);
              }}
              onPointerMove={(e) => moveTo(e.clientY)}
              onPointerUp={(e) => finish(e.clientY)}
              onPointerCancel={() => {
                drag.current = null;
                setDragIndex(null);
                setOverIndex(null);
              }}
              style={{ touchAction: "none" }}
              className={`flex cursor-grab items-center gap-3 rounded-md border bg-white px-3 py-2 text-sm select-none ${dragIndex === i ? "border-brand-500 opacity-60" : "border-slate-200"} ${overIndex === i && dragIndex !== i ? "ring-2 ring-brand-500" : ""}`}
            >
              <span aria-hidden="true" className="text-slate-400">
                ⋮⋮
              </span>
              <span>
                {i + 1}. {item}
              </span>
            </li>
          ))}
      </ol>
    </Section>
  );
}

/* ---------------------------------------------------------------- Tooltip */

export function TooltipDemo() {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const tooltipId = useId();

  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), 300);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };

  return (
    <Section id="tooltip" title="Tooltip" description="Aparece 300 ms depois do hover ou do foco.">
      <div className="relative inline-block">
        <Button variant="secondary" aria-describedby={open ? tooltipId : undefined} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} onKeyDown={(e) => e.key === "Escape" && hide()}>
          Passe o mouse aqui
        </Button>
        {open && (
          <div id={tooltipId} role="tooltip" className="absolute top-full left-0 z-10 mt-2 w-56 rounded-md bg-ink px-3 py-2 text-xs text-white shadow-lg">
            Dica: tooltips só existem enquanto o mouse está em cima.
          </div>
        )}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------- Hover menu */

export function HoverMenu() {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const items = ["Eletrônicos", "Livros", "Casa", "Esporte"];

  return (
    <Section id="menu-hover" title="Menu ao passar o mouse" description="O submenu abre no hover e fecha quando o mouse sai.">
      <div className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
        <Button variant="secondary" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          Categorias ▾
        </Button>
        {open && (
          <ul aria-label="Categorias" className="absolute top-full left-0 z-10 w-44 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
            {items.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => {
                    setChosen(item);
                    setOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {chosen && (
        <p className="mt-3 text-sm" data-testid="hover-menu-result">
          Categoria escolhida: {chosen}
        </p>
      )}
    </Section>
  );
}

/* ----------------------------------------------------------- Context menu */

export function ContextMenuArea() {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const actions = ["Abrir", "Renomear", "Duplicar", "Excluir"];

  useEffect(() => {
    if (!menu) return;
    menuRef.current?.querySelector("button")?.focus();
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  return (
    <Section id="menu-contexto" title="Menu de contexto" description="Clique com o botão direito na área tracejada.">
      <div
        data-testid="context-area"
        onContextMenu={(e) => {
          e.preventDefault();
          setMenu({ x: e.clientX, y: e.clientY });
        }}
        className="flex h-32 items-center justify-center rounded-md border-2 border-dashed border-slate-300 text-sm text-slate-600"
      >
        Clique com o botão direito aqui (relatorio-final.pdf)
      </div>
      {menu && (
        <ul ref={menuRef} role="menu" aria-label="Ações do arquivo" style={{ left: menu.x, top: menu.y }} className="fixed z-30 w-40 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {actions.map((a) => (
            <li key={a} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setResult(a);
                  setMenu(null);
                }}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-100 focus:bg-slate-100 ${a === "Excluir" ? "text-red-700" : ""}`}
              >
                {a}
              </button>
            </li>
          ))}
        </ul>
      )}
      {result && (
        <p role="status" className="mt-3 text-sm">
          Ação escolhida: {result}
        </p>
      )}
    </Section>
  );
}

/* ----------------------------------------------------------- Duplo clique */

export function DoubleClickEdit() {
  const [text, setText] = useState("Clique duas vezes para editar este texto");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);

  return (
    <Section id="duplo-clique" title="Duplo clique" description="Duplo clique entra em modo de edição. Enter salva, Esc cancela.">
      {editing ? (
        <div>
          <label htmlFor="editar-texto" className={labelClass}>
            Editar texto
          </label>
          <input
            id="editar-texto"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setText(draft.trim() || text);
                setEditing(false);
              }
              if (e.key === "Escape") setEditing(false);
            }}
            onBlur={() => setEditing(false)}
            className={`${inputClass} mt-1`}
          />
        </div>
      ) : (
        <p
          data-testid="editable-text"
          onDoubleClick={() => {
            setDraft(text);
            setEditing(true);
          }}
          className="cursor-text rounded-md border border-transparent px-2 py-1 hover:border-slate-200"
        >
          {text}
        </p>
      )}
    </Section>
  );
}

/* ---------------------------------------------------------------- Teclado */

const LANGUAGES = ["TypeScript", "JavaScript", "Python", "Java", "C#", "Go"];

function describeKey(e: React.KeyboardEvent | KeyboardEvent) {
  const mods = [e.ctrlKey && "Control", e.metaKey && "Meta", e.altKey && "Alt", e.shiftKey && "Shift"].filter(Boolean);
  const key = ["Control", "Meta", "Alt", "Shift"].includes(e.key) ? "" : e.key;
  return [...mods, key].filter(Boolean).join("+");
}

export function KeyboardPlayground() {
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const listboxId = useId();

  // Ctrl+K ou ⌘+K abre a busca rápida em qualquer lugar da página.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onListKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, LANGUAGES.length - 1));
    else if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(LANGUAGES.length - 1);
    else if (e.key === "Enter" || e.key === " ") setSelected(LANGUAGES[active]);
    else return;
    e.preventDefault();
  }

  return (
    <Section id="teclado" title="Teclado e atalhos" description="Pressione Ctrl+K (ou ⌘+K) para abrir a busca rápida.">
      <div className="space-y-5">
        <div>
          <label htmlFor="campo-teclas" className={labelClass}>
            Campo de teclas
          </label>
          <input id="campo-teclas" placeholder="Clique aqui e pressione teclas" onKeyDown={(e) => setLastKey(describeKey(e))} className={`${inputClass} mt-1`} />
          <p className="mt-1 text-sm" data-testid="last-key" aria-live="polite">
            {lastKey ? `Última tecla: ${lastKey}` : "Nenhuma tecla pressionada"}
          </p>
        </div>
        <div>
          <p id={`${listboxId}-label`} className={labelClass}>
            Linguagem favorita (use as setas e Enter)
          </p>
          <ul
            id={listboxId}
            role="listbox"
            tabIndex={0}
            aria-labelledby={`${listboxId}-label`}
            aria-activedescendant={`${listboxId}-opt-${active}`}
            onKeyDown={onListKey}
            className="mt-1 max-w-xs rounded-md border border-slate-300 bg-white py-1"
          >
            {LANGUAGES.map((lang, i) => (
              <li
                key={lang}
                id={`${listboxId}-opt-${i}`}
                role="option"
                aria-selected={selected === lang}
                onClick={() => {
                  setActive(i);
                  setSelected(lang);
                }}
                className={`cursor-pointer px-3 py-1.5 text-sm ${i === active ? "bg-slate-100" : ""} ${selected === lang ? "font-semibold text-brand-700" : ""}`}
              >
                {lang}
              </li>
            ))}
          </ul>
          {selected && (
            <p className="mt-1 text-sm" data-testid="selected-language">
              Selecionado: {selected}
            </p>
          )}
        </div>
      </div>
      <Modal open={searchOpen} onClose={() => setSearchOpen(false)} title="Busca rápida" footer={<Button variant="secondary" onClick={() => setSearchOpen(false)}>Fechar</Button>}>
        <label htmlFor="busca-rapida" className={labelClass}>
          Buscar módulo
        </label>
        <input id="busca-rapida" autoFocus className={`${inputClass} mt-1`} />
      </Modal>
    </Section>
  );
}

/* ---------------------------------------------------------------- Sliders */

export function Sliders() {
  const [volume, setVolume] = useState(30);
  const [brightness, setBrightness] = useState(50);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
  const fromPointer = (clientX: number) => {
    const r = trackRef.current!.getBoundingClientRect();
    setBrightness(clamp(((clientX - r.left) / r.width) * 100));
  };

  function onKey(e: React.KeyboardEvent) {
    const step: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
    if (e.key in step) setBrightness((b) => clamp(b + step[e.key]));
    else if (e.key === "Home") setBrightness(0);
    else if (e.key === "End") setBrightness(100);
    else return;
    e.preventDefault();
  }

  return (
    <Section id="sliders" title="Sliders" description="Um slider nativo (input range) e um customizado (role=slider) controlado por mouse e teclado.">
      <div className="space-y-6">
        <div>
          <label htmlFor="volume" className={labelClass}>
            Volume
          </label>
          <input id="volume" type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="mt-2 w-full accent-brand-600" />
          <output htmlFor="volume" data-testid="volume-value" className="text-sm">
            Volume: {volume}
          </output>
        </div>
        <div>
          <p id="brilho-label" className={labelClass}>
            Brilho
          </p>
          <div
            ref={trackRef}
            onPointerDown={(e) => {
              dragging.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              fromPointer(e.clientX);
            }}
            onPointerMove={(e) => dragging.current && fromPointer(e.clientX)}
            onPointerUp={() => (dragging.current = false)}
            style={{ touchAction: "none" }}
            data-testid="brightness-track"
            className="relative mt-3 h-2 cursor-pointer rounded-full bg-slate-200"
          >
            <div className="absolute inset-y-0 left-0 rounded-full bg-brand-700" style={{ width: `${brightness}%` }} />
            <div
              role="slider"
              tabIndex={0}
              aria-labelledby="brilho-label"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={brightness}
              aria-valuetext={`${brightness}%`}
              onKeyDown={onKey}
              className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-600 bg-white shadow"
              style={{ left: `${brightness}%` }}
            />
          </div>
          <p className="mt-3 text-sm" data-testid="brightness-value">
            Brilho: {brightness}%
          </p>
        </div>
      </div>
    </Section>
  );
}
