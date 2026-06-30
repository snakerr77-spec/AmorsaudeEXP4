const STORAGE_KEY = "amorSaudeControladoriaDocsV2";
const LEGACY_STORAGE_KEY = "amorSaudeControladoriaDocs";

const FOLDERS = [
  "Termos de Responsabilidade",
  "Valores de Médicos",
  "Documentos Administrativos",
  "Modelos e Procedimentos",
  "Pendências por Unidade"
];

const DEFAULT_DOCS = [
  {
    id: "doc-termo-atendimento",
    title: "Termo de responsabilidade do atendimento",
    folder: "Termos de Responsabilidade",
    type: "Termo",
    city: "Todas",
    tags: "termo, atendimento, recepção, paciente",
    content: "TERMO DE RESPONSABILIDADE DO ATENDIMENTO\n\nDeclaro que recebi as orientações de atendimento, confirmação de dados, horários e documentos necessários para a realização do procedimento ou consulta.\n\nResponsável pelo atendimento:\nPaciente:\nData:\nAssinatura:",
    note: "Modelo base para adaptar por unidade.",
    updatedAt: new Date().toISOString()
  },
  {
    id: "doc-valores-medicos",
    title: "Tabela de valores médicos",
    folder: "Valores de Médicos",
    type: "Tabela de valores",
    city: "Todas",
    tags: "valores, médicos, consulta, financeiro",
    content: "TABELA DE VALORES MÉDICOS\n\nClínico geral: R$ 00,00\nGinecologia: R$ 00,00\nOftalmologia: R$ 00,00\nReumatologia: R$ 00,00\nFisioterapia: R$ 00,00\n\nObservação: atualizar valores conforme orientação do financeiro.",
    note: "Preencher com os valores aprovados pela gestão.",
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "doc-procedimento-conferencia",
    title: "Procedimento de conferência diária",
    folder: "Modelos e Procedimentos",
    type: "Procedimento",
    city: "Todas",
    tags: "checklist, rotina, controladoria",
    content: "PROCEDIMENTO DE CONFERÊNCIA DIÁRIA\n\n1. Conferir documentos pendentes.\n2. Validar valores lançados.\n3. Revisar termos assinados.\n4. Registrar pendências por cidade.\n5. Enviar resumo para a liderança.",
    note: "Pode virar checklist por colaborador.",
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: "doc-pendencias-cerquilho",
    title: "Pendências da unidade Cerquilho",
    folder: "Pendências por Unidade",
    type: "Checklist",
    city: "Cerquilho",
    tags: "pendências, unidade, controladoria",
    content: "PENDÊNCIAS DA UNIDADE\n\nCidade: Cerquilho\nResponsável:\nData:\n\nPendência 1:\nStatus:\nPrazo:\n\nPendência 2:\nStatus:\nPrazo:",
    note: "Duplicar para criar listas de outras cidades.",
    updatedAt: new Date(Date.now() - 259200000).toISOString()
  }
];

const foldersGrid = document.getElementById("foldersGrid");
const documentsGrid = document.getElementById("documentsGrid");
const docSearch = document.getElementById("docSearch");
const clearSearch = document.getElementById("clearSearch");
const newDocument = document.getElementById("newDocument");
const documentForm = document.getElementById("documentForm");
const duplicateDocument = document.getElementById("duplicateDocument");
const deleteDocument = document.getElementById("deleteDocument");
const cancelEdit = document.getElementById("cancelEdit");
const showAllFolders = document.getElementById("showAllFolders");
const activeFolderLabel = document.getElementById("activeFolderLabel");
const resultCount = document.getElementById("resultCount");
const editorTitle = document.getElementById("editorTitle");
const saveStatus = document.getElementById("saveStatus");
const statDocs = document.getElementById("statDocs");
const statFolders = document.getElementById("statFolders");
const statTerms = document.getElementById("statTerms");
const statValues = document.getElementById("statValues");
const controlCidadeSelect = document.getElementById("controlCidadeSelect");
const editorPanel = document.getElementById("editorPanel");
const viewerPanel = document.getElementById("viewerPanel");
const viewerEmpty = document.getElementById("viewerEmpty");
const viewerContent = document.getElementById("viewerContent");
const viewerFolder = document.getElementById("viewerFolder");
const viewerTitle = document.getElementById("viewerTitle");
const viewerMeta = document.getElementById("viewerMeta");
const viewerText = document.getElementById("viewerText");
const viewerNoteWrap = document.getElementById("viewerNoteWrap");
const viewerNote = document.getElementById("viewerNote");
const closeViewer = document.getElementById("closeViewer");
const closeEditor = document.getElementById("closeEditor");
const controlBackdrop = document.getElementById("controlBackdrop");
const editViewedDocument = document.getElementById("editViewedDocument");
const duplicateViewedDocument = document.getElementById("duplicateViewedDocument");

const viewerAnchor = document.createComment("viewer-panel-anchor");
const editorAnchor = document.createComment("editor-panel-anchor");
if (viewerPanel?.parentNode) viewerPanel.parentNode.insertBefore(viewerAnchor, viewerPanel);
if (editorPanel?.parentNode) editorPanel.parentNode.insertBefore(editorAnchor, editorPanel);

function dockPanel(panel) {
  if (!panel || panel.parentNode === document.body) return;
  document.body.appendChild(panel);
}

function restorePanel(panel, anchor) {
  if (!panel || !anchor?.parentNode || panel.parentNode !== document.body) return;
  anchor.parentNode.insertBefore(panel, anchor.nextSibling);
}

function restoreModalPanels() {
  restorePanel(viewerPanel, viewerAnchor);
  restorePanel(editorPanel, editorAnchor);
}

const fields = {
  id: document.getElementById("docId"),
  title: document.getElementById("docTitle"),
  folder: document.getElementById("docFolder"),
  type: document.getElementById("docType"),
  city: document.getElementById("docCity"),
  tags: document.getElementById("docTags"),
  content: document.getElementById("docContent"),
  note: document.getElementById("docNote")
};

let docs = loadDocs();
let activeFolder = "";
let selectedId = "";
let viewedId = "";

function makeId() {
  return `doc-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadDocs() {
  const sources = [STORAGE_KEY, LEGACY_STORAGE_KEY];

  for (const source of sources) {
    try {
      const stored = JSON.parse(localStorage.getItem(source) || "[]");
      if (Array.isArray(stored) && stored.length) {
        const normalized = stored.map((doc) => ({ city: "Todas", updatedAt: new Date().toISOString(), ...doc }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        return normalized;
      }
    } catch (error) {
      console.warn("Não foi possível ler os documentos salvos.", error);
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DOCS));
  return [...DEFAULT_DOCS];
}

function saveDocs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

function setStatus(text, type = "") {
  saveStatus.textContent = text;
  saveStatus.className = "status-dot" + (type ? ` ${type}` : "");
}

function openModalShell(kind) {
  if (!controlBackdrop) return;

  const activePanel = kind === "editor" ? editorPanel : viewerPanel;
  dockPanel(activePanel);

  document.body.classList.add("control-modal-open");
  controlBackdrop.hidden = false;

  requestAnimationFrame(() => {
    controlBackdrop.classList.add("is-visible");
  });

  viewerPanel.classList.toggle("is-modal-open", kind === "viewer");
  editorPanel.classList.toggle("is-modal-open", kind === "editor");
}

function closeModalShell() {
  document.body.classList.remove("control-modal-open");
  viewerPanel.classList.remove("is-modal-open");
  editorPanel.classList.remove("is-modal-open");

  if (!controlBackdrop) {
    restoreModalPanels();
    return;
  }

  controlBackdrop.classList.remove("is-visible");
  window.setTimeout(() => {
    if (!document.body.classList.contains("control-modal-open")) {
      controlBackdrop.hidden = true;
      restoreModalPanels();
    }
  }, 240);
}

function hasEditorDraft() {
  return Boolean(
    fields.title.value.trim() ||
    fields.tags.value.trim() ||
    fields.content.value.trim() ||
    fields.note.value.trim()
  );
}

function closeEditorPanel() {
  const idToReturn = viewedId || selectedId;
  editorPanel.hidden = true;
  editorPanel.classList.remove("is-modal-open");

  if (idToReturn) {
    openViewer(idToReturn);
    return;
  }

  selectedId = "";
  viewedId = "";
  fillEditor(null);
  closeModalShell();
  showViewerShell(false);
  renderDocuments();
  setStatus("Pronto");
}

function formatDate(iso) {
  if (!iso) return "Sem data";
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return "Sem data";
  }
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function docIcon(type) {
  const normalizedType = normalize(type);
  if (normalizedType.includes("valor")) return "fa-money-check-dollar";
  if (normalizedType.includes("termo")) return "fa-file-signature";
  if (normalizedType.includes("check")) return "fa-list-check";
  if (normalizedType.includes("proced")) return "fa-diagram-project";
  return "fa-file-lines";
}

function getCurrentCity() {
  return window.usuarioLogado?.cidade || localStorage.getItem("amorSaudeCidadeSelecionada") || "Cerquilho";
}

function getFilteredDocs() {
  const term = normalize(docSearch.value);

  return docs.filter((doc) => {
    const matchesFolder = activeFolder ? doc.folder === activeFolder : true;
    const searchable = normalize(`${doc.title} ${doc.folder} ${doc.type} ${doc.city} ${doc.tags} ${doc.content} ${doc.note}`);
    return matchesFolder && searchable.includes(term);
  });
}

function updateStats() {
  const activeFolders = new Set(docs.map((doc) => doc.folder)).size;
  const termDocs = docs.filter((doc) => normalize(doc.type).includes("termo") || normalize(doc.folder).includes("termos")).length;
  const valueDocs = docs.filter((doc) => normalize(doc.type).includes("valor") || normalize(doc.folder).includes("valores")).length;

  statDocs.textContent = docs.length;
  statFolders.textContent = activeFolders;
  statTerms.textContent = termDocs;
  statValues.textContent = valueDocs;
}

function renderFolders() {
  foldersGrid.innerHTML = "";

  FOLDERS.forEach((folder) => {
    const count = docs.filter((doc) => doc.folder === folder).length;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "folder-card" + (activeFolder === folder ? " active" : "");
    card.innerHTML = `
      <span class="folder-icon"><i class="fa-solid fa-folder"></i></span>
      <span>
        <strong>${escapeHTML(folder)}</strong>
        <small>${count} ${count === 1 ? "arquivo" : "arquivos"}</small>
      </span>
    `;
    card.addEventListener("click", () => {
      activeFolder = folder;
      activeFolderLabel.textContent = folder;
      renderAll();
    });
    foldersGrid.appendChild(card);
  });
}

function renderDocuments() {
  const filtered = getFilteredDocs();
  documentsGrid.innerHTML = "";
  resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "item" : "itens"}`;

  if (!filtered.length) {
    documentsGrid.innerHTML = `
      <div class="empty-state">
        <div>
          <i class="fa-regular fa-folder-open"></i>
          <h3>Nada encontrado</h3>
          <p>Troque a pesquisa, escolha outra pasta ou crie um novo documento.</p>
        </div>
      </div>
    `;
    return;
  }

  filtered
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .forEach((doc) => {
      const tags = String(doc.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 3);

      if (doc.city && doc.city !== "Todas") tags.unshift(doc.city);

      const content = String(doc.content || "");
      const card = document.createElement("article");
      card.className = "document-card" + (viewedId === doc.id || selectedId === doc.id ? " active" : "");
      card.innerHTML = `
        <div class="document-top">
          <div class="doc-icon-title">
            <span class="doc-icon"><i class="fa-solid ${docIcon(doc.type)}"></i></span>
            <div>
              <strong>${escapeHTML(doc.title)}</strong>
              <small>${escapeHTML(doc.folder)}<br>Atualizado ${formatDate(doc.updatedAt)}</small>
            </div>
          </div>
          <span class="type-pill">${escapeHTML(doc.type)}</span>
        </div>
        <p>${escapeHTML(content.slice(0, 148))}${content.length > 148 ? "..." : ""}</p>
        <div class="tag-row">${tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("")}</div>
        <div class="document-actions">
          <button class="soft-btn" type="button" data-action="view" data-id="${escapeHTML(doc.id)}"><i class="fa-solid fa-eye"></i> Ver conteúdo</button>
          <button class="primary-btn" type="button" data-action="edit" data-id="${escapeHTML(doc.id)}"><i class="fa-solid fa-pen-to-square"></i> Editar</button>
        </div>
      `;
      card.addEventListener("click", () => openViewer(doc.id));
      documentsGrid.appendChild(card);
    });

  documentsGrid.querySelectorAll("button[data-action]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const id = button.dataset.id;
      if (button.dataset.action === "edit") openEditor(id);
      else openViewer(id);
    });
  });
}

function fillEditor(doc) {
  fields.id.value = doc?.id || "";
  fields.title.value = doc?.title || "";
  fields.folder.value = doc?.folder || "Termos de Responsabilidade";
  fields.type.value = doc?.type || "Documento";
  fields.city.value = doc?.city || getCurrentCity() || "Todas";
  fields.tags.value = doc?.tags || "";
  fields.content.value = doc?.content || "";
  fields.note.value = doc?.note || "";
  editorTitle.textContent = doc?.id ? "Editando documento" : "Novo documento";
  deleteDocument.disabled = !doc?.id;
  duplicateDocument.disabled = !doc?.id;
}

function showViewerShell(showContent = false) {
  editorPanel.hidden = true;
  viewerPanel.hidden = false;
  viewerEmpty.hidden = showContent;
  viewerContent.hidden = !showContent;
}

function openViewer(id) {
  const doc = docs.find((item) => item.id === id);
  if (!doc) return;

  viewedId = id;
  selectedId = "";
  viewerFolder.textContent = doc.folder || "Documento";
  viewerTitle.textContent = doc.title || "Documento";
  viewerMeta.innerHTML = [
    doc.type,
    doc.city || "Todas",
    `Atualizado ${formatDate(doc.updatedAt)}`
  ].filter(Boolean).map((item) => `<span>${escapeHTML(item)}</span>`).join("");
  viewerText.textContent = doc.content || "Sem conteúdo preenchido.";
  viewerNote.textContent = doc.note || "";
  viewerNoteWrap.hidden = !doc.note;
  showViewerShell(true);
  openModalShell("viewer");
  setStatus("Pronto");
  renderDocuments();
}

function closeCurrentViewer() {
  viewedId = "";
  selectedId = "";
  closeModalShell();
  showViewerShell(false);
  renderDocuments();
}

function openEditor(id = "") {
  const doc = id ? docs.find((item) => item.id === id) : null;
  selectedId = id || "";
  viewedId = id || "";
  fillEditor(doc);
  editorPanel.hidden = false;
  viewerPanel.hidden = true;
  openModalShell("editor");
  setStatus(id ? "Editando" : "Novo");
  renderDocuments();
  setTimeout(() => fields.title.focus(), 80);
}

function createNewDocument() {
  openEditor("");
}

function upsertDocument(event) {
  event.preventDefault();
  setStatus("Salvando...", "saving");

  const id = fields.id.value || makeId();
  const payload = {
    id,
    title: fields.title.value.trim(),
    folder: fields.folder.value,
    type: fields.type.value,
    city: fields.city.value,
    tags: fields.tags.value.trim(),
    content: fields.content.value.trim(),
    note: fields.note.value.trim(),
    updatedAt: new Date().toISOString()
  };

  if (!payload.title) {
    setStatus("Informe o nome", "error");
    fields.title.focus();
    return;
  }

  const index = docs.findIndex((item) => item.id === id);
  if (index >= 0) docs[index] = payload;
  else docs.unshift(payload);

  selectedId = "";
  viewedId = id;
  saveDocs();
  renderAll();
  setStatus("Salvo", "saved");
  openViewer(id);
}

function removeDocument() {
  const id = selectedId || viewedId;
  if (!id) return;
  const doc = docs.find((item) => item.id === id);
  const ok = confirm(`Excluir "${doc?.title || "documento"}"?`);
  if (!ok) return;

  docs = docs.filter((item) => item.id !== id);
  selectedId = "";
  viewedId = "";
  saveDocs();
  fillEditor(null);
  showViewerShell(false);
  renderAll();
  setStatus("Excluído", "saved");
}

function duplicateById(id) {
  if (!id) return;
  const doc = docs.find((item) => item.id === id);
  if (!doc) return;

  const copy = {
    ...doc,
    id: makeId(),
    title: `${doc.title} cópia`,
    updatedAt: new Date().toISOString()
  };

  docs.unshift(copy);
  saveDocs();
  renderAll();
  openViewer(copy.id);
  setStatus("Duplicado", "saved");
}

function duplicateCurrentDocument() {
  duplicateById(selectedId || viewedId);
}

function renderAll() {
  renderFolders();
  renderDocuments();
  updateStats();
}

function syncCityInControladoria(cidade) {
  const cidadeFinal = cidade || getCurrentCity();
  if (controlCidadeSelect) controlCidadeSelect.value = cidadeFinal;
  document.querySelectorAll("[data-user-city]").forEach((el) => {
    el.textContent = cidadeFinal;
  });
}

newDocument.addEventListener("click", createNewDocument);
documentForm.addEventListener("submit", upsertDocument);
deleteDocument.addEventListener("click", removeDocument);
duplicateDocument.addEventListener("click", duplicateCurrentDocument);
cancelEdit.addEventListener("click", closeEditorPanel);
closeEditor?.addEventListener("click", closeEditorPanel);
closeViewer.addEventListener("click", closeCurrentViewer);
editViewedDocument.addEventListener("click", () => openEditor(viewedId));
duplicateViewedDocument.addEventListener("click", () => duplicateById(viewedId));

controlBackdrop?.addEventListener("click", () => {
  if (!editorPanel.hidden) {
    const canClose = !hasEditorDraft() || confirm("Fechar o editor sem salvar as alterações?");
    if (canClose) closeEditorPanel();
    return;
  }

  closeCurrentViewer();
});

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !document.body.classList.contains("control-modal-open")) return;

  if (!editorPanel.hidden) {
    const canClose = !hasEditorDraft() || confirm("Fechar o editor sem salvar as alterações?");
    if (canClose) closeEditorPanel();
    return;
  }

  closeCurrentViewer();
});

docSearch.addEventListener("input", renderDocuments);
clearSearch.addEventListener("click", () => {
  docSearch.value = "";
  activeFolder = "";
  activeFolderLabel.textContent = "Todos os arquivos";
  renderAll();
});
showAllFolders.addEventListener("click", () => {
  activeFolder = "";
  activeFolderLabel.textContent = "Todos os arquivos";
  renderAll();
});

controlCidadeSelect?.addEventListener("change", () => {
  localStorage.setItem("amorSaudeCidadeSelecionada", controlCidadeSelect.value);
  syncCityInControladoria(controlCidadeSelect.value);
});

window.addEventListener("usuario-carregado", (event) => {
  syncCityInControladoria(event.detail?.cidade);
});

syncCityInControladoria();
renderAll();
showViewerShell(false);
