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
            await env.DB.prepare(database.UPDATE_CANAL)
                .bind(nome, descricao, thumbnail, now, id, userId).run();
        }
        
        return { success: true };
    }
    
    if (intent === "delete") {
        const id = formData.get("id")?.toString();
        if (id) {
            const stmt1 = env.DB.prepare(database.DELETE_CANAL_USUARIO_ADMIN).bind(id);
            const stmt2 = env.DB.prepare(database.DELETE_CANAL).bind(id, userId);
            // It might fail if the user tries to delete a channel they don't own, 
            // but the WHERE clause in DELETE_CANAL prevents it from being deleted if they don't own it.
            // But we should delete from CanalUsuarioAdmin first to avoid foreign key issues or leaving orphaned rows.
            await env.DB.batch([stmt1, stmt2]);
        }
        return { success: true };
    }

    return { error: "Intent inválido" };
}