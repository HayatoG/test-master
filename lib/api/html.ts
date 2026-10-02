/** Página HTML mínima (sem o layout do site) para ser exibida dentro de iframes. */
export function htmlPage(title: string, body: string) {
  return new Response(
    `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; padding: 12px; color: #0f172a; background: #fff; }
  label { display: block; font-size: 14px; font-weight: 500; }
  input { margin-top: 4px; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
  button { padding: 6px 12px; border-radius: 6px; border: 0; background: #047857; color: #fff; cursor: pointer; }
  iframe { width: 100%; height: 170px; border: 1px solid #cbd5e1; border-radius: 6px; }
  p { font-size: 14px; }
</style>
</head>
<body>${body}</body>
</html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
