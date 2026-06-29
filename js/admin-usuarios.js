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
const COLLECTION_BY_TYPE = { notificacao: "notificacoes", anuncio: "noticias" };
const TYPE_LABEL = { notificacao: "Notificação", anuncio: "Anúncio" };

function normalizarNivelAcessoAdmin(nivel) {
  const valor = String(nivel || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

  const aliases = {
    administrador: "admin", administradora: "admin", adm: "admin", master: "admin",
    financeiro: "financeiro", financa: "financeiro", financas: "financeiro",
    gerencia: "gerencia", gerente: "gerencia", gerencial: "gerencia",
    cdt: "cdt", recepcao: "recepcao", recepcionista: "recepcao",
    medico: "medico", medica: "medico", colaborador: "colaborador", colaboradora: "colaborador"
  };

  const normalizado = aliases[valor] || valor;
  return NIVEIS_ACESSO_ADMIN.includes(normalizado) ? normalizado : "colaborador";
}

function normalizarCidadeAdmin(cidade) {
  const valor = String(cidade || "").trim();
  if (valor === "Tatuí") return "Tatui";
  return CIDADES_AMOR_SAUDE.includes(valor) ? valor : "Cerquilho";
}

function getAPI() {
  if (!window.AmorSaudeAPI?.apiFetch) {
    throw new Error("API Cloudflare ainda não carregou. Recarregue a página.");
  }
  return window.AmorSaudeAPI;
}

function setMessage(texto, tipo = "") {
  if (!adminMessage) return;
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
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
  } catch { return "--"; }
}

function dateMillis(value) {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function atualizarStats(lista) {
  const total = lista.length;
  const ativos = lista.filter((u) => u.ativo === true || u.ativo === 1 || u.ativo === "1").length;
  if (statTotal) statTotal.textContent = total;
  if (statAtivos) statAtivos.textContent = ativos;
  if (statBloqueados) statBloqueados.textContent = total - ativos;
}

function renderUsuarios() {
  if (!usersGrid || !template) return;
  const termo = (searchInput?.value || "").toLowerCase().trim();
  const filtrados = usuarios.filter((usuario) => {
    const texto = `${usuario.nomeCompleto || usuario.nome || ""} ${usuario.email || ""} ${usuario.cidade || ""} ${usuario.nivelAcesso || usuario.nivel_acesso || ""}`.toLowerCase();
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
    name.textContent = usuario.nomeCompleto || usuario.nome || "Sem nome";
    email.textContent = usuario.email || "Sem e-mail";
    active.value = usuario.ativo === false || usuario.ativo === 0 || usuario.ativo === "0" ? "false" : "true";
    role.value = normalizarNivelAcessoAdmin(usuario.nivelAcesso || usuario.nivel_acesso);
    city.value = normalizarCidadeAdmin(usuario.cidade);
    created.textContent = "Cadastro: " + formatDate(usuario.createdAt || usuario.criado_em);
    lastLogin.textContent = "Último login: " + formatDate(usuario.ultimoLogin);

    saveButton.addEventListener("click", async () => {
      saveButton.disabled = true;
      saveButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

      try {
        const resposta = await getAPI().atualizar("usuarios", usuario.id || usuario.email, {
          ativo: active.value === "true",
          nivelAcesso: normalizarNivelAcessoAdmin(role.value),
          nivel_acesso: normalizarNivelAcessoAdmin(role.value),
          cidade: normalizarCidadeAdmin(city.value)
        });
        Object.assign(usuario, resposta.usuario || resposta.dado || {});
        setMessage(`Usuário ${usuario.email || usuario.id} atualizado no D1.`, "sucesso");
      } catch (erro) {
        console.error("Erro ao salvar usuário:", erro);
        setMessage(erro.message || "Erro ao salvar no banco D1.", "erro");
      } finally {
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar alterações';
      }
    });

    usersGrid.appendChild(node);
  });
}

async function carregarUsuarios() {
  setMessage("Carregando usuários do D1...");
  if (usersGrid) usersGrid.innerHTML = "";

  try {
    const resposta = await getAPI().listar("usuarios");
    usuarios = (resposta.dados || resposta.items || []).sort((a, b) => String(a.email || "").localeCompare(String(b.email || "")));
    renderUsuarios();
  } catch (erro) {
    console.error("Erro ao carregar usuários:", erro);
    setMessage(erro.message || "Não consegui carregar usuários do D1.", "erro");
  }
}

function normalizeCommunication(item = {}, tipo) {
  return {
    id: item.id,
    tipo,
    collectionName: COLLECTION_BY_TYPE[tipo],
    titulo: item.titulo || item.title || "Sem título",
    mensagem: item.mensagem || item.texto || item.descricao || "",
    categoria: item.categoria || item.tag || (tipo === "anuncio" ? "Anúncio" : "Aviso"),
    importante: item.importante === true || item.importante === 1 || item.importante === "1",
    ativo: item.ativo !== false && item.ativo !== 0 && item.ativo !== "0",
    createdAt: item.createdAt || item.criadoEm || item.data || item.criado_em || "",
    criadoPorEmail: item.criadoPorEmail || ""
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
      if (!confirm(`Excluir este ${TYPE_LABEL[item.tipo]?.toLowerCase() || "comunicado"}?`)) return;
      deleteButton.disabled = true;
      deleteButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

      try {
        await getAPI().excluir(item.collectionName, item.id);
        comunicados = comunicados.filter((comunicado) => !(comunicado.id === item.id && comunicado.collectionName === item.collectionName));
        renderComunicados();
        setCommunicationStatus("Comunicado excluído do D1 com sucesso.", "sucesso");
      } catch (erro) {
        console.error("Erro ao excluir comunicado:", erro);
        setCommunicationStatus(erro.message || "Erro ao excluir comunicado.", "erro");
        deleteButton.disabled = false;
        deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
      }
    });

    communicationList.appendChild(node);
  });
}

async function carregarComunicados() {
  if (!communicationList) return;
  communicationList.innerHTML = '<p class="empty-communication">Carregando comunicados do D1...</p>';

  try {
    const [notificacoesResp, noticiasResp] = await Promise.all([
      getAPI().listar("notificacoes"),
      getAPI().listar("noticias")
    ]);

    comunicados = [
      ...(notificacoesResp.dados || notificacoesResp.items || []).map((item) => normalizeCommunication(item, "notificacao")),
      ...(noticiasResp.dados || noticiasResp.items || []).map((item) => normalizeCommunication(item, "anuncio"))
    ].filter((item) => item.ativo).sort((a, b) => dateMillis(b.createdAt) - dateMillis(a.createdAt)).slice(0, 24);

    renderComunicados();
    setCommunicationStatus(`${comunicados.length} comunicado(s) carregado(s).`, "sucesso");
  } catch (erro) {
    console.error("Erro ao carregar comunicados:", erro);
    communicationList.innerHTML = '<p class="empty-communication erro">Não consegui carregar os comunicados do D1.</p>';
    setCommunicationStatus(erro.message || "Erro ao carregar comunicados.", "erro");
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
  setCommunicationStatus("Enviando comunicado para o D1...");

  try {
    const payload = {
      tipo,
      titulo,
      mensagem,
      categoria,
      importante: communicationImportant?.checked === true,
      ativo: true,
      criadoPor: window.usuarioLogado?.uid || window.usuarioLogado?.id || "",
      criadoPorEmail: window.usuarioLogado?.email || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await getAPI().criar(collectionName, payload);
    communicationForm.reset();
    setCommunicationStatus(`${TYPE_LABEL[tipo]} publicado para todos os colaboradores.`, "sucesso");
    await carregarComunicados();
  } catch (erro) {
    console.error("Erro ao publicar comunicado:", erro);
    setCommunicationStatus(erro.message || "Erro ao publicar no D1.", "erro");
  } finally {
    publishCommunication.disabled = false;
    publishCommunication.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Publicar para todos';
  }
}

function inicializarAdmin() {
  carregarUsuarios();
  carregarComunicados();
}

window.addEventListener("usuario-carregado", inicializarAdmin);
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(inicializarAdmin, 450));
else setTimeout(inicializarAdmin, 450);

searchInput?.addEventListener("input", renderUsuarios);
refreshUsers?.addEventListener("click", carregarUsuarios);
communicationForm?.addEventListener("submit", publicarComunicado);
refreshCommunications?.addEventListener("click", carregarComunicados);
