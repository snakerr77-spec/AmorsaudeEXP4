const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const forgotPassword = document.getElementById("forgotPassword");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const authMessage = document.getElementById("authMessage");
const loginCidadeSelect = document.getElementById("loginCidadeSelect");

const API_URL = "https://little-fog-b415amorsaude-api.snakerr77.workers.dev";
const PAGINA_APOS_LOGIN = "/index.html";
const PAGINA_LOGIN = "/pages/login.html";

const CIDADES_LOGIN = [
  "Embu das Artes",
  "Itapeva",
  "Tatui",
  "Cerquilho"
];

function normalizarCidadeLogin(cidade) {
  const valor = String(cidade || "").trim();

  if (valor === "Tatuí") return "Tatui";

  return CIDADES_LOGIN.includes(valor) ? valor : "Cerquilho";
}

function getCidadeLogin() {
  return normalizarCidadeLogin(
    loginCidadeSelect?.value ||
    localStorage.getItem("amorSaudeCidadeSelecionada") ||
    localStorage.getItem("amor_cidade") ||
    "Cerquilho"
  );
}

function prepararCidadeLogin() {
  if (!loginCidadeSelect) return;

  const cidadeSalva = normalizarCidadeLogin(
    localStorage.getItem("amorSaudeCidadeSelecionada") ||
    localStorage.getItem("amor_cidade") ||
    "Cerquilho"
  );

  loginCidadeSelect.value = cidadeSalva;

  localStorage.setItem("amorSaudeCidadeSelecionada", cidadeSalva);
  localStorage.setItem("amor_cidade", cidadeSalva);

  loginCidadeSelect.addEventListener("change", () => {
    const cidade = getCidadeLogin();

    localStorage.setItem("amorSaudeCidadeSelecionada", cidade);
    localStorage.setItem("amor_cidade", cidade);
  });
}

prepararCidadeLogin();

function mostrarMensagem(texto, tipo = "") {
  if (!authMessage) return;

  authMessage.textContent = texto || "";
  authMessage.classList.remove("erro", "sucesso", "aviso");

  if (tipo) {
    authMessage.classList.add(tipo);
  }
}

function normalizarEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function setCarregandoLogin(carregando) {
  const botaoEntrar = loginForm?.querySelector("button[type='submit']");

  if (botaoEntrar) {
    botaoEntrar.disabled = carregando;

    if (!botaoEntrar.dataset.textoOriginal) {
      botaoEntrar.dataset.textoOriginal = botaoEntrar.textContent;
    }

    botaoEntrar.textContent = carregando
      ? "Entrando..."
      : botaoEntrar.dataset.textoOriginal;
  }

  if (googleLoginBtn) {
    googleLoginBtn.disabled = carregando;
  }

  if (forgotPassword) {
    forgotPassword.style.pointerEvents = carregando ? "none" : "";
    forgotPassword.style.opacity = carregando ? "0.65" : "";
  }
}

function limparSessaoAntiga() {
  localStorage.removeItem("firebaseUser");
  localStorage.removeItem("firebaseAuth");
  localStorage.removeItem("firebaseUID");

  localStorage.removeItem("amor_token");
  localStorage.removeItem("amor_token_expira_em");
  localStorage.removeItem("amor_email");
  localStorage.removeItem("usuarioEmail");
  localStorage.removeItem("amor_usuario");
  localStorage.removeItem("amorSaudeUsuario");
  localStorage.removeItem("usuarioLogado");
  localStorage.removeItem("amor_nivel_acesso");
  localStorage.removeItem("nivelAcesso");
  localStorage.removeItem("amorSaudeLogado");
  localStorage.removeItem("isLoggedIn");

  sessionStorage.removeItem("amorSaudeSessaoAtiva");
}

async function fazerLoginCloudflare(email, senha) {
  const emailNormalizado = normalizarEmail(email);

  const resposta = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: emailNormalizado,
      senha
    })
  });

  let data = {};

  try {
    data = await resposta.json();
  } catch {
    data = {};
  }

  if (!resposta.ok) {
    throw new Error(
      data.erro ||
      data.detalhe ||
      "Não foi possível fazer login."
    );
  }

  if (!data.token || !data.usuario) {
    throw new Error("A API não retornou uma sessão válida.");
  }

  return data;
}

function salvarSessaoCloudflare(data, cidadeSelecionada) {
  const usuario = data.usuario;

  const cidadeFinal = normalizarCidadeLogin(
    cidadeSelecionada ||
    usuario.cidade ||
    "Cerquilho"
  );

  const nivelAcesso =
    usuario.nivel_acesso ||
    usuario.nivelAcesso ||
    "colaborador";

  const usuarioSessao = {
    ...usuario,
    nivelAcesso,
    nivel_acesso: nivelAcesso,
    cidade: cidadeFinal,
    authProvider: "cloudflare-d1"
  };

  localStorage.setItem("amor_token", data.token);
  localStorage.setItem("amor_token_expira_em", data.expira_em || "");

  localStorage.setItem("amor_email", usuario.email || "");
  localStorage.setItem("usuarioEmail", usuario.email || "");

  localStorage.setItem("amor_usuario", JSON.stringify(usuarioSessao));
  localStorage.setItem("amorSaudeUsuario", JSON.stringify(usuarioSessao));
  localStorage.setItem("usuarioLogado", JSON.stringify(usuarioSessao));

  localStorage.setItem("amor_nivel_acesso", nivelAcesso);
  localStorage.setItem("nivelAcesso", nivelAcesso);

  localStorage.setItem("amor_cidade", cidadeFinal);
  localStorage.setItem("cidadeSelecionada", cidadeFinal);
  localStorage.setItem("amorSaudeCidadeSelecionada", cidadeFinal);

  localStorage.setItem("amorSaudeAuthProvider", "cloudflare-d1");
  localStorage.setItem("amorSaudeLogado", "true");
  localStorage.setItem("isLoggedIn", "true");

  localStorage.setItem("usuarioId", usuario.id || "");
  localStorage.setItem("usuarioNome", usuario.nome || usuario.nome_completo || "");
  localStorage.setItem("usuarioCargo", usuario.cargo || "");
  localStorage.setItem("usuarioSetor", usuario.setor || "");

  sessionStorage.setItem("amorSaudeSessaoAtiva", "true");
}

function redirecionarAposLogin() {
  const params = new URLSearchParams(window.location.search);

  let redirect =
    params.get("redirect") ||
    localStorage.getItem("amorSaudeRedirectAfterLogin") ||
    PAGINA_APOS_LOGIN;

  localStorage.removeItem("amorSaudeRedirectAfterLogin");

  if (
    !redirect ||
    redirect.includes("login.html") ||
    redirect.includes("/pages/login")
  ) {
    redirect = PAGINA_APOS_LOGIN;
  }

  mostrarMensagem("Login realizado com sucesso. Abrindo painel...", "sucesso");

  setTimeout(() => {
    window.location.replace(redirect);
  }, 500);
}

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("amor_token") || "";
  const emailSalvo =
    localStorage.getItem("amor_email") ||
    localStorage.getItem("usuarioEmail") ||
    "";

  const resposta = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "x-user-email": emailSalvo,
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
    throw new Error(
      data.erro ||
      data.detalhe ||
      "Erro na API Cloudflare."
    );
  }

  return data;
}

async function verificarSessaoJaAtiva() {
  const token = localStorage.getItem("amor_token");

  if (!token) return;

  try {
    const data = await apiFetch("/api/me");

    if (data?.ok && data?.usuario) {
      const usuarioLocal = {
        ...data.usuario,
        nivelAcesso:
          data.usuario.nivel_acesso ||
          data.usuario.nivelAcesso ||
          "colaborador"
      };

      localStorage.setItem("amor_usuario", JSON.stringify(usuarioLocal));
      localStorage.setItem("amorSaudeUsuario", JSON.stringify(usuarioLocal));
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLocal));

      window.location.replace(PAGINA_APOS_LOGIN);
    }
  } catch {
    limparSessaoAntiga();
  }
}

if (togglePassword && password) {
  togglePassword.addEventListener("click", () => {
    if (password.type === "password") {
      password.type = "text";
      togglePassword.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
    } else {
      password.type = "password";
      togglePassword.innerHTML = '<i class="fa-solid fa-eye"></i>';
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = normalizarEmail(emailInput ? emailInput.value : "");
    const senha = password ? password.value : "";
    const cidade = getCidadeLogin();

    if (!email || !senha) {
      mostrarMensagem("Digite seu e-mail e sua senha.", "erro");
      return;
    }

    try {
      setCarregandoLogin(true);
      mostrarMensagem("Entrando com Cloudflare...", "");

      limparSessaoAntiga();

      const dataLogin = await fazerLoginCloudflare(email, senha);

      salvarSessaoCloudflare(dataLogin, cidade);

      redirecionarAposLogin();

    } catch (erro) {
      console.error("Erro no login Cloudflare:", erro);

      mostrarMensagem(
        erro.message || "Não foi possível entrar. Verifique e-mail e senha.",
        "erro"
      );

      setCarregandoLogin(false);
    }
  });
}

if (forgotPassword) {
  forgotPassword.addEventListener("click", async (event) => {
    event.preventDefault();

    mostrarMensagem(
      "Recuperação de senha será feita pelo administrador por enquanto.",
      "aviso"
    );

    alert(
      "Para redefinir senha, o administrador precisa gerar um token de senha na API. Depois criaremos uma tela própria para isso."
    );
  });
}

if (googleLoginBtn) {
  googleLoginBtn.style.display = "none";
}

window.AmorSaudeAPI = {
  API_URL,
  apiFetch,

  async me() {
    return await apiFetch("/api/me");
  },

  async listar(colecao, busca = "") {
    const query = busca ? `?busca=${encodeURIComponent(busca)}` : "";
    return await apiFetch(`/api/${colecao}${query}`);
  },

  async criar(colecao, dados) {
    return await apiFetch(`/api/${colecao}`, {
      method: "POST",
      body: JSON.stringify(dados)
    });
  },

  async atualizar(colecao, id, dados) {
    return await apiFetch(`/api/${colecao}/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados)
    });
  },

  async excluir(colecao, id) {
    return await apiFetch(`/api/${colecao}/${id}`, {
      method: "DELETE"
    });
  },

  async sair() {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST"
      });
    } catch (erro) {
      console.warn("Não foi possível encerrar sessão no servidor:", erro);
    }

    limparSessaoAntiga();

    window.location.href = PAGINA_LOGIN;
  }
};

verificarSessaoJaAtiva();
