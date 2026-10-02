/** Regras de upload compartilhadas entre o client e a API. */
export const MAX_UPLOAD_BYTES = 1024 * 1024; // 1 MB
export const MAX_FILES = 5;

const ALLOWED: Record<string, string[]> = {
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  pdf: ["application/pdf"],
  csv: ["text/csv", "application/vnd.ms-excel", "text/plain"],
};

export const ACCEPT_ATTR = ".png,.jpg,.jpeg,.pdf,.csv";

export function extensionOf(name: string) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

/** Valida tipo (extensão + MIME, quando informado) e tamanho. Retorna a mensagem de erro ou null. */
export function validateUpload(file: { name: string; size: number; type: string }, bugs = false): string | null {
  const allowed = ALLOWED[extensionOf(file.name)];
  if (!allowed || (file.type && !allowed.includes(file.type))) return "Tipo de arquivo não permitido. Use PNG, JPG, PDF ou CSV.";
  if (file.size === 0) return "O arquivo está vazio";
  // B17: com bug, "1 MB" vira 1.000.000 bytes em vez de 1.048.576.
  const limit = bugs ? 1_000_000 : MAX_UPLOAD_BYTES;
  if (file.size > limit) return "O arquivo excede o limite de 1 MB";
  return null;
}

export function formatBytes(bytes: number) {
  const fmt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${fmt(bytes / 1024)} KB`;
  return `${fmt(bytes / (1024 * 1024))} MB`;
}

export function toCsv(rows: (string | number)[][]) {
  return rows.map((r) => r.map((v) => (typeof v === "number" ? String(v) : `"${v.replace(/"/g, '""')}"`)).join(",")).join("\n") + "\n";
}
