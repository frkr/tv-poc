import { describe, it, expect, beforeEach } from "vitest";
import { env } from "cloudflare:test";
import { loader as tvHomeLoader } from "../../../src/front/.server/api/tv/home";

describe("TV Home Endpoint & Continuation Logic", () => {
    beforeEach(async () => {
        // Setup SQLite tables
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS Usuario (
                id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, nome TEXT NOT NULL, admin INTEGER NOT NULL DEFAULT 0, status INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL
            )
        `).run();
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS UsuarioToken (
                id_usuario TEXT PRIMARY KEY, token TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL,
                FOREIGN KEY (id_usuario) REFERENCES Usuario(id)
            )
        `).run();
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS Canal (
                id TEXT PRIMARY KEY, nome TEXT NOT NULL, descricao TEXT NOT NULL, thumbnail TEXT NOT NULL, status INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, modified_at INTEGER NOT NULL
            )
        `).run();
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS CanalUsuario (
                id_canal TEXT NOT NULL, id_usuario TEXT NOT NULL, PRIMARY KEY (id_canal, id_usuario)
            )
        `).run();
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS Categoria (
                id TEXT PRIMARY KEY, categoria TEXT NOT NULL, created_at INTEGER NOT NULL, modified_at INTEGER NOT NULL
            )
        `).run();
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS Curso (
                id TEXT PRIMARY KEY, nome TEXT NOT NULL, descricao TEXT NOT NULL, thumbnail TEXT NOT NULL, status INTEGER NOT NULL DEFAULT 1, data_publicacao INTEGER, created_at INTEGER NOT NULL, modified_at INTEGER NOT NULL
            )
        `).run();
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS Episodio (
                id TEXT PRIMARY KEY, id_curso TEXT NOT NULL, nome TEXT NOT NULL, descricao TEXT NOT NULL, url TEXT NOT NULL, media_type TEXT NOT NULL, thumbnail TEXT NOT NULL, status INTEGER NOT NULL DEFAULT 1, data_publicacao INTEGER, created_at INTEGER NOT NULL, modified_at INTEGER NOT NULL
            )
        `).run();
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS EpisodioProgresso (
                id_episodio TEXT NOT NULL, id_usuario TEXT NOT NULL, progresso INTEGER NOT NULL DEFAULT 0, concluido INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL, PRIMARY KEY (id_episodio, id_usuario)
            )
        `).run();

        // Clear all tables before each test
        await env.DB.prepare("DELETE FROM UsuarioToken").run();
        await env.DB.prepare("DELETE FROM Usuario").run();
        await env.DB.prepare("DELETE FROM Canal").run();
        await env.DB.prepare("DELETE FROM CanalUsuario").run();
        await env.DB.prepare("DELETE FROM Categoria").run();
        await env.DB.prepare("DELETE FROM Curso").run();
        await env.DB.prepare("DELETE FROM Episodio").run();
        await env.DB.prepare("DELETE FROM EpisodioProgresso").run();
    });

    it("should return continue watching, recent courses, canais and categorias correctly", async () => {
        const userId = "user_1";
        const token = "TVT-123";

        // Insert Usuario & Token
        await env.DB.prepare("INSERT INTO Usuario (id, email, nome, created_at) VALUES (?, ?, ?, ?)")
            .bind(userId, "tv@test.com", "TV User", Date.now()).run();
        await env.DB.prepare("INSERT INTO UsuarioToken (id_usuario, token, created_at) VALUES (?, ?, ?)")
            .bind(userId, token, Date.now()).run();

        // Insert Canais and connect to user
        await env.DB.prepare("INSERT INTO Canal (id, nome, descricao, thumbnail, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?)")
            .bind("canal_1", "My Canal", "Desc", "thumb.jpg", Date.now(), Date.now()).run();
        await env.DB.prepare("INSERT INTO CanalUsuario (id_canal, id_usuario) VALUES (?, ?)")
            .bind("canal_1", userId).run();

        // Insert Categorias
        await env.DB.prepare("INSERT INTO Categoria (id, categoria, created_at, modified_at) VALUES (?, ?, ?, ?)")
            .bind("cat_1", "Tech", Date.now(), Date.now()).run();

        // Insert Cursos (sorted by data_publicacao DESC)
        await env.DB.prepare("INSERT INTO Curso (id, nome, descricao, thumbnail, status, data_publicacao, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
            .bind("curso_1", "Curso One", "Desc 1", "thumb1.jpg", 1, 1000, Date.now(), Date.now()).run();
        await env.DB.prepare("INSERT INTO Curso (id, nome, descricao, thumbnail, status, data_publicacao, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
            .bind("curso_2", "Curso Two", "Desc 2", "thumb2.jpg", 1, 2000, Date.now(), Date.now()).run();

        // Insert Episodios for Curso One
        await env.DB.prepare("INSERT INTO Episodio (id, id_curso, nome, descricao, url, media_type, thumbnail, status, data_publicacao, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .bind("ep_1_1", "curso_1", "Episode 1.1", "Desc 1.1", "url1.mp4", "video/mp4", "thumb1.jpg", 1, 100, Date.now(), Date.now()).run();
        await env.DB.prepare("INSERT INTO Episodio (id, id_curso, nome, descricao, url, media_type, thumbnail, status, data_publicacao, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .bind("ep_1_2", "curso_1", "Episode 1.2", "Desc 1.2", "url2.mp4", "video/mp4", "thumb2.jpg", 1, 200, Date.now(), Date.now()).run();

        // Insert EpisodioProgresso (Started Episode 1.1)
        await env.DB.prepare("INSERT INTO EpisodioProgresso (id_episodio, id_usuario, progresso, concluido, updated_at) VALUES (?, ?, ?, ?, ?)")
            .bind("ep_1_1", userId, 10, 0, 5000).run();

        const req = new Request("http://localhost/api/tv/home", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const res = await tvHomeLoader({ request: req, context: { cloudflare: { env } } });
        expect(res.status).toBe(200);

        const data = await res.json() as any;
        expect(data.canais).toHaveLength(1);
        expect(data.canais[0].nome).toBe("My Canal");
        expect(data.categorias).toHaveLength(1);
        expect(data.categorias[0].categoria).toBe("Tech");

        // Verify recent courses (ordered by data_publicacao DESC, so curso_2 first, then curso_1)
        expect(data.recent_courses).toHaveLength(2);
        expect(data.recent_courses[0].id).toBe("curso_2");
        expect(data.recent_courses[1].id).toBe("curso_1");

        // Verify continue watching
        expect(data.continue_watching).toHaveLength(1);
        expect(data.continue_watching[0].episodio_id).toBe("ep_1_1");
        expect(data.continue_watching[0].curso_nome).toBe("Curso One");
    });

    it("should shift to the next uncompleted episode of the course once the previous one is completed", async () => {
        const userId = "user_2";
        const token = "TVT-456";

        // Insert Usuario & Token
        await env.DB.prepare("INSERT INTO Usuario (id, email, nome, created_at) VALUES (?, ?, ?, ?)")
            .bind(userId, "tv2@test.com", "TV User 2", Date.now()).run();
        await env.DB.prepare("INSERT INTO UsuarioToken (id_usuario, token, created_at) VALUES (?, ?, ?)")
            .bind(userId, token, Date.now()).run();

        // Insert Curso
        await env.DB.prepare("INSERT INTO Curso (id, nome, descricao, thumbnail, status, data_publicacao, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
            .bind("curso_test", "Continuation Course", "Desc", "thumb.jpg", 1, 1000, Date.now(), Date.now()).run();

        // Insert 3 Episodios (pub dates: 10, 20, 30)
        await env.DB.prepare("INSERT INTO Episodio (id, id_curso, nome, descricao, url, media_type, thumbnail, status, data_publicacao, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .bind("ep_1", "curso_test", "Ep 1", "Desc", "u1", "video/mp4", "t", 1, 10, Date.now(), Date.now()).run();
        await env.DB.prepare("INSERT INTO Episodio (id, id_curso, nome, descricao, url, media_type, thumbnail, status, data_publicacao, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .bind("ep_2", "curso_test", "Ep 2", "Desc", "u2", "video/mp4", "t", 1, 20, Date.now(), Date.now()).run();
        await env.DB.prepare("INSERT INTO Episodio (id, id_curso, nome, descricao, url, media_type, thumbnail, status, data_publicacao, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .bind("ep_3", "curso_test", "Ep 3", "Desc", "u3", "video/mp4", "t", 1, 30, Date.now(), Date.now()).run();

        // Case 1: ep_1 is in progress (concluido = 0)
        await env.DB.prepare("INSERT INTO EpisodioProgresso (id_episodio, id_usuario, progresso, concluido, updated_at) VALUES (?, ?, ?, ?, ?)")
            .bind("ep_1", userId, 45, 0, 1000).run();

        const req = new Request("http://localhost/api/tv/home", {
            headers: { Authorization: `Bearer ${token}` }
        });

        let res = await tvHomeLoader({ request: req, context: { cloudflare: { env } } });
        let data = await res.json() as any;
        expect(data.continue_watching).toHaveLength(1);
        expect(data.continue_watching[0].episodio_id).toBe("ep_1");

        // Case 2: ep_1 is marked completed (concluido = 1). The first uncompleted episode should now be ep_2.
        await env.DB.prepare("UPDATE EpisodioProgresso SET concluido = 1, updated_at = 2000 WHERE id_episodio = ? AND id_usuario = ?")
            .bind("ep_1", userId).run();

        res = await tvHomeLoader({ request: req, context: { cloudflare: { env } } });
        data = await res.json() as any;
        expect(data.continue_watching).toHaveLength(1);
        expect(data.continue_watching[0].episodio_id).toBe("ep_2");
        expect(data.continue_watching[0].progresso).toBe(0); // No progress entry yet

        // Case 3: ep_2 is also marked completed. The first uncompleted episode should now be ep_3.
        await env.DB.prepare("INSERT INTO EpisodioProgresso (id_episodio, id_usuario, progresso, concluido, updated_at) VALUES (?, ?, ?, ?, ?)")
            .bind("ep_2", userId, 100, 1, 3000).run();

        res = await tvHomeLoader({ request: req, context: { cloudflare: { env } } });
        data = await res.json() as any;
        expect(data.continue_watching).toHaveLength(1);
        expect(data.continue_watching[0].episodio_id).toBe("ep_3");

        // Case 4: ep_3 is marked completed. All episodes are completed, so the course should be removed from continue watching.
        await env.DB.prepare("INSERT INTO EpisodioProgresso (id_episodio, id_usuario, progresso, concluido, updated_at) VALUES (?, ?, ?, ?, ?)")
            .bind("ep_3", userId, 100, 1, 4000).run();

        res = await tvHomeLoader({ request: req, context: { cloudflare: { env } } });
        data = await res.json() as any;
        expect(data.continue_watching).toHaveLength(0);
    });

    it("should order courses in continue watching by most recently watched (updated_at of any episode in the course DESC)", async () => {
        const userId = "user_3";
        const token = "TVT-789";

        // Insert Usuario & Token
        await env.DB.prepare("INSERT INTO Usuario (id, email, nome, created_at) VALUES (?, ?, ?, ?)")
            .bind(userId, "tv3@test.com", "TV User 3", Date.now()).run();
        await env.DB.prepare("INSERT INTO UsuarioToken (id_usuario, token, created_at) VALUES (?, ?, ?)")
            .bind(userId, token, Date.now()).run();

        // Insert 2 Cursos
        await env.DB.prepare("INSERT INTO Curso (id, nome, descricao, thumbnail, status, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
            .bind("curso_A", "Course A", "Desc", "thumb.jpg", 1, Date.now(), Date.now()).run();
        await env.DB.prepare("INSERT INTO Curso (id, nome, descricao, thumbnail, status, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
            .bind("curso_B", "Course B", "Desc", "thumb.jpg", 1, Date.now(), Date.now()).run();

        // Insert Episodes
        await env.DB.prepare("INSERT INTO Episodio (id, id_curso, nome, descricao, url, media_type, thumbnail, status, data_publicacao, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .bind("ep_A1", "curso_A", "Ep A1", "Desc", "u1", "video/mp4", "t", 1, 10, Date.now(), Date.now()).run();
        await env.DB.prepare("INSERT INTO Episodio (id, id_curso, nome, descricao, url, media_type, thumbnail, status, data_publicacao, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .bind("ep_B1", "curso_B", "Ep B1", "Desc", "u1", "video/mp4", "t", 1, 10, Date.now(), Date.now()).run();

        // Both are in progress. Course A was updated at 1000, Course B was updated at 2000.
        await env.DB.prepare("INSERT INTO EpisodioProgresso (id_episodio, id_usuario, progresso, concluido, updated_at) VALUES (?, ?, ?, ?, ?)")
            .bind("ep_A1", userId, 10, 0, 1000).run();
        await env.DB.prepare("INSERT INTO EpisodioProgresso (id_episodio, id_usuario, progresso, concluido, updated_at) VALUES (?, ?, ?, ?, ?)")
            .bind("ep_B1", userId, 20, 0, 2000).run();

        const req = new Request("http://localhost/api/tv/home", {
            headers: { Authorization: `Bearer ${token}` }
        });

        let res = await tvHomeLoader({ request: req, context: { cloudflare: { env } } });
        let data = await res.json() as any;
        expect(data.continue_watching).toHaveLength(2);
        // Course B should be first because its updated_at (2000) is greater than Course A's (1000)
        expect(data.continue_watching[0].id_curso).toBe("curso_B");
        expect(data.continue_watching[1].id_curso).toBe("curso_A");

        // Now update Course A to updated_at = 3000. It should now be first.
        await env.DB.prepare("UPDATE EpisodioProgresso SET progresso = 15, updated_at = 3000 WHERE id_episodio = ? AND id_usuario = ?")
            .bind("ep_A1", userId).run();

        res = await tvHomeLoader({ request: req, context: { cloudflare: { env } } });
        data = await res.json() as any;
        expect(data.continue_watching[0].id_curso).toBe("curso_A");
        expect(data.continue_watching[1].id_curso).toBe("curso_B");
    });
});
