const PATIENT_RECORDS_COLLECTION = "prontuariosMedicos";

let allRecords = [];
let patients = [];
let selectedPatientKey = "";
let currentDoctorGroups = [];
let initializedPatients = false;

const patientsList = document.getElementById("patientsList");
const patientDetail = document.getElementById("patientDetail");
const searchInput = document.getElementById("patientsSearch");
const refreshButton = document.getElementById("patientsRefresh");
const statusElement = document.getElementById("patientsStatus");

function escapeHTML(value = "") {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function formatDate(value) {
  if (!value) return "Não informado";
  const parts = String(value).split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function recordTimestamp(record) {
  const base = `${record.visitDate || "0000-00-00"}T${record.visitTime || "00:00"}:00`;
  const date = new Date(base);
  if (!Number.isNaN(date.getTime())) return date.getTime();
  const fallback = new Date(record.createdAtISO || record.createdAt || 0);
  return Number.isNaN(fallback.getTime()) ? 0 : fallback.getTime();
}

function patientKey(record) {
  return [record.patient, record.birthDate, record.phone]
    .map((value) => normalizeText(value))
    .join("|");
}

function patientInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "P";
  return `${parts[0][0] || ""}${parts.length > 1 ? parts[parts.length - 1][0] : ""}`.toUpperCase();
}

function setStatus(text = "", type = "") {
  if (!statusElement) return;
  statusElement.textContent = text;
  statusElement.className = `patients-status${type ? ` ${type}` : ""}`;
}

function buildPatients(records) {
  const map = new Map();

  records.forEach((record) => {
    const key = patientKey(record);
    if (!normalizeText(record.patient)) return;

    if (!map.has(key)) {
      map.set(key, {
        key,
        name: record.patient || "Paciente",
        birthDate: record.birthDate || "",
        phone: record.phone || "",
        city: record.city || record.cidade || "",
        records: []
      });
    }

    const patient = map.get(key);
    patient.records.push(record);
    if (!patient.birthDate && record.birthDate) patient.birthDate = record.birthDate;
    if (!patient.phone && record.phone) patient.phone = record.phone;
    if (!patient.city && (record.city || record.cidade)) patient.city = record.city || record.cidade;
  });

  return [...map.values()]
    .map((patient) => ({
      ...patient,
      records: patient.records.sort((a, b) => recordTimestamp(b) - recordTimestamp(a)),
      lastVisit: Math.max(...patient.records.map(recordTimestamp))
    }))
    .sort((a, b) => b.lastVisit - a.lastVisit || a.name.localeCompare(b.name, "pt-BR"));
}

function updateStats() {
  const doctors = new Set(allRecords.map((record) => normalizeText(record.doctor)).filter(Boolean));
  document.getElementById("patientsTotal").textContent = String(patients.length);
  document.getElementById("recordsTotal").textContent = String(allRecords.length);
  document.getElementById("doctorsTotal").textContent = String(doctors.size);
}

function renderPatientList() {
  const term = normalizeText(searchInput?.value || "");
  const filtered = patients.filter((patient) => {
    const haystack = normalizeText(`${patient.name} ${patient.phone} ${patient.birthDate} ${patient.city}`);
    return !term || haystack.includes(term);
  });

  document.getElementById("patientsVisibleCount").textContent = String(filtered.length);
  patientsList.innerHTML = "";

  if (!filtered.length) {
    patientsList.innerHTML = '<div class="patients-list-empty"><i class="fa-regular fa-folder-open"></i><br>Nenhum paciente encontrado.</div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  filtered.forEach((patient) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `patient-list-item${patient.key === selectedPatientKey ? " active" : ""}`;
    button.dataset.patientKey = patient.key;
    button.innerHTML = `
      <span class="patient-list-avatar">${escapeHTML(patientInitials(patient.name))}</span>
      <span class="patient-list-content">
        <strong>${escapeHTML(patient.name)}</strong>
        <small>${escapeHTML(patient.phone || "Sem telefone")} · ${escapeHTML(formatDate(patient.birthDate))}</small>
      </span>
      <span class="patient-list-badge">${patient.records.length}</span>
    `;
    fragment.appendChild(button);
  });

  patientsList.appendChild(fragment);
}

function groupRecordsByDoctor(records) {
  const map = new Map();

  records.forEach((record) => {
    const doctor = record.doctor || "Médico não informado";
    const specialty = record.specialty || "Especialidade não informada";
    const key = `${normalizeText(doctor)}|${normalizeText(specialty)}`;
    if (!map.has(key)) map.set(key, { key, doctor, specialty, records: [] });
    map.get(key).records.push(record);
  });

  return [...map.values()]
    .map((group) => ({ ...group, records: group.records.sort((a, b) => recordTimestamp(b) - recordTimestamp(a)) }))
    .sort((a, b) => a.doctor.localeCompare(b.doctor, "pt-BR"));
}

function recordFields(record) {
  const painAreas = Array.isArray(record.painAreas) && record.painAreas.length ? record.painAreas.join(", ") : "Não informado";
  return [
    ["Queixa principal", record.complaint],
    ["Anamnese", record.anamnesis],
    ["Sinais vitais", record.vitals],
    ["Alergias", record.allergies],
    ["Medicamentos em uso", record.medicines],
    ["Exame físico", record.physicalExam],
    ["Hipótese diagnóstica / CID", record.diagnosis],
    ["Conduta médica", record.conduct],
    ["Exames solicitados", record.requestedTests],
    ["Prescrição", record.prescription],
    ["Dor", `${record.painLevel || "0"}/10 · ${record.painType || "Não informado"}`],
    ["Locais da dor", painAreas],
    ["Início dos sintomas", record.symptomStart]
  ].map(([label, value]) => ({ label, value: value || "Não informado" }));
}

function renderRecord(record) {
  const fields = recordFields(record);
  return `
    <details class="record-item">
      <summary>
        <span class="record-date"><strong>${escapeHTML(formatDate(record.visitDate))}</strong><small>${escapeHTML(record.visitTime || "Horário não informado")}</small></span>
        <span class="record-summary-text"><strong>${escapeHTML(record.diagnosis || record.complaint || "Atendimento médico")}</strong><small>${escapeHTML(record.specialty || "Especialidade não informada")}</small></span>
        <i class="fa-solid fa-chevron-down record-toggle-icon"></i>
      </summary>
      <div class="record-detail-grid">
        ${fields.map((field) => `
          <div class="record-field${["Queixa principal", "Anamnese", "Exame físico", "Hipótese diagnóstica / CID", "Conduta médica", "Exames solicitados", "Prescrição"].includes(field.label) ? " wide" : ""}">
            <span>${escapeHTML(field.label)}</span>
            <p>${escapeHTML(field.value)}</p>
          </div>
        `).join("")}
      </div>
    </details>
  `;
}

function renderPatientDetail(patient) {
  if (!patient) return;
  currentDoctorGroups = groupRecordsByDoctor(patient.records);

  patientDetail.innerHTML = `
    <div class="patient-header">
      <div class="patient-header-main">
        <div class="patient-header-avatar">${escapeHTML(patientInitials(patient.name))}</div>
        <div>
          <h2>${escapeHTML(patient.name)}</h2>
          <p>Histórico clínico consolidado a partir dos prontuários registrados no D1.</p>
          <div class="patient-meta">
            <span><i class="fa-regular fa-calendar"></i> ${escapeHTML(formatDate(patient.birthDate))}</span>
            <span><i class="fa-solid fa-phone"></i> ${escapeHTML(patient.phone || "Não informado")}</span>
            <span><i class="fa-solid fa-location-dot"></i> ${escapeHTML(patient.city || "Unidade não informada")}</span>
          </div>
        </div>
      </div>
      <div class="patient-header-summary">
        <strong>${patient.records.length}</strong>
        <small>atendimento(s) · ${currentDoctorGroups.length} médico(s)</small>
      </div>
    </div>

    <div class="doctors-section">
      <div class="doctors-section-title">
        <div><h3>Prontuários por médico</h3><p>Cada PDF contém somente os registros do profissional selecionado.</p></div>
      </div>

      ${currentDoctorGroups.map((group, index) => `
        <article class="doctor-record-group">
          <header class="doctor-group-head">
            <div class="doctor-identity">
              <span class="doctor-icon"><i class="fa-solid fa-user-doctor"></i></span>
              <div><strong>${escapeHTML(group.doctor)}</strong><small>${escapeHTML(group.specialty)} · ${group.records.length} atendimento(s)</small></div>
            </div>
            <button type="button" class="doctor-download" data-download-doctor="${index}">
              <i class="fa-solid fa-file-pdf"></i> Baixar PDF deste médico
            </button>
          </header>
          <div class="doctor-records">${group.records.map(renderRecord).join("")}</div>
        </article>
      `).join("")}
    </div>
  `;
}

function selectPatient(key) {
  const patient = patients.find((item) => item.key === key);
  if (!patient) return;
  selectedPatientKey = key;
  renderPatientList();
  renderPatientDetail(patient);
}

function sanitizeFileName(value = "") {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "prontuario";
}

function pdfText(value) {
  return String(value || "Não informado").replace(/\s+$/g, "");
}

function downloadDoctorPdf(patient, group) {
  if (!window.jspdf?.jsPDF) {
    setStatus("Biblioteca de PDF não carregou. Atualize a página e tente novamente.", "error");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 16;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  const ensureSpace = (needed = 16) => {
    if (y + needed <= pageHeight - 18) return;
    doc.addPage();
    y = 18;
  };

  const line = (text, options = {}) => {
    const size = options.size || 10;
    const style = options.style || "normal";
    const spacing = options.spacing || 5;
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(pdfText(text), contentWidth);
    ensureSpace(lines.length * spacing + 2);
    doc.text(lines, margin, y);
    y += lines.length * spacing + 1.5;
  };

  doc.setFillColor(11, 71, 139);
  doc.rect(0, 0, pageWidth, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("LAG Controller | Prontuário do Paciente", margin, 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Gerado em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date())}`, margin, 23);

  doc.setTextColor(22, 43, 68);
  y = 44;
  line(`Paciente: ${patient.name}`, { size: 13, style: "bold", spacing: 6 });
  line(`Nascimento: ${formatDate(patient.birthDate)}   |   Telefone: ${patient.phone || "Não informado"}`, { size: 9 });
  line(`Unidade: ${patient.city || "Não informada"}`, { size: 9 });
  y += 2;
  line(`Médico responsável: ${group.doctor}`, { size: 12, style: "bold", spacing: 6 });
  line(`Especialidade: ${group.specialty}   |   Atendimentos neste PDF: ${group.records.length}`, { size: 9 });
  y += 4;

  const chronological = [...group.records].sort((a, b) => recordTimestamp(a) - recordTimestamp(b));
  chronological.forEach((record, index) => {
    ensureSpace(28);
    doc.setDrawColor(210, 224, 238);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;
    line(`Atendimento ${index + 1} — ${formatDate(record.visitDate)} às ${record.visitTime || "horário não informado"}`, { size: 11, style: "bold", spacing: 5.5 });

    recordFields(record).forEach((field) => {
      ensureSpace(14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(67, 101, 133);
      doc.text(field.label.toUpperCase(), margin, y);
      y += 4.2;
      doc.setTextColor(25, 44, 64);
      line(field.value, { size: 9.5, spacing: 4.6 });
      y += 1.2;
    });
    y += 3;
  });

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(110, 126, 143);
    doc.text(`Página ${page} de ${pages}`, pageWidth - margin, pageHeight - 9, { align: "right" });
    doc.text("Documento gerado pela Central de Pacientes LAG Controller", margin, pageHeight - 9);
  }

  const fileName = `prontuario-${sanitizeFileName(patient.name)}-${sanitizeFileName(group.doctor)}.pdf`;
  doc.save(fileName);
  setStatus(`PDF de ${group.doctor} gerado com sucesso.`, "success");
}

async function loadPatientRecords(showMessage = true) {
  try {
    if (showMessage) setStatus("Atualizando prontuários...");
    refreshButton.disabled = true;
    refreshButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Atualizando';

    if (!window.AmorSaudeAPI?.listar) throw new Error("API Cloudflare ainda não carregou.");
    const response = await window.AmorSaudeAPI.listar(PATIENT_RECORDS_COLLECTION);
    allRecords = (response.dados || response.items || []).sort((a, b) => recordTimestamp(b) - recordTimestamp(a));
    patients = buildPatients(allRecords);
    updateStats();
    renderPatientList();

    if (selectedPatientKey && patients.some((patient) => patient.key === selectedPatientKey)) {
      selectPatient(selectedPatientKey);
    } else if (patients.length) {
      selectPatient(patients[0].key);
    } else {
      patientDetail.innerHTML = '<div class="patients-empty"><div class="patients-empty-icon"><i class="fa-solid fa-notes-medical"></i></div><h2>Nenhum prontuário encontrado</h2><p>Assim que os médicos salvarem atendimentos, os pacientes aparecerão aqui automaticamente.</p></div>';
    }

    setStatus(`${allRecords.length} prontuário(s) carregado(s) de ${patients.length} paciente(s).`, "success");
  } catch (error) {
    console.error("Erro ao carregar central de pacientes:", error);
    patientsList.innerHTML = '<div class="patients-list-empty">Não foi possível carregar os pacientes.</div>';
    setStatus(error.message || "Erro ao carregar prontuários do D1.", "error");
  } finally {
    refreshButton.disabled = false;
    refreshButton.innerHTML = '<i class="fa-solid fa-rotate"></i> Atualizar dados';
  }
}

function initPatients() {
  if (initializedPatients) return;
  initializedPatients = true;
  loadPatientRecords(false);
}

patientsList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-patient-key]");
  if (button) selectPatient(button.dataset.patientKey);
});

patientDetail?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-download-doctor]");
  if (!button) return;
  const patient = patients.find((item) => item.key === selectedPatientKey);
  const group = currentDoctorGroups[Number(button.dataset.downloadDoctor)];
  if (patient && group) downloadDoctorPdf(patient, group);
});

searchInput?.addEventListener("input", renderPatientList);
refreshButton?.addEventListener("click", () => loadPatientRecords(true));
window.addEventListener("usuario-carregado", initPatients);

if (window.usuarioLogado) {
  setTimeout(initPatients, 100);
} else {
  setTimeout(initPatients, 650);
}
