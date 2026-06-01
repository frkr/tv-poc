export interface Curso {
  id: string;
  nome: string;
  descricao: string;
  thumbnail: string;
  status?: number;
  data_publicacao?: number | null;
  created_at?: number;
}

export interface Categoria {
  id: string;
  categoria: string;
}

export interface Canal {
  id: string;
  nome: string;
  descricao: string;
  thumbnail: string;
}

export interface Episodio {
  id: string;
  id_curso: string;
  nome: string;
  descricao: string;
  url: string;
  media_type: string;
  thumbnail: string;
  progresso: number;
  concluido: number;
}

export interface ContinueWatchingItem {
  episodio_id: string;
  episodio_nome: string;
  episodio_thumbnail: string;
  episodio_url: string;
  media_type: string;
  id_curso: string;
  curso_nome: string;
  curso_thumbnail: string;
  progresso: number;
  concluido: number;
}

export interface HomeData {
  continue_watching: ContinueWatchingItem[];
  recent_courses: Curso[];
  canais: Canal[];
  categorias: Categoria[];
}
