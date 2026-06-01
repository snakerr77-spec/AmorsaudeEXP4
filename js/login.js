const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const forgotPassword = document.getElementById("forgotPassword");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const authMessage = document.getElementById("authMessage");
const loginCidadeSelect = document.getElementById("loginCidadeSelect");


const CIDADES_LOGIN = ["Embu das Artes", "Itapeva", "Tatui", "Cerquilho"];

function normalizarCidadeLogin(cidade) {
  const valor = String(cidade || "").trim();
  return CIDADES_LOGIN.includes(valor) ? valor : "Cerquilho";
}

function getCidadeLogin() {
  return normalizarCidadeLogin(loginCidadeSelect?.value || localStorage.getItem("amorSaudeCidadeSelecionada") || "Cerquilho");
}

function prepararCidadeLogin() {
  if (!loginCidadeSelect) return;
  const cidadeSalva = normalizarCidadeLogin(localStorage.getItem("amorSaudeCidadeSelecionada") || "Cerquilho");
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
  authMessage.classList.remove("erro", "sucesso");
  if (tipo) authMessage.classList.add(tipo);
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

function firebasePronto() {
  return window.firebaseCarregado === true &&
    typeof window.loginComEmailSenha === "function" &&
    typeof window.loginComGoogle === "function" &&
    typeof window.recuperarSenha === "function";
}

function aguardarFirebase() {
  if (firebasePronto()) {
    return Promise.resolve(true);
  }

  mostrarMensagem("Carregando Firebase...", "");

  return new Promise((resolve) => {
    const tempoLimite = setTimeout(() => {
      window.removeEventListener("firebase-carregado", aoCarregar);
      resolve(firebasePronto());
    }, 7000);

    function aoCarregar() {
      clearTimeout(tempoLimite);
      resolve(firebasePronto());
    }

    window.addEventListener("firebase-carregado", aoCarregar, { once: true });
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput ? emailInput.value.trim() : "";
    const senha = password ? password.value.trim() : "";

    if (!email || !senha) {
      mostrarMensagem("Digite seu e-mail e sua senha.", "erro");
      return;
    }

    const pronto = await aguardarFirebase();

    if (!pronto) {
      mostrarMensagem("O Firebase não carregou. Aperte Ctrl + F5 e tente novamente.", "erro");
      alert("O Firebase não carregou. Aperte Ctrl + F5 e tente novamente.");
      return;
    }

    mostrarMensagem("Entrando...", "");
    window.loginComEmailSenha(email, senha, getCidadeLogin());
  });
}

if (forgotPassword) {
  forgotPassword.addEventListener("click", async (event) => {
    event.preventDefault();

    const email = emailInput ? emailInput.value.trim() : "";

    if (!email) {
      mostrarMensagem("Digite seu e-mail primeiro.", "erro");
      return;
    }

    const pronto = await aguardarFirebase();

    if (!pronto) {
      mostrarMensagem("O Firebase não carregou. Aperte Ctrl + F5 e tente novamente.", "erro");
      alert("O Firebase não carregou. Aperte Ctrl + F5 e tente novamente.");
      return;
    }

    mostrarMensagem("Enviando recuperação de senha...", "");
    window.recuperarSenha(email);
  });
}

if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    const pronto = await aguardarFirebase();

    if (!pronto) {
      mostrarMensagem("O Firebase não carregou. Aperte Ctrl + F5 e tente novamente.", "erro");
      alert("O Firebase não carregou. Aperte Ctrl + F5 e tente novamente.");
      return;
    }

    mostrarMensagem("Abrindo login do Google...", "");
    window.loginComGoogle(getCidadeLogin());
  });
}
