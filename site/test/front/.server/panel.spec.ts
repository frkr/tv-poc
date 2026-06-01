import { describe, it, expect, beforeEach, vi } from "vitest";
import { loader as canaisLoader, action as canaisAction } from "../../../src/front/.server/panel/canais";
import { loader as categoriasLoader, action as categoriasAction } from "../../../src/front/.server/panel/categorias";
import { loader as cursosLoader, action as cursosAction } from "../../../src/front/.server/panel/cursos";
import { loader as episodiosLoader, action as episodiosAction } from "../../../src/front/.server/panel/episodios";
import { env } from "cloudflare:test";
import * as auth from "../../../src/front/.server/panel/auth";

describe("Panel Server Actions and Loaders (CRUD)", () => {
    beforeEach(async () => {
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS Canal (
                id TEXT PRIMARY KEY, nome TEXT NOT NULL, descricao TEXT NOT NULL,
                thumbnail TEXT NOT NULL, status INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, modified_at INTEGER NOT NULL
            )
        `).run();
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS Curso (
                id TEXT PRIMARY KEY, nome TEXT NOT NULL, descricao TEXT NOT NULL,
                thumbnail TEXT NOT NULL, status INTEGER NOT NULL DEFAULT 1, data_publicacao INTEGER, created_at INTEGER NOT NULL, modified_at INTEGER NOT NULL
            )
        `).run();
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS CursoCanal (
                id_curso TEXT NOT NULL, id_canal TEXT NOT NULL, PRIMARY KEY (id_curso, id_canal)
            )
        `).run();
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS Episodio (
                id TEXT PRIMARY KEY, id_curso TEXT NOT NULL, nome TEXT NOT NULL, descricao TEXT NOT NULL,
                url TEXT NOT NULL, media_type TEXT NOT NULL, thumbnail TEXT NOT NULL, status INTEGER NOT NULL DEFAULT 1,
                data_publicacao INTEGER, created_at INTEGER NOT NULL, modified_at INTEGER NOT NULL
            )
        `).run();
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS CanalUsuarioAdmin (
                id_canal TEXT NOT NULL, id_usuario TEXT NOT NULL, PRIMARY KEY (id_canal, id_usuario)
            )
        `).run();
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS CursoUsuarioAdmin (
                id_curso TEXT NOT NULL, id_usuario TEXT NOT NULL, PRIMARY KEY (id_curso, id_usuario)
            )
        `).run();
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS Categoria (
                id TEXT PRIMARY KEY, categoria TEXT NOT NULL, created_at INTEGER NOT NULL, modified_at INTEGER NOT NULL
            )
        `).run();
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS CursoCategoria (
                id_curso TEXT NOT NULL, id_categoria TEXT NOT NULL, PRIMARY KEY (id_curso, id_categoria)
            )
        `).run();
        
        await env.DB.prepare("DELETE FROM Canal").run();
        await env.DB.prepare("DELETE FROM Curso").run();
        await env.DB.prepare("DELETE FROM CursoCanal").run();
        await env.DB.prepare("DELETE FROM Episodio").run();
        await env.DB.prepare("DELETE FROM CanalUsuarioAdmin").run();
        await env.DB.prepare("DELETE FROM CursoUsuarioAdmin").run();
        await env.DB.prepare("DELETE FROM Categoria").run();
        await env.DB.prepare("DELETE FROM CursoCategoria").run();
        
        vi.spyOn(auth, 'checkAdminAuth').mockResolvedValue({ isAdmin: true, userId: 'user1', user: { nome: 'Admin' } });
    });

    it("should fully CRUD Canais (com verificação campo a campo)", async () => {
        const context = { env };
        
        // CREATE
        let formData = new FormData();
        formData.append("intent", "create");
        formData.append("nome", "Canal 1");
        formData.append("descricao", "Desc");
        formData.append("thumbnail", "http://test.com/1.jpg");
        await canaisAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        // READ
        let loaderResult = await canaisLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.canais).toHaveLength(1);
        const canalId = loaderResult.canais[0].id;
        expect(loaderResult.canais[0].nome).toBe("Canal 1");
        expect(loaderResult.canais[0].descricao).toBe("Desc");
        expect(loaderResult.canais[0].thumbnail).toBe("http://test.com/1.jpg");

        // UPDATE
        formData = new FormData();
        formData.append("intent", "update");
        formData.append("id", canalId);
        formData.append("nome", "Canal Atualizado");
        formData.append("descricao", "Desc Atualizada");
        formData.append("thumbnail", "http://test.com/2.jpg");
        await canaisAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        loaderResult = await canaisLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.canais[0].nome).toBe("Canal Atualizado");
        expect(loaderResult.canais[0].descricao).toBe("Desc Atualizada");
        expect(loaderResult.canais[0].thumbnail).toBe("http://test.com/2.jpg");

        // DELETE
        formData = new FormData();
        formData.append("intent", "delete");
        formData.append("id", canalId);
        await canaisAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        // O loader deve estar vazio
        loaderResult = await canaisLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.canais).toHaveLength(0);

        // Garantir deleção física real da tabela Canal
        const dbCount = await env.DB.prepare("SELECT COUNT(*) as total FROM Canal").first();
        expect(dbCount?.total).toBe(0);
        
        // Garantir remoção da associação de admin
        const dbAdminCount = await env.DB.prepare("SELECT COUNT(*) as total FROM CanalUsuarioAdmin").first();
        expect(dbAdminCount?.total).toBe(0);
    });

    it("should fully CRUD Categorias", async () => {
        const context = { env };
        
        // CREATE
        let formData = new FormData();
        formData.append("intent", "create");
        formData.append("categoria", "Categoria 1");
        await categoriasAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        // READ
        let loaderResult = await categoriasLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.categorias).toHaveLength(1);
        const catId = loaderResult.categorias[0].id;
        expect(loaderResult.categorias[0].categoria).toBe("Categoria 1");

        // UPDATE
        formData = new FormData();
        formData.append("intent", "update");
        formData.append("id", catId);
        formData.append("categoria", "Categoria Atualizada");
        await categoriasAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        loaderResult = await categoriasLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.categorias[0].categoria).toBe("Categoria Atualizada");

        // DELETE
        formData = new FormData();
        formData.append("intent", "delete");
        formData.append("id", catId);
        await categoriasAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        loaderResult = await categoriasLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.categorias).toHaveLength(0);

        // Garantir deleção física real da tabela Categoria
        const dbCount = await env.DB.prepare("SELECT COUNT(*) as total FROM Categoria").first();
        expect(dbCount?.total).toBe(0);
    });

    it("should fully CRUD Cursos (com verificação campo a campo e vinculações)", async () => {
        const context = { env };
        
        // Criar Canal e Categoria de suporte
        await env.DB.prepare("INSERT INTO Canal (id, nome, descricao, thumbnail, status, created_at, modified_at) VALUES ('canal1', 'Canal de Teste', 'Desc', 'http://thumb.jpg', 1, 0, 0)").run();
        await env.DB.prepare("INSERT INTO CanalUsuarioAdmin (id_canal, id_usuario) VALUES ('canal1', 'user1')").run();
        await env.DB.prepare("INSERT INTO Categoria (id, categoria, created_at, modified_at) VALUES ('cat1', 'Categoria de Teste', 0, 0)").run();

        // CREATE com todos os campos e relações
        let formData = new FormData();
        formData.append("intent", "create");
        formData.append("nome", "Curso Completo");
        formData.append("descricao", "Descrição Detalhada do Curso");
        formData.append("thumbnail", "http://test.com/curso.jpg");
        formData.append("id_canal", "canal1");
        formData.append("id_categoria", "cat1");
        formData.append("data_publicacao", "2026-06-01");
        await cursosAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        // READ
        let loaderResult = await cursosLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.cursos).toHaveLength(1);
        const cursoId = loaderResult.cursos[0].id;
        
        // Verificação campo a campo
        expect(loaderResult.cursos[0].nome).toBe("Curso Completo");
        expect(loaderResult.cursos[0].descricao).toBe("Descrição Detalhada do Curso");
        expect(loaderResult.cursos[0].thumbnail).toBe("http://test.com/curso.jpg");
        expect(loaderResult.cursos[0].id_canal).toBe("canal1");
        expect(loaderResult.cursos[0].id_categoria).toBe("cat1");
        expect(new Date(loaderResult.cursos[0].data_publicacao!).toISOString().slice(0, 10)).toBe("2026-06-01");

        // UPDATE (modificar todos os campos para testar campo a campo)
        formData = new FormData();
        formData.append("intent", "update");
        formData.append("id", cursoId);
        formData.append("nome", "Curso Atualizado");
        formData.append("descricao", "Descrição Atualizada");
        formData.append("thumbnail", "http://test.com/curso_updated.jpg");
        formData.append("id_canal", "canal1");
        formData.append("id_categoria", "cat1");
        formData.append("data_publicacao", "2026-06-15");
        await cursosAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        loaderResult = await cursosLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.cursos[0].nome).toBe("Curso Atualizado");
        expect(loaderResult.cursos[0].descricao).toBe("Descrição Atualizada");
        expect(loaderResult.cursos[0].thumbnail).toBe("http://test.com/curso_updated.jpg");
        expect(loaderResult.cursos[0].id_canal).toBe("canal1");
        expect(loaderResult.cursos[0].id_categoria).toBe("cat1");
        expect(new Date(loaderResult.cursos[0].data_publicacao!).toISOString().slice(0, 10)).toBe("2026-06-15");

        // DELETE
        formData = new FormData();
        formData.append("intent", "delete");
        formData.append("id", cursoId);
        await cursosAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        loaderResult = await cursosLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.cursos).toHaveLength(0);

        // Garantir deleção física real da tabela Curso
        const dbCount = await env.DB.prepare("SELECT COUNT(*) as total FROM Curso").first();
        expect(dbCount?.total).toBe(0);

        // Garantir deleção dos mapeamentos de canal e categoria
        const dbCanalCount = await env.DB.prepare("SELECT COUNT(*) as total FROM CursoCanal").first();
        expect(dbCanalCount?.total).toBe(0);
        const dbCatCount = await env.DB.prepare("SELECT COUNT(*) as total FROM CursoCategoria").first();
        expect(dbCatCount?.total).toBe(0);
    });

    it("should require categoria when creating or updating a course", async () => {
        const context = { env };

        // 1. Tentar CREATE sem id_categoria
        let formData = new FormData();
        formData.append("intent", "create");
        formData.append("nome", "Curso Sem Categoria");
        formData.append("descricao", "Descrição");
        formData.append("thumbnail", "http://test.com/curso.jpg");
        const resCreate = await cursosAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);
        expect(resCreate).toEqual({ error: "Categoria é obrigatória" });

        // Criar Canal e Categoria de suporte
        await env.DB.prepare("INSERT INTO Canal (id, nome, descricao, thumbnail, status, created_at, modified_at) VALUES ('canal2', 'Canal de Teste 2', 'Desc', 'http://thumb.jpg', 1, 0, 0)").run();
        await env.DB.prepare("INSERT INTO CanalUsuarioAdmin (id_canal, id_usuario) VALUES ('canal2', 'user1')").run();
        await env.DB.prepare("INSERT INTO Categoria (id, categoria, created_at, modified_at) VALUES ('cat2', 'Categoria de Teste 2', 0, 0)").run();

        // 2. Criar com id_categoria válido primeiro
        formData = new FormData();
        formData.append("intent", "create");
        formData.append("nome", "Curso Válido");
        formData.append("descricao", "Descrição");
        formData.append("thumbnail", "http://test.com/curso.jpg");
        formData.append("id_canal", "canal2");
        formData.append("id_categoria", "cat2");
        await cursosAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        const loaderResult = await cursosLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.cursos).toHaveLength(1);
        const cursoId = loaderResult.cursos[0].id;

        // 3. Tentar UPDATE sem id_categoria
        formData = new FormData();
        formData.append("intent", "update");
        formData.append("id", cursoId);
        formData.append("nome", "Curso Atualizado Sem Categoria");
        formData.append("descricao", "Descrição");
        formData.append("thumbnail", "http://test.com/curso.jpg");
        const resUpdate = await cursosAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);
        expect(resUpdate).toEqual({ error: "Categoria é obrigatória" });
    });

    it("should fully CRUD Episodios (com verificação campo a campo)", async () => {
        const context = { env };
        
        // PREPARE CURSO
        await env.DB.prepare("INSERT INTO Curso (id, nome, descricao, thumbnail, status, created_at, modified_at) VALUES ('curso1', 'Curso 1', 'Desc', 'img', 1, 0, 0)").run();
        await env.DB.prepare("INSERT INTO CursoUsuarioAdmin (id_curso, id_usuario) VALUES ('curso1', 'user1')").run();

        // CREATE
        let formData = new FormData();
        formData.append("intent", "create");
        formData.append("id_curso", "curso1");
        formData.append("nome", "Episodio 1");
        formData.append("descricao", "Desc Ep");
        formData.append("url", "http://test.com/vid.mp4");
        formData.append("thumbnail", "http://test.com/thumb.jpg");
        formData.append("media_type", "video/mp4");
        formData.append("data_publicacao", "2026-06-01");
        await episodiosAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        // READ
        let loaderResult = await episodiosLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.episodios).toHaveLength(1);
        const epId = loaderResult.episodios[0].id;
        
        // Verificação campo a campo
        expect(loaderResult.episodios[0].nome).toBe("Episodio 1");
        expect(loaderResult.episodios[0].descricao).toBe("Desc Ep");
        expect(loaderResult.episodios[0].url).toBe("http://test.com/vid.mp4");
        expect(loaderResult.episodios[0].thumbnail).toBe("http://test.com/thumb.jpg");
        expect(loaderResult.episodios[0].media_type).toBe("video/mp4");
        expect(new Date(loaderResult.episodios[0].data_publicacao!).toISOString().slice(0, 10)).toBe("2026-06-01");
        expect(loaderResult.episodios[0].curso_nome).toBe("Curso 1");

        // UPDATE (modificar todos os campos para testar campo a campo)
        formData = new FormData();
        formData.append("intent", "update");
        formData.append("id", epId);
        formData.append("id_curso", "curso1");
        formData.append("nome", "Episodio Atualizado");
        formData.append("descricao", "Desc Atualizada");
        formData.append("url", "http://test.com/vid_updated.mp4");
        formData.append("thumbnail", "http://test.com/thumb_updated.jpg");
        formData.append("media_type", "video/quicktime");
        formData.append("data_publicacao", "2026-06-15");
        await episodiosAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        loaderResult = await episodiosLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.episodios[0].nome).toBe("Episodio Atualizado");
        expect(loaderResult.episodios[0].descricao).toBe("Desc Atualizada");
        expect(loaderResult.episodios[0].url).toBe("http://test.com/vid_updated.mp4");
        expect(loaderResult.episodios[0].thumbnail).toBe("http://test.com/thumb_updated.jpg");
        expect(loaderResult.episodios[0].media_type).toBe("video/quicktime");
        expect(new Date(loaderResult.episodios[0].data_publicacao!).toISOString().slice(0, 10)).toBe("2026-06-15");

        // DELETE
        formData = new FormData();
        formData.append("intent", "delete");
        formData.append("id", epId);
        await episodiosAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        loaderResult = await episodiosLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.episodios).toHaveLength(0);

        // Garantir deleção física real da tabela Episodio
        const dbCount = await env.DB.prepare("SELECT COUNT(*) as total FROM Episodio").first();
        expect(dbCount?.total).toBe(0);
    });
});
