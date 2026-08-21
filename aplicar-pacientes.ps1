$ErrorActionPreference = "Stop"
$root = (Get-Location).Path

$required = Join-Path $root "public\js\home.js"
if (-not (Test-Path $required)) {
  throw "Execute este script na raiz do repositorio AmorsaudeEXP4. Nao encontrei public\js\home.js"
}

$module = Join-Path $root "public\modules\pacientes"
New-Item -ItemType Directory -Force -Path $module | Out-Null

$html = @'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LAG Controller | Pacientes</title>
  <link rel="stylesheet" href="/css/lag-global.css?v=pacientes-20260821">
  <link rel="stylesheet" href="./pacientes.css?v=pacientes-20260821">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
</head>
<body data-protected-page="true" data-required-role="admin">
  <header class="patients-topbar">
    <a class="patients-brand" href="../../pages/home.html" aria-label="Voltar para a homepage">
      <img src="../../assets/images/logo-lag-sem-fundo.png" alt="LAG Controller">
    </a>
    <div class="patients-topbar-actions">
      <a href="../prontuario-medico/prontuario-medico.html" class="patients-link-secondary">
        <i class="fa-solid fa-file-medical"></i> Prontuário
      </a>
      <a href="../../pages/home.html" class="patients-link-primary">
        <i class="fa-solid fa-house"></i> Homepage
      </a>
    </div>
  </header>

  <main class="patients-shell">
    <section class="patients-hero">
      <div>
        <span class="patients-eyebrow"><i class="fa-solid fa-user-injured"></i> Central do paciente</span>
        <h1>Pacientes e prontuários</h1>
        <p>Localize o paciente, consulte todo o histórico clínico e gere um PDF separado para cada médico responsável.</p>
      </div>
      <button type="button" id="patientsRefresh" class="patients-refresh">
        <i class="fa-solid fa-rotate"></i> Atualizar dados
      </button>
    </section>

    <section class="patients-stats" aria-label="Resumo dos prontuários">
      <article>
        <span><i class="fa-solid fa-users"></i></span>
        <div><strong id="patientsTotal">0</strong><small>Pacientes</small></div>
      </article>
      <article>
        <span><i class="fa-solid fa-notes-medical"></i></span>
        <div><strong id="recordsTotal">0</strong><small>Prontuários</small></div>
      </article>
      <article>
        <span><i class="fa-solid fa-user-doctor"></i></span>
        <div><strong id="doctorsTotal">0</strong><small>Médicos nos registros</small></div>
      </article>
    </section>

    <section class="patients-workspace">
      <aside class="patients-sidebar">
        <div class="patients-sidebar-head">
          <div>
            <span>Base clínica</span>
            <h2>Pacientes</h2>
          </div>
          <span class="patients-count" id="patientsVisibleCount">0</span>
        </div>

        <label class="patients-search" for="patientsSearch">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input id="patientsSearch" type="search" placeholder="Buscar nome, telefone ou nascimento..." autocomplete="off">
        </label>

        <div class="patients-list" id="patientsList">
          <div class="patients-loading"><i class="fa-solid fa-spinner fa-spin"></i> Carregando pacientes...</div>
        </div>
      </aside>

      <section class="patients-detail" id="patientDetail">
        <div class="patients-empty">
          <div class="patients-empty-icon"><i class="fa-solid fa-folder-open"></i></div>
          <h2>Selecione um paciente</h2>
          <p>O histórico será organizado por médico e cada profissional terá um PDF próprio para download.</p>
        </div>
      </section>
    </section>

    <p class="patients-status" id="patientsStatus" role="status"></p>
  </main>

  <script src="/js/cloud-auth.js?v=pacientes-20260821"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="./pacientes.js?v=pacientes-20260821"></script>
</body>
</html>
'@
$css = @'
:root {
  --patients-bg: #f4f8fc;
  --patients-surface: #ffffff;
  --patients-border: #dbe7f2;
  --patients-text: #10243e;
  --patients-muted: #69809a;
  --patients-blue: #1677e8;
  --patients-blue-dark: #0757b7;
  --patients-cyan: #29b6f6;
  --patients-shadow: 0 18px 45px rgba(38, 82, 125, .10);
}

* { box-sizing: border-box; }
body { margin: 0; background: var(--patients-bg); color: var(--patients-text); font-family: Inter, Arial, sans-serif; }
button, input { font: inherit; }

.patients-topbar {
  min-height: 76px; padding: 12px clamp(18px, 4vw, 64px); background: rgba(255,255,255,.96);
  border-bottom: 1px solid var(--patients-border); display: flex; align-items: center; justify-content: space-between;
  gap: 18px; position: sticky; top: 0; z-index: 20; backdrop-filter: blur(16px);
}
.patients-brand img { width: 150px; height: 48px; object-fit: contain; }
.patients-topbar-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.patients-link-primary, .patients-link-secondary {
  min-height: 42px; padding: 0 16px; border-radius: 12px; display: inline-flex; align-items: center; gap: 9px;
  font-weight: 800; text-decoration: none; transition: .2s ease;
}
.patients-link-primary { background: linear-gradient(135deg, var(--patients-blue), var(--patients-cyan)); color: #fff; box-shadow: 0 10px 24px rgba(22,119,232,.18); }
.patients-link-secondary { background: #eef6ff; color: var(--patients-blue-dark); border: 1px solid #d6e9ff; }
.patients-link-primary:hover, .patients-link-secondary:hover { transform: translateY(-1px); }

.patients-shell { width: min(1480px, calc(100% - 36px)); margin: 0 auto; padding: 34px 0 56px; }
.patients-hero {
  border-radius: 28px; padding: clamp(24px, 4vw, 42px); display: flex; justify-content: space-between; gap: 24px; align-items: flex-end;
  background: radial-gradient(circle at 92% 15%, rgba(41,182,246,.20), transparent 28%), linear-gradient(135deg, #071d3f, #0a4386 58%, #087dbe);
  color: #fff; box-shadow: 0 26px 60px rgba(7,55,112,.20); overflow: hidden;
}
.patients-eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 999px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.15); font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; }
.patients-hero h1 { margin: 15px 0 8px; font-size: clamp(32px, 5vw, 58px); line-height: 1; letter-spacing: -.045em; }
.patients-hero p { max-width: 780px; margin: 0; color: #cfe3f8; font-size: 16px; line-height: 1.65; }
.patients-refresh { border: 1px solid rgba(255,255,255,.24); background: rgba(255,255,255,.13); color: #fff; border-radius: 14px; min-height: 46px; padding: 0 18px; font-weight: 900; cursor: pointer; white-space: nowrap; }
.patients-refresh:hover { background: rgba(255,255,255,.20); }

.patients-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin: 20px 0; }
.patients-stats article { min-height: 104px; background: var(--patients-surface); border: 1px solid var(--patients-border); border-radius: 20px; padding: 18px; display: flex; align-items: center; gap: 14px; box-shadow: var(--patients-shadow); }
.patients-stats article > span { width: 50px; height: 50px; flex: 0 0 50px; border-radius: 16px; background: #eaf5ff; color: var(--patients-blue); display: grid; place-items: center; font-size: 20px; }
.patients-stats strong { display: block; font-size: 28px; line-height: 1; }
.patients-stats small { display: block; margin-top: 7px; color: var(--patients-muted); font-weight: 700; }

.patients-workspace { display: grid; grid-template-columns: minmax(310px, 390px) minmax(0, 1fr); gap: 18px; align-items: start; }
.patients-sidebar, .patients-detail { background: var(--patients-surface); border: 1px solid var(--patients-border); border-radius: 24px; box-shadow: var(--patients-shadow); }
.patients-sidebar { padding: 20px; position: sticky; top: 96px; max-height: calc(100vh - 118px); display: flex; flex-direction: column; }
.patients-sidebar-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.patients-sidebar-head span:first-child { color: var(--patients-blue); font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .09em; }
.patients-sidebar-head h2 { margin: 4px 0 0; font-size: 24px; }
.patients-count { min-width: 34px; height: 34px; padding: 0 9px; border-radius: 999px; background: #edf6ff; color: var(--patients-blue-dark); display: grid; place-items: center; font-weight: 900; }
.patients-search { min-height: 48px; border: 1px solid var(--patients-border); background: #f8fbfe; border-radius: 14px; display: flex; align-items: center; gap: 10px; padding: 0 14px; color: #7c90a6; }
.patients-search:focus-within { border-color: #89c4ff; box-shadow: 0 0 0 4px rgba(22,119,232,.08); }
.patients-search input { width: 100%; border: 0; outline: 0; background: transparent; color: var(--patients-text); }
.patients-list { overflow: auto; margin-top: 14px; padding-right: 4px; }
.patients-loading, .patients-list-empty { padding: 28px 10px; text-align: center; color: var(--patients-muted); line-height: 1.6; }
.patient-list-item { width: 100%; border: 1px solid transparent; background: transparent; border-radius: 16px; padding: 14px; text-align: left; cursor: pointer; display: flex; gap: 12px; align-items: center; color: inherit; }
.patient-list-item:hover { background: #f5faff; }
.patient-list-item.active { background: #edf6ff; border-color: #cce4ff; }
.patient-list-avatar { width: 44px; height: 44px; flex: 0 0 44px; border-radius: 14px; display: grid; place-items: center; background: linear-gradient(135deg, #d9edff, #e5f9ff); color: var(--patients-blue-dark); font-weight: 900; }
.patient-list-content { min-width: 0; flex: 1; }
.patient-list-content strong { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.patient-list-content small { color: var(--patients-muted); display: block; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.patient-list-badge { font-size: 11px; font-weight: 900; color: var(--patients-blue-dark); background: #fff; border: 1px solid #d8eafa; padding: 5px 7px; border-radius: 999px; }

.patients-detail { min-height: 560px; padding: clamp(20px, 3vw, 30px); }
.patients-empty { min-height: 500px; display: grid; place-items: center; align-content: center; text-align: center; color: var(--patients-muted); padding: 30px; }
.patients-empty-icon { width: 72px; height: 72px; border-radius: 22px; background: #edf6ff; color: var(--patients-blue); display: grid; place-items: center; font-size: 28px; margin-bottom: 14px; }
.patients-empty h2 { color: var(--patients-text); margin: 0 0 8px; }
.patients-empty p { max-width: 520px; margin: 0; line-height: 1.65; }

.patient-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 18px; padding-bottom: 22px; border-bottom: 1px solid var(--patients-border); }
.patient-header-main { display: flex; align-items: center; gap: 15px; min-width: 0; }
.patient-header-avatar { width: 62px; height: 62px; border-radius: 19px; background: linear-gradient(135deg, #1478e8, #2dbaf5); color: #fff; display: grid; place-items: center; font-size: 22px; font-weight: 900; box-shadow: 0 12px 24px rgba(22,119,232,.18); }
.patient-header h2 { margin: 0; font-size: clamp(24px, 4vw, 34px); }
.patient-header p { margin: 6px 0 0; color: var(--patients-muted); line-height: 1.55; }
.patient-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.patient-meta span { padding: 6px 9px; border-radius: 9px; background: #f0f6fb; color: #4d6680; font-size: 12px; font-weight: 800; }
.patient-header-summary { text-align: right; }
.patient-header-summary strong { font-size: 24px; display: block; color: var(--patients-blue-dark); }
.patient-header-summary small { color: var(--patients-muted); font-weight: 700; }

.doctors-section { margin-top: 24px; }
.doctors-section-title { display: flex; justify-content: space-between; gap: 14px; align-items: end; margin-bottom: 14px; }
.doctors-section-title h3 { margin: 0; font-size: 20px; }
.doctors-section-title p { margin: 4px 0 0; color: var(--patients-muted); }
.doctor-record-group { border: 1px solid var(--patients-border); border-radius: 20px; overflow: hidden; margin-top: 14px; background: #fff; }
.doctor-group-head { padding: 17px 18px; background: linear-gradient(180deg, #f9fcff, #f4f9fd); display: flex; justify-content: space-between; gap: 16px; align-items: center; border-bottom: 1px solid var(--patients-border); }
.doctor-identity { display: flex; align-items: center; gap: 12px; min-width: 0; }
.doctor-icon { width: 44px; height: 44px; flex: 0 0 44px; border-radius: 14px; background: #e7f3ff; color: var(--patients-blue); display: grid; place-items: center; }
.doctor-identity strong { display: block; font-size: 16px; }
.doctor-identity small { color: var(--patients-muted); display: block; margin-top: 4px; }
.doctor-download { border: 0; min-height: 42px; padding: 0 14px; border-radius: 12px; background: var(--patients-blue); color: #fff; font-weight: 900; cursor: pointer; display: inline-flex; gap: 8px; align-items: center; white-space: nowrap; }
.doctor-download:hover { background: var(--patients-blue-dark); }
.doctor-records { padding: 8px 16px 16px; }
.record-item { border-bottom: 1px solid #e7eef5; padding: 12px 0; }
.record-item:last-child { border-bottom: 0; }
.record-item summary { cursor: pointer; list-style: none; display: grid; grid-template-columns: 140px minmax(0,1fr) auto; gap: 14px; align-items: center; }
.record-item summary::-webkit-details-marker { display: none; }
.record-date strong { display: block; }
.record-date small, .record-summary-text small { display: block; color: var(--patients-muted); margin-top: 4px; }
.record-summary-text strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.record-toggle-icon { color: var(--patients-blue); }
.record-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; padding: 14px 0 4px; }
.record-field { padding: 12px; border-radius: 12px; background: #f7fafc; border: 1px solid #e6eef5; }
.record-field.wide { grid-column: 1 / -1; }
.record-field span { display: block; color: #72879b; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .045em; margin-bottom: 5px; }
.record-field p { margin: 0; white-space: pre-wrap; line-height: 1.55; }
.patients-status { min-height: 22px; margin: 14px 4px 0; color: var(--patients-muted); font-size: 13px; }
.patients-status.error { color: #c93434; }
.patients-status.success { color: #167a55; }

@media (max-width: 980px) {
  .patients-workspace { grid-template-columns: 1fr; }
  .patients-sidebar { position: static; max-height: none; }
  .patients-list { max-height: 380px; }
}
@media (max-width: 720px) {
  .patients-shell { width: min(100% - 22px, 1480px); padding-top: 18px; }
  .patients-topbar { padding: 10px 14px; }
  .patients-brand img { width: 120px; }
  .patients-link-secondary { display: none; }
  .patients-hero { align-items: stretch; flex-direction: column; border-radius: 22px; }
  .patients-refresh { align-self: flex-start; }
  .patients-stats { grid-template-columns: 1fr; }
  .patient-header, .doctor-group-head { flex-direction: column; align-items: stretch; }
  .patient-header-summary { text-align: left; }
  .doctor-download { justify-content: center; }
  .record-item summary { grid-template-columns: 1fr auto; }
  .record-summary-text { grid-column: 1 / -1; grid-row: 2; }
  .record-detail-grid { grid-template-columns: 1fr; }
  .record-field.wide { grid-column: auto; }
}
'@
$js = @'
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
'@

[System.IO.File]::WriteAllText((Join-Path $module "pacientes.html"), $html, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText((Join-Path $module "pacientes.css"), $css, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText((Join-Path $module "pacientes.js"), $js, [System.Text.UTF8Encoding]::new($false))

$homeJs = Join-Path $root "public\js\home.js"
$homeContent = [System.IO.File]::ReadAllText($homeJs)
$marker = "LAG_PATIENTS_HOME_ENTRY"
if (-not $homeContent.Contains($marker)) {
  $injection = @'
/* LAG_PATIENTS_HOME_ENTRY */
document.addEventListener("DOMContentLoaded", () => {
  function normalizePatientsRole(value = "") {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  function getPatientsHomeUser() {
    if (window.usuarioLogado) return window.usuarioLogado;
    for (const key of ["amor_usuario", "amorSaudeUsuario", "usuarioLogado"]) {
      try {
        const value = JSON.parse(localStorage.getItem(key) || "null");
        if (value) return value;
      } catch {}
    }
    return null;
  }

  function installPatientsHomeEntry(user = getPatientsHomeUser()) {
    const role = normalizePatientsRole(user?.nivelAcesso || user?.nivel_acesso || user?.role || user?.cargo);
    if (role !== "admin") return;

    const url = "../modules/pacientes/pacientes.html";

    const nav = document.getElementById("homeNavigation");
    if (nav && !nav.querySelector('[data-patients-home-link]')) {
      const link = document.createElement("a");
      link.href = url;
      link.dataset.patientsHomeLink = "true";
      link.textContent = "Pacientes";
      const medicalLink = nav.querySelector('a[href*="prontuario-medico"]');
      if (medicalLink?.nextSibling) nav.insertBefore(link, medicalLink.nextSibling);
      else nav.appendChild(link);
    }

    const cards = document.getElementById("beneficios");
    if (cards && !cards.querySelector('[data-patients-home-card]')) {
      const card = document.createElement("article");
      card.className = "card";
      card.dataset.patientsHomeCard = "true";
      card.innerHTML = `
        <div class="card-icon"><i class="fa-solid fa-hospital-user"></i></div>
        <h4>Pacientes</h4>
        <p>Consulte o histórico completo do paciente e baixe os prontuários em PDF separados por médico.</p>
        <a href="${url}">Abrir central de pacientes →</a>
      `;
      cards.appendChild(card);
    }

    const drawerSections = Array.from(document.querySelectorAll(".home-drawer-category"));
    const clinicalSection = drawerSections.find((section) => normalizePatientsRole(section.textContent).includes("operacao clinica"));
    const drawerList = clinicalSection?.querySelector(".home-drawer-link-list");
    if (drawerList && !drawerList.querySelector('[data-patients-home-drawer]')) {
      const link = document.createElement("a");
      link.className = "home-drawer-link";
      link.href = url;
      link.dataset.patientsHomeDrawer = "true";
      link.innerHTML = '<i class="fa-solid fa-hospital-user"></i><div><b>Pacientes</b><small>Histórico clínico e PDFs por médico</small></div>';
      drawerList.appendChild(link);
    }
  }

  window.addEventListener("usuario-carregado", (event) => installPatientsHomeEntry(event.detail));
  setTimeout(() => installPatientsHomeEntry(), 300);
});
'@
  [System.IO.File]::WriteAllText($homeJs, ($homeContent.TrimEnd() + "`r`n`r`n" + $injection + "`r`n"), [System.Text.UTF8Encoding]::new($false))
}

Write-Host "Central de Pacientes aplicada com sucesso." -ForegroundColor Green
Write-Host "Arquivos criados: public/modules/pacientes/*" -ForegroundColor Cyan
Write-Host "Homepage atualizada: public/js/home.js" -ForegroundColor Cyan
Write-Host "Agora rode: git status" -ForegroundColor Yellow
