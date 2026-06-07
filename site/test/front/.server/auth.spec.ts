import { describe, it, expect } from "vitest";
import { isJsonRequest, getSessionStorage } from "../../../src/front/.server/panel/auth";

describe("getSessionStorage", () => {
	it("should create session storage when SESSION_SECRET is provided", () => {
		const env = { SESSION_SECRET: "my-super-secret" };
		const storage = getSessionStorage(env);
		expect(storage).toBeDefined();
		expect(storage.getSession).toBeDefined();
		expect(storage.commitSession).toBeDefined();
		expect(storage.destroySession).toBeDefined();
	});

	it("should throw an error when SESSION_SECRET is missing", () => {
		const env = {};
		expect(() => getSessionStorage(env)).toThrow("Missing session secret in environment variables");
	});

	it("should throw an error when SESSION_SECRET is missing even if GOOGLE_CLIENT_SECRET is present", () => {
		const env = { GOOGLE_CLIENT_SECRET: "google-secret" };
		expect(() => getSessionStorage(env)).toThrow("Missing session secret in environment variables");
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
