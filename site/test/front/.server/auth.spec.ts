import { describe, it, expect, beforeEach } from "vitest";
import { getSessionStorage, getSession, commitSession, destroySession, checkAdminAuth, isJsonRequest } from "../../../src/front/.server/panel/auth";
import { env } from "cloudflare:test";

describe("auth helpers", () => {
    beforeEach(async () => {
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS Usuario (
                id TEXT PRIMARY KEY, nome TEXT NOT NULL, email TEXT NOT NULL,
                admin INTEGER NOT NULL, status INTEGER NOT NULL, lgpd INTEGER NOT NULL,
                created_at INTEGER NOT NULL, modified_at INTEGER NOT NULL
            )
        `).run();
        await env.DB.prepare("DELETE FROM Usuario").run();
    });

    it("getSessionStorage should throw if secret is missing", () => {
        expect(() => getSessionStorage({})).toThrow("Missing session secret in environment variables");
    });

    it("getSessionStorage should return session storage if secret is provided", () => {
        const storage = getSessionStorage({ SESSION_SECRET: "secret" });
        expect(storage.getSession).toBeDefined();
    });

    it("should handle session lifecycle (get, commit, destroy)", async () => {
        const customEnv = { SESSION_SECRET: "test-secret" };
        const storage = getSessionStorage(customEnv);
        const session = await storage.getSession();
        session.set("userId", "123");

        const cookie = await commitSession(session, customEnv);
        expect(cookie).toContain("__session=");

        const request = new Request("http://localhost", {
            headers: { Cookie: cookie }
        });

        const retrievedSession = await getSession(request, customEnv);
        expect(retrievedSession.get("userId")).toBe("123");

        const destroyCookie = await destroySession(retrievedSession, customEnv);
        expect(destroyCookie).toContain("__session=");
    });

    it("checkAdminAuth should return false if no userId in session", async () => {
        const request = new Request("http://localhost");
        const result = await checkAdminAuth(request, { ...env, SESSION_SECRET: "test-secret" });
        expect(result.isAdmin).toBe(false);
        expect(result.userId).toBeNull();
    });

    it("checkAdminAuth should return false if user not in DB", async () => {
        const customEnv = { ...env, SESSION_SECRET: "test-secret" };
        const storage = getSessionStorage(customEnv);
        const session = await storage.getSession();
        session.set("userId", "123");
        const cookie = await commitSession(session, customEnv);

        const request = new Request("http://localhost", { headers: { Cookie: cookie } });
        const result = await checkAdminAuth(request, customEnv);

        expect(result.isAdmin).toBe(false);
        expect(result.userId).toBeNull();
        expect(result.user).toBeNull();
    });

    it("checkAdminAuth should return true if user is admin in DB", async () => {
        await env.DB.prepare(`
            INSERT INTO Usuario (id, nome, email, admin, status, lgpd, created_at, modified_at)
            VALUES ('123', 'Admin', 'admin@test.com', 1, 1, 0, 0, 0)
        `).run();

        const customEnv = { ...env, SESSION_SECRET: "test-secret" };
        const storage = getSessionStorage(customEnv);
        const session = await storage.getSession();
        session.set("userId", "123");
        session.set("avatar", "http://avatar.com/1.jpg");
        const cookie = await commitSession(session, customEnv);

        const request = new Request("http://localhost", { headers: { Cookie: cookie } });
        const result = await checkAdminAuth(request, customEnv);

        expect(result.isAdmin).toBe(true);
        expect(result.userId).toBe("123");
        expect(result.user).toBeDefined();
        expect(result.user.avatar).toBe("http://avatar.com/1.jpg");
    });

    it("checkAdminAuth should return false if user is not admin in DB", async () => {
        await env.DB.prepare(`
            INSERT INTO Usuario (id, nome, email, admin, status, lgpd, created_at, modified_at)
            VALUES ('123', 'User', 'user@test.com', 0, 1, 0, 0, 0)
        `).run();

        const customEnv = { ...env, SESSION_SECRET: "test-secret" };
        const storage = getSessionStorage(customEnv);
        const session = await storage.getSession();
        session.set("userId", "123");
        const cookie = await commitSession(session, customEnv);

        const request = new Request("http://localhost", { headers: { Cookie: cookie } });
        const result = await checkAdminAuth(request, customEnv);

        expect(result.isAdmin).toBe(false);
        expect(result.userId).toBe("123");
        expect(result.user).toBeDefined();
        expect(result.user.admin).toBe(0);
    });

    it("isJsonRequest should correctly identify JSON requests", () => {
        let req = new Request("http://localhost", { headers: { Accept: "application/json" } });
        expect(isJsonRequest(req)).toBe(true);

        req = new Request("http://localhost?json=true");
        expect(isJsonRequest(req)).toBe(true);

        req = new Request("http://localhost", { headers: { Accept: "text/html" } });
        expect(isJsonRequest(req)).toBe(false);
    });
});
