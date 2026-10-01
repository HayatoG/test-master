import Link from "next/link";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { MODULES } from "@/lib/modules";
import { DEFAULT_PASSWORD, USERS } from "@/lib/seed/users";

const USER_NOTES: Record<string, string> = {
  normal: "Login normal",
  locked: "Bloqueado: recebe mensagem de erro",
  slow: "Login demora 3 segundos",
  expired: "Precisa trocar a senha após o login",
};

export default function Home() {
  return (
    <div className="space-y-10">
      <section aria-labelledby="titulo-home">
        <p className="font-mono text-sm text-brand-700">ambiente de treino para Playwright</p>
        <h1 id="titulo-home" className="mt-1 text-3xl font-semibold tracking-tight">
          QA Playground
        </h1>
        <p className="mt-3 max-w-3xl text-slate-700">
          Cada módulo reproduz um cenário comum em entrevistas técnicas e no dia a dia de QA. Comece pelos módulos fáceis,
          escreva seus testes e depois ligue o <strong>Modo Bugs</strong> para ver se sua suíte encontra os defeitos.
        </p>
      </section>

      <section aria-labelledby="titulo-como-usar" className="grid gap-4 md:grid-cols-3">
        <h2 id="titulo-como-usar" className="sr-only">
          Como usar
        </h2>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="font-semibold">Estado isolado</h3>
          <p className="mt-2 text-sm text-slate-600">
            Os dados ficam no seu navegador. Use o botão <em>Resetar estado</em>, acesse <code>/reset</code> ou chame{" "}
            <code>POST /api/reset</code> para voltar ao início.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="font-semibold">Modo Bugs</h3>
          <p className="mt-2 text-sm text-slate-600">
            Use o interruptor no topo ou acrescente <code>?bugs=on</code> a qualquer URL (<code>?bugs=off</code> desliga).
            Com ele ligado, vários módulos passam a ter defeitos intencionais.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="font-semibold">Determinístico</h3>
          <p className="mt-2 text-sm text-slate-600">
            A mesma ação gera sempre o mesmo resultado. As exceções são propositais e documentadas, como o endpoint{" "}
            <code>/api/flaky</code>.
          </p>
        </div>
      </section>

      <section aria-labelledby="titulo-usuarios">
        <h2 id="titulo-usuarios" className="text-xl font-semibold">
          Usuários de teste
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Senha de todos: <code className="rounded bg-slate-100 px-1.5 py-0.5">{DEFAULT_PASSWORD}</code>
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" className="px-4 py-2">Usuário</th>
                <th scope="col" className="px-4 py-2">Perfil</th>
                <th scope="col" className="px-4 py-2">Comportamento</th>
              </tr>
            </thead>
            <tbody>
              {USERS.map((u) => (
                <tr key={u.username} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-mono">{u.username}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2">{USER_NOTES[u.behavior]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="titulo-modulos">
        <h2 id="titulo-modulos" className="text-xl font-semibold">
          Módulos
        </h2>
        <ul className="mt-4 grid gap-4 lg:grid-cols-2">
          {MODULES.map((m) => (
            <li key={m.slug}>
              <article aria-labelledby={`modulo-${m.slug}`} className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 id={`modulo-${m.slug}`} className="text-lg font-semibold">
                    {m.title}
                  </h3>
                  <DifficultyBadge difficulty={m.difficulty} />
                  {m.requiresLogin && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">requer login</span>}
                </div>
                <p className="mt-2 text-sm text-slate-600">{m.summary}</p>
                <h4 className="mt-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">Cenários sugeridos</h4>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-slate-700">
                  {m.scenarios.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <Link href={m.href} className="mt-4 self-start text-sm font-medium text-brand-700 underline-offset-4 hover:underline">
                  Abrir módulo<span className="sr-only">: {m.title}</span> →
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
