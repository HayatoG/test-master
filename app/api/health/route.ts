import { json } from "@/lib/api/http";

export function GET() {
  return json({ status: "ok" });
}
