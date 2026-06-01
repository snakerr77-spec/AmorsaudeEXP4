-- Banco base para transformar o progresso dos treinamentos em sistema real.
-- A versão HTML usa localStorage. Este schema serve para backend depois.

CREATE TABLE colaboradores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cargo TEXT NOT NULL DEFAULT 'colaborador',
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cursos (
  id TEXT PRIMARY KEY,
  categoria TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  nivel TEXT,
  duracao TEXT,
  ativo INTEGER DEFAULT 1
);

CREATE TABLE aulas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  curso_id TEXT NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  duracao TEXT,
  video_url TEXT,
  ordem INTEGER NOT NULL,
  FOREIGN KEY (curso_id) REFERENCES cursos(id)
);

CREATE TABLE progresso_aulas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  colaborador_id INTEGER NOT NULL,
  curso_id TEXT NOT NULL,
  aula_id INTEGER NOT NULL,
  concluida INTEGER DEFAULT 0,
  concluida_em DATETIME,
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id),
  FOREIGN KEY (curso_id) REFERENCES cursos(id),
  FOREIGN KEY (aula_id) REFERENCES aulas(id),
  UNIQUE (colaborador_id, aula_id)
);

CREATE TABLE certificados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  colaborador_id INTEGER NOT NULL,
  curso_id TEXT NOT NULL,
  emitido_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id),
  FOREIGN KEY (curso_id) REFERENCES cursos(id),
  UNIQUE (colaborador_id, curso_id)
);
