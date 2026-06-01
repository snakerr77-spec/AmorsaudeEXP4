// js/firebase-config.js
// Central do Firebase do projeto Amor Saúde.
// Este arquivo cuida de login, proteção de páginas e dados do usuário logado.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAzB9hreLNk5TJqQH5JsIhcJx2HO4qrHYY",
  authDomain: "beseamorsaude.firebaseapp.com",
  projectId: "beseamorsaude",
  storageBucket: "beseamorsaude.firebasestorage.app",
  messagingSenderId: "388897235068",
  appId: "1:388897235068:web:bc6f3ab94c0bf873d7e9f9",
  measurementId: "G-8D73GZ7VGC"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();
export const HOME_URL = new URL("../pages/home.html", import.meta.url).href;
export const LOGIN_URL = new URL("../pages/login.html", import.meta.url).href;

function mostrarErroNaTela(mensagem) {
  const authMessage = document.getElementById("authMessage");
  if (authMessage) {
    authMessage.textContent = mensagem;
    authMessage.classList.remove("sucesso");
    authMessage.classList.add("erro");
  }
}

export function traduzirErroFirebase(codigo) {
  const erros = {
    "auth/email-already-in-use": "Este e-mail já está cadastrado.",
    "auth/invalid-email": "Digite um e-mail válido.",
    "auth/missing-password": "Digite sua senha.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "E-mail ou senha incorretos. Se este e-mail foi criado pelo Google, entre pelo ícone do Google.",
    "auth/operation-not-allowed": "Login por e-mail/senha ainda não está ativado no Firebase.",
    "auth/popup-closed-by-user": "A janela do Google foi fechada antes de concluir o login.",
    "auth/popup-blocked": "O navegador bloqueou a janela de login do Google.",
    "auth/unauthorized-domain": "Este domínio não está autorizado no Firebase.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente novamente.",
    "permission-denied": "Sem permissão no Firestore. Verifique as regras e se o usuário está ativo."
  };

  return erros[codigo] || codigo || "Erro desconhecido.";
}

export async function buscarPerfil(uid) {
  const usuarioRef = doc(db, "usuarios", uid);
  const usuarioSnap = await getDoc(usuarioRef);
  return usuarioSnap.exists() ? usuarioSnap.data() : null;
}

async function criarPerfilInicial(usuario, nomeCompleto = "", cidadeSelecionada = "") {
  await setDoc(doc(db, "usuarios", usuario.uid), {
    nomeCompleto: nomeCompleto || usuario.displayName || usuario.email || "",
    email: usuario.email || "",
    foto: usuario.photoURL || "",
    capa: "",
    telefone: "",
    cargo: "",
    setor: "",
    bio: "",
    cidade: normalizarCidade(cidadeSelecionada || localStorage.getItem("amorSaudeCidadeSelecionada") || "Cerquilho"),
    nivelAcesso: "colaborador",
    ativo: false,
    createdAt: serverTimestamp(),
    ultimoLogin: serverTimestamp()
  });
}

async function validarPerfilEEntrar(usuario, cidadeSelecionada = "") {
  let dadosUsuario = await buscarPerfil(usuario.uid);
  const cidadeLogin = normalizarCidade(cidadeSelecionada || localStorage.getItem("amorSaudeCidadeSelecionada") || dadosUsuario?.cidade || "Cerquilho");
  localStorage.setItem("amorSaudeCidadeSelecionada", cidadeLogin);

  if (!dadosUsuario) {
    await criarPerfilInicial(usuario, "", cidadeLogin);
    await signOut(auth);
    alert("Cadastro criado! Aguarde um administrador liberar seu acesso.");
    return;
  }

  if (dadosUsuario.ativo !== true) {
    await signOut(auth);
    alert("Seu acesso ainda não foi liberado pelo administrador.");
    return;
  }

  try {
    await updateDoc(doc(db, "usuarios", usuario.uid), {
      cidade: cidadeLogin,
      ultimoLogin: serverTimestamp()
    });
  } catch (erro) {
    console.warn("Não foi possível atualizar cidade/último login. Entrando mesmo assim porque o perfil está ativo.", erro);
  }

  window.location.href = HOME_URL;
}

export async function loginComGoogle(cidadeSelecionada = "") {
  try {
    const resultado = await signInWithPopup(auth, provider);
    await validarPerfilEEntrar(resultado.user, cidadeSelecionada);
  } catch (erro) {
    console.error("Erro no login com Google:", erro);
    const mensagem = "Erro no login com Google: " + traduzirErroFirebase(erro.code);
    mostrarErroNaTela(mensagem);
    alert(mensagem);
  }
}

export async function loginComEmailSenha(email, senha, cidadeSelecionada = "") {
  try {
    const emailLimpo = String(email || "").trim();
    const senhaLimpa = String(senha || "").trim();

    if (!emailLimpo || !senhaLimpa) {
      alert("Digite seu e-mail e sua senha.");
      return;
    }

    const resultado = await signInWithEmailAndPassword(auth, emailLimpo, senhaLimpa);
    await validarPerfilEEntrar(resultado.user, cidadeSelecionada);
  } catch (erro) {
    console.error("Erro no login com e-mail/senha:", erro);
    const mensagem = "Erro ao entrar: " + traduzirErroFirebase(erro.code);
    mostrarErroNaTela(mensagem);
    alert(mensagem);
  }
}

export async function recuperarSenha(email) {
  try {
    const emailLimpo = String(email || "").trim();

    if (!emailLimpo) {
      alert("Digite seu e-mail primeiro para recuperar a senha.");
      return;
    }

    await sendPasswordResetEmail(auth, emailLimpo);
    alert("Enviamos um link de recuperação para seu e-mail. Verifique a caixa de entrada e o spam.");
  } catch (erro) {
    console.error("Erro ao recuperar senha:", erro);
    const mensagem = "Erro ao recuperar senha: " + traduzirErroFirebase(erro.code);
    mostrarErroNaTela(mensagem);
    alert(mensagem);
  }
}

export async function sairDaConta() {
  try {
    await signOut(auth);
    window.location.href = LOGIN_URL;
  } catch (erro) {
    console.error("Erro ao sair:", erro);
    alert("Erro ao sair da conta.");
  }
}


const ROLE_LABELS = {
  admin: "Admin",
  financeiro: "Financeiro",
  gerencia: "Gerência",
  cdt: "CDT",
  recepcao: "Recepção",
  medico: "Médico",
  colaborador: "Colaborador"
};

function normalizarNivelAcesso(nivel) {
  const valor = String(nivel ?? "")
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

function obterRotuloNivelAcesso(nivel) {
  const normalizado = normalizarNivelAcesso(nivel);
  return ROLE_LABELS[normalizado] || normalizado || "Colaborador";
}

const CIDADES_AMOR_SAUDE = ["Embu das Artes", "Itapeva", "Tatui", "Cerquilho"];

function normalizarCidade(cidade) {
  const valor = String(cidade || "").trim();
  return CIDADES_AMOR_SAUDE.includes(valor) ? valor : "Cerquilho";
}

function aplicarCidadeNaTela(cidade) {
  const cidadeFinal = normalizarCidade(cidade);
  localStorage.setItem("amorSaudeCidadeSelecionada", cidadeFinal);

  document.querySelectorAll("[data-user-city]").forEach((el) => {
    el.textContent = cidadeFinal;
  });

  document.querySelectorAll("[data-city-select]").forEach((select) => {
    select.value = cidadeFinal;
  });
}

async function salvarCidadeUsuario(cidade) {
  const cidadeFinal = normalizarCidade(cidade);
  aplicarCidadeNaTela(cidadeFinal);

  if (window.usuarioLogado) {
    window.usuarioLogado.cidade = cidadeFinal;
  }

  if (!auth.currentUser) return;

  try {
    await updateDoc(doc(db, "usuarios", auth.currentUser.uid), {
      cidade: cidadeFinal,
      updatedAt: serverTimestamp()
    });
  } catch (erro) {
    console.warn("Cidade salva somente neste navegador. Confira as permissões do Firestore se quiser salvar no perfil.", erro);
  }
}

function prepararSeletoresCidade() {
  document.querySelectorAll("[data-city-select]").forEach((select) => {
    if (select.dataset.cityReady === "true") return;
    select.dataset.cityReady = "true";
    select.addEventListener("change", () => salvarCidadeUsuario(select.value));
  });

  const cidadeAtual = window.usuarioLogado?.cidade || localStorage.getItem("amorSaudeCidadeSelecionada") || "Cerquilho";
  aplicarCidadeNaTela(cidadeAtual);
}

function preencherElementosUsuario(usuarioComPerfil) {
  document.querySelectorAll("[data-user-name]").forEach((el) => {
    el.textContent = usuarioComPerfil.nomeCompleto || usuarioComPerfil.email || "Usuário";
  });

  document.querySelectorAll("[data-user-email]").forEach((el) => {
    el.textContent = usuarioComPerfil.email || "";
  });

  document.querySelectorAll("[data-user-role]").forEach((el) => {
    el.textContent = obterRotuloNivelAcesso(usuarioComPerfil.nivelAcesso);
  });

  document.querySelectorAll("[data-user-avatar]").forEach((img) => {
    if (usuarioComPerfil.foto) img.src = usuarioComPerfil.foto;
  });

  const role = normalizarNivelAcesso(
    usuarioComPerfil.nivelAcesso ||
    usuarioComPerfil.acesso ||
    usuarioComPerfil.perfil ||
    usuarioComPerfil.tipoAcesso ||
    usuarioComPerfil.tipoUsuario ||
    usuarioComPerfil.tipo ||
    "colaborador"
  );
  usuarioComPerfil.nivelAcesso = role;
  const isAdmin = role === "admin";
  const canAccessRestrictedManagement = ["admin", "financeiro", "gerencia"].includes(role);
  const canAccessControladoria = canAccessRestrictedManagement;
  const canAccessLag = canAccessRestrictedManagement;
  const canAccessMedical = ["admin", "financeiro", "medico"].includes(role);

  document.querySelectorAll("[data-admin-only]").forEach((el) => {
    el.hidden = !isAdmin;
  });

  document.querySelectorAll("[data-controladoria-only]").forEach((el) => {
    el.hidden = !canAccessControladoria;
  });

  document.querySelectorAll("[data-lag-only]").forEach((el) => {
    el.hidden = !canAccessLag;
  });

  document.querySelectorAll("[data-medical-only]").forEach((el) => {
    el.hidden = !canAccessMedical;
  });

  aplicarCidadeNaTela(usuarioComPerfil.cidade || localStorage.getItem("amorSaudeCidadeSelecionada") || "Cerquilho");
  prepararSeletoresCidade();
}

async function protegerPagina(usuario) {
  if (!document.body || document.body.dataset.protectedPage !== "true") {
    return;
  }

  if (!usuario) {
    window.location.href = LOGIN_URL;
    return;
  }

  try {
    const dadosUsuario = await buscarPerfil(usuario.uid);

    if (!dadosUsuario || dadosUsuario.ativo !== true) {
      await signOut(auth);
      alert("Acesso bloqueado. Aguarde liberação do administrador.");
      window.location.href = LOGIN_URL;
      return;
    }

    const usuarioComPerfil = {
      uid: usuario.uid,
      email: usuario.email,
      authPhoto: usuario.photoURL,
      ...dadosUsuario
    };

    const role = normalizarNivelAcesso(
      usuarioComPerfil.nivelAcesso ||
      usuarioComPerfil.acesso ||
      usuarioComPerfil.perfil ||
      usuarioComPerfil.tipoAcesso ||
      usuarioComPerfil.tipoUsuario ||
      usuarioComPerfil.tipo ||
      "colaborador"
    );
    usuarioComPerfil.nivelAcesso = role;

    const requiredRoleRaw = String(document.body.dataset.requiredRole || "").trim();
    const requiredRole = requiredRoleRaw ? normalizarNivelAcesso(requiredRoleRaw) : "";
    const allowedRoles = String(document.body.dataset.allowedRoles || "")
      .split(",")
      .map((item) => normalizarNivelAcesso(item.trim()))
      .filter((item) => item && item !== "colaborador");

    window.amorSaudeAccessDebug = {
      uid: usuario.uid,
      emailAuth: usuario.email,
      emailPerfil: dadosUsuario.email || "",
      ativo: dadosUsuario.ativo,
      nivelAcesso: role,
      requiredRole,
      allowedRoles,
      pagina: window.location.pathname
    };
    console.table(window.amorSaudeAccessDebug);

    const adminPodeTudo = role === "admin";

    if (!adminPodeTudo && allowedRoles.length && !allowedRoles.includes(role)) {
      alert(`Você não tem permissão para acessar esta área. Seu acesso atual está como: ${obterRotuloNivelAcesso(role)}.`);
      window.location.href = HOME_URL;
      return;
    }

    if (!adminPodeTudo && requiredRole && role !== requiredRole) {
      alert(`Você não tem permissão para acessar esta área. Seu acesso atual está como: ${obterRotuloNivelAcesso(role)}.`);
      window.location.href = HOME_URL;
      return;
    }

    document.body.classList.add("usuario-autenticado");
    window.usuarioLogado = usuarioComPerfil;
    preencherElementosUsuario(usuarioComPerfil);
    window.dispatchEvent(new CustomEvent("usuario-carregado", { detail: usuarioComPerfil }));
  } catch (erro) {
    console.error("Erro ao validar acesso:", erro);
    window.location.href = LOGIN_URL;
  }
}

document.addEventListener("DOMContentLoaded", prepararSeletoresCidade);
window.salvarCidadeUsuario = salvarCidadeUsuario;
window.aplicarCidadeNaTela = aplicarCidadeNaTela;

onAuthStateChanged(auth, protegerPagina);

window.loginComGoogle = loginComGoogle;
window.loginComEmailSenha = loginComEmailSenha;
window.recuperarSenha = recuperarSenha;
window.sairDaConta = sairDaConta;
window.firebaseCarregado = true;
window.dispatchEvent(new Event("firebase-carregado"));
