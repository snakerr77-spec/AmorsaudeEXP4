-- Schema D1 do LAG Controller
-- A API também cria essas tabelas automaticamente na primeira chamada.

CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  nome TEXT,
  nome_completo TEXT,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT,
  senha TEXT,
  nivel_acesso TEXT DEFAULT 'colaborador',
  cidade TEXT DEFAULT 'Cerquilho',
  telefone TEXT,
  cargo TEXT,
  setor TEXT,
  bio TEXT,
  foto TEXT,
  capa TEXT,
  ativo INTEGER DEFAULT 1,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT,
  ultimoLogin TEXT
);

CREATE TABLE IF NOT EXISTS sessoes (
  token TEXT PRIMARY KEY,
  usuario_id TEXT,
  email TEXT,
  expira_em TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registros (
  id TEXT PRIMARY KEY,
  colecao TEXT NOT NULL,
  dados TEXT NOT NULL,
  cidade TEXT,
  criado_por TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT
);

CREATE INDEX IF NOT EXISTS idx_registros_colecao ON registros (colecao);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email);
