import { checkAdminAuth } from "./auth";
import database from "./database.json";

export async function loader({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const { isAdmin, userId } = await checkAdminAuth(request, env);
    
    if (!isAdmin) {
        return {
            canaisTotal: 0,
            cursosTotal: 0,
            episodiosTotal: 0,
            categoriasTotal: 0,
        };
    }

    const [canais, cursos, episodios, categorias] = await env.DB.batch([
        env.DB.prepare(database.COUNT_CANAIS).bind(userId),
        env.DB.prepare(database.COUNT_CURSOS).bind(userId),
        env.DB.prepare(database.COUNT_EPISODIOS).bind(userId),
        env.DB.prepare(database.COUNT_CATEGORIAS),
    ]);

    return {
        canaisTotal: canais.results[0]?.total || 0,
        cursosTotal: cursos.results[0]?.total || 0,
        episodiosTotal: episodios.results[0]?.total || 0,
        categoriasTotal: categorias.results[0]?.total || 0,
    };
}
