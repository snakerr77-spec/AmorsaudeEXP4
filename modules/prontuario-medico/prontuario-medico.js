const RECORDS_COLLECTION = "prontuariosMedicos";

let selectedPainAreas = [];
let recordsCache = [];
let currentUser = window.usuarioLogado || getUserFromStorage();
let initialized = false;
let loadingRecords = false;

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
const statusMessage = $("#medicalStatusMessage");
const logoutButton = $("#medicalLogoutButton");

function getUserFromStorage() {
  const possibleKeys = [
    "usuarioLogado",
    "lagUsuarioLogado",
    "lagUser",
    "currentUser",
    "authUser"
  ];

  for (const key of possibleKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // localStorage pode guardar texto simples em alguns projetos. Ignora e tenta a próxima chave.
    }
  }

  return null;
}

function normalizeRole(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getCurrentRole() {
  const rawRole = currentUser?.nivelAcesso
    || currentUser?.role
    || currentUser?.perfil
    || currentUser?.tipo
    || currentUser?.cargo
    || "colaborador";

  return normalizeRole(rawRole);
}

function canDeleteRecords() {
  return ["admin", "financeiro"].includes(getCurrentRole());
}

function isDoctorEmailOnly() {
  const email = String(currentUser?.email || "").trim().toLowerCase();
  return /^(dra?\.|dra|dr)\s*[a-z0-9._%+-]+@/.test(email);
}

const DOCTOR_PRESETS_BY_EMAIL = {
  "dra.larissajunquira@lag.com": {
    doctor: "Dra. Larissa Junqueira Alk",
    specialty: "Dermatologista"
  }
};

function getDoctorPresetFromLogin() {
  const emailOriginal = String(currentUser?.email || "").trim();
  const email = emailOriginal.toLowerCase();

  if (DOCTOR_PRESETS_BY_EMAIL[email]) return DOCTOR_PRESETS_BY_EMAIL[email];
  if (!isDoctorEmailOnly()) return null;

  const storedName = currentUser?.nomeCompleto
    || currentUser?.nome_completo
    || currentUser?.name
    || currentUser?.nome
    || "";

  if (storedName) {
    const hasTitle = /^dr(a)?\.?\s/i.test(storedName);
    const title = email.startsWith("dra") ? "Dra." : "Dr.";
    return {
      doctor: hasTitle ? storedName : `${title} ${storedName}`,
      specialty: currentUser?.especialidade || currentUser?.setor || ""
    };
  }

  const localPart = emailOriginal.split("@")[0] || "";
  const title = email.startsWith("dra") ? "Dra." : "Dr.";
  const cleanedName = localPart
    .replace(/^dra?\.?/i, "")
    .replace(/([a-záéíóúãõç])([A-ZÁÉÍÓÚÃÕÇ])/g, "$1 $2")
    .replace(/[._-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return {
    doctor: cleanedName ? `${title} ${cleanedName}` : title,
    specialty: currentUser?.especialidade || currentUser?.setor || ""
  };
}

function applyDoctorResponsibleDefaults(force = false) {
  const preset = getDoctorPresetFromLogin();
  const doctorInput = $("#medicalDoctor");
  const specialtyInput = $("#medicalSpecialty");

  if (!preset || !doctorInput) return;

  if (force || !doctorInput.value.trim()) {
    doctorInput.value = preset.doctor;
  }

  doctorInput.readOnly = true;
  doctorInput.classList.add("medical-doctor-autofilled");
  doctorInput.title = "Preenchido automaticamente pelo login do médico.";

  if (specialtyInput && preset.specialty) {
    const desired = String(preset.specialty).trim().toLowerCase();
    const option = Array.from(specialtyInput.options).find((item) => {
      return String(item.value || item.textContent).trim().toLowerCase() === desired;
    });

    if (option) specialtyInput.value = option.value;
  }
}

function canViewRecordLists() {
  return !isDoctorEmailOnly();
}

function applyDoctorEmailRestrictions() {
  const locked = isDoctorEmailOnly();
  document.body.classList.toggle("medical-doctor-prontuario-only", locked);

  $$('[data-medical-tab="dia"], [data-medical-tab="mes"], [data-medical-panel="dia"], [data-medical-panel="mes"]').forEach((item) => {
    item.hidden = locked;
    item.setAttribute("aria-hidden", String(locked));
  });

  if (locked) {
    activateMedicalTab("prontuario");
  }
}


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

function setStatus(message = "", type = "") {
  if (!statusMessage) return;
  statusMessage.textContent = message;
  statusMessage.className = "medical-status-message";
  if (message) statusMessage.classList.add("active");
  if (type) statusMessage.classList.add(type);
}

function getUserCity() {
  return currentUser?.cidade
    || currentUser?.unidade
    || localStorage.getItem("lagCidadeSelecionada")
    || localStorage.getItem("amorSaudeCidadeSelecionada")
    || "Cerquilho";
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

function resetForm() {
  if (!form) return;

  form.reset();
  if (visitDateInput) visitDateInput.value = getLocalDate();
  if (visitTimeInput) visitTimeInput.value = getLocalTime();
  if (painLevelInput) painLevelInput.value = "0";
  if (painLevelText) painLevelText.textContent = "0";
  clearPainSelection();
  applyDoctorResponsibleDefaults(true);
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
    city: getUserCity(),
    createdBy: currentUser?.uid || currentUser?.id || "",
    createdByName: currentUser?.nomeCompleto || currentUser?.name || currentUser?.email || "",
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
      <i class="${escapeHTML(icon)}"></i>
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
    <div class="medical-record-detail-item${item.wide ? " wide" : ""}">
      <span>${escapeHTML(item.label)}</span>
      <p>${escapeHTML(item.value)}</p>
    </div>
  `).join("");

  const deleteButtonHTML = canDeleteRecords()
    ? `<button type="button" class="delete" data-delete-record="${escapeHTML(record.id)}"><i class="fa-solid fa-trash"></i> Excluir</button>`
    : "";

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
        ${deleteButtonHTML}
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
  if (!window.AmorSaudeAPI?.listar) throw new Error("API Cloudflare não carregada.");
  const resposta = await window.AmorSaudeAPI.listar(RECORDS_COLLECTION);

  recordsCache = (resposta.dados || resposta.items || [])
    .sort((a, b) => String(b.createdAtISO || b.createdAt || "").localeCompare(String(a.createdAtISO || a.createdAt || "")));
}

function renderRecords() {
  if (!canViewRecordLists()) {
    if (todayCount) todayCount.textContent = "0";
    if (monthCount) monthCount.textContent = "0";
    return;
  }

  const today = getLocalDate();
  const month = getCurrentMonth();
  const todayRecords = recordsCache.filter((record) => record.visitDate === today);
  const monthRecords = recordsCache.filter((record) => String(record.visitDate || "").startsWith(month));

  if (todayCount) todayCount.textContent = String(todayRecords.length);
  if (monthCount) monthCount.textContent = String(monthRecords.length);

  if (todayRecords.length) {
    if (todayList) {
      todayList.innerHTML = "";
      todayRecords.forEach((record) => todayList.appendChild(makeRecordCard(record)));
    }
  } else {
    renderEmpty(todayList, "Salve um prontuário com a data de hoje para ele aparecer aqui.");
  }

  if (monthRecords.length) {
    if (monthList) {
      monthList.innerHTML = "";
      monthRecords.forEach((record) => monthList.appendChild(makeRecordCard(record)));
    }
  } else {
    renderEmpty(monthList, "Os prontuários do mês atual aparecerão neste painel.");
  }
}

async function refreshRecords(showOk = false) {
  if (!canViewRecordLists()) {
    recordsCache = [];
    renderRecords();
    return;
  }

  if (loadingRecords) return;
  loadingRecords = true;

  try {
    await loadRecords();
    renderRecords();
    if (showOk) setStatus("Prontuários atualizados pelo banco de dados.", "sucesso");
  } catch (error) {
    console.error("Erro ao carregar prontuários:", error);
    renderEmpty(todayList, "Não foi possível ler os prontuários. Confira o binding DB no Cloudflare.");
    renderEmpty(monthList, "Não foi possível ler os prontuários. Confira o binding DB no Cloudflare.");
    setStatus(error.message || "Erro ao carregar prontuários do D1.", "erro");
  } finally {
    loadingRecords = false;
  }
}

async function deleteRecord(recordId) {
  if (!recordId) return;

  if (!canDeleteRecords()) {
    setStatus("Seu perfil não tem permissão para excluir prontuários.", "erro");
    return;
  }

  await window.AmorSaudeAPI.excluir(RECORDS_COLLECTION, recordId);
  recordsCache = recordsCache.filter((record) => record.id !== recordId);
  renderRecords();
  setStatus("Prontuário excluído do D1.", "sucesso");
}

function activateMedicalTab(panelName) {
  const targetTab = $(`[data-medical-tab="${panelName}"]`);
  const targetPanel = $(`[data-medical-panel="${panelName}"]`);

  if (!targetTab || !targetPanel || targetTab.hidden || targetPanel.hidden) return;

  $$("[data-medical-tab]").forEach((item) => {
    const active = item === targetTab;
    item.classList.toggle("active", active);
    item.setAttribute("aria-selected", String(active));
  });

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
      if (!pain) return;

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
  $("#medicalClearForm")?.addEventListener("click", resetForm);

  $("#medicalPrintCurrent")?.addEventListener("click", () => {
    const record = collectRecord();
    printRecord(record);
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const record = collectRecord();

    if (!record.patient || !record.doctor) {
      setStatus("Preencha pelo menos o nome do paciente e o médico responsável.", "erro");
      return;
    }

    try {
      setStatus("Salvando prontuário no banco de dados...");
      const resposta = await window.AmorSaudeAPI.criar(RECORDS_COLLECTION, {
        ...record,
        createdAt: new Date().toISOString()
      });

      recordsCache.unshift({ id: resposta.id || resposta.dado?.id, ...record });
      renderRecords();
      resetForm();
      setStatus("", "");
    } catch (error) {
      console.error("Erro ao salvar prontuário:", error);
      setStatus(error.message || "Erro ao salvar prontuário no D1. Confira login e binding DB.", "erro");
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
        const isExpanded = toggleButton.getAttribute("aria-expanded") === "true";
        const nextState = !isExpanded;

        if (details) details.hidden = !nextState;
        toggleButton.setAttribute("aria-expanded", String(nextState));
        toggleButton.classList.toggle("active", nextState);
        toggleButton.innerHTML = `<i class="fa-solid ${nextState ? "fa-chevron-up" : "fa-chevron-down"}"></i> ${nextState ? "Ocultar detalhes" : "Ver detalhes"}`;
        return;
      }

      if (printButton) {
        const record = recordsCache.find((item) => item.id === printButton.dataset.printRecord);
        if (record) printRecord(record);
        return;
      }

      if (deleteButton) {
        const recordId = deleteButton.dataset.deleteRecord;
        const ok = confirm("Excluir este prontuário do banco de dados?");
        if (ok) await deleteRecord(recordId);
      }
    } catch (error) {
      console.error("Erro na ação médica:", error);
      setStatus(error.message || "Não consegui concluir a ação no D1.", "erro");
    }
  });

  $$("[data-medical-refresh]").forEach((button) => {
    button.addEventListener("click", () => refreshRecords(true));
  });
}

function setupLogout() {
  logoutButton?.addEventListener("click", () => {
    if (typeof window.sairDaConta === "function") {
      window.sairDaConta();
      return;
    }

    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("lagUsuarioLogado");
    localStorage.removeItem("lagUser");
    window.location.href = "../../pages/login.html";
  });
}

async function initMedicalArea(user) {
  if (user) currentUser = user;
  if (!currentUser) currentUser = window.usuarioLogado || getUserFromStorage();

  applyDoctorEmailRestrictions();

  if (initialized) {
    renderRecords();
    return refreshRecords(false);
  }

  if (!form) {
    console.warn("Formulário #medicalRecordForm não encontrado.");
    return;
  }

  initialized = true;

  if (visitDateInput && !visitDateInput.value) visitDateInput.value = getLocalDate();
  if (visitTimeInput && !visitTimeInput.value) visitTimeInput.value = getLocalTime();
  if (painLevelText && painLevelInput) painLevelText.textContent = painLevelInput.value || "0";
  applyDoctorResponsibleDefaults(true);

  setupTabs();
  setupFormControls();
  setupDelegatedActions();
  setupLogout();
  updatePainSummary();

  await refreshRecords(false);
}

window.addEventListener("usuario-carregado", (event) => {
  initMedicalArea(event.detail);
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => initMedicalArea(window.usuarioLogado || getUserFromStorage()), 350);
  });
} else {
  setTimeout(() => initMedicalArea(window.usuarioLogado || getUserFromStorage()), 350);
}
