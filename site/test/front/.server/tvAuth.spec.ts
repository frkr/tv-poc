import { describe, it, expect, beforeEach } from "vitest";
import { env } from "cloudflare:test";
import generateTvToken from "../../../src/front/lib/generateTvToken";
import { checkTvAuth } from "../../../src/front/.server/api/tv/auth";

describe("TV Token Generation and Auth", () => {
    beforeEach(async () => {
        // Setup SQLite tables for TV Auth
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS Usuario (
                id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, nome TEXT NOT NULL, foto TEXT, created_at INTEGER NOT NULL
            )
        `).run();
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS UsuarioToken (
                id_usuario TEXT PRIMARY KEY, token TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL,
                FOREIGN KEY (id_usuario) REFERENCES Usuario(id)
            )
        `).run();

        await env.DB.prepare("DELETE FROM UsuarioToken").run();
        await env.DB.prepare("DELETE FROM Usuario").run();
    });

    it("should generate a valid TV token in format 'XXX-XXX' containing mixed letters and numbers", () => {
        const token = generateTvToken();
        // Regex format: 3 alphanumeric characters, a hyphen, 3 alphanumeric characters
        expect(token).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/);
        expect(token.length).toBe(7);
    });

    it("should authenticate correctly with exact token matches", async () => {
        const userId = "user_tv_1";
        const token = "A1B-C2D";
        
        await env.DB.prepare("INSERT INTO Usuario (id, email, nome, created_at) VALUES (?, ?, ?, ?)")
            .bind(userId, "tvuser@test.com", "TV User", Date.now()).run();
        await env.DB.prepare("INSERT INTO UsuarioToken (id_usuario, token, created_at) VALUES (?, ?, ?)")
            .bind(userId, token, Date.now()).run();

        const req = new Request("http://localhost/api/tv/home", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const user = await checkTvAuth(req, env);
        expect(user).not.toBeNull();
        expect((user as any).nome).toBe("TV User");
    });

    it("should authenticate case-insensitively", async () => {
        const userId = "user_tv_2";
        const token = "H4X-P9Q"; // Stored in uppercase
        
        await env.DB.prepare("INSERT INTO Usuario (id, email, nome, created_at) VALUES (?, ?, ?, ?)")
            .bind(userId, "tvuser2@test.com", "TV User Case", Date.now()).run();
        await env.DB.prepare("INSERT INTO UsuarioToken (id_usuario, token, created_at) VALUES (?, ?, ?)")
            .bind(userId, token, Date.now()).run();

        // Send completely lowercase token
        const reqLower = new Request("http://localhost/api/tv/home", {
            headers: { Authorization: `Bearer h4x-p9q` }
        });

        const userLower = await checkTvAuth(reqLower, env);
        expect(userLower).not.toBeNull();
        expect((userLower as any).nome).toBe("TV User Case");
    });

    it("should authenticate without hyphen", async () => {
        const userId = "user_tv_3";
        const token = "K7M-W8L"; // Stored with hyphen
        
        await env.DB.prepare("INSERT INTO Usuario (id, email, nome, created_at) VALUES (?, ?, ?, ?)")
            .bind(userId, "tvuser3@test.com", "TV User Hyphen", Date.now()).run();
        await env.DB.prepare("INSERT INTO UsuarioToken (id_usuario, token, created_at) VALUES (?, ?, ?)")
            .bind(userId, token, Date.now()).run();

        // Send token without hyphen
        const reqNoHyphen = new Request("http://localhost/api/tv/home", {
            headers: { Authorization: `Bearer k7mw8l` }
        });

        const userNoHyphen = await checkTvAuth(reqNoHyphen, env);
        expect(userNoHyphen).not.toBeNull();
        expect((userNoHyphen as any).nome).toBe("TV User Hyphen");
    });

    it("should return null for invalid or missing tokens", async () => {
        const reqInvalid = new Request("http://localhost/api/tv/home", {
            headers: { Authorization: "Bearer INVALID" }
        });
        const userInvalid = await checkTvAuth(reqInvalid, env);
        expect(userInvalid).toBeNull();

        const reqNoAuth = new Request("http://localhost/api/tv/home");
        const userNoAuth = await checkTvAuth(reqNoAuth, env);
        expect(userNoAuth).toBeNull();
    });
});
