import { error, json } from "@/lib/api/http";
import { MAX_UPLOAD_BYTES, validateUpload } from "@/lib/domain/files";

/**
 * POST /api/upload (multipart/form-data, campo "file").
 * Valida de novo no servidor e devolve metadados + SHA-256. Nada é guardado.
 */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return error(400, "Envie multipart/form-data com o campo 'file'");
  }
  const file = form.get("file");
  if (!(file instanceof File)) return error(400, "Campo 'file' ausente");
  if (file.size > MAX_UPLOAD_BYTES) return error(413, "O arquivo excede o limite de 1 MB");
  const problem = validateUpload(file);
  if (problem) return error(415, problem);

  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  const sha256 = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  return json({ name: file.name, size: file.size, type: file.type, sha256 }, 201);
}
