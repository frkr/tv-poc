import { checkAdminAuth } from "../panel/auth";
import database from "./database.json";

export async function loader({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const { userId, user } = await checkAdminAuth(request, env);
    
    if (!userId) {
        throw new Response("Unauthorized", { status: 401 });
    }

    const { results: canais } = await env.DB.prepare(database.SELECT_ALL_CANAIS).all();
    const { results: cursos } = await env.DB.prepare(database.SELECT_ALL_CURSOS).all();

    return {
        user,
        canais,
        cursos
    };
}
