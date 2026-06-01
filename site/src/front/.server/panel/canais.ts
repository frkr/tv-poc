import { checkAdminAuth } from "./auth";
import randomHEX from "../../lib/randomHEX";
import database from "./database.json";

export async function loader({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const { isAdmin, userId } = await checkAdminAuth(request, env);
    if (!isAdmin) return { canais: [] };
    
    const { results } = await env.DB.prepare(database.SELECT_CANAIS).bind(userId).all();
    return { canais: results };
}

export async function action({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const { isAdmin, userId } = await checkAdminAuth(request, env);
    if (!isAdmin || !userId) return { error: "Não autorizado" };

    const formData = await request.formData();
    const intent = formData.get("intent");
    const now = Date.now();

    if (intent === "create") {
        const nome = formData.get("nome")?.toString() || "";
        const descricao = formData.get("descricao")?.toString() || "";
        const thumbnail = formData.get("thumbnail")?.toString() || "";
        
        const id = await randomHEX();
        const stmt1 = env.DB.prepare(database.INSERT_CANAL)
            .bind(id, nome, descricao, thumbnail, 1, now, now);
        const stmt2 = env.DB.prepare(database.INSERT_CANAL_USUARIO_ADMIN)
            .bind(id, userId);
            
        await env.DB.batch([stmt1, stmt2]);
        
        return { success: true };
    }
    
    if (intent === "update") {
        const id = formData.get("id")?.toString();
        const nome = formData.get("nome")?.toString() || "";
        const descricao = formData.get("descricao")?.toString() || "";
        const thumbnail = formData.get("thumbnail")?.toString() || "";
        
        if (id) {
            const isOwner = await env.DB.prepare(
                "SELECT 1 FROM CanalUsuarioAdmin WHERE id_canal = ? AND id_usuario = ?"
            ).bind(id, userId).first();
            if (!isOwner) return { error: "Não autorizado" };

            await env.DB.prepare(database.UPDATE_CANAL)
                .bind(nome, descricao, thumbnail, now, id, userId).run();
        }
        
        return { success: true };
    }
    
    if (intent === "delete") {
        const id = formData.get("id")?.toString();
        if (id) {
            const isOwner = await env.DB.prepare(
                "SELECT 1 FROM CanalUsuarioAdmin WHERE id_canal = ? AND id_usuario = ?"
            ).bind(id, userId).first();
            if (!isOwner) return { error: "Não autorizado" };

            const stmt1 = env.DB.prepare(database.DELETE_CANAL).bind(id, userId);
            const stmt2 = env.DB.prepare(database.DELETE_CURSO_CANAL_BY_CANAL).bind(id);
            const stmt3 = env.DB.prepare(database.DELETE_CANAL_USUARIO_ADMIN).bind(id);
            await env.DB.batch([stmt1, stmt2, stmt3]);
        }
        return { success: true };
    }

    return { error: "Intent inválido" };
}