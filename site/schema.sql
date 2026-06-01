CREATE TABLE IF NOT EXISTS Usuario (
	id TEXT PRIMARY KEY,
	nome TEXT NOT NULL,
	email TEXT UNIQUE NOT NULL,
	admin INTEGER NOT NULL DEFAULT 0,
	status INTEGER NOT NULL DEFAULT 1,
	lgpd INTEGER NOT NULL DEFAULT 0,
	lgpd_date INTEGER,
	created_at INTEGER NOT NULL,
	modified_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS Canal (
	id TEXT PRIMARY KEY,
	nome TEXT NOT NULL,
	descricao TEXT NOT NULL,
	thumbnail TEXT NOT NULL,
	status INTEGER NOT NULL DEFAULT 1,
	created_at INTEGER NOT NULL,
	modified_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS CanalUsuario (
	id_canal TEXT NOT NULL,
	id_usuario TEXT NOT NULL,
	PRIMARY KEY (id_canal, id_usuario)
);

CREATE TABLE IF NOT EXISTS CanalUsuarioAdmin (
	id_canal TEXT NOT NULL,
	id_usuario TEXT NOT NULL,
	PRIMARY KEY (id_canal, id_usuario)
);

CREATE TABLE IF NOT EXISTS Curso (
	id TEXT PRIMARY KEY,
	nome TEXT NOT NULL,
	descricao TEXT NOT NULL,
	thumbnail TEXT NOT NULL,
	status INTEGER NOT NULL DEFAULT 1,
	data_publicacao INTEGER,
	created_at INTEGER NOT NULL,
	modified_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS CursoUsuarioAdmin (
	id_curso TEXT NOT NULL,
	id_usuario TEXT NOT NULL,
	PRIMARY KEY (id_curso, id_usuario)
);

CREATE TABLE IF NOT EXISTS CursoCanal (
	id_curso TEXT NOT NULL,
	id_canal TEXT NOT NULL,
	PRIMARY KEY (id_curso, id_canal)
);

CREATE TABLE IF NOT EXISTS Episodio (
	id TEXT PRIMARY KEY,
	id_curso TEXT NOT NULL,
	nome TEXT NOT NULL,
	descricao TEXT NOT NULL,
	url TEXT NOT NULL,
	media_type TEXT NOT NULL,
	thumbnail TEXT NOT NULL,
	status INTEGER NOT NULL DEFAULT 1,
	data_publicacao INTEGER,
	created_at INTEGER NOT NULL,
	modified_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS EpisodioUsuario (
	id_episodio TEXT NOT NULL,
	id_usuario TEXT NOT NULL,
	PRIMARY KEY (id_episodio, id_usuario)
);

CREATE TABLE IF NOT EXISTS Categoria (
	id TEXT PRIMARY KEY,
	categoria TEXT NOT NULL,
	created_at INTEGER NOT NULL,
	modified_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS CursoCategoria (
	id_curso TEXT NOT NULL,
	id_categoria TEXT NOT NULL,
	PRIMARY KEY (id_curso, id_categoria)
);

CREATE TABLE IF NOT EXISTS EpisodioProgresso (
	id_episodio TEXT NOT NULL,
	id_usuario TEXT NOT NULL,
	progresso INTEGER NOT NULL DEFAULT 0,
	concluido INTEGER NOT NULL DEFAULT 0,
	updated_at INTEGER NOT NULL,
	PRIMARY KEY (id_episodio, id_usuario)
);

CREATE TABLE IF NOT EXISTS UsuarioToken (
	id_usuario TEXT NOT NULL PRIMARY KEY,
	token TEXT NOT NULL UNIQUE,
	created_at INTEGER NOT NULL
);