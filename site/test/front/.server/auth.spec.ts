import { describe, it, expect } from "vitest";
import { isJsonRequest } from "../../../src/front/.server/panel/auth";

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
