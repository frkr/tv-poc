import { checkTvAuth, jsonResponse } from "./auth";
import database from "./database.json";

export async function loader({ request, params, context }: { request: Request, params: any, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const user = await checkTvAuth(request, env);
    if (!user) return jsonResponse({ error: "Não autorizado" }, 401);

    const id_curso = params.id_curso;
    if (!id_curso) return jsonResponse({ error: "id_curso obrigatório" }, 400);

    const now = Date.now();
    const { results } = await env.DB.prepare(database.SELECT_EPISODIOS_BY_CURSO).bind(user.id, id_curso, now).all();
    return jsonResponse({ episodios: results });
}
