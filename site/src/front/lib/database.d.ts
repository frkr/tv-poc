export interface Usuario {
	id: string; // Toda chave primária deve ser `randomHEX`
	nome: string;
	email: string; // Deve ser unico, então, verificar se já existe no banco de dados
	admin: boolean; // Todos os usuários vão ser administradores, até que outros modulos sejam criados
	status: boolean; // Ativo ou Inativo
	lgpd: boolean; // Se o usuário pediu para ser deletado da base, esse valor será `true` e nunca mais ele voltará. Amenos que mande um email para o suporte.
	lgpd_date: number; // O dia que o usuário pediu para ser deletado da base
	created_at: number;
	modified_at: number;
}

export interface Canal {
	id: string;
	nome: string;
	descricao: string;
	thumbnail: string;
	status: boolean;
	created_at: number;
	modified_at: number;
}

export interface CanalUsuario {
	id_canal: string;
	id_usuario: string;
}

export interface CanalUsuarioAdmin {
	id_canal: string;
	id_usuario: string;
}

export interface Curso {
	id: string;
	nome: string;
	descricao: string;
	thumbnail: string;
	status: boolean;
	data_publicacao?: number | null;
	id_canal?: string | null;
	id_categoria: string;
	created_at: number;
	modified_at: number;
}

export interface CursoUsuarioAdmin {
	id_curso: string;
	id_usuario: string;
}

export interface CursoCanal {
	id_curso: string;
	id_canal: string;
}

export interface Episodio {
	id: string;
	id_curso: string;
	nome: string;
	descricao: string;
	url: string;
	media_type: string;
	thumbnail: string;
	status: boolean;
	data_publicacao?: number | null;
	created_at: number;
	modified_at: number;
}

export interface EpisodioUsuario {
	id_episodio: string;
	id_usuario: string;
}

export interface Categoria {
	id: string;
	categoria: string;
	created_at: number;
	modified_at: number;
}

export interface CursoCategoria {
	id_curso: string;
	id_categoria: string;
}

export interface EpisodioProgresso {
	id_episodio: string;
	id_usuario: string;
	progresso: number;
	concluido: number;
	updated_at: number;
}

export interface UsuarioToken {
	id_usuario: string;
	token: string;
	created_at: number;
}
