import { intBetween, mulberry32, pick } from "./prng";

export type RowStatus = "ativo" | "pendente" | "cancelado";

export type TableRow = {
  id: number;
  customer: string;
  email: string;
  city: string;
  status: RowStatus;
  amount: number;
  createdAt: string; // ISO yyyy-mm-dd
};

export const TABLE_ROW_COUNT = 137;

const FIRST = ["Ana", "Bruno", "Carla", "Diego", "Elisa", "Fábio", "Gabriela", "Heitor", "Isabela", "João", "Larissa", "Marcos", "Natália", "Otávio", "Paula", "Rafael", "Sofia", "Tiago", "Vanessa", "William"];
const LAST = ["Silva", "Souza", "Oliveira", "Santos", "Pereira", "Costa", "Rodrigues", "Almeida", "Nascimento", "Lima", "Araújo", "Ferreira"];
const CITIES = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre", "Recife", "Salvador", "Fortaleza", "Florianópolis", "Brasília"];
const STATUSES: RowStatus[] = ["ativo", "ativo", "pendente", "cancelado"];

function slug(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function build(): TableRow[] {
  const rand = mulberry32(20260101);
  const base = Date.UTC(2025, 0, 1);
  return Array.from({ length: TABLE_ROW_COUNT }, (_, i) => {
    const first = pick(rand, FIRST);
    const last = pick(rand, LAST);
    // Valores de 5 a 2500 para tornar visível a ordenação lexicográfica (bug B09).
    const amount = Math.round((5 + rand() * 2495) * 100) / 100;
    const day = intBetween(rand, 0, 600);
    return {
      id: i + 1,
      customer: `${first} ${last}`,
      email: `${slug(first)}.${slug(last)}${i + 1}@exemplo.com`,
      city: pick(rand, CITIES),
      status: pick(rand, STATUSES),
      amount,
      createdAt: new Date(base + day * 86400000).toISOString().slice(0, 10),
    };
  });
}

export const TABLE_ROWS: readonly TableRow[] = build();
