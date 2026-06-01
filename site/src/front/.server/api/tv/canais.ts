import { checkTvAuth, jsonResponse } from "./auth";
import database from "./database.json";

export async function loader({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const user = await checkTvAuth(request, env);
    if (!user) return jsonResponse({ error: "Não autorizado" }, 401);

    const { results } = await env.DB.prepare(database.SELECT_CANAIS_USUARIO).bind(user.id).all();
    return jsonResponse({ canais: results });
}
