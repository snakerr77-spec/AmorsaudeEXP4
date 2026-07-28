// Autenticação Cloudflare D1 ativa. As páginas internas exigem sessão válida.
const MODO_EDICAO_LIVRE = false;
const API_URL_CLOUD = window.location.protocol === "file:"
  ? "http://localhost:8787"
  : window.location.origin;
const LOGIN_URL_CLOUD = "/pages/login";
const HOME_URL_CLOUD = "/pages/home";

const USUARIO_EDITOR_LIVRE = Object.freeze({
  id: "editor-livre",
  uid: "editor-livre",
  nome: "Editor LAG",
  nomeCompleto: "Editor LAG",
  nome_completo: "Editor LAG",
  email: "editor@lag.local",
  nivelAcesso: "admin",
  nivel_acesso: "admin",
  cidade: "Cerquilho",
  cargo: "Administrador",
  setor: "Edição",
  ativo: true,
  authProvider: "edicao-livre"
});

const CIDADES_CLOUD = ["Embu das Artes", "Itapeva", "Tatui", "Cerquilho"];

function normalizarCidadeCloud(cidade) {
  const valor = String(cidade || "").trim();
  if (valor === "Tatuí") return "Tatui";
  return CIDADES_CLOUD.includes(valor) ? valor : "Cerquilho";
}

function normalizarNivelCloud(nivel) {
  const valor = String(nivel || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

  const aliases = {
    admin: "admin",
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

  return aliases[valor] || valor || "colaborador";
}

function rotuloNivelCloud(nivel) {
  const mapa = {
    admin: "Admin",
    financeiro: "Financeiro",
    gerencia: "Gerência",
    cdt: "CDT",
    recepcao: "Recepção",
    medico: "Médico",
    colaborador: "Colaborador"
  };

  return mapa[normalizarNivelCloud(nivel)] || "Colaborador";
}

function getUsuarioCloudLocal() {
  const raw =
    localStorage.getItem("amor_usuario") ||
    localStorage.getItem("amorSaudeUsuario") ||
    localStorage.getItem("usuarioLogado");

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function salvarUsuarioCloudLocal(usuario) {
  if (!usuario) return null;

  const nivel = MODO_EDICAO_LIVRE
    ? "admin"
    : normalizarNivelCloud(
      usuario.nivel_acesso ||
      usuario.nivelAcesso ||
      "colaborador"
    );

  const cidade = normalizarCidadeCloud(
    usuario.cidade ||
    localStorage.getItem("amorSaudeCidadeSelecionada") ||
    localStorage.getItem("amor_cidade") ||
    "Cerquilho"
  );

  const sessao = {
    ...usuario,
    uid: usuario.uid || usuario.id || usuario.email || "cloud-user",
    nivelAcesso: nivel,
    nivel_acesso: nivel,
    cidade,
    ativo: MODO_EDICAO_LIVRE ? true : usuario.ativo,
    authProvider: MODO_EDICAO_LIVRE ? "edicao-livre" : "cloudflare-d1"
  };

  localStorage.setItem("amor_usuario", JSON.stringify(sessao));
  localStorage.setItem("amorSaudeUsuario", JSON.stringify(sessao));
  localStorage.setItem("usuarioLogado", JSON.stringify(sessao));

  localStorage.setItem("amor_nivel_acesso", nivel);
  localStorage.setItem("nivelAcesso", nivel);

  localStorage.setItem("amor_cidade", cidade);
  localStorage.setItem("cidadeSelecionada", cidade);
  localStorage.setItem("amorSaudeCidadeSelecionada", cidade);

  if (sessao.email) {
    localStorage.setItem("amor_email", sessao.email);
    localStorage.setItem("usuarioEmail", sessao.email);
  }

  window.usuarioLogado = sessao;
  return sessao;
}

function limparSessaoCloud() {
  [
    "firebaseUser",
    "firebaseAuth",
    "firebaseUID",
    "amor_token",
    "amor_token_expira_em",
    "amor_email",
    "usuarioEmail",
    "amor_usuario",
    "amorSaudeUsuario",
    "usuarioLogado",
    "amor_nivel_acesso",
    "nivelAcesso",
    "amor_cidade",
    "cidadeSelecionada",
    "amorSaudeLogado",
    "isLoggedIn"
  ].forEach((chave) => localStorage.removeItem(chave));

  sessionStorage.removeItem("amorSaudeSessaoAtiva");
  window.usuarioLogado = null;
}

async function cloudFetch(path, options = {}) {
  const token = localStorage.getItem("amor_token") || "";
  const email =
    localStorage.getItem("amor_email") ||
    localStorage.getItem("usuarioEmail") ||
    "";

  const resposta = await fetch(`${API_URL_CLOUD}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "x-user-email": email,
      ...(options.headers || {})
    }
  });

  let data = {};

  try {
    data = await resposta.json();
  } catch {
    data = {};
  }

  if (!resposta.ok) {
    throw new Error(data.erro || data.detalhe || "Erro na API Cloudflare.");
  }

  return data;
}

function preencherUsuarioNaTela(usuario) {
  if (!usuario) return;

  const nome =
    usuario.nomeCompleto ||
    usuario.nome_completo ||
    usuario.nome ||
    usuario.email ||
    "Usuário";

  const email = usuario.email || "";
  const nivel = normalizarNivelCloud(usuario.nivelAcesso || usuario.nivel_acesso);
  const cidade = normalizarCidadeCloud(usuario.cidade);

  document.querySelectorAll("[data-user-name]").forEach((el) => {
    el.textContent = nome;
  });

  document.querySelectorAll("[data-user-email]").forEach((el) => {
    el.textContent = email;
  });

  document.querySelectorAll("[data-user-role]").forEach((el) => {
    el.textContent = rotuloNivelCloud(nivel);
  });

  document.querySelectorAll("[data-user-city]").forEach((el) => {
    el.textContent = cidade;
  });

  document.querySelectorAll("[data-city-select]").forEach((select) => {
    select.value = cidade;

    if (select.dataset.cloudReady === "true") return;

    select.dataset.cloudReady = "true";

    select.addEventListener("change", () => {
      const novaCidade = normalizarCidadeCloud(select.value);
      usuario.cidade = novaCidade;
      salvarUsuarioCloudLocal(usuario);

      document.querySelectorAll("[data-user-city]").forEach((el) => {
        el.textContent = novaCidade;
      });
    });
  });

  const isAdmin = MODO_EDICAO_LIVRE || nivel === "admin";
  const podeGestao = MODO_EDICAO_LIVRE || ["admin", "financeiro", "gerencia"].includes(nivel);
  const podeMedicina = MODO_EDICAO_LIVRE || ["admin", "financeiro", "medico"].includes(nivel);

  document.querySelectorAll("[data-admin-only]").forEach((el) => {
    el.hidden = !isAdmin;
  });

  document.querySelectorAll("[data-controladoria-only]").forEach((el) => {
    el.hidden = !podeGestao;
  });

  document.querySelectorAll("[data-lag-only]").forEach((el) => {
    el.hidden = !podeGestao;
  });

  document.querySelectorAll("[data-medical-only]").forEach((el) => {
    el.hidden = !podeMedicina;
  });
}

async function validarSessaoCloudflare() {
  if (MODO_EDICAO_LIVRE) {
    return salvarUsuarioCloudLocal({
      ...USUARIO_EDITOR_LIVRE,
      ...(getUsuarioCloudLocal() || {}),
      id: USUARIO_EDITOR_LIVRE.id,
      uid: USUARIO_EDITOR_LIVRE.uid,
      email: USUARIO_EDITOR_LIVRE.email,
      nivelAcesso: "admin",
      nivel_acesso: "admin",
      ativo: true
    });
  }

  const token = localStorage.getItem("amor_token");
  if (!token) return null;

  const data = await cloudFetch("/api/me");
  if (!data?.ok || !data?.usuario) return null;

  return salvarUsuarioCloudLocal(data.usuario);
}

async function protegerPaginaCloud() {
  const path = window.location.pathname;
  const paginaLogin = path.includes("/pages/login");

  if (paginaLogin) return;

  try {
    if (MODO_EDICAO_LIVRE) {
      const usuario = await validarSessaoCloudflare();
      preencherUsuarioNaTela(usuario);

      document.querySelectorAll(
        "[data-admin-only], [data-controladoria-only], [data-lag-only], [data-medical-only]"
      ).forEach((el) => {
        el.hidden = false;
        el.removeAttribute("aria-hidden");
      });

      window.dispatchEvent(new CustomEvent("usuario-carregado", {
        detail: usuario
      }));
      return;
    }

    // Sempre confirma o token no servidor antes de liberar uma página interna.
    const usuario = await validarSessaoCloudflare();

    if (!usuario) {
      limparSessaoCloud();
      localStorage.setItem("amorSaudeRedirectAfterLogin", path + window.location.search);
      window.location.href = LOGIN_URL_CLOUD;
      return;
    }

    preencherUsuarioNaTela(usuario);

    window.dispatchEvent(new CustomEvent("usuario-carregado", {
      detail: usuario
    }));
  } catch (erro) {
    console.error("Erro ao proteger página com Cloudflare:", erro);
    limparSessaoCloud();
    localStorage.setItem("amorSaudeRedirectAfterLogin", path + window.location.search);
    window.location.href = LOGIN_URL_CLOUD;
  }
}

async function sairDaContaCloud() {
  if (MODO_EDICAO_LIVRE) {
    limparSessaoCloud();
    salvarUsuarioCloudLocal(USUARIO_EDITOR_LIVRE);
    window.location.href = HOME_URL_CLOUD;
    return;
  }

  const token = localStorage.getItem("amor_token") || "";

  try {
    await fetch(`${API_URL_CLOUD}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
  } catch (erro) {
    console.warn("Não foi possível encerrar sessão no servidor:", erro);
  }

  limparSessaoCloud();
  window.location.href = LOGIN_URL_CLOUD;
}

window.AmorSaudeAPI = {
  API_URL: API_URL_CLOUD,
  apiFetch: cloudFetch,

  async me() {
    return await cloudFetch("/api/me");
  },

  async listar(colecao, busca = "") {
    const query = busca ? `?busca=${encodeURIComponent(busca)}` : "";
    return await cloudFetch(`/api/${colecao}${query}`);
  },

  async criar(colecao, dados) {
    return await cloudFetch(`/api/${colecao}`, {
      method: "POST",
      body: JSON.stringify(dados)
    });
  },

  async atualizar(colecao, id, dados) {
    return await cloudFetch(`/api/${colecao}/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados)
    });
  },

  async excluir(colecao, id) {
    return await cloudFetch(`/api/${colecao}/${id}`, {
      method: "DELETE"
    });
  },

  sair: sairDaContaCloud
};

window.sairDaConta = sairDaContaCloud;
window.sairDaContaCloud = sairDaContaCloud;
window.protegerPaginaCloud = protegerPaginaCloud;

document.addEventListener("DOMContentLoaded", protegerPaginaCloud);
