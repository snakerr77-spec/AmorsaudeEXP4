import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const usersGrid = document.getElementById("usersGrid");
const template = document.getElementById("userCardTemplate");
const adminMessage = document.getElementById("adminMessage");
const searchInput = document.getElementById("userSearch");
const refreshUsers = document.getElementById("refreshUsers");
const statTotal = document.getElementById("statTotal");
const statAtivos = document.getElementById("statAtivos");
const statBloqueados = document.getElementById("statBloqueados");

const communicationForm = document.getElementById("communicationForm");
const communicationType = document.getElementById("communicationType");
const communicationCategory = document.getElementById("communicationCategory");
const communicationTitle = document.getElementById("communicationTitle");
const communicationText = document.getElementById("communicationMessage");
const communicationImportant = document.getElementById("communicationImportant");
const communicationStatus = document.getElementById("communicationMessageStatus");
const communicationList = document.getElementById("communicationList");
const communicationTemplate = document.getElementById("communicationCardTemplate");
const refreshCommunications = document.getElementById("refreshCommunications");
const publishCommunication = document.getElementById("publishCommunication");

let usuarios = [];
let comunicados = [];
const CIDADES_AMOR_SAUDE = ["Embu das Artes", "Itapeva", "Tatui", "Cerquilho"];
const NIVEIS_ACESSO_ADMIN = ["admin", "financeiro", "gerencia", "cdt", "recepcao", "medico", "colaborador"];

function normalizarNivelAcessoAdmin(nivel) {
  const valor = String(nivel || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  const aliases = {
    administrador: "admin",
    adm: "admin",
    financeiro: "financeiro",
    financa: "financeiro",
    financas: "financeiro",
    gerencia: "gerencia",
    gerente: "gerencia",
    cdt: "cdt",
    recepcao: "recepcao",
    recepcionista: "recepcao",
    medico: "medico",
    colaborador: "colaborador"
  };

  const normalizado = aliases[valor] || valor;
  return NIVEIS_ACESSO_ADMIN.includes(normalizado) ? normalizado : "colaborador";
}


const COLLECTION_BY_TYPE = {
  notificacao: "notificacoes",
  anuncio: "noticias"
};

const TYPE_LABEL = {
  notificacao: "Notificação",
  anuncio: "Anúncio"
};

function normalizarCidadeAdmin(cidade) {
  const valor = String(cidade || "").trim();
  return CIDADES_AMOR_SAUDE.includes(valor) ? valor : "Cerquilho";
}

function setMessage(texto, tipo = "") {
  adminMessage.textContent = texto;
  adminMessage.className = "admin-message" + (tipo ? ` ${tipo}` : "");
}

function setCommunicationStatus(texto, tipo = "") {
  if (!communicationStatus) return;
  communicationStatus.textContent = texto;
  communicationStatus.className = "admin-message communication-message" + (tipo ? ` ${tipo}` : "");
}

function formatDate(value) {
  if (!value) return "--";
  try {
    const date = value.toDate ? value.toDate() : new Date(value);
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short"
    }).format(date);
  } catch {
    return "--";
  }
}

function dateMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function atualizarStats(lista) {
  const total = lista.length;
  const ativos = lista.filter((u) => u.ativo === true).length;
  statTotal.textContent = total;
  statAtivos.textContent = ativos;
  statBloqueados.textContent = total - ativos;
}

function renderUsuarios() {
  const termo = (searchInput.value || "").toLowerCase().trim();
  const filtrados = usuarios.filter((usuario) => {
    const texto = `${usuario.nomeCompleto || ""} ${usuario.email || ""} ${usuario.cidade || ""} ${usuario.nivelAcesso || ""}`.toLowerCase();
    return texto.includes(termo);
  });

  usersGrid.innerHTML = "";
  atualizarStats(filtrados);

  if (!filtrados.length) {
    setMessage("Nenhum usuário encontrado.");
    return;
  }

  setMessage(`${filtrados.length} usuário(s) na lista.`, "sucesso");

  filtrados.forEach((usuario) => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".user-card");
    const avatar = node.querySelector(".avatar");
    const name = node.querySelector("[data-name]");
    const email = node.querySelector("[data-email]");
    const active = node.querySelector("[data-active]");
    const role = node.querySelector("[data-role]");
    const city = node.querySelector("[data-city]");
    const created = node.querySelector("[data-created]");
    const lastLogin = node.querySelector("[data-last-login]");
    const saveButton = node.querySelector(".save-user");

    avatar.src = usuario.foto || "../assets/images/mascote_hero.png";
    name.textContent = usuario.nomeCompleto || "Sem nome";
    email.textContent = usuario.email || "Sem e-mail";
    active.value = usuario.ativo === true ? "true" : "false";
    role.value = normalizarNivelAcessoAdmin(usuario.nivelAcesso);
    city.value = normalizarCidadeAdmin(usuario.cidade);
    created.textContent = "Cadastro: " + formatDate(usuario.createdAt);
    lastLogin.textContent = "Último login: " + formatDate(usuario.ultimoLogin);

    saveButton.addEventListener("click", async () => {
      saveButton.disabled = true;
      saveButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

      try {
        await updateDoc(doc(db, "usuarios", usuario.id), {
          ativo: active.value === "true",
          nivelAcesso: normalizarNivelAcessoAdmin(role.value),
          cidade: normalizarCidadeAdmin(city.value),
          updatedAt: serverTimestamp()
        });

        usuario.ativo = active.value === "true";
        usuario.nivelAcesso = normalizarNivelAcessoAdmin(role.value);
        usuario.cidade = normalizarCidadeAdmin(city.value);
        setMessage(`Usuário ${usuario.email || usuario.id} atualizado.`, "sucesso");
      } catch (erro) {
        console.error("Erro ao salvar usuário:", erro);
        setMessage("Erro ao salvar. Verifique se sua conta é admin e se as regras foram publicadas.", "erro");
      } finally {
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar alterações';
      }
    });

    usersGrid.appendChild(node);
  });
}

async function carregarUsuarios() {
  setMessage("Carregando usuários...");
  usersGrid.innerHTML = "";

  try {
    const snap = await getDocs(collection(db, "usuarios"));
    usuarios = snap.docs.map((documento) => ({
      id: documento.id,
      ...documento.data()
    })).sort((a, b) => String(a.email || "").localeCompare(String(b.email || "")));

    renderUsuarios();
  } catch (erro) {
    console.error("Erro ao carregar usuários:", erro);
    setMessage("Não consegui carregar usuários. Confira as regras do Firestore e se você é admin.", "erro");
  }
}

function normalizeCommunication(documento, tipo) {
  const dados = documento.data();
  return {
    id: documento.id,
    tipo,
    collectionName: COLLECTION_BY_TYPE[tipo],
    titulo: dados.titulo || dados.title || "Sem título",
    mensagem: dados.mensagem || dados.texto || dados.descricao || "",
    categoria: dados.categoria || dados.tag || (tipo === "anuncio" ? "Anúncio" : "Aviso"),
    importante: dados.importante === true,
    ativo: dados.ativo !== false,
    createdAt: dados.createdAt || dados.criadoEm || dados.data || "",
    criadoPorEmail: dados.criadoPorEmail || ""
  };
}

function renderComunicados() {
  if (!communicationList || !communicationTemplate) return;
  communicationList.innerHTML = "";

  if (!comunicados.length) {
    communicationList.innerHTML = '<p class="empty-communication">Nenhum comunicado publicado ainda.</p>';
    return;
  }

  comunicados.forEach((item) => {
    const node = communicationTemplate.content.cloneNode(true);
    const card = node.querySelector(".communication-card");
    const type = node.querySelector("[data-communication-type]");
    const title = node.querySelector("[data-communication-title]");
    const text = node.querySelector("[data-communication-text]");
    const category = node.querySelector("[data-communication-category]");
    const date = node.querySelector("[data-communication-date]");
    const deleteButton = node.querySelector(".delete-communication");

    card.classList.toggle("important", item.importante);
    card.classList.toggle("inactive", !item.ativo);
    type.textContent = TYPE_LABEL[item.tipo] || "Comunicado";
    title.textContent = item.titulo;
    text.textContent = item.mensagem;
    category.textContent = item.importante ? `${item.categoria} · importante` : item.categoria;
    date.textContent = formatDate(item.createdAt);

    deleteButton.addEventListener("click", async () => {
      const confirmar = confirm(`Excluir este ${TYPE_LABEL[item.tipo]?.toLowerCase() || "comunicado"}?`);
      if (!confirmar) return;

      deleteButton.disabled = true;
      deleteButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

      try {
        await deleteDoc(doc(db, item.collectionName, item.id));
        comunicados = comunicados.filter((comunicado) => !(comunicado.id === item.id && comunicado.collectionName === item.collectionName));
        renderComunicados();
        setCommunicationStatus("Comunicado excluído com sucesso.", "sucesso");
      } catch (erro) {
        console.error("Erro ao excluir comunicado:", erro);
        setCommunicationStatus("Erro ao excluir. Confira se sua conta continua como admin.", "erro");
        deleteButton.disabled = false;
        deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
      }
    });

    communicationList.appendChild(node);
  });
}

async function carregarComunicados() {
  if (!communicationList) return;
  communicationList.innerHTML = '<p class="empty-communication">Carregando comunicados...</p>';

  try {
    const [notificacoesSnap, noticiasSnap] = await Promise.all([
      getDocs(query(collection(db, "notificacoes"), orderBy("createdAt", "desc"), limit(12))),
      getDocs(query(collection(db, "noticias"), orderBy("createdAt", "desc"), limit(12)))
    ]);

    comunicados = [
      ...notificacoesSnap.docs.map((documento) => normalizeCommunication(documento, "notificacao")),
      ...noticiasSnap.docs.map((documento) => normalizeCommunication(documento, "anuncio"))
    ]
      .filter((item) => item.ativo)
      .sort((a, b) => dateMillis(b.createdAt) - dateMillis(a.createdAt));

    renderComunicados();
    setCommunicationStatus(`${comunicados.length} comunicado(s) carregado(s).`, "sucesso");
  } catch (erro) {
    console.error("Erro ao carregar comunicados:", erro);
    communicationList.innerHTML = '<p class="empty-communication erro">Não consegui carregar os comunicados. Confira as regras do Firestore.</p>';
    setCommunicationStatus("Erro ao carregar comunicados. Verifique permissões e internet.", "erro");
  }
}

async function publicarComunicado(event) {
  event.preventDefault();

  const tipo = communicationType?.value || "notificacao";
  const collectionName = COLLECTION_BY_TYPE[tipo];
  const titulo = String(communicationTitle?.value || "").trim();
  const mensagem = String(communicationText?.value || "").trim();
  const categoria = String(communicationCategory?.value || "Aviso").trim();

  if (!collectionName || !titulo || !mensagem) {
    setCommunicationStatus("Preencha tipo, título e mensagem antes de publicar.", "erro");
    return;
  }

  publishCommunication.disabled = true;
  publishCommunication.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publicando...';
  setCommunicationStatus("Enviando comunicado para todos os colaboradores...");

  try {
    const payload = {
      tipo,
      titulo,
      mensagem,
      categoria,
      importante: communicationImportant?.checked === true,
      ativo: true,
      criadoPor: window.usuarioLogado?.uid || "",
      criadoPorEmail: window.usuarioLogado?.email || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await addDoc(collection(db, collectionName), payload);
    communicationForm.reset();
    setCommunicationStatus(`${TYPE_LABEL[tipo]} publicado para todos os colaboradores.`, "sucesso");
    await carregarComunicados();
  } catch (erro) {
    console.error("Erro ao publicar comunicado:", erro);
    setCommunicationStatus("Erro ao publicar. Confira se sua conta é admin e se as regras do Firestore estão publicadas.", "erro");
  } finally {
    publishCommunication.disabled = false;
    publishCommunication.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Publicar para todos';
  }
}

window.addEventListener("usuario-carregado", (event) => {
  if (event.detail?.nivelAcesso === "admin") {
    carregarUsuarios();
    carregarComunicados();
  }
});

if (window.usuarioLogado?.nivelAcesso === "admin") {
  carregarUsuarios();
  carregarComunicados();
}

searchInput.addEventListener("input", renderUsuarios);
refreshUsers.addEventListener("click", carregarUsuarios);
communicationForm?.addEventListener("submit", publicarComunicado);
refreshCommunications?.addEventListener("click", carregarComunicados);
