import { redirect } from "react-router";
import { getSession } from "../panel/auth";
import database from "../panel/database.json";
import tvDatabase from "../api/tv/database.json";
import generateTvToken from "../../lib/generateTvToken";

export async function loader({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const session = await getSession(request, env);
    const userId = session.get("userId");

    if (!userId) {
        const url = new URL(request.url);
        return redirect(`/login/google?redirect=${encodeURIComponent(url.pathname)}`);
    }

    const user = await env.DB.prepare(database.SELECT_USUARIO).bind(userId).first() as any;
    if (!user) return redirect("/login/google");

    const token = generateTvToken();
    await env.DB.prepare(tvDatabase.UPSERT_TOKEN).bind(userId, token, Date.now()).run();

    return new Response(renderTokenPage(user.nome, token), {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        },
    });
}

function escapeHtml(unsafe: string) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function renderTokenPage(nome: string, token: string) {
    const safeNome = escapeHtml(nome.split(' ')[0] || '');
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Token de Acesso - TV</title>
  <style>
    body { font-family: sans-serif; background: #0f0f1a; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #1a1a2e; border-radius: 16px; padding: 48px; text-align: center; max-width: 480px; width: 90%; }
    h1 { font-size: 1.5rem; margin-bottom: 8px; }
    p { color: #aaa; margin-bottom: 32px; }
    .token { font-size: 1.1rem; font-family: monospace; background: #0d1117; border: 2px solid #3b82f6; border-radius: 8px; padding: 16px 24px; letter-spacing: 2px; word-break: break-all; }
    button { margin-top: 32px; background: #3b82f6; color: white; border: none; padding: 12px 32px; border-radius: 8px; font-size: 1rem; cursor: pointer; }
    button:hover { background: #2563eb; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Olá, ${safeNome}!</h1>
    <p>Seu token de acesso ao aplicativo de TV:</p>
    <div class="token">${token}</div>
    <button onclick="refreshToken()">Gerar novo token</button>
  </div>
  <script>
    function refreshToken() {
      window.location.reload();
    }
  </script>
</body>
</html>`;
}
