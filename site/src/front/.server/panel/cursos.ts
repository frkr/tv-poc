import { checkAdminAuth } from "./auth";
import randomHEX from "../../lib/randomHEX";
import database from "./database.json";

export async function loader({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const { isAdmin, userId } = await checkAdminAuth(request, env);
    if (!isAdmin || !userId) return { cursos: [], canais: [] };
    
    const { results: cursos } = await env.DB.prepare(database.SELECT_CURSOS).bind(userId).all();
    const { results: canais } = await env.DB.prepare(database.SELECT_CANAIS_SIMPLES).bind(userId).all();
    return { cursos, canais };
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
        const id_canal = formData.get("id_canal")?.toString() || "";
        
        const id = await randomHEX();
        
        const stmt1 = env.DB.prepare(database.INSERT_CURSO)
            .bind(id, nome, descricao, thumbnail, 1, now, now);
        const stmtInsertAdmin = env.DB.prepare(database.INSERT_CURSO_USUARIO_ADMIN).bind(id, userId);
        
        if (id_canal) {
            const stmt2 = env.DB.prepare(database.INSERT_CURSO_CANAL)
                .bind(id, id_canal);
            await env.DB.batch([stmt1, stmtInsertAdmin, stmt2]);
        } else {
            await env.DB.batch([stmt1, stmtInsertAdmin]);
        }
        
        return { success: true };
    }
    
    if (intent === "update") {
        const id = formData.get("id")?.toString();
        const nome = formData.get("nome")?.toString() || "";
        const descricao = formData.get("descricao")?.toString() || "";
        const thumbnail = formData.get("thumbnail")?.toString() || "";
        const id_canal = formData.get("id_canal")?.toString() || "";
        
        if (id) {
            const stmt1 = env.DB.prepare(database.UPDATE_CURSO)
                .bind(nome, descricao, thumbnail, now, id, userId);
            
            // Updates to relationships might be complex, typically we delete and re-insert 
            // for many-to-many, but here it's 1-to-N or simpler.
            const stmtDeleteAssoc = env.DB.prepare(database.DELETE_CURSO_CANAL).bind(id);
            
            if (id_canal) {
                const stmtInsertAssoc = env.DB.prepare(database.INSERT_CURSO_CANAL).bind(id, id_canal);
                await env.DB.batch([stmtDeleteAssoc, stmtInsertAssoc, stmt1]);
            } else {
                await env.DB.batch([stmtDeleteAssoc, stmt1]);
            }
        }
        
        return { success: true };
    }
    
    if (intent === "delete") {
        const id = formData.get("id")?.toString();
        if (id) {
            const stmt1 = env.DB.prepare(database.DELETE_CURSO_USUARIO_ADMIN).bind(id);
            const stmt2 = env.DB.prepare(database.DELETE_CURSO_CANAL).bind(id);
            const stmt3 = env.DB.prepare(database.DELETE_CURSO).bind(id, userId);
            await env.DB.batch([stmt1, stmt2, stmt3]);
        }
        return { success: true };
    }

    return { error: "Intent inválido" };
}