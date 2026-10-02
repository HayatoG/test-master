import { htmlPage } from "@/lib/api/html";

/** Conteúdo do iframe: um formulário simples. ?nivel=2 indica o iframe interno. */
export function GET(request: Request) {
  const level = new URL(request.url).searchParams.get("nivel") === "2" ? "interno" : "simples";
  return htmlPage(
    `Iframe ${level}`,
    `<h1 style="font-size:16px;margin:0 0 8px">Formulário no iframe ${level}</h1>
<form id="form">
  <label for="mensagem">Mensagem</label>
  <input id="mensagem" name="mensagem">
  <button type="submit">Enviar</button>
</form>
<p role="status" id="resultado"></p>
<script>
  document.getElementById("form").addEventListener("submit", function (e) {
    e.preventDefault();
    document.getElementById("resultado").textContent = "Mensagem enviada: " + document.getElementById("mensagem").value;
  });
</script>`,
  );
}
