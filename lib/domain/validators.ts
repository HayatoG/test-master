import { onlyDigits } from "./masks";

export function isValidEmail(email: string, buggy = false) {
  // B03: a versão com bug não exige domínio de topo (aceita "ana@qa").
  const re = buggy ? /^[^\s@]+@[^\s@]+$/ : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(email.trim());
}

export function isValidCPF(value: string, buggy = false) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  // B04: a versão com bug só confere a quantidade de dígitos.
  if (buggy) return true;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

export function isValidCNPJ(value: string) {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const calc = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((acc, w, i) => acc + Number(cnpj[i]) * w, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return calc(12) === Number(cnpj[12]) && calc(13) === Number(cnpj[13]);
}

export const PASSWORD_RULES = [
  { id: "length", label: "Pelo menos 8 caracteres", test: (s: string) => s.length >= 8 },
  { id: "upper", label: "Uma letra maiúscula", test: (s: string) => /[A-Z]/.test(s) },
  { id: "lower", label: "Uma letra minúscula", test: (s: string) => /[a-z]/.test(s) },
  { id: "digit", label: "Um número", test: (s: string) => /\d/.test(s) },
  { id: "special", label: "Um caractere especial (!@#$%…)", test: (s: string) => /[^A-Za-z0-9]/.test(s) },
] as const;

export const isStrongPassword = (s: string) => PASSWORD_RULES.every((r) => r.test(s));

/** Algoritmo de Luhn para número de cartão. */
export function isValidCardNumber(value: string) {
  const digits = onlyDigits(value);
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

/** Idade completa em anos, em relação a `today` (yyyy-mm-dd). */
export function ageOn(birth: string, today: Date) {
  const [y, m, d] = birth.split("-").map(Number);
  let age = today.getFullYear() - y;
  const beforeBirthday = today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d);
  if (beforeBirthday) age--;
  return age;
}
