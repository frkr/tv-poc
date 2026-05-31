import { describe, it, expect, beforeEach, vi } from "vitest";
import { loader as canaisLoader, action as canaisAction } from "../../../src/front/.server/panel/canais";
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
                thumbnail TEXT NOT NULL, status INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, modified_at INTEGER NOT NULL
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
                created_at INTEGER NOT NULL, modified_at INTEGER NOT NULL
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
        
        await env.DB.prepare("DELETE FROM Canal").run();
        await env.DB.prepare("DELETE FROM Curso").run();
        await env.DB.prepare("DELETE FROM CursoCanal").run();
        await env.DB.prepare("DELETE FROM Episodio").run();
        await env.DB.prepare("DELETE FROM CanalUsuarioAdmin").run();
        await env.DB.prepare("DELETE FROM CursoUsuarioAdmin").run();
        
        vi.spyOn(auth, 'checkAdminAuth').mockResolvedValue({ isAdmin: true, userId: 'user1', user: { nome: 'Admin' } });
    });

    it("should fully CRUD Canais", async () => {
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

        // DELETE
        formData = new FormData();
        formData.append("intent", "delete");
        formData.append("id", canalId);
        await canaisAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        loaderResult = await canaisLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.canais).toHaveLength(0);
    });

    it("should fully CRUD Cursos", async () => {
        const context = { env };
        
        // CREATE
        let formData = new FormData();
        formData.append("intent", "create");
        formData.append("nome", "Curso 1");
        formData.append("descricao", "Desc");
        formData.append("thumbnail", "http://test.com/c1.jpg");
        await cursosAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        // READ
        let loaderResult = await cursosLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.cursos).toHaveLength(1);
        const cursoId = loaderResult.cursos[0].id;

        // UPDATE
        formData = new FormData();
        formData.append("intent", "update");
        formData.append("id", cursoId);
        formData.append("nome", "Curso Atualizado");
        formData.append("descricao", "Desc Atualizada");
        formData.append("thumbnail", "http://test.com/c2.jpg");
        await cursosAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        loaderResult = await cursosLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.cursos[0].nome).toBe("Curso Atualizado");

        // DELETE
        formData = new FormData();
        formData.append("intent", "delete");
        formData.append("id", cursoId);
        await cursosAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        loaderResult = await cursosLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.cursos).toHaveLength(0);
    });

    it("should fully CRUD Episodios", async () => {
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
        await episodiosAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        // READ
        let loaderResult = await episodiosLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.episodios).toHaveLength(1);
        const epId = loaderResult.episodios[0].id;
        expect(loaderResult.episodios[0].nome).toBe("Episodio 1");
        expect(loaderResult.episodios[0].curso_nome).toBe("Curso 1");

        // UPDATE
        formData = new FormData();
        formData.append("intent", "update");
        formData.append("id", epId);
        formData.append("id_curso", "curso1");
        formData.append("nome", "Episodio Atualizado");
        formData.append("descricao", "Desc Atualizada");
        formData.append("url", "http://test.com/vid2.mp4");
        formData.append("thumbnail", "http://test.com/thumb2.jpg");
        formData.append("media_type", "video/mp4");
        await episodiosAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        loaderResult = await episodiosLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.episodios[0].nome).toBe("Episodio Atualizado");

        // DELETE
        formData = new FormData();
        formData.append("intent", "delete");
        formData.append("id", epId);
        await episodiosAction({ request: new Request("http://localhost", { method: "POST", body: formData }), context } as any);

        loaderResult = await episodiosLoader({ request: new Request("http://localhost"), context } as any);
        expect(loaderResult.episodios).toHaveLength(0);
    });
});
