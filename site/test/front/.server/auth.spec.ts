import { describe, it, expect, beforeEach } from "vitest";
import { isJsonRequest, getSessionStorage, getSession, commitSession, destroySession, checkAdminAuth } from "../../../src/front/.server/panel/auth";
import { env } from "cloudflare:test";

describe("auth functions", () => {
	beforeEach(async () => {
		await env.DB.prepare(`
			CREATE TABLE IF NOT EXISTS Usuario (
				id TEXT PRIMARY KEY,
				nome TEXT NOT NULL,
				email TEXT NOT NULL,
				admin INTEGER NOT NULL DEFAULT 0,
				status INTEGER NOT NULL DEFAULT 1,
				lgpd INTEGER NOT NULL DEFAULT 0,
				created_at INTEGER NOT NULL,
				modified_at INTEGER NOT NULL
			)
		`).run();
		await env.DB.prepare("DELETE FROM Usuario").run();
	});

	describe("getSessionStorage", () => {
		it("should throw an error when session secret is missing", () => {
			expect(() => getSessionStorage({})).toThrow("Missing session secret in environment variables");
		});

		it("should use SESSION_SECRET if provided", () => {
			const storage = getSessionStorage({ SESSION_SECRET: "secret123" });
			expect(storage).toBeDefined();
		});

		it("should use GOOGLE_CLIENT_SECRET if SESSION_SECRET is not provided", () => {
			const storage = getSessionStorage({ GOOGLE_CLIENT_SECRET: "googleSecret123" });
			expect(storage).toBeDefined();
		});
	});

	describe("Session management (getSession, commitSession, destroySession)", () => {
		const mockEnv = { SESSION_SECRET: "test-secret" };

		it("should create, commit, retrieve and destroy a session", async () => {
			// 1. Get an empty session
			const request1 = new Request("http://localhost");
			const session = await getSession(request1, mockEnv);

			// 2. Set some data
			session.set("userId", "user123");
			session.set("avatar", "http://example.com/avatar.jpg");

			// 3. Commit it to get a cookie
			const cookieHeader = await commitSession(session, mockEnv);
			expect(cookieHeader).toBeDefined();
			expect(cookieHeader).toContain("__session=");

			// 4. Retrieve the session using the cookie
			const request2 = new Request("http://localhost", {
				headers: { Cookie: cookieHeader }
			});
			const retrievedSession = await getSession(request2, mockEnv);
			expect(retrievedSession.get("userId")).toBe("user123");
			expect(retrievedSession.get("avatar")).toBe("http://example.com/avatar.jpg");

			// 5. Destroy the session
			const destroyCookieHeader = await destroySession(retrievedSession, mockEnv);
			expect(destroyCookieHeader).toBeDefined();
			expect(destroyCookieHeader).toContain("__session="); // the set-cookie header should clear it

			// 6. Verify destroyed session works as expected (usually expired or empty)
			const request3 = new Request("http://localhost", {
				headers: { Cookie: destroyCookieHeader }
			});
			const finalSession = await getSession(request3, mockEnv);
			expect(finalSession.get("userId")).toBeUndefined();
		});
	});

	describe("checkAdminAuth", () => {
		const mockEnv = { ...env, SESSION_SECRET: "test-secret" };

		it("should return false if userId is not in session", async () => {
			const request = new Request("http://localhost");
			const result = await checkAdminAuth(request, mockEnv);
			expect(result).toEqual({ isAdmin: false, userId: null, user: null });
		});

		it("should return false if userId is in session but not in database", async () => {
			const session = await getSession(new Request("http://localhost"), mockEnv);
			session.set("userId", "missing_user");
			const cookie = await commitSession(session, mockEnv);

			const request = new Request("http://localhost", { headers: { Cookie: cookie } });
			const result = await checkAdminAuth(request, mockEnv);
			expect(result).toEqual({ isAdmin: false, userId: null, user: null });
		});

		it("should return false if user is in database but not admin", async () => {
			await mockEnv.DB.prepare(
				"INSERT INTO Usuario (id, nome, email, admin, status, lgpd, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
			).bind("user1", "User One", "user1@example.com", 0, 1, 0, 0, 0).run();

			const session = await getSession(new Request("http://localhost"), mockEnv);
			session.set("userId", "user1");
			const cookie = await commitSession(session, mockEnv);

			const request = new Request("http://localhost", { headers: { Cookie: cookie } });
			const result = await checkAdminAuth(request, mockEnv);

			expect(result.isAdmin).toBe(false);
			expect(result.userId).toBe("user1");
			expect(result.user).toBeDefined();
			expect(result.user?.id).toBe("user1");
			expect(result.user?.admin).toBe(0);
		});

		it("should return true if user is in database and is admin, including avatar from session", async () => {
			await mockEnv.DB.prepare(
				"INSERT INTO Usuario (id, nome, email, admin, status, lgpd, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
			).bind("admin1", "Admin One", "admin1@example.com", 1, 1, 0, 0, 0).run();

			const session = await getSession(new Request("http://localhost"), mockEnv);
			session.set("userId", "admin1");
			session.set("avatar", "http://example.com/admin.png");
			const cookie = await commitSession(session, mockEnv);

			const request = new Request("http://localhost", { headers: { Cookie: cookie } });
			const result = await checkAdminAuth(request, mockEnv);

			expect(result.isAdmin).toBe(true);
			expect(result.userId).toBe("admin1");
			expect(result.user).toBeDefined();
			expect(result.user?.id).toBe("admin1");
			expect(result.user?.admin).toBe(1);
			expect(result.user?.avatar).toBe("http://example.com/admin.png");
		});
	});
});

describe("isJsonRequest", () => {
	it("should return true when Accept header is application/json", () => {
		const request = new Request("http://localhost", {
			headers: { Accept: "application/json" }
		});
		expect(isJsonRequest(request)).toBe(true);
	});

	it("should return true when Accept header includes application/json along with other types", () => {
		const request = new Request("http://localhost", {
			headers: { Accept: "text/html, application/xhtml+xml, application/json;q=0.9, */*;q=0.8" }
		});
		expect(isJsonRequest(request)).toBe(true);
	});

	it("should return true when URL has json search parameter", () => {
		const request = new Request("http://localhost?json");
		expect(isJsonRequest(request)).toBe(true);
	});

	it("should return true when URL has json search parameter with value", () => {
		const request = new Request("http://localhost?json=true");
		expect(isJsonRequest(request)).toBe(true);
	});

	it("should return false when Accept header does not include application/json and no json param", () => {
		const request = new Request("http://localhost", {
			headers: { Accept: "text/html, application/xhtml+xml, */*;q=0.8" }
		});
		expect(isJsonRequest(request)).toBe(false);
	});

	it("should return false when no Accept header is present and no json param", () => {
		const request = new Request("http://localhost");
		expect(isJsonRequest(request)).toBe(false);
	});
});
