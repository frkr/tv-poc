import { checkTvAuth, jsonResponse } from "./auth";
import database from "./database.json";

export async function loader({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const user = await checkTvAuth(request, env);
    if (!user) return jsonResponse({ error: "Não autorizado" }, 401);

    const now = Date.now();
    const [continueWatching, recentCourses, canais, categorias] = await Promise.all([
        env.DB.prepare(database.SELECT_CONTINUE_WATCHING).bind(user.id, user.id, user.id).all(),
        env.DB.prepare(database.SELECT_CURSOS_RECENTES).bind(now, 10, 0).all(),
        env.DB.prepare(database.SELECT_CANAIS_USUARIO).bind(user.id).all(),
        env.DB.prepare(database.SELECT_CATEGORIAS).all(),
    ]);

    const continueWatchingList = continueWatching.results || [];
    const groupedContinueWatching: any[] = [];
    const seenCursos = new Set<string>();

    for (const item of continueWatchingList) {
        if (!seenCursos.has(item.id_curso)) {
            seenCursos.add(item.id_curso);
            groupedContinueWatching.push(item);
            if (groupedContinueWatching.length >= 10) {
                break;
            }
        }
    }

    return jsonResponse({
        continue_watching: groupedContinueWatching,
        recent_courses: recentCourses.results,
        canais: canais.results,
        categorias: categorias.results,
    });
}
