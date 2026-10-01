/** Todas as chaves do localStorage usam este prefixo para o reset limpar tudo. */
export const STORAGE_PREFIX = "qap:";

export const STORAGE_KEYS = {
  products: `${STORAGE_PREFIX}products`,
  cart: `${STORAGE_PREFIX}cart`,
  orders: `${STORAGE_PREFIX}orders`,
  kanban: `${STORAGE_PREFIX}kanban`,
  sortableList: `${STORAGE_PREFIX}sortable-list`,
  lastUsername: `${STORAGE_PREFIX}last-username`,
} as const;

export function clearAppStorage() {
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) toRemove.push(key);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
  sessionStorage.clear();
}
