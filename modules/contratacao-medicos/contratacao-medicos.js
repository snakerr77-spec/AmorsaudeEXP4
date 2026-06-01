import { db } from "../../js/firebase-config.js";
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CANDIDATES_COLLECTION = "candidatosMedicos";
const DOCTORS_COLLECTION = "medicos";

let currentUser = window.usuarioLogado || null;
let candidatesCache = [];
let searchTerm = "";
let initialized = false;

const $ = (selector) => document.querySelector(selector);

const statusMessage = $("#hiringStatusMessage");
const publicLinkInput = $("#hiringPublicLink");
const copyPublicLink = $("#copyHiringPublicLink");
const openPublicPage = $("#openHiringPublicPage");
const refreshButton = $("#refreshCandidates");
const candidateList = $("#candidateList");
const candidateSearch = $("#candidateSearch");
const totalCount = $("#candidateTotalCount");
const newCount = $("#candidateNewCount");
const approvedCount = $("#candidateApprovedCount");

function escapeHTML(value = "") {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setStatus(message, type = "") {
  if (!statusMessage) return;
  statusMessage.textContent = message;
  statusMessage.className = "hiring-status active" + (type ? ` ${type}` : "");
}

function formatDateTime(value) {
  if (!value) return "--";
  try {
    const date = value.toDate ? value.toDate() : new Date(value);
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short"
    }).format(date);
  } catch (error) {
    return String(value);
  }
}

function candidateStatusLabel(status = "novo") {
  const labels = {
    novo: "Novo cadastro",
    analisando: "Em análise",
    aprovado: "Aprovado",
    recusado: "Recusado"
  };
  return labels[status] || status;
}

function setupPublicLink() {
  const link = new URL("../../pages/cadastro-medico.html", window.location.href).href;
  if (publicLinkInput) publicLinkInput.value = link;
  if (openPublicPage) openPublicPage.href = link;
}

async function copyLink() {
  const value = publicLinkInput?.value || "";
  try {
    await navigator.clipboard.writeText(value);
    setStatus("Link de cadastro médico copiado.", "sucesso");
  } catch (error) {
    publicLinkInput?.select();
    document.execCommand("copy");
    setStatus("Link de cadastro médico copiado.", "sucesso");
  }
}

function candidateMatches(candidate) {
  if (!searchTerm) return true;
  const haystack = [
    candidate.name,
    candidate.crm,
    candidate.email,
    candidate.phone,
    candidate.city,
    candidate.specialty,
    candidate.status
  ].join(" ").toLowerCase();
  return haystack.includes(searchTerm);
}

function updateStats() {
  if (totalCount) totalCount.textContent = String(candidatesCache.length);
  if (newCount) newCount.textContent = String(candidatesCache.filter((item) => (item.status || "novo") === "novo").length);
  if (approvedCount) approvedCount.textContent = String(candidatesCache.filter((item) => item.status === "aprovado").length);
}

function makeCandidateCard(candidate) {
  const card = document.createElement("article");
  card.className = "candidate-card";

  const docsLink = candidate.documents
    ? `<a href="${escapeHTML(candidate.documents)}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir documento</a>`
    : "";

  card.innerHTML = `
    <div class="candidate-top">
      <div>
        <h3>${escapeHTML(candidate.name || "Médico sem nome")}</h3>
        <p>${escapeHTML(candidate.specialty || "Especialidade não informada")} • CRM ${escapeHTML(candidate.crm || "não informado")}</p>
      </div>
      <span class="candidate-status">${escapeHTML(candidateStatusLabel(candidate.status))}</span>
    </div>

    <div class="candidate-meta">
      <small><strong>Cidade:</strong> ${escapeHTML(candidate.city || "Não informada")}</small>
      <small><strong>E-mail:</strong> ${escapeHTML(candidate.email || "Não informado")}</small>
      <small><strong>Telefone:</strong> ${escapeHTML(candidate.phone || "Não informado")}</small>
      <small><strong>Enviado:</strong> ${escapeHTML(formatDateTime(candidate.createdAt || candidate.createdAtISO))}</small>
    </div>

    <div class="candidate-extra">
      <small><strong>Disponibilidade:</strong> ${escapeHTML(candidate.availability || "Não informada")}</small>
      <small><strong>Valor/Formato:</strong> ${escapeHTML(candidate.payment || "Não informado")}</small>
      <small><strong>Experiência:</strong> ${escapeHTML(candidate.experience || "Não informada")}</small>
      <small><strong>Status atual:</strong> ${escapeHTML(candidateStatusLabel(candidate.status))}</small>
    </div>

    <div class="candidate-actions">
      <button type="button" data-candidate-status="${escapeHTML(candidate.id)}" data-status="analisando"><i class="fa-solid fa-magnifying-glass"></i> Analisando</button>
      <button type="button" class="approve" data-approve-candidate="${escapeHTML(candidate.id)}"><i class="fa-solid fa-check"></i> Aprovar</button>
      <button type="button" class="reject" data-candidate-status="${escapeHTML(candidate.id)}" data-status="recusado"><i class="fa-solid fa-xmark"></i> Recusar</button>
      ${docsLink}
    </div>
  `;
  return card;
}

function renderCandidates() {
  if (!candidateList) return;
  updateStats();

  const filtered = candidatesCache.filter(candidateMatches);

  if (!filtered.length) {
    candidateList.innerHTML = `
      <div class="empty-candidates">
        <i class="fa-solid fa-user-doctor"></i>
        <h3>Nenhum médico encontrado</h3>
        <p>Quando alguém preencher a ficha pública, o cadastro aparecerá aqui.</p>
      </div>
    `;
    return;
  }

  candidateList.innerHTML = "";
  filtered.forEach((candidate) => candidateList.appendChild(makeCandidateCard(candidate)));
}

async function loadCandidates(showOk = false) {
  try {
    const snap = await getDocs(collection(db, CANDIDATES_COLLECTION));
    candidatesCache = snap.docs.map((item) => ({ id: item.id, ...item.data() }))
      .sort((a, b) => String(b.createdAtISO || "").localeCompare(String(a.createdAtISO || "")));
    renderCandidates();
    if (showOk) setStatus("Lista de médicos cadastrados atualizada.", "sucesso");
  } catch (error) {
    console.error("Erro ao carregar candidatos médicos:", error);
    if (candidateList) {
      candidateList.innerHTML = `
        <div class="empty-candidates">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <h3>Não foi possível carregar</h3>
          <p>Confira se as regras do Firestore foram publicadas corretamente.</p>
        </div>
      `;
    }
    setStatus("Erro ao carregar médicos cadastrados. Confira as regras do Firestore.", "erro");
  }
}

async function updateCandidateStatus(candidateId, status) {
  await updateDoc(doc(db, CANDIDATES_COLLECTION, candidateId), {
    status,
    updatedAt: serverTimestamp(),
    updatedAtISO: new Date().toISOString(),
    updatedBy: currentUser?.uid || ""
  });

  const candidate = candidatesCache.find((item) => item.id === candidateId);
  if (candidate) candidate.status = status;
  renderCandidates();
  setStatus(`Cadastro marcado como ${candidateStatusLabel(status).toLowerCase()}.`, "sucesso");
}

async function approveCandidate(candidateId) {
  const candidate = candidatesCache.find((item) => item.id === candidateId);
  if (!candidate) return;

  await setDoc(doc(db, DOCTORS_COLLECTION, candidateId), {
    nome: candidate.name || "",
    especialidade: candidate.specialty || "",
    crm: candidate.crm || "",
    email: candidate.email || "",
    telefone: candidate.phone || "",
    cidade: candidate.city || "",
    unidade: candidate.city || "",
    disponibilidade: candidate.availability || "",
    valorFormato: candidate.payment || "",
    documentos: candidate.documents || "",
    experiencia: candidate.experience || "",
    status: "Atendendo",
    origem: "cadastro-medico",
    candidatoId: candidateId,
    aprovadoPor: currentUser?.uid || "",
    aprovadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp()
  }, { merge: true });

  await updateCandidateStatus(candidateId, "aprovado");
  setStatus("Médico aprovado e salvo na coleção medicos do banco de dados.", "sucesso");
}

function setupEvents() {
  copyPublicLink?.addEventListener("click", copyLink);
  refreshButton?.addEventListener("click", () => loadCandidates(true));

  candidateSearch?.addEventListener("input", () => {
    searchTerm = candidateSearch.value.trim().toLowerCase();
    renderCandidates();
  });

  document.addEventListener("click", async (event) => {
    const statusButton = event.target.closest("[data-candidate-status]");
    const approveButton = event.target.closest("[data-approve-candidate]");

    try {
      if (statusButton) {
        await updateCandidateStatus(statusButton.dataset.candidateStatus, statusButton.dataset.status);
      }

      if (approveButton) {
        await approveCandidate(approveButton.dataset.approveCandidate);
      }
    } catch (error) {
      console.error("Erro na ação de contratação médica:", error);
      setStatus("Não foi possível concluir a ação. Confira as permissões do Firestore.", "erro");
    }
  });
}

async function init(user) {
  if (initialized) return;
  initialized = true;
  currentUser = user || window.usuarioLogado || currentUser;
  setupPublicLink();
  setupEvents();
  await loadCandidates(false);
}

window.addEventListener("usuario-carregado", (event) => init(event.detail));

if (window.usuarioLogado) {
  init(window.usuarioLogado);
}
