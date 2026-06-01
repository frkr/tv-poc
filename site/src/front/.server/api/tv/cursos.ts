import { checkTvAuth, jsonResponse } from "./auth";
import database from "./database.json";

export async function loader({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const user = await checkTvAuth(request, env);
    if (!user) return jsonResponse({ error: "Não autorizado" }, 401);

    const url = new URL(request.url);
    const id_categoria = url.searchParams.get("categoria");
    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit = 10;
    const offset = (page - 1) * limit;

    const now = Date.now();
    let results;
    if (id_categoria) {
        ({ results } = await env.DB.prepare(database.SELECT_CURSOS_BY_CATEGORIA).bind(id_categoria, now, limit, offset).all());
    } else {
        ({ results } = await env.DB.prepare(database.SELECT_CURSOS_RECENTES).bind(now, limit, offset).all());
    }

    return jsonResponse({ cursos: results, page, limit });
}
