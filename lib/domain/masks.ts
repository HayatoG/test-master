export const onlyDigits = (v: string) => v.replace(/\D/g, "");

function applyPattern(digits: string, pattern: string) {
  let out = "";
  let i = 0;
  for (const ch of pattern) {
    if (i >= digits.length) break;
    if (ch === "0") out += digits[i++];
    else out += ch;
  }
  return out;
}

export const maskCPF = (v: string) => applyPattern(onlyDigits(v).slice(0, 11), "000.000.000-00");
export const maskCNPJ = (v: string) => applyPattern(onlyDigits(v).slice(0, 14), "00.000.000/0000-00");
export const maskCEP = (v: string) => applyPattern(onlyDigits(v).slice(0, 8), "00000-000");
export const maskCardNumber = (v: string) => applyPattern(onlyDigits(v).slice(0, 16), "0000 0000 0000 0000");
export const maskCardExpiry = (v: string) => applyPattern(onlyDigits(v).slice(0, 4), "00/00");

export function maskPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  // Fixo (10 dígitos) ou celular (11 dígitos)
  return d.length <= 10 ? applyPattern(d, "(00) 0000-0000") : applyPattern(d, "(00) 00000-0000");
}
