const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Formata em reais. Usa espaço comum no lugar do NBSP para facilitar asserções. */
export const formatBRL = (value: number) => BRL.format(value).replace(/ /g, " ");

/** Arredonda para centavos evitando erros de ponto flutuante. */
export const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function formatDateBR(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
