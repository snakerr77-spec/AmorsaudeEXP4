const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-email"
};

// Login obrigatório via Cloudflare D1.
const FREE_EDIT_MODE = false;
const FREE_EDITOR_ID = "editor-livre";
const FREE_EDITOR_EMAIL = "editor@lag.local";

const USER_FIELDS = [
  "id", "nome", "nome_completo", "email", "senha_hash", "senha", "nivel_acesso",
  "cidade", "telefone", "cargo", "setor", "bio", "foto", "capa", "ativo",
  "createdAt", "updatedAt", "ultimoLogin"
];

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: JSON_HEADERS
  });
}

function normalizeEmail(email = "") {
  return String(email || "").trim().toLowerCase();
}

function normalizeRole(role = "colaborador") {
  const value = String(role || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

  const aliases = {
    administrador: "admin",
    administradora: "admin",
    adm: "admin",
    master: "admin",
    financeiro: "financeiro",
    financa: "financeiro",
    financas: "financeiro",
    gerencia: "gerencia",
    gerente: "gerencia",
    gerencial: "gerencia",
    cdt: "cdt",
    recepcao: "recepcao",
    recepcionista: "recepcao",
    medico: "medico",
    medica: "medico",
    colaborador: "colaborador",
    colaboradora: "colaborador"
  };

  return aliases[value] || value || "colaborador";
}

function normalizeCity(city = "Cerquilho") {
  const value = String(city || "").trim();
  const allowed = ["Embu das Artes", "Itapeva", "Tatui", "Cerquilho"];
  if (value === "Tatuí") return "Tatui";
  return allowed.includes(value) ? value : "Cerquilho";
}

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function sha256(value) {
  const encoded = new TextEncoder().encode(String(value || ""));
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function readBody(request) {
  try { return await request.json(); } catch { return {}; }
}

async function ensureColumn(db, table, name, definition) {
  const info = await db.prepare(`PRAGMA table_info(${table})`).all();
  const columns = (info.results || []).map((column) => column.name);
  if (columns.includes(name)) return;
  await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`).run();
}

async function ensureDatabase(db) {
  await db.prepare(`
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
    )
  `).run();

  const extraColumns = {
    nome: "TEXT",
    nome_completo: "TEXT",
    email: "TEXT",
    senha_hash: "TEXT",
    senha: "TEXT",
    nivel_acesso: "TEXT DEFAULT 'colaborador'",
    cidade: "TEXT DEFAULT 'Cerquilho'",
    telefone: "TEXT",
    cargo: "TEXT",
    setor: "TEXT",
    bio: "TEXT",
    foto: "TEXT",
    capa: "TEXT",
    ativo: "INTEGER DEFAULT 1",
    createdAt: "TEXT DEFAULT CURRENT_TIMESTAMP",
    updatedAt: "TEXT",
    ultimoLogin: "TEXT"
  };

  for (const [name, definition] of Object.entries(extraColumns)) {
    try { await ensureColumn(db, "usuarios", name, definition); }
    catch (error) { console.warn(`Não consegui garantir coluna usuarios.${name}:`, error.message); }
  }

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS sessoes (
      token TEXT PRIMARY KEY,
      usuario_id TEXT,
      email TEXT,
      expira_em TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS registros (
      id TEXT PRIMARY KEY,
      colecao TEXT NOT NULL,
      dados TEXT NOT NULL,
      cidade TEXT,
      criado_por TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT
    )
  `).run();

  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_registros_colecao ON registros (colecao)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email)`).run();

  const count = await db.prepare("SELECT COUNT(*) AS total FROM usuarios").first();
  if (!Number(count?.total || 0)) {
    const senhaHash = await sha256("123456");
    const now = new Date().toISOString();
    await db.prepare(`
      INSERT INTO usuarios (
        id, nome, nome_completo, email, senha_hash, nivel_acesso, cidade, telefone,
        cargo, setor, ativo, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).bind(uuid(), "Administrador LAG", "Administrador LAG", "admin@lag.com", senhaHash, "admin", "Cerquilho", "", "Administrador", "Gestão", now, now).run();
  }

  if (FREE_EDIT_MODE) {
    const editor = await db.prepare("SELECT id FROM usuarios WHERE id = ? LIMIT 1").bind(FREE_EDITOR_ID).first();

    if (!editor) {
      const now = new Date().toISOString();
      await db.prepare(`
        INSERT INTO usuarios (
          id, nome, nome_completo, email, nivel_acesso, cidade, telefone,
          cargo, setor, ativo, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).bind(
        FREE_EDITOR_ID,
        "Editor LAG",
        "Editor LAG",
        FREE_EDITOR_EMAIL,
        "admin",
        "Cerquilho",
        "",
        "Administrador",
        "Edição",
        now,
        now
      ).run();
    }
  }
}

function publicUser(row = {}) {
  const ativo = row.ativo === true || row.ativo === 1 || row.ativo === "1" || row.ativo === null || row.ativo === undefined;
  const nome = row.nome_completo || row.nome || row.email || "Usuário";
  const nivel = normalizeRole(row.nivel_acesso || row.nivelAcesso || "colaborador");
  const cidade = normalizeCity(row.cidade || "Cerquilho");

  return {
    id: row.id,
    uid: row.id,
    nome,
    nomeCompleto: nome,
    nome_completo: nome,
    email: row.email || "",
    nivelAcesso: nivel,
    nivel_acesso: nivel,
    cidade,
    telefone: row.telefone || "",
    cargo: row.cargo || "",
    setor: row.setor || "",
    bio: row.bio || "",
    foto: row.foto || "",
    capa: row.capa || "",
    ativo,
    createdAt: row.createdAt || row.created_at || "",
    updatedAt: row.updatedAt || row.updated_at || "",
    ultimoLogin: row.ultimoLogin || row.ultimo_login || ""
  };
}

async function findUserByEmail(db, email) {
  return await db.prepare("SELECT * FROM usuarios WHERE lower(email) = lower(?) LIMIT 1").bind(normalizeEmail(email)).first();
}

async function findUserByIdOrEmail(db, id) {
  const value = String(id || "").trim();
  if (!value) return null;
  return await db.prepare("SELECT * FROM usuarios WHERE id = ? OR lower(email) = lower(?) LIMIT 1").bind(value, value).first();
}

async function getFreeEditor(db) {
  const editor = await findUserByIdOrEmail(db, FREE_EDITOR_ID);
  if (editor) {
    return {
      ...publicUser(editor),
      nivelAcesso: "admin",
      nivel_acesso: "admin",
      ativo: true
    };
  }

  return {
    id: FREE_EDITOR_ID,
    uid: FREE_EDITOR_ID,
    nome: "Editor LAG",
    nomeCompleto: "Editor LAG",
    nome_completo: "Editor LAG",
    email: FREE_EDITOR_EMAIL,
    nivelAcesso: "admin",
    nivel_acesso: "admin",
    cidade: "Cerquilho",
    cargo: "Administrador",
    setor: "Edição",
    ativo: true
  };
}

async function authenticate(request, db) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();

  if (token) {
    const session = await db.prepare(`
      SELECT s.token, s.expira_em, u.*
      FROM sessoes s
      JOIN usuarios u ON u.id = s.usuario_id
      WHERE s.token = ?
      LIMIT 1
    `).bind(token).first();

    if (session) {
      if (session.expira_em && new Date(session.expira_em).getTime() < Date.now()) {
        await db.prepare("DELETE FROM sessoes WHERE token = ?").bind(token).run();
        return null;
      }
      return publicUser(session);
    }
  }

  const email = normalizeEmail(request.headers.get("x-user-email") || "");
  if (email) {
    const user = await findUserByEmail(db, email);
    if (user) return publicUser(user);
  }

  return null;
}

async function login(request, db) {
  if (FREE_EDIT_MODE) {
    return json({
      ok: true,
      token: "edicao-livre",
      expira_em: "",
      usuario: await getFreeEditor(db)
    });
  }

  const body = await readBody(request);
  const email = normalizeEmail(body.email);
  const senha = String(body.senha || body.password || "");

  if (!email || !senha) return json({ ok: false, erro: "Digite e-mail e senha." }, 400);

  const user = await findUserByEmail(db, email);
  if (!user) return json({ ok: false, erro: "E-mail ou senha inválidos." }, 401);

  const senhaHash = await sha256(senha);
  const passwordOk = (user.senha_hash && user.senha_hash === senhaHash) || (user.senha && String(user.senha) === senha);
  if (!passwordOk) return json({ ok: false, erro: "E-mail ou senha inválidos." }, 401);

  const ativo = user.ativo === 1 || user.ativo === true || user.ativo === "1" || user.ativo === null || user.ativo === undefined;
  if (!ativo) return json({ ok: false, erro: "Usuário bloqueado. Fale com o administrador." }, 403);

  const token = `${uuid()}.${Math.random().toString(36).slice(2)}`;
  const expiraEm = new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString();
  const now = new Date().toISOString();

  await db.prepare("DELETE FROM sessoes WHERE usuario_id = ?").bind(user.id).run();
  await db.prepare("INSERT INTO sessoes (token, usuario_id, email, expira_em, createdAt) VALUES (?, ?, ?, ?, ?)").bind(token, user.id, user.email, expiraEm, now).run();
  await db.prepare("UPDATE usuarios SET ultimoLogin = ?, updatedAt = ? WHERE id = ?").bind(now, now, user.id).run();

  const fresh = await findUserByIdOrEmail(db, user.id);
  return json({ ok: true, token, expira_em: expiraEm, usuario: publicUser(fresh || user) });
}

async function logout(request, db) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (token) await db.prepare("DELETE FROM sessoes WHERE token = ?").bind(token).run();
  return json({ ok: true });
}

function cleanUserPayload(payload = {}) {
  const temNome = payload.nome_completo || payload.nomeCompleto || payload.nome || payload.name;
  const nome = temNome ? (payload.nome_completo || payload.nomeCompleto || payload.nome || payload.name) : undefined;
  const result = {
    nome,
    nome_completo: nome,
    email: payload.email ? normalizeEmail(payload.email) : undefined,
    nivel_acesso: payload.nivel_acesso || payload.nivelAcesso ? normalizeRole(payload.nivel_acesso || payload.nivelAcesso) : undefined,
    cidade: payload.cidade ? normalizeCity(payload.cidade) : undefined,
    telefone: payload.telefone ?? undefined,
    cargo: payload.cargo ?? undefined,
    setor: payload.setor ?? undefined,
    bio: payload.bio ?? undefined,
    foto: payload.foto ?? undefined,
    capa: payload.capa ?? undefined,
    ativo: payload.ativo === undefined ? undefined : (payload.ativo === true || payload.ativo === 1 || payload.ativo === "1" ? 1 : 0),
    updatedAt: new Date().toISOString()
  };
  if (payload.senha || payload.password) result.senha_original = String(payload.senha || payload.password);
  Object.keys(result).forEach((key) => result[key] === undefined && delete result[key]);
  return result;
}

async function listUsers(db, search = "") {
  const rows = await db.prepare("SELECT * FROM usuarios ORDER BY lower(email) ASC").all();
  let users = (rows.results || []).map(publicUser);
  const term = String(search || "").trim().toLowerCase();
  if (term) users = users.filter((user) => [user.nome, user.email, user.cidade, user.nivelAcesso, user.cargo, user.setor].join(" ").toLowerCase().includes(term));
  return json({ ok: true, dados: users, items: users });
}

async function createUser(db, payload = {}) {
  const data = cleanUserPayload(payload);
  const email = normalizeEmail(data.email);
  if (!email) return json({ ok: false, erro: "E-mail obrigatório para criar usuário." }, 400);
  const id = payload.id || uuid();
  const now = new Date().toISOString();
  const senhaHash = await sha256(payload.senha || payload.password || "123456");

  await db.prepare(`
    INSERT INTO usuarios (
      id, nome, nome_completo, email, senha_hash, nivel_acesso, cidade, telefone,
      cargo, setor, bio, foto, capa, ativo, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, data.nome || email, data.nome_completo || data.nome || email, email, senhaHash, data.nivel_acesso || "colaborador", data.cidade || "Cerquilho", data.telefone || "", data.cargo || "", data.setor || "", data.bio || "", data.foto || "", data.capa || "", data.ativo === undefined ? 1 : data.ativo, now, now).run();

  const user = await findUserByIdOrEmail(db, id);
  return json({ ok: true, usuario: publicUser(user), dado: publicUser(user) }, 201);
}

async function updateUser(db, id, payload = {}) {
  const existing = await findUserByIdOrEmail(db, id);
  if (!existing) return json({ ok: false, erro: "Usuário não encontrado." }, 404);

  const data = cleanUserPayload(payload);
  const entries = Object.entries(data).filter(([key]) => !["senha_original"].includes(key) && USER_FIELDS.includes(key));
  if (data.senha_original) entries.push(["senha_hash", await sha256(data.senha_original)]);
  if (!entries.length) return json({ ok: true, usuario: publicUser(existing) });

  const setSql = entries.map(([key]) => `${key} = ?`).join(", ");
  const values = entries.map(([, value]) => value);
  await db.prepare(`UPDATE usuarios SET ${setSql} WHERE id = ?`).bind(...values, existing.id).run();

  const updated = await findUserByIdOrEmail(db, existing.id);
  return json({ ok: true, usuario: publicUser(updated), dado: publicUser(updated) });
}

async function deleteUser(db, id) {
  const existing = await findUserByIdOrEmail(db, id);
  if (!existing) return json({ ok: false, erro: "Usuário não encontrado." }, 404);
  await db.prepare("DELETE FROM usuarios WHERE id = ?").bind(existing.id).run();
  await db.prepare("DELETE FROM sessoes WHERE usuario_id = ?").bind(existing.id).run();
  return json({ ok: true });
}

function collectionFromPath(pathname) {
  return decodeURIComponent(pathname.replace(/^\/api\//, "").split("/")[0] || "");
}

function idFromPath(pathname) {
  const parts = pathname.replace(/^\/api\//, "").split("/");
  return parts[1] ? decodeURIComponent(parts[1]) : "";
}

function normalizeGenericRecord(row = {}) {
  let data = {};
  try { data = JSON.parse(row.dados || "{}"); } catch { data = {}; }
  return {
    id: row.id,
    ...data,
    cidade: data.cidade || data.city || row.cidade || "",
    createdAt: data.createdAt || data.criadoEm || row.createdAt || "",
    updatedAt: data.updatedAt || row.updatedAt || ""
  };
}

async function listGeneric(db, collection, search = "") {
  const rows = await db.prepare("SELECT * FROM registros WHERE colecao = ? ORDER BY createdAt DESC").bind(collection).all();
  let items = (rows.results || []).map(normalizeGenericRecord);
  const term = String(search || "").trim().toLowerCase();
  if (term) items = items.filter((item) => JSON.stringify(item).toLowerCase().includes(term));
  return json({ ok: true, dados: items, items });
}

async function createGeneric(request, db, collection, user) {
  const payload = await readBody(request);
  const id = payload.id || uuid();
  const now = new Date().toISOString();
  const data = { ...payload, id, createdAt: payload.createdAt || payload.createdAtISO || now, updatedAt: payload.updatedAt || now };

  await db.prepare(`
    INSERT OR REPLACE INTO registros (id, colecao, dados, cidade, criado_por, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, collection, JSON.stringify(data), data.cidade || data.city || user?.cidade || "", user?.email || data.criadoPorEmail || data.createdByEmail || "", data.createdAt, data.updatedAt).run();

  return json({ ok: true, id, dado: data, item: data }, 201);
}

async function updateGeneric(request, db, collection, id) {
  const payload = await readBody(request);
  const existing = await db.prepare("SELECT * FROM registros WHERE colecao = ? AND id = ? LIMIT 1").bind(collection, id).first();
  if (!existing) return json({ ok: false, erro: "Registro não encontrado." }, 404);

  const current = normalizeGenericRecord(existing);
  const updated = { ...current, ...payload, id, updatedAt: new Date().toISOString() };
  await db.prepare("UPDATE registros SET dados = ?, cidade = ?, updatedAt = ? WHERE colecao = ? AND id = ?").bind(JSON.stringify(updated), updated.cidade || updated.city || "", updated.updatedAt, collection, id).run();
  return json({ ok: true, dado: updated, item: updated });
}

async function deleteGeneric(db, collection, id) {
  await db.prepare("DELETE FROM registros WHERE colecao = ? AND id = ?").bind(collection, id).run();
  return json({ ok: true });
}

async function route(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { headers: JSON_HEADERS });

  if (!env.DB) {
    return json({ ok: false, erro: "Binding D1 ausente.", detalhe: "No Cloudflare Pages/Worker, adicione um binding D1 com o nome exato DB." }, 500);
  }

  await ensureDatabase(env.DB);
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, "") || "/api";

  if (pathname === "/api" || pathname === "/api/health") {
    return json({
      ok: true,
      api: "LAG Controller Cloudflare D1",
      worker: "amorsaudeexp4",
      db: true,
      assets: true,
      horario: new Date().toISOString()
    });
  }

  if (pathname === "/api/debug-bindings") {
    return json({
      ok: true,
      bindings: {
        DB: Boolean(env.DB),
        ASSETS: Boolean(env.ASSETS)
      },
      horario: new Date().toISOString()
    });
  }
  if (pathname === "/api/auth/login" && request.method === "POST") return login(request, env.DB);
  if (pathname === "/api/auth/logout" && request.method === "POST") return logout(request, env.DB);

  const user = FREE_EDIT_MODE
    ? await getFreeEditor(env.DB)
    : await authenticate(request, env.DB);
  if (pathname === "/api/me" && request.method === "GET") {
    if (!user) return json({ ok: false, erro: "Sessão inválida ou expirada." }, 401);
    return json({ ok: true, usuario: user });
  }

  const publicCreateCollections = new Set(["candidatosMedicos"]);
  const collection = collectionFromPath(pathname);
  const id = idFromPath(pathname);

  if (!collection || ["auth", "me", "health"].includes(collection)) return json({ ok: false, erro: "Rota não encontrada." }, 404);
  if (!FREE_EDIT_MODE && collection !== "candidatosMedicos" && !user) return json({ ok: false, erro: "Faça login para acessar esta rota." }, 401);

  if (collection === "usuarios") {
    if (request.method === "GET") return listUsers(env.DB, url.searchParams.get("busca") || "");
    if (request.method === "POST") return createUser(env.DB, await readBody(request));
    if (request.method === "PUT" && id) return updateUser(env.DB, id, await readBody(request));
    if (request.method === "DELETE" && id) return deleteUser(env.DB, id);
  }

  if (request.method === "GET") return listGeneric(env.DB, collection, url.searchParams.get("busca") || "");
  if (request.method === "POST" && (user || publicCreateCollections.has(collection))) return createGeneric(request, env.DB, collection, user);
  if (request.method === "PUT" && id) return updateGeneric(request, env.DB, collection, id);
  if (request.method === "DELETE" && id) return deleteGeneric(env.DB, collection, id);

  return json({ ok: false, erro: "Método não permitido." }, 405);
}

async function handleApi(request, env) {
  try {
    return await route(request, env);
  } catch (error) {
    console.error("Erro na API LAG:", error);
    return json({ ok: false, erro: "Erro interno na API.", detalhe: error.message }, 500);
  }
}

function wantsHtml(pathname) {
  if (pathname === "/") return true;
  const last = pathname.split("/").pop() || "";
  return !last.includes(".");
}

async function handleAssets(request, env) {
  if (!env.ASSETS) {
    return new Response("Assets binding ausente. Confira [assets] no wrangler.toml.", { status: 500 });
  }

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  // Rotas sem extensão entregam diretamente os HTMLs estáticos, sem redirecionamentos em ciclo.
  const staticRoutes = {
    "/": "/pages/login.html",
    "/pages/login": "/pages/login.html",
    "/pages/home": "/pages/home.html",
    "/modules/prontuario-medico/prontuario-medico": "/modules/prontuario-medico/prontuario-medico.html"
  };

  if (staticRoutes[pathname]) {
    const assetUrl = new URL(request.url);
    assetUrl.pathname = staticRoutes[pathname];
    return env.ASSETS.fetch(new Request(assetUrl.toString(), request));
  }

  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      return handleApi(request, env);
    }

    return handleAssets(request, env);
  }
};
