import { describe, it, expect } from "vitest";
import isEmpty from "../../../src/front/lib/isEmpty";

describe("isEmpty", () => {
	it("should return true for null", () => {
		expect(isEmpty(null)).toBe(true);
	});

	it("should return true for undefined", () => {
		expect(isEmpty(undefined)).toBe(true);
	});

	it("should return true for an empty string", () => {
		expect(isEmpty("")).toBe(true);
	});

	it("should return true for a string with only spaces", () => {
		expect(isEmpty("   ")).toBe(true);
		expect(isEmpty("\t\n")).toBe(true);
	});

	it("should return true for the literal string 'null'", () => {
		expect(isEmpty("null")).toBe(true);
	});

	it("should return true for the literal string 'undefined'", () => {
		expect(isEmpty("undefined")).toBe(true);
	});

	it("should return true for the string 'null' or 'undefined' with surrounding spaces", () => {
		expect(isEmpty(" null ")).toBe(true);
		expect(isEmpty("  undefined  ")).toBe(true);
	});

	it("should return false for a valid non-empty string", () => {
		expect(isEmpty("hello")).toBe(false);
		expect(isEmpty("0")).toBe(false);
		expect(isEmpty("false")).toBe(false);
		expect(isEmpty("  a  ")).toBe(false);
	});
});
