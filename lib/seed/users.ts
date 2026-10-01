export type Role = "user" | "admin";

export type SeedUser = {
  id: number;
  username: string;
  name: string;
  email: string;
  role: Role;
  /** Comportamento especial documentado no README. */
  behavior: "normal" | "locked" | "slow" | "expired";
};

/** Senha única para todos os usuários de teste. */
export const DEFAULT_PASSWORD = "qa@12345";

export const USERS: readonly SeedUser[] = [
  { id: 1, username: "standard_user", name: "Ana Souza", email: "ana.souza@qaplayground.dev", role: "user", behavior: "normal" },
  { id: 2, username: "locked_user", name: "Bruno Lima", email: "bruno.lima@qaplayground.dev", role: "user", behavior: "locked" },
  { id: 3, username: "slow_user", name: "Carla Mendes", email: "carla.mendes@qaplayground.dev", role: "user", behavior: "slow" },
  { id: 4, username: "admin", name: "Diego Admin", email: "diego.admin@qaplayground.dev", role: "admin", behavior: "normal" },
  { id: 5, username: "expired_user", name: "Elisa Prado", email: "elisa.prado@qaplayground.dev", role: "user", behavior: "expired" },
];

export const SLOW_LOGIN_MS = 3000;

export function findUser(username: string) {
  return USERS.find((u) => u.username === username);
}

/** Versão pública (sem dados sensíveis) usada pela API. */
export function publicUser(u: SeedUser) {
  return { id: u.id, username: u.username, name: u.name, email: u.email, role: u.role };
}
