import { checkAdminAuth } from "./auth";
import randomHEX from "../../lib/randomHEX";
import database from "./database.json";

export async function loader({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const { isAdmin, userId } = await checkAdminAuth(request, env);
    if (!isAdmin || !userId) return { cursos: [], canais: [] };
    
    const { results: cursos } = await env.DB.prepare(database.SELECT_CURSOS).bind(userId).all();
    const { results: canais } = await env.DB.prepare(database.SELECT_CANAIS_SIMPLES).bind(userId).all();
    const { results: categorias } = await env.DB.prepare(database.SELECT_CATEGORIAS_SIMPLES).all();
    return { cursos, canais, categorias };
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
        
        const data_publicacao_str = formData.get("data_publicacao")?.toString();
        const parsedDate = data_publicacao_str ? new Date(data_publicacao_str).getTime() : null;
        const data_publicacao = (parsedDate && !isNaN(parsedDate)) ? parsedDate : null;
        const id_categoria = formData.get("id_categoria")?.toString() || "";

        if (!id_categoria) {
            return { error: "Categoria é obrigatória" };
        }

        if (id_canal) {
            const canalOwner = await env.DB.prepare(
                "SELECT 1 FROM CanalUsuarioAdmin WHERE id_canal = ? AND id_usuario = ?"
            ).bind(id_canal, userId).first();
            if (!canalOwner) return { error: "Não autorizado para este canal" };
        }

        const id = await randomHEX();

        const stmt1 = env.DB.prepare(database.INSERT_CURSO)
            .bind(id, nome, descricao, thumbnail, 1, data_publicacao, now, now);
        const stmtInsertAdmin = env.DB.prepare(database.INSERT_CURSO_USUARIO_ADMIN).bind(id, userId);
        
        const stmts = [stmt1, stmtInsertAdmin];
        if (id_canal) stmts.push(env.DB.prepare(database.INSERT_CURSO_CANAL).bind(id, id_canal));
        if (id_categoria) stmts.push(env.DB.prepare(database.INSERT_CURSO_CATEGORIA).bind(id, id_categoria));
        await env.DB.batch(stmts);
        
        return { success: true };
    }
    
    if (intent === "update") {
        const id = formData.get("id")?.toString();
        const nome = formData.get("nome")?.toString() || "";
        const descricao = formData.get("descricao")?.toString() || "";
        const thumbnail = formData.get("thumbnail")?.toString() || "";
        const id_canal = formData.get("id_canal")?.toString() || "";
        const id_categoria = formData.get("id_categoria")?.toString() || "";
        const data_publicacao_str_u = formData.get("data_publicacao")?.toString();
        const parsedDateU = data_publicacao_str_u ? new Date(data_publicacao_str_u).getTime() : null;
        const data_publicacao_u = (parsedDateU && !isNaN(parsedDateU)) ? parsedDateU : null;

        if (!id_categoria) {
            return { error: "Categoria é obrigatória" };
        }

        if (id) {
            const isOwner = await env.DB.prepare(
                "SELECT 1 FROM CursoUsuarioAdmin WHERE id_curso = ? AND id_usuario = ?"
            ).bind(id, userId).first();
            if (!isOwner) return { error: "Não autorizado" };

            if (id_canal) {
                const canalOwner = await env.DB.prepare(
                    "SELECT 1 FROM CanalUsuarioAdmin WHERE id_canal = ? AND id_usuario = ?"
                ).bind(id_canal, userId).first();
                if (!canalOwner) return { error: "Não autorizado para este canal" };
            }

            const stmt1 = env.DB.prepare(database.UPDATE_CURSO)
                .bind(nome, descricao, thumbnail, data_publicacao_u, now, id, userId);
            const stmtDeleteCanal = env.DB.prepare(database.DELETE_CURSO_CANAL).bind(id);
            const stmtDeleteCategoria = env.DB.prepare(database.DELETE_CURSO_CATEGORIA).bind(id);

            const stmts = [stmtDeleteCanal, stmtDeleteCategoria, stmt1];
            if (id_canal) stmts.push(env.DB.prepare(database.INSERT_CURSO_CANAL).bind(id, id_canal));
            if (id_categoria) stmts.push(env.DB.prepare(database.INSERT_CURSO_CATEGORIA).bind(id, id_categoria));
            await env.DB.batch(stmts);
        }
        
        return { success: true };
    }
    
    if (intent === "delete") {
        const id = formData.get("id")?.toString();
        if (id) {
            const isOwner = await env.DB.prepare(
                "SELECT 1 FROM CursoUsuarioAdmin WHERE id_curso = ? AND id_usuario = ?"
            ).bind(id, userId).first();
            if (!isOwner) return { error: "Não autorizado" };

            const stmt1 = env.DB.prepare(database.DELETE_CURSO).bind(id, userId);
            const stmt2 = env.DB.prepare(database.DELETE_CURSO_USUARIO_ADMIN).bind(id);
            const stmt3 = env.DB.prepare(database.DELETE_CURSO_CANAL).bind(id);
            const stmt4 = env.DB.prepare(database.DELETE_CURSO_CATEGORIA).bind(id);
            const stmt5 = env.DB.prepare(database.DELETE_EPISODIOS_BY_CURSO).bind(id);
            await env.DB.batch([stmt1, stmt2, stmt3, stmt4, stmt5]);
        }
        return { success: true };
    }

    return { error: "Intent inválido" };
}