import { token } from "./store";
import type { Canal, Categoria, Curso, Episodio, HomeData } from "./types";

const API_BASE: string = (import.meta.env.VITE_API_BASE || "https://curso.ideias.casa").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token()}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    throw new ApiError(res.status, `Falha na requisição (${res.status})`);
  }
  return (await res.json()) as T;
}

export const api = {
  base: API_BASE,

  home(): Promise<HomeData> {
    return apiFetch<HomeData>("/api/v1/tv/home");
  },

  categorias(): Promise<{ categorias: Categoria[] }> {
    return apiFetch<{ categorias: Categoria[] }>("/api/v1/tv/categorias");
  },

  canais(): Promise<{ canais: Canal[] }> {
    return apiFetch<{ canais: Canal[] }>("/api/v1/tv/canais");
  },

  cursos(idCategoria?: string, page = 1): Promise<{ cursos: Curso[]; page: number; limit: number }> {
    const params = new URLSearchParams();
    if (idCategoria) params.set("categoria", idCategoria);
    params.set("page", String(page));
    return apiFetch(`/api/v1/tv/cursos?${params.toString()}`);
  },

  episodios(idCurso: string): Promise<{ episodios: Episodio[] }> {
    return apiFetch<{ episodios: Episodio[] }>(`/api/v1/tv/episodios/${idCurso}`);
  },

  saveProgresso(idEpisodio: string, progresso: number, concluido = 0): Promise<{ success: boolean }> {
    return apiFetch<{ success: boolean }>("/api/v1/tv/progresso", {
      method: "POST",
      body: JSON.stringify({ id_episodio: idEpisodio, progresso, concluido }),
    });
  },
};
