"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { FieldError, inputClass, labelClass } from "@/components/ui/form";
import { useBugs } from "@/lib/bugs/BugsProvider";
import { formatDateBR } from "@/lib/domain/money";
import { maskCNPJ, maskCPF, maskPhone, onlyDigits } from "@/lib/domain/masks";
import { ageOn, isStrongPassword, isValidCNPJ, isValidCPF, isValidEmail, PASSWORD_RULES } from "@/lib/domain/validators";

const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
const INTERESTS = ["Automação", "Performance", "Segurança", "Acessibilidade", "Outro"];

type Values = {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  birthDate: string;
  startDate: string;
  uf: string;
  accountType: "PF" | "PJ";
  cnpj: string;
  companyName: string;
  interests: string[];
  otherInterest: string;
  password: string;
  passwordConfirm: string;
  terms: boolean;
};

type Field = keyof Values;
type Errors = Partial<Record<Field, string>>;

const INITIAL: Values = {
  name: "",
  email: "",
  cpf: "",
  phone: "",
  birthDate: "",
  startDate: "",
  uf: "",
  accountType: "PF",
  cnpj: "",
  companyName: "",
  interests: [],
  otherInterest: "",
  password: "",
  passwordConfirm: "",
  terms: false,
};

/** Ordem de foco quando há erros no submit. */
const FIELD_ORDER: Field[] = ["name", "email", "cpf", "phone", "birthDate", "startDate", "uf", "cnpj", "companyName", "interests", "otherInterest", "password", "passwordConfirm", "terms"];
const FIELD_ID: Record<Field, string> = {
  name: "nome",
  email: "email",
  cpf: "cpf",
  phone: "telefone",
  birthDate: "nascimento",
  startDate: "data-inicio",
  uf: "uf",
  accountType: "tipo-pf",
  cnpj: "cnpj",
  companyName: "razao-social",
  interests: "interesse-0",
  otherInterest: "outro-interesse",
  password: "senha",
  passwordConfirm: "confirmar-senha",
  terms: "termos",
};

function validate(v: Values, bugs: boolean): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 3) e.name = "Informe o nome completo (mínimo 3 caracteres)";
  if (!v.email.trim()) e.email = "Informe o e-mail";
  else if (!isValidEmail(v.email, bugs)) e.email = "E-mail inválido";
  if (!v.cpf) e.cpf = "Informe o CPF";
  else if (!isValidCPF(v.cpf, bugs)) e.cpf = "CPF inválido";
  const phoneDigits = onlyDigits(v.phone).length;
  if (!phoneDigits) e.phone = "Informe o telefone";
  else if (phoneDigits < 10) e.phone = "Telefone incompleto";
  if (!v.birthDate) e.birthDate = "Informe a data de nascimento";
  else if (v.birthDate > new Date().toISOString().slice(0, 10)) e.birthDate = "A data não pode estar no futuro";
  else if (ageOn(v.birthDate, new Date()) < 18) e.birthDate = "É preciso ter pelo menos 18 anos";
  if (!v.startDate) e.startDate = "Escolha a data de início";
  if (!v.uf) e.uf = "Selecione o estado";
  if (v.accountType === "PJ") {
    if (!v.cnpj) e.cnpj = "Informe o CNPJ";
    else if (!isValidCNPJ(v.cnpj)) e.cnpj = "CNPJ inválido";
    if (!v.companyName.trim()) e.companyName = "Informe a razão social";
  }
  if (v.interests.length === 0) e.interests = "Selecione pelo menos um interesse";
  if (v.interests.includes("Outro") && !v.otherInterest.trim()) e.otherInterest = "Descreva o outro interesse";
  if (!v.password) e.password = "Informe a senha";
  else if (!isStrongPassword(v.password)) e.password = "A senha não atende aos requisitos";
  // B05: com bug, a confirmação só compara o tamanho.
  const confirmOk = bugs ? v.passwordConfirm.length === v.password.length : v.passwordConfirm === v.password;
  if (!v.passwordConfirm) e.passwordConfirm = "Confirme a senha";
  else if (!confirmOk) e.passwordConfirm = "As senhas não conferem";
  if (!v.terms) e.terms = "É preciso aceitar os termos";
  return e;
}

export function RegistrationForm() {
  const { enabled: bugs } = useBugs();
  const [values, setValues] = useState<Values>(INITIAL);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<{ field?: Field; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<Values | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const errors = validate(values, bugs);
  if (serverError?.field && !errors[serverError.field]) errors[serverError.field] = serverError.message;
  const show = (f: Field) => (submitted || touched[f] ? errors[f] : undefined);

  const set = <K extends Field>(field: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (serverError?.field === field) setServerError(null);
  };
  const blur = (field: Field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const describedBy = (f: Field) => (show(f) ? `${FIELD_ID[f]}-erro` : undefined);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setServerError(null);
    const current = validate(values, bugs);
    const firstInvalid = FIELD_ORDER.find((f) => current[f]);
    if (firstInvalid) {
      document.getElementById(FIELD_ID[firstInvalid])?.focus();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.status === 409) {
        setServerError({ field: "email", message: "Este e-mail já está cadastrado" });
        document.getElementById("email")?.focus();
      } else if (!res.ok) {
        setServerError({ message: "Erro ao enviar o cadastro. Tente novamente." });
      } else {
        setSuccess(values);
      }
    } catch {
      setServerError({ message: "Falha de rede. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div role="status" className="rounded-lg border border-emerald-300 bg-white p-6" data-testid="registration-success">
        <h2 className="text-xl font-semibold text-emerald-800">Cadastro realizado com sucesso!</h2>
        <dl className="mt-4 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-slate-500">Nome</dt>
          <dd>{success.name}</dd>
          <dt className="text-slate-500">E-mail</dt>
          <dd>{success.email}</dd>
          <dt className="text-slate-500">CPF</dt>
          <dd>{success.cpf}</dd>
          <dt className="text-slate-500">Telefone</dt>
          <dd>{success.phone}</dd>
          <dt className="text-slate-500">Nascimento</dt>
          <dd>{formatDateBR(success.birthDate)}</dd>
          <dt className="text-slate-500">Início</dt>
          <dd>{formatDateBR(success.startDate)}</dd>
          <dt className="text-slate-500">Estado</dt>
          <dd>{success.uf}</dd>
          <dt className="text-slate-500">Tipo de conta</dt>
          <dd>{success.accountType === "PF" ? "Pessoa Física" : `Pessoa Jurídica — ${success.companyName} (${success.cnpj})`}</dd>
          <dt className="text-slate-500">Interesses</dt>
          <dd>{success.interests.map((i) => (i === "Outro" ? `Outro: ${success.otherInterest}` : i)).join(", ")}</dd>
        </dl>
        <Button
          className="mt-6"
          onClick={() => {
            setSuccess(null);
            setValues(INITIAL);
            setTouched({});
            setSubmitted(false);
          }}
        >
          Novo cadastro
        </Button>
      </div>
    );
  }

  const errorCount = Object.keys(errors).length;

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Cadastro" className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      {submitted && (errorCount > 0 || serverError) && (
        <div ref={summaryRef} role="alert" data-testid="form-error-summary" className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {serverError && !serverError.field ? serverError.message : `Corrija ${errorCount === 1 ? "1 campo destacado" : `os ${errorCount} campos destacados`}.`}
        </div>
      )}

      <fieldset className="grid gap-4 md:grid-cols-2">
        <legend className="mb-2 text-base font-semibold">Dados pessoais</legend>
        <div className="md:col-span-2">
          <label htmlFor="nome" className={labelClass}>
            Nome completo
          </label>
          <input id="nome" autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} onBlur={blur("name")} aria-invalid={!!show("name")} aria-describedby={describedBy("name")} className={`${inputClass} mt-1`} />
          <FieldError id="nome-erro" message={show("name")} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            E-mail
          </label>
          <input id="email" type="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} onBlur={blur("email")} aria-invalid={!!show("email")} aria-describedby={describedBy("email")} className={`${inputClass} mt-1`} />
          <FieldError id="email-erro" message={show("email")} />
        </div>
        <div>
          <label htmlFor="cpf" className={labelClass}>
            CPF
          </label>
          <input id="cpf" inputMode="numeric" placeholder="000.000.000-00" value={values.cpf} onChange={(e) => set("cpf", maskCPF(e.target.value))} onBlur={blur("cpf")} aria-invalid={!!show("cpf")} aria-describedby={describedBy("cpf")} className={`${inputClass} mt-1`} />
          <FieldError id="cpf-erro" message={show("cpf")} />
        </div>
        <div>
          {/* B06: com bug, o label aponta para o campo de CPF. */}
          <label htmlFor={bugs ? "cpf" : "telefone"} className={labelClass}>
            Telefone
          </label>
          <input id="telefone" type="tel" inputMode="numeric" placeholder="(00) 00000-0000" value={values.phone} onChange={(e) => set("phone", maskPhone(e.target.value))} onBlur={blur("phone")} aria-invalid={!!show("phone")} aria-describedby={describedBy("phone")} className={`${inputClass} mt-1`} />
          <FieldError id="telefone-erro" message={show("phone")} />
        </div>
        <div>
          <label htmlFor="nascimento" className={labelClass}>
            Data de nascimento
          </label>
          <input id="nascimento" type="date" value={values.birthDate} onChange={(e) => set("birthDate", e.target.value)} onBlur={blur("birthDate")} aria-invalid={!!show("birthDate")} aria-describedby={describedBy("birthDate")} className={`${inputClass} mt-1`} />
          <FieldError id="nascimento-erro" message={show("birthDate")} />
        </div>
        <DatePicker
          id="data-inicio"
          label="Data de início"
          value={values.startDate}
          onChange={(iso) => set("startDate", iso)}
          onBlur={blur("startDate")}
          error={show("startDate")}
          errorId="data-inicio-erro"
        />
        <div>
          <label htmlFor="uf" className={labelClass}>
            Estado
          </label>
          <select id="uf" value={values.uf} onChange={(e) => set("uf", e.target.value)} onBlur={blur("uf")} aria-invalid={!!show("uf")} aria-describedby={describedBy("uf")} className={`${inputClass} mt-1`}>
            <option value="">Selecione…</option>
            {UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
          <FieldError id="uf-erro" message={show("uf")} />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-base font-semibold">Tipo de conta</legend>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" id="tipo-pf" name="tipo-conta" value="PF" checked={values.accountType === "PF"} onChange={() => set("accountType", "PF")} />
            Pessoa Física
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" id="tipo-pj" name="tipo-conta" value="PJ" checked={values.accountType === "PJ"} onChange={() => set("accountType", "PJ")} />
            Pessoa Jurídica
          </label>
        </div>
        {values.accountType === "PJ" && (
          <div className="grid gap-4 md:grid-cols-2" data-testid="pj-fields">
            <div>
              <label htmlFor="cnpj" className={labelClass}>
                CNPJ
              </label>
              <input id="cnpj" inputMode="numeric" placeholder="00.000.000/0000-00" value={values.cnpj} onChange={(e) => set("cnpj", maskCNPJ(e.target.value))} onBlur={blur("cnpj")} aria-invalid={!!show("cnpj")} aria-describedby={describedBy("cnpj")} className={`${inputClass} mt-1`} />
              <FieldError id="cnpj-erro" message={show("cnpj")} />
            </div>
            <div>
              <label htmlFor="razao-social" className={labelClass}>
                Razão social
              </label>
              <input id="razao-social" value={values.companyName} onChange={(e) => set("companyName", e.target.value)} onBlur={blur("companyName")} aria-invalid={!!show("companyName")} aria-describedby={describedBy("companyName")} className={`${inputClass} mt-1`} />
              <FieldError id="razao-social-erro" message={show("companyName")} />
            </div>
          </div>
        )}
      </fieldset>

      <fieldset aria-describedby={show("interests") ? "interesse-0-erro" : undefined}>
        <legend className="mb-2 text-base font-semibold">Áreas de interesse</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {INTERESTS.map((interest, i) => (
            <label key={interest} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                id={`interesse-${i}`}
                checked={values.interests.includes(interest)}
                onChange={(e) => {
                  set("interests", e.target.checked ? [...values.interests, interest] : values.interests.filter((x) => x !== interest));
                  setTouched((t) => ({ ...t, interests: true }));
                }}
              />
              {interest}
            </label>
          ))}
        </div>
        <FieldError id="interesse-0-erro" message={show("interests")} />
        {values.interests.includes("Outro") && (
          <div className="mt-3 max-w-md">
            <label htmlFor="outro-interesse" className={labelClass}>
              Qual outro interesse?
            </label>
            <input id="outro-interesse" value={values.otherInterest} onChange={(e) => set("otherInterest", e.target.value)} onBlur={blur("otherInterest")} aria-invalid={!!show("otherInterest")} aria-describedby={describedBy("otherInterest")} className={`${inputClass} mt-1`} />
            <FieldError id="outro-interesse-erro" message={show("otherInterest")} />
          </div>
        )}
      </fieldset>

      <fieldset className="grid gap-4 md:grid-cols-2">
        <legend className="mb-2 text-base font-semibold">Acesso</legend>
        <div>
          <label htmlFor="senha" className={labelClass}>
            Senha
          </label>
          <input id="senha" type="password" autoComplete="new-password" value={values.password} onChange={(e) => set("password", e.target.value)} onBlur={blur("password")} aria-invalid={!!show("password")} aria-describedby={["senha-requisitos", describedBy("password")].filter(Boolean).join(" ")} className={`${inputClass} mt-1`} />
          <FieldError id="senha-erro" message={show("password")} />
          <ul id="senha-requisitos" aria-label="Requisitos da senha" className="mt-2 space-y-0.5 text-xs">
            {PASSWORD_RULES.map((rule) => {
              const met = rule.test(values.password);
              return (
                <li key={rule.id} data-met={met} className={met ? "text-emerald-700" : "text-slate-500"}>
                  <span aria-hidden="true">{met ? "✓" : "○"}</span> {rule.label}
                  <span className="sr-only">{met ? " (atendido)" : " (pendente)"}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <label htmlFor="confirmar-senha" className={labelClass}>
            Confirmar senha
          </label>
          <input id="confirmar-senha" type="password" autoComplete="new-password" value={values.passwordConfirm} onChange={(e) => set("passwordConfirm", e.target.value)} onBlur={blur("passwordConfirm")} aria-invalid={!!show("passwordConfirm")} aria-describedby={describedBy("passwordConfirm")} className={`${inputClass} mt-1`} />
          <FieldError id="confirmar-senha-erro" message={show("passwordConfirm")} />
        </div>
      </fieldset>

      <div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" id="termos" checked={values.terms} onChange={(e) => set("terms", e.target.checked)} aria-invalid={!!show("terms")} aria-describedby={describedBy("terms")} />
          Li e aceito os termos de uso
        </label>
        <FieldError id="termos-erro" message={show("terms")} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Enviando…" : "Cadastrar"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setValues(INITIAL);
            setTouched({});
            setSubmitted(false);
            setServerError(null);
          }}
        >
          Limpar
        </Button>
      </div>
    </form>
  );
}
