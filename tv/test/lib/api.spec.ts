import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api, ApiError } from "../../src/lib/api";
import * as store from "../../src/lib/store";

// Mock do store para podermos controlar o token retornado
vi.mock("../../src/lib/store", () => ({
  token: vi.fn(),
}));

describe("tv/src/lib/api.ts", () => {
  const mockToken = "mocked-token-123";
  const mockBaseUrl = "https://curso.ideias.casa"; // Como está no api.ts (default)

  beforeEach(() => {
    // Configura o mock do token antes de cada teste
    vi.mocked(store.token).mockReturnValue(mockToken);

    // Mock global do fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("apiFetch helper logic", () => {
    it("should throw ApiError when response is not ok", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({ message: "Not found" }),
      };

      vi.mocked(global.fetch).mockResolvedValue(mockResponse as unknown as Response);

      await expect(api.home()).rejects.toThrow(ApiError);
      await expect(api.home()).rejects.toThrow("Falha na requisição (404)");

      try {
        await api.home();
      } catch (err) {
        expect((err as ApiError).status).toBe(404);
      }
    });

    it("should correctly set Authorization header using the store token", async () => {
      const mockData = { test: true };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockData),
      };

      vi.mocked(global.fetch).mockResolvedValue(mockResponse as unknown as Response);

      await api.home();

      expect(global.fetch).toHaveBeenCalledWith(`${mockBaseUrl}/api/v1/tv/home`, expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockToken}`
        })
      }));
    });
  });

  describe("API Endpoints", () => {
    it("home() should call /api/v1/tv/home", async () => {
      const mockData = { banners: [], trilhas: [] };
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockData),
      } as unknown as Response);

      const result = await api.home();

      expect(global.fetch).toHaveBeenCalledWith(`${mockBaseUrl}/api/v1/tv/home`, expect.any(Object));
      expect(result).toEqual(mockData);
    });

    it("categorias() should call /api/v1/tv/categorias", async () => {
      const mockData = { categorias: [] };
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockData),
      } as unknown as Response);

      const result = await api.categorias();

      expect(global.fetch).toHaveBeenCalledWith(`${mockBaseUrl}/api/v1/tv/categorias`, expect.any(Object));
      expect(result).toEqual(mockData);
    });

    it("canais() should call /api/v1/tv/canais", async () => {
      const mockData = { canais: [] };
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockData),
      } as unknown as Response);

      const result = await api.canais();

      expect(global.fetch).toHaveBeenCalledWith(`${mockBaseUrl}/api/v1/tv/canais`, expect.any(Object));
      expect(result).toEqual(mockData);
    });

    describe("cursos()", () => {
      it("should call /api/v1/tv/cursos with default parameters", async () => {
        const mockData = { cursos: [], page: 1, limit: 10 };
        vi.mocked(global.fetch).mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue(mockData),
        } as unknown as Response);

        const result = await api.cursos();

        expect(global.fetch).toHaveBeenCalledWith(`${mockBaseUrl}/api/v1/tv/cursos?page=1`, expect.any(Object));
        expect(result).toEqual(mockData);
      });

      it("should call /api/v1/tv/cursos with idCategoria and page parameters", async () => {
        const mockData = { cursos: [], page: 2, limit: 10 };
        vi.mocked(global.fetch).mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue(mockData),
        } as unknown as Response);

        const result = await api.cursos("cat1", 2);

        expect(global.fetch).toHaveBeenCalledWith(`${mockBaseUrl}/api/v1/tv/cursos?categoria=cat1&page=2`, expect.any(Object));
        expect(result).toEqual(mockData);
      });
    });

    it("episodios() should call /api/v1/tv/episodios/:idCurso", async () => {
      const mockData = { episodios: [] };
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockData),
      } as unknown as Response);

      const result = await api.episodios("curso-id-123");

      expect(global.fetch).toHaveBeenCalledWith(`${mockBaseUrl}/api/v1/tv/episodios/curso-id-123`, expect.any(Object));
      expect(result).toEqual(mockData);
    });

    describe("saveProgresso()", () => {
      it("should POST to /api/v1/tv/progresso with correct body and default concluido=0", async () => {
        const mockData = { success: true };
        vi.mocked(global.fetch).mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue(mockData),
        } as unknown as Response);

        const result = await api.saveProgresso("ep-1", 50);

        expect(global.fetch).toHaveBeenCalledWith(`${mockBaseUrl}/api/v1/tv/progresso`, expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ id_episodio: "ep-1", progresso: 50, concluido: 0 }),
          headers: expect.objectContaining({
            "Content-Type": "application/json"
          })
        }));
        expect(result).toEqual(mockData);
      });

      it("should POST to /api/v1/tv/progresso with provided concluido value", async () => {
        const mockData = { success: true };
        vi.mocked(global.fetch).mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue(mockData),
        } as unknown as Response);

        const result = await api.saveProgresso("ep-1", 100, 1);

        expect(global.fetch).toHaveBeenCalledWith(`${mockBaseUrl}/api/v1/tv/progresso`, expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ id_episodio: "ep-1", progresso: 100, concluido: 1 })
        }));
        expect(result).toEqual(mockData);
      });
    });
  });
});
