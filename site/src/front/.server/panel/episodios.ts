import { checkAdminAuth } from "./auth";
import randomHEX from "../../lib/randomHEX";
import database from "./database.json";

export async function loader({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const { isAdmin, userId } = await checkAdminAuth(request, env);
    if (!isAdmin || !userId) return { episodios: [], cursos: [] };
    
    const { results: episodios } = await env.DB.prepare(database.SELECT_EPISODIOS).bind(userId).all();
    
    const { results: cursos } = await env.DB.prepare(database.SELECT_CURSOS_SIMPLES).bind(userId).all();
    return { episodios, cursos };
}

export async function action({ request, context }: { request: Request, context: any }) {
    const env = context?.cloudflare?.env || context?.env;
    const { isAdmin, userId } = await checkAdminAuth(request, env);
    if (!isAdmin || !userId) return { error: "Não autorizado" };

    const formData = await request.formData();
    const intent = formData.get("intent");
    const now = Date.now();

    if (intent === "create") {
        const id_curso = formData.get("id_curso")?.toString() || "";
        const nome = formData.get("nome")?.toString() || "";
        const descricao = formData.get("descricao")?.toString() || "";
        const url = formData.get("url")?.toString() || "";
        const media_type = formData.get("media_type")?.toString() || "video/mp4";
        const thumbnail = formData.get("thumbnail")?.toString() || "";
        
        if (!id_curso) return { error: "Selecione um curso" };

        const isCursoOwner = await env.DB.prepare(
            "SELECT 1 FROM CursoUsuarioAdmin WHERE id_curso = ? AND id_usuario = ?"
        ).bind(id_curso, userId).first();
        if (!isCursoOwner) return { error: "Não autorizado para este curso" };

        const data_publicacao_str = formData.get("data_publicacao")?.toString();
        const parsedDate = data_publicacao_str ? new Date(data_publicacao_str).getTime() : null;
        const data_publicacao = (parsedDate && !isNaN(parsedDate)) ? parsedDate : null;

        const id = await randomHEX();
        await env.DB.prepare(database.INSERT_EPISODIO)
            .bind(id, id_curso, nome, descricao, url, media_type, thumbnail, 1, data_publicacao, now, now).run();
        
        return { success: true };
    }
    
    if (intent === "update") {
        const id = formData.get("id")?.toString();
        const id_curso = formData.get("id_curso")?.toString() || "";
        const nome = formData.get("nome")?.toString() || "";
        const descricao = formData.get("descricao")?.toString() || "";
        const url = formData.get("url")?.toString() || "";
        const media_type = formData.get("media_type")?.toString() || "video/mp4";
        const thumbnail = formData.get("thumbnail")?.toString() || "";
        
        const data_publicacao_str = formData.get("data_publicacao")?.toString();

        if (id && id_curso) {
            const isCursoOwner = await env.DB.prepare(
                "SELECT 1 FROM CursoUsuarioAdmin WHERE id_curso = ? AND id_usuario = ?"
            ).bind(id_curso, userId).first();
            if (!isCursoOwner) return { error: "Não autorizado para este curso" };

            const isEpisodioOwner = await env.DB.prepare(
                "SELECT 1 FROM Episodio e INNER JOIN CursoUsuarioAdmin cua ON e.id_curso = cua.id_curso WHERE e.id = ? AND cua.id_usuario = ?"
            ).bind(id, userId).first();
            if (!isEpisodioOwner) return { error: "Não autorizado para este episódio" };

            const parsedDateU = data_publicacao_str ? new Date(data_publicacao_str).getTime() : null;
            const data_publicacao = (parsedDateU && !isNaN(parsedDateU)) ? parsedDateU : null;

            await env.DB.prepare(database.UPDATE_EPISODIO)
                .bind(id_curso, nome, descricao, url, media_type, thumbnail, data_publicacao, now, id, userId).run();
        }
        
        return { success: true };
    }
    
    if (intent === "delete") {
        const id = formData.get("id")?.toString();
        if (id) {
            const isEpisodioOwner = await env.DB.prepare(
                "SELECT 1 FROM Episodio e INNER JOIN CursoUsuarioAdmin cua ON e.id_curso = cua.id_curso WHERE e.id = ? AND cua.id_usuario = ?"
            ).bind(id, userId).first();
            if (!isEpisodioOwner) return { error: "Não autorizado para este episódio" };

            await env.DB.prepare(database.DELETE_EPISODIO).bind(id, userId).run();
        }
        return { success: true };
    }

    return { error: "Intent inválido" };
}