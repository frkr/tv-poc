import { describe, it, expect } from "vitest";
import randomHEX from "../../../src/front/lib/randomHEX";

describe("randomHEX", () => {
	it("should generate a 128-character string", async () => {
		const result = await randomHEX();
		expect(typeof result).toBe("string");
		expect(result.length).toBe(128);
	});

	it("should only contain valid lowercase hexadecimal characters", async () => {
		const result = await randomHEX();
		expect(result).toMatch(/^[a-f0-9]{128}$/);
	});

	it("should generate unique values on subsequent calls", async () => {
		const result1 = await randomHEX();
		const result2 = await randomHEX();
		expect(result1).not.toBe(result2);
	});

	it("should generate a valid hex string even with a different size parameter", async () => {
		const result = await randomHEX(32);
		expect(typeof result).toBe("string");
		expect(result.length).toBe(128);
		expect(result).toMatch(/^[a-f0-9]{128}$/);
	});
});
