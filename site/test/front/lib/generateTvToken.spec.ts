import { describe, it, expect } from "vitest";
import generateTvToken from "../../../src/front/lib/generateTvToken";

describe("generateTvToken", () => {
	it("should generate a token in the correct format (XXX-XXX)", () => {
		const token = generateTvToken();
		expect(typeof token).toBe("string");
		expect(token.length).toBe(7); // 3 chars + 1 hyphen + 3 chars
		expect(token).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/);
	});

	it("should consistently generate tokens in the correct format", () => {
		for (let i = 0; i < 100; i++) {
			const token = generateTvToken();
			expect(token).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/);
		}
	});

	it("should likely generate unique tokens on subsequent calls", () => {
		const token1 = generateTvToken();
		const token2 = generateTvToken();
		// While there is a very small chance of a collision, it's virtually zero for 6 random characters.
		expect(token1).not.toBe(token2);
	});
});
