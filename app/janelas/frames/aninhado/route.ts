import { htmlPage } from "@/lib/api/html";

/** Iframe externo que contém outro iframe. */
export function GET() {
  return htmlPage(
    "Iframe externo",
    `<h1 style="font-size:16px;margin:0 0 8px">Iframe externo</h1>
<p>O formulário abaixo está em um segundo iframe.</p>
<iframe title="Iframe interno" src="/janelas/frames/conteudo?nivel=2"></iframe>`,
  );
}
