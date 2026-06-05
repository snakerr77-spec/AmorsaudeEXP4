const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const forgotPassword = document.getElementById("forgotPassword");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const authMessage = document.getElementById("authMessage");
const loginCidadeSelect = document.getElementById("loginCidadeSelect");

const API_URL = "https://little-fog-b415amorsaude-api.snakerr77.workers.dev";
const PAGINA_APOS_LOGIN = "../index.html";

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
    "Cerquilho"
  );
}

function prepararCidadeLogin() {
  if (!loginCidadeSelect) return;

  const cidadeSalva = normalizarCidadeLogin(
    localStorage.getItem("amorSaudeCidadeSelecionada") || "Cerquilho"
  );

  loginCidadeSelect.value = cidadeSalva;
  localStorage.setItem("amorSaudeCidadeSelecionada", cidadeSalva);

  loginCidadeSelect.addEventListener("change", () => {
    localStorage.setItem("amorSaudeCidadeSelecionada", getCidadeLogin());
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
    botaoEntrar.dataset.textoOriginal = botaoEntrar.dataset.textoOriginal || botaoEntrar.textContent;

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

async function apiFetch(path, options = {}) {
  const emailSalvo =
    options.emailHeader ||
    localStorage.getItem("amor_email") ||
    localStorage.getItem("usuarioEmail") ||
    "";

  const resposta = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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
      "Erro ao conectar com a API Cloudflare."
    );
  }

  return data;
}

async function buscarUsuarioCloudflare(email) {
  const emailNormalizado = normalizarEmail(email);

  if (!emailNormalizado) {
    throw new Error("Digite seu e-mail.");
  }

  const data = await apiFetch("/api/me", {
    emailHeader: emailNormalizado,
    headers: {
      "x-user-email": emailNormalizado
    }
  });

  if (!data?.usuario) {
    throw new Error("Usuário não encontrado no banco Cloudflare.");
  }

  if (Number(data.usuario.ativo) !== 1) {
    throw new Error("Seu usuário está inativo. Fale com o administrador.");
  }

  return data.usuario;
}

function salvarSessaoCloudflare(usuario, cidadeSelecionada) {
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

  localStorage.setItem("amor_email", usuario.email);
  localStorage.setItem("usuarioEmail", usuario.email);

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

  const redirect =
    params.get("redirect") ||
    localStorage.getItem("amorSaudeRedirectAfterLogin") ||
    PAGINA_APOS_LOGIN;

  localStorage.removeItem("amorSaudeRedirectAfterLogin");

  setTimeout(() => {
    window.location.href = redirect;
  }, 450);
}

function limparSessaoAntigaFirebase() {
  localStorage.removeItem("firebaseUser");
  localStorage.removeItem("firebaseAuth");
  localStorage.removeItem("firebaseUID");
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
    const senha = password ? password.value.trim() : "";
    const cidade = getCidadeLogin();

    if (!email || !senha) {
      mostrarMensagem("Digite seu e-mail e sua senha.", "erro");
      return;
    }

    try {
      setCarregandoLogin(true);
      mostrarMensagem("Conectando ao Cloudflare...", "");

      const usuario = await buscarUsuarioCloudflare(email);

      limparSessaoAntigaFirebase();
      salvarSessaoCloudflare(usuario, cidade);

      mostrarMensagem("Login realizado com sucesso. Redirecionando...", "sucesso");

      redirecionarAposLogin();

    } catch (erro) {
      console.error("Erro no login Cloudflare:", erro);

      mostrarMensagem(
        erro.message || "Não foi possível entrar. Verifique seu e-mail.",
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
      "Recuperação de senha ainda não foi migrada para o Cloudflare.",
      "aviso"
    );

    alert(
      "A recuperação de senha do Firebase foi removida. No próximo passo vamos criar senha real no Cloudflare com rota de recuperação."
    );
  });
}

if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    mostrarMensagem(
      "Login com Google ainda não foi migrado para o Cloudflare.",
      "aviso"
    );

    alert(
      "O login com Google dependia do Firebase. Agora estamos usando Cloudflare D1. Primeiro vamos ativar login por e-mail, depois adicionamos Google novamente se quiser."
    );
  });
}

window.AmorSaudeAPI = {
  API_URL,
  apiFetch,
  buscarUsuarioCloudflare,
  salvarSessaoCloudflare,

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

  sair() {
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

    window.location.href = "./login.html";
  }
};
