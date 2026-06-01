import { checkAdminAuth } from "./auth";
import randomHEX from "../../lib/randomHEX";
import database from "./database.json";

export async function loader({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const { isAdmin } = await checkAdminAuth(request, env);
    if (!isAdmin) return { categorias: [] };

    const { results: categorias } = await env.DB.prepare(database.SELECT_CATEGORIAS).all();
    return { categorias };
}

export async function action({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const { isAdmin } = await checkAdminAuth(request, env);
    if (!isAdmin) return { error: "Não autorizado" };

    const formData = await request.formData();
    const intent = formData.get("intent");
    const now = Date.now();

    if (intent === "create") {
        const categoria = formData.get("categoria")?.toString() || "";
        const id = await randomHEX();
        await env.DB.prepare(database.INSERT_CATEGORIA).bind(id, categoria, now, now).run();
        return { success: true };
    }

    if (intent === "update") {
        const id = formData.get("id")?.toString();
        const categoria = formData.get("categoria")?.toString() || "";
        if (id) {
            await env.DB.prepare(database.UPDATE_CATEGORIA).bind(categoria, now, id).run();
        }
        return { success: true };
    }

    if (intent === "delete") {
        const id = formData.get("id")?.toString();
        if (id) {
            const stmt1 = env.DB.prepare(database.DELETE_CURSO_CATEGORIA_BY_CATEGORIA).bind(id);
            const stmt2 = env.DB.prepare(database.DELETE_CATEGORIA).bind(id);
            await env.DB.batch([stmt1, stmt2]);
        }
        return { success: true };
    }

    return { error: "Intent inválido" };
}
