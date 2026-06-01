import { db } from "../../js/firebase-config.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const RECORDS_COLLECTION = "prontuariosMedicos";
const CANDIDATES_COLLECTION = "candidatosMedicos";
const DOCTORS_COLLECTION = "medicos";

let selectedPainAreas = [];
let recordsCache = [];
let candidatesCache = [];
let currentUser = window.usuarioLogado || null;
let initialized = false;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const form = $("#medicalRecordForm");
const visitDateInput = $("#medicalVisitDate");
const visitTimeInput = $("#medicalVisitTime");
const painLevelInput = $("#medicalPainLevel");
const painLevelText = $("#medicalPainLevelText");
const painAreasInput = $("#medicalPainAreas");
const selectedPainText = $("#medicalSelectedPainText");
const todayList = $("#medicalTodayList");
const monthList = $("#medicalMonthList");
const todayCount = $("#medicalTodayCount");
const monthCount = $("#medicalMonthCount");
const hiringLinkInput = $("#medicalHiringLink");
const openHiringPage = $("#medicalOpenHiringPage");
const candidateList = $("#medicalCandidateList");
const statusMessage = $("#medicalStatusMessage");

function getLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalTime(date = new Date()) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function getCurrentMonth() {
  return getLocalDate().slice(0, 7);
}

function escapeHTML(value = "") {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateText) {
  if (!dateText) return "Sem data";
  const [year, month, day] = String(dateText).split("-");
  if (!year || !month || !day) return dateText;
  return `${day}/${month}/${year}`;
}

function formatDateTime(value) {
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

function setStatus(message = "", type = "") {
  if (!statusMessage) return;
  statusMessage.textContent = message;
  statusMessage.className = "medical-status-message";
  if (message) statusMessage.classList.add("active");
  if (type) statusMessage.classList.add(type);
}

function role() {
  return currentUser?.nivelAcesso || "colaborador";
}

function canReviewDoctors() {
  return ["admin", "financeiro"].includes(role());
}

function updatePainSummary() {
  if (painAreasInput) painAreasInput.value = selectedPainAreas.join(", ");
  if (!selectedPainText) return;
  selectedPainText.textContent = selectedPainAreas.length
    ? selectedPainAreas.join(" • ")
    : "Nenhum local selecionado.";
}

function clearPainSelection() {
  selectedPainAreas = [];
  $$(".medical-pain-dot.selected").forEach((dot) => dot.classList.remove("selected"));
  updatePainSummary();
}

function collectRecord() {
  const now = new Date();
  return {
    patient: $("#medicalPatientName")?.value.trim() || "",
    birthDate: $("#medicalBirthDate")?.value || "",
    phone: $("#medicalPhone")?.value.trim() || "",
    doctor: $("#medicalDoctor")?.value.trim() || "",
    specialty: $("#medicalSpecialty")?.value || "",
    visitDate: $("#medicalVisitDate")?.value || getLocalDate(now),
    visitTime: $("#medicalVisitTime")?.value || getLocalTime(now),
    painLevel: $("#medicalPainLevel")?.value || "0",
    painType: $("#medicalPainType")?.value || "Não informado",
    symptomStart: $("#medicalSymptomStart")?.value.trim() || "",
    complaint: $("#medicalComplaint")?.value.trim() || "",
    anamnesis: $("#medicalAnamnesis")?.value.trim() || "",
    vitals: $("#medicalVitals")?.value.trim() || "",
    allergies: $("#medicalAllergies")?.value.trim() || "",
    medicines: $("#medicalMedicines")?.value.trim() || "",
    physicalExam: $("#medicalPhysicalExam")?.value.trim() || "",
    diagnosis: $("#medicalDiagnosis")?.value.trim() || "",
    conduct: $("#medicalConduct")?.value.trim() || "",
    requestedTests: $("#medicalRequestedTests")?.value.trim() || "",
    prescription: $("#medicalPrescription")?.value.trim() || "",
    painAreas: [...selectedPainAreas],
    city: currentUser?.cidade || localStorage.getItem("amorSaudeCidadeSelecionada") || "Cerquilho",
    createdBy: currentUser?.uid || "",
    createdByName: currentUser?.nomeCompleto || currentUser?.email || "",
    createdByEmail: currentUser?.email || "",
    createdAtISO: now.toISOString()
  };
}

function recordToHTML(record) {
  const painAreas = Array.isArray(record.painAreas) && record.painAreas.length
    ? record.painAreas.join(", ")
    : "Não informado";

  return `
    <h1>Prontuário Médico</h1>
    <p><strong>Paciente:</strong> ${escapeHTML(record.patient || "Não informado")}</p>
    <p><strong>Nascimento:</strong> ${escapeHTML(formatDate(record.birthDate))}</p>
    <p><strong>Telefone:</strong> ${escapeHTML(record.phone || "Não informado")}</p>
    <p><strong>Médico:</strong> ${escapeHTML(record.doctor || "Não informado")}</p>
    <p><strong>Especialidade:</strong> ${escapeHTML(record.specialty || "Não informado")}</p>
    <p><strong>Atendimento:</strong> ${escapeHTML(formatDate(record.visitDate))} às ${escapeHTML(record.visitTime || "--:--")}</p>
    <p><strong>Dor:</strong> ${escapeHTML(record.painLevel || "0")}/10, ${escapeHTML(record.painType || "Não informado")}</p>
    <p><strong>Locais da dor:</strong> ${escapeHTML(painAreas)}</p>
    <hr>
    <h2>Queixa principal</h2><p>${escapeHTML(record.complaint || "Não informado")}</p>
    <h2>Anamnese</h2><p>${escapeHTML(record.anamnesis || "Não informado")}</p>
    <h2>Sinais vitais</h2><p>${escapeHTML(record.vitals || "Não informado")}</p>
    <h2>Alergias</h2><p>${escapeHTML(record.allergies || "Não informado")}</p>
    <h2>Medicamentos em uso</h2><p>${escapeHTML(record.medicines || "Não informado")}</p>
    <h2>Exame físico</h2><p>${escapeHTML(record.physicalExam || "Não informado")}</p>
    <h2>Hipótese diagnóstica / CID</h2><p>${escapeHTML(record.diagnosis || "Não informado")}</p>
    <h2>Conduta médica</h2><p>${escapeHTML(record.conduct || "Não informado")}</p>
    <h2>Exames solicitados</h2><p>${escapeHTML(record.requestedTests || "Não informado")}</p>
    <h2>Prescrição</h2><p>${escapeHTML(record.prescription || "Não informado")}</p>
    <br><br>
    <p>________________________________________</p>
    <p><strong>Assinatura e carimbo do médico</strong></p>
  `;
}

function printRecord(record) {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    alert("Permita pop-ups para imprimir o prontuário.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Prontuário - ${escapeHTML(record.patient || "Paciente")}</title>
      <style>
        body { font-family: Arial, sans-serif; color: #1e3347; padding: 32px; line-height: 1.55; }
        h1 { color: #2f7f86; margin-bottom: 16px; }
        h2 { color: #2f7f86; font-size: 18px; margin-top: 22px; }
        p { margin: 5px 0; white-space: pre-wrap; }
        hr { border: 0; border-top: 1px solid #d9e6ea; margin: 18px 0; }
      </style>
    </head>
    <body>${recordToHTML(record)}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 250);
}

function renderEmpty(target, message, icon = "fa-regular fa-folder-open") {
  if (!target) return;
  target.innerHTML = `
    <div class="medical-empty-state">
      <i class="${icon}"></i>
      <h4>Nenhum registro por aqui</h4>
      <p>${escapeHTML(message)}</p>
    </div>
  `;
}

function makeRecordCard(record) {
  const card = document.createElement("article");
  card.className = "medical-record-card";
  card.dataset.recordId = record.id || "";

  const painAreas = Array.isArray(record.painAreas) && record.painAreas.length
    ? record.painAreas.join(", ")
    : "Sem local marcado";

  const details = [
    { label: "Nascimento", value: formatDate(record.birthDate) },
    { label: "Telefone", value: record.phone || "Não informado" },
    { label: "Tipo da dor", value: record.painType || "Não informado" },
    { label: "Início dos sintomas", value: record.symptomStart || "Não informado" },
    { label: "Sinais vitais", value: record.vitals || "Não informado" },
    { label: "Alergias", value: record.allergies || "Não informado" },
    { label: "Medicamentos em uso", value: record.medicines || "Não informado" },
    { label: "Locais da dor", value: painAreas },
    { label: "Queixa principal", value: record.complaint || "Não informado", wide: true },
    { label: "Anamnese", value: record.anamnesis || "Não informado", wide: true },
    { label: "Exame físico", value: record.physicalExam || "Não informado", wide: true },
    { label: "Hipótese diagnóstica / CID", value: record.diagnosis || "Não informado", wide: true },
    { label: "Conduta médica", value: record.conduct || "Não informado", wide: true },
    { label: "Exames solicitados", value: record.requestedTests || "Não informado", wide: true },
    { label: "Prescrição", value: record.prescription || "Não informado", wide: true }
  ];

  const detailsHTML = details.map((item) => `
    <div class="medical-record-detail-item${item.wide ? ' wide' : ''}">
      <span>${escapeHTML(item.label)}</span>
      <p>${escapeHTML(item.value)}</p>
    </div>
  `).join("");

  card.innerHTML = `
    <div class="medical-record-summary">
      <div>
        <h4>${escapeHTML(record.patient || "Paciente sem nome")}</h4>
        <p>${escapeHTML(record.specialty || "Especialidade")} com ${escapeHTML(record.doctor || "médico não informado")}</p>
        <small>${escapeHTML(formatDate(record.visitDate))} ${escapeHTML(record.visitTime || "")} • Dor ${escapeHTML(record.painLevel || "0")}/10 • ${escapeHTML(painAreas)}</small>
      </div>
      <div class="medical-record-actions">
        <button type="button" class="expand" data-toggle-record="${escapeHTML(record.id)}" aria-expanded="false">
          <i class="fa-solid fa-chevron-down"></i>
          Ver detalhes
        </button>
        <button type="button" data-print-record="${escapeHTML(record.id)}"><i class="fa-solid fa-print"></i> Imprimir</button>
        <button type="button" class="delete" data-delete-record="${escapeHTML(record.id)}"><i class="fa-solid fa-trash"></i> Excluir</button>
      </div>
    </div>
    <div class="medical-record-details" hidden>
      <div class="medical-record-details-grid">
        ${detailsHTML}
      </div>
    </div>
  `;
  return card;
}

async function loadRecords() {
  const snap = await getDocs(collection(db, RECORDS_COLLECTION));
  recordsCache = snap.docs.map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => String(b.createdAtISO || "").localeCompare(String(a.createdAtISO || "")));
}

function renderRecords() {
  const today = getLocalDate();
  const month = getCurrentMonth();
  const todayRecords = recordsCache.filter((record) => record.visitDate === today);
  const monthRecords = recordsCache.filter((record) => String(record.visitDate || "").startsWith(month));

  if (todayCount) todayCount.textContent = String(todayRecords.length);
  if (monthCount) monthCount.textContent = String(monthRecords.length);

  if (todayRecords.length) {
    todayList.innerHTML = "";
    todayRecords.forEach((record) => todayList.appendChild(makeRecordCard(record)));
  } else {
    renderEmpty(todayList, "Salve um prontuário com a data de hoje para ele aparecer aqui.");
  }

  if (monthRecords.length) {
    monthList.innerHTML = "";
    monthRecords.forEach((record) => monthList.appendChild(makeRecordCard(record)));
  } else {
    renderEmpty(monthList, "Os prontuários do mês atual aparecerão neste painel.");
  }
}

async function refreshRecords(showOk = false) {
  try {
    await loadRecords();
    renderRecords();
    if (showOk) setStatus("Prontuários atualizados pelo banco de dados.", "sucesso");
  } catch (error) {
    console.error("Erro ao carregar prontuários:", error);
    renderEmpty(todayList, "Não foi possível ler os prontuários. Confira as regras do Firestore.");
    renderEmpty(monthList, "Não foi possível ler os prontuários. Confira as regras do Firestore.");
    setStatus("Erro ao carregar prontuários. Publique as regras do Firestore que estão na pasta docs.", "erro");
  }
}

async function deleteRecord(recordId) {
  await deleteDoc(doc(db, RECORDS_COLLECTION, recordId));
  recordsCache = recordsCache.filter((record) => record.id !== recordId);
  renderRecords();
  setStatus("Prontuário excluído do banco de dados.", "sucesso");
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

function makeCandidateCard(candidate) {
  const card = document.createElement("article");
  card.className = "medical-candidate-card";
  const docsLink = candidate.documents
    ? `<a href="${escapeHTML(candidate.documents)}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir documento</a>`
    : "";

  card.innerHTML = `
    <span class="medical-badge-status">${escapeHTML(candidateStatusLabel(candidate.status))}</span>
    <h4>${escapeHTML(candidate.name || "Médico sem nome")}</h4>
    <p>${escapeHTML(candidate.specialty || "Especialidade não informada")} • CRM ${escapeHTML(candidate.crm || "não informado")}</p>
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
    </div>
    <div class="medical-candidate-actions">
      <button type="button" data-candidate-status="${escapeHTML(candidate.id)}" data-status="analisando"><i class="fa-solid fa-magnifying-glass"></i> Analisando</button>
      <button type="button" class="approve" data-approve-candidate="${escapeHTML(candidate.id)}"><i class="fa-solid fa-check"></i> Aprovar</button>
      <button type="button" class="reject" data-candidate-status="${escapeHTML(candidate.id)}" data-status="recusado"><i class="fa-solid fa-xmark"></i> Recusar</button>
      ${docsLink}
    </div>
  `;
  return card;
}

async function loadCandidates() {
  if (!canReviewDoctors()) return;
  const snap = await getDocs(collection(db, CANDIDATES_COLLECTION));
  candidatesCache = snap.docs.map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => String(b.createdAtISO || "").localeCompare(String(a.createdAtISO || "")));
}

function renderCandidates() {
  if (!candidateList || !canReviewDoctors()) return;

  if (!candidatesCache.length) {
    candidateList.innerHTML = `
      <div class="medical-empty-state">
        <i class="fa-solid fa-user-doctor"></i>
        <h4>Nenhum médico cadastrado</h4>
        <p>Quando alguém preencher a ficha pública, aparecerá aqui no banco de dados.</p>
      </div>
    `;
    return;
  }

  candidateList.innerHTML = "";
  candidatesCache.forEach((candidate) => candidateList.appendChild(makeCandidateCard(candidate)));
}

async function refreshCandidates(showOk = false) {
  if (!canReviewDoctors()) return;
  try {
    await loadCandidates();
    renderCandidates();
    if (showOk) setStatus("Lista de médicos cadastrados atualizada.", "sucesso");
  } catch (error) {
    console.error("Erro ao carregar candidatos médicos:", error);
    renderEmpty(candidateList, "Não foi possível carregar os médicos cadastrados. Confira as regras do Firestore.", "fa-solid fa-user-doctor");
    setStatus("Erro ao carregar médicos cadastrados. Publique as regras do Firestore que estão na pasta docs.", "erro");
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

function setupHiringLink() {
  if (!hiringLinkInput) return;
  const link = new URL("../../pages/cadastro-medico.html", window.location.href).href;
  hiringLinkInput.value = link;
  if (openHiringPage) openHiringPage.href = link;
}

function activateMedicalTab(panelName) {
  const targetTab = $(`[data-medical-tab="${panelName}"]`);
  const targetPanel = $(`[data-medical-panel="${panelName}"]`);
  if (!targetTab || !targetPanel || targetTab.hidden || targetPanel.hidden) return;

  $$("[data-medical-tab]").forEach((item) => item.classList.toggle("active", item === targetTab));
  $$("[data-medical-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel === targetPanel);
  });
}

function setupTabs() {
  $$("[data-medical-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      activateMedicalTab(tab.dataset.medicalTab);
      refreshRecords(false);
    });
  });

}

function setupFormControls() {
  $$(".medical-pain-dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      const pain = dot.dataset.pain;
      dot.classList.toggle("selected");
      if (dot.classList.contains("selected")) {
        if (!selectedPainAreas.includes(pain)) selectedPainAreas.push(pain);
      } else {
        selectedPainAreas = selectedPainAreas.filter((item) => item !== pain);
      }
      updatePainSummary();
    });
  });

  painLevelInput?.addEventListener("input", () => {
    if (painLevelText) painLevelText.textContent = painLevelInput.value;
  });

  $("#medicalClearPain")?.addEventListener("click", clearPainSelection);

  $("#medicalClearForm")?.addEventListener("click", () => {
    form.reset();
    if (visitDateInput) visitDateInput.value = getLocalDate();
    if (visitTimeInput) visitTimeInput.value = getLocalTime();
    if (painLevelInput) painLevelInput.value = "0";
    if (painLevelText) painLevelText.textContent = "0";
    clearPainSelection();
  });

  $("#medicalPrintCurrent")?.addEventListener("click", () => {
    const record = collectRecord();
    printRecord(record);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const record = collectRecord();

    if (!record.patient || !record.doctor) {
      alert("Preencha pelo menos o nome do paciente e o médico responsável.");
      return;
    }

    try {
      setStatus("Salvando prontuário no banco de dados...");
      const docRef = await addDoc(collection(db, RECORDS_COLLECTION), {
        ...record,
        createdAt: serverTimestamp()
      });
      recordsCache.unshift({ id: docRef.id, ...record });
      renderRecords();
      setStatus("Prontuário salvo no banco de dados com sucesso.", "sucesso");
    } catch (error) {
      console.error("Erro ao salvar prontuário:", error);
      setStatus("Erro ao salvar prontuário. Confira as regras do Firestore em docs/REGRAS-FIRESTORE.txt.", "erro");
    }
  });
}

function setupDelegatedActions() {
  document.addEventListener("click", async (event) => {
    const toggleButton = event.target.closest("[data-toggle-record]");
    const printButton = event.target.closest("[data-print-record]");
    const deleteButton = event.target.closest("[data-delete-record]");

    try {
      if (toggleButton) {
        const card = toggleButton.closest(".medical-record-card");
        const details = card?.querySelector(".medical-record-details");
        const icon = toggleButton.querySelector("i");
        const isExpanded = toggleButton.getAttribute("aria-expanded") === "true";
        const nextState = !isExpanded;

        if (details) details.hidden = !nextState;
        toggleButton.setAttribute("aria-expanded", String(nextState));
        toggleButton.classList.toggle("active", nextState);
        toggleButton.innerHTML = `<i class="fa-solid ${nextState ? 'fa-chevron-up' : 'fa-chevron-down'}"></i> ${nextState ? 'Ocultar detalhes' : 'Ver detalhes'}`;
        return;
      }

      if (printButton) {
        const record = recordsCache.find((item) => item.id === printButton.dataset.printRecord);
        if (record) printRecord(record);
      }

      if (deleteButton) {
        const recordId = deleteButton.dataset.deleteRecord;
        if (confirm("Excluir este prontuário do banco de dados?")) await deleteRecord(recordId);
      }
    } catch (error) {
      console.error("Erro na ação médica:", error);
      setStatus("Não consegui concluir a ação. Confira as permissões do Firestore.", "erro");
    }
  });

  $$("[data-medical-refresh]").forEach((button) => {
    button.addEventListener("click", () => refreshRecords(true));
  });
}

async function initMedicalArea(user) {
  if (initialized || !form) return;
  initialized = true;
  currentUser = user || window.usuarioLogado || currentUser;

  if (visitDateInput && !visitDateInput.value) visitDateInput.value = getLocalDate();
  if (visitTimeInput && !visitTimeInput.value) visitTimeInput.value = getLocalTime();

  setupTabs();
  setupFormControls();
  setupDelegatedActions();
  updatePainSummary();


  await refreshRecords(false);
}

window.addEventListener("usuario-carregado", (event) => {
  initMedicalArea(event.detail);
});

if (window.usuarioLogado) {
  initMedicalArea(window.usuarioLogado);
}
