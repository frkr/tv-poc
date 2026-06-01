import { checkTvAuth, jsonResponse } from "./auth";
import database from "./database.json";

export async function loader({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const user = await checkTvAuth(request, env);
    if (!user) return jsonResponse({ error: "Não autorizado" }, 401);

    const url = new URL(request.url);
    const id_episodio = url.searchParams.get("id_episodio");
    if (!id_episodio) return jsonResponse({ error: "id_episodio obrigatório" }, 400);

    const progresso = await env.DB.prepare(database.SELECT_PROGRESSO).bind(id_episodio, user.id).first();
    return jsonResponse({ progresso: progresso ?? null });
}

export async function action({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const user = await checkTvAuth(request, env);
    if (!user) return jsonResponse({ error: "Não autorizado" }, 401);

    const body = await request.json() as { id_episodio: string, progresso: number, concluido?: boolean };
    const { id_episodio, progresso, concluido = false } = body;

    if (!id_episodio || progresso === undefined) {
        return jsonResponse({ error: "id_episodio e progresso são obrigatórios" }, 400);
    }

    await env.DB.prepare(database.UPSERT_PROGRESSO)
        .bind(id_episodio, user.id, progresso, concluido ? 1 : 0, Date.now())
        .run();

    return jsonResponse({ success: true });
}
