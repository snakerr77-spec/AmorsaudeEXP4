(() => {
  "use strict";

  const COLLECTION = "prontuariosMedicos";
  const selectedRecordIds = new Set();
  let observer = null;
  let initialized = false;

  function injectStyles() {
    if (document.getElementById("medicalPdfSelectionStyles")) return;

    const style = document.createElement("style");
    style.id = "medicalPdfSelectionStyles";
    style.textContent = `
      .medical-pdf-selection-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        flex-wrap: wrap;
        margin: 0 0 18px;
        padding: 14px 16px;
        border: 1px solid rgba(47, 127, 134, .18);
        background: rgba(255,255,255,.92);
        border-radius: 16px;
        box-shadow: 0 10px 26px rgba(25, 62, 75, .07);
      }

      .medical-pdf-selection-info {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 180px;
        color: #29495b;
        font-size: 14px;
        font-weight: 700;
      }

      .medical-pdf-selection-info i {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        border-radius: 10px;
        color: #2f7f86;
        background: rgba(47, 127, 134, .10);
      }

      .medical-pdf-selection-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .medical-pdf-btn {
        border: 0;
        border-radius: 12px;
        min-height: 42px;
        padding: 0 15px;
        cursor: pointer;
        font: inherit;
        font-size: 13px;
        font-weight: 800;
        transition: .18s ease;
      }

      .medical-pdf-btn:hover:not(:disabled) {
        transform: translateY(-1px);
      }

      .medical-pdf-btn.select-all {
        color: #244659;
        border: 1px solid #d7e6ea;
        background: #fff;
      }

      .medical-pdf-btn.download {
        color: #fff;
        background: linear-gradient(135deg, #237a82, #3a99a0);
        box-shadow: 0 8px 20px rgba(35, 122, 130, .20);
      }

      .medical-pdf-btn:disabled {
        cursor: not-allowed;
        opacity: .45;
        transform: none;
        box-shadow: none;
      }

      .medical-record-card {
        position: relative;
      }

      .medical-record-pdf-selector {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 10px;
        cursor: pointer;
        user-select: none;
        color: #476579;
        font-size: 12px;
        font-weight: 800;
      }

      .medical-record-pdf-selector input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }

      .medical-record-pdf-check {
        display: grid;
        place-items: center;
        width: 22px;
        height: 22px;
        flex: 0 0 22px;
        border: 2px solid #bad2d9;
        border-radius: 7px;
        background: #fff;
        transition: .18s ease;
      }

      .medical-record-pdf-check::after {
        content: "";
        width: 8px;
        height: 4px;
        border-left: 2px solid #fff;
        border-bottom: 2px solid #fff;
        transform: rotate(-45deg) scale(0);
        transition: .15s ease;
      }

      .medical-record-pdf-selector input:checked + .medical-record-pdf-check {
        border-color: #2f7f86;
        background: #2f7f86;
      }

      .medical-record-pdf-selector input:checked + .medical-record-pdf-check::after {
        transform: rotate(-45deg) scale(1);
      }

      .medical-record-card.pdf-selected {
        border-color: rgba(47, 127, 134, .52) !important;
        box-shadow: 0 12px 30px rgba(47, 127, 134, .12) !important;
      }

      @media (max-width: 720px) {
        .medical-pdf-selection-toolbar {
          align-items: stretch;
        }

        .medical-pdf-selection-actions,
        .medical-pdf-btn {
          width: 100%;
        }

        .medical-pdf-selection-actions {
          display: grid;
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function getPanel(scope) {
    return document.querySelector(`[data-medical-panel="${scope}"]`);
  }

  function getPanelList(scope) {
    return scope === "dia"
      ? document.getElementById("medicalTodayList")
      : document.getElementById("medicalMonthList");
  }

  function getPanelCheckboxes(scope) {
    return Array.from(
      getPanelList(scope)?.querySelectorAll("[data-pdf-record-select]") || []
    );
  }

  function getAllSelectionCheckboxes() {
    return Array.from(document.querySelectorAll("[data-pdf-record-select]"));
  }

  function syncDuplicateCheckboxes(recordId, checked) {
    getAllSelectionCheckboxes()
      .filter((checkbox) => checkbox.dataset.pdfRecordSelect === String(recordId))
      .forEach((checkbox) => {
        checkbox.checked = checked;
        checkbox.closest(".medical-record-card")?.classList.toggle("pdf-selected", checked);
      });
  }

  function updateSelectionUI() {
    document.querySelectorAll("[data-pdf-selected-count]").forEach((el) => {
      const total = selectedRecordIds.size;
      el.textContent = `${total} ${total === 1 ? "prontuário selecionado" : "prontuários selecionados"}`;
    });

    document.querySelectorAll("[data-pdf-download]").forEach((button) => {
      button.disabled = selectedRecordIds.size === 0;
    });

    ["dia", "mes"].forEach((scope) => {
      const checkboxes = getPanelCheckboxes(scope);
      const selectAllButton = document.querySelector(`[data-pdf-select-all="${scope}"]`);

      if (!selectAllButton) return;

      const allChecked =
        checkboxes.length > 0 &&
        checkboxes.every((checkbox) => selectedRecordIds.has(checkbox.dataset.pdfRecordSelect));

      selectAllButton.innerHTML = allChecked
        ? '<i class="fa-solid fa-square-minus"></i> Desmarcar todos'
        : '<i class="fa-regular fa-square-check"></i> Selecionar todos';

      selectAllButton.disabled = checkboxes.length === 0;
    });
  }

  function createToolbar(scope) {
    const panel = getPanel(scope);
    const list = getPanelList(scope);

    if (!panel || !list || panel.querySelector(`[data-pdf-toolbar="${scope}"]`)) {
      return;
    }

    const toolbar = document.createElement("div");
    toolbar.className = "medical-pdf-selection-toolbar";
    toolbar.dataset.pdfToolbar = scope;

    toolbar.innerHTML = `
      <div class="medical-pdf-selection-info">
        <i class="fa-solid fa-file-pdf"></i>
        <span data-pdf-selected-count>0 prontuários selecionados</span>
      </div>

      <div class="medical-pdf-selection-actions">
        <button type="button" class="medical-pdf-btn select-all" data-pdf-select-all="${scope}">
          <i class="fa-regular fa-square-check"></i>
          Selecionar todos
        </button>

        <button type="button" class="medical-pdf-btn download" data-pdf-download disabled>
          <i class="fa-solid fa-download"></i>
          Baixar selecionados em PDF
        </button>
      </div>
    `;

    list.parentNode.insertBefore(toolbar, list);
  }

  function decorateRecordCards(root = document) {
    root.querySelectorAll?.(".medical-record-card").forEach((card) => {
      const recordId = String(card.dataset.recordId || "").trim();
      if (!recordId || card.querySelector("[data-pdf-record-select]")) return;

      const summary = card.querySelector(".medical-record-summary");
      const mainInfo = summary?.firstElementChild;

      if (!mainInfo) return;

      const label = document.createElement("label");
      label.className = "medical-record-pdf-selector";
      label.title = "Selecionar este prontuário para o PDF";

      const checked = selectedRecordIds.has(recordId);

      label.innerHTML = `
        <input
          type="checkbox"
          data-pdf-record-select="${escapeAttribute(recordId)}"
          ${checked ? "checked" : ""}
        >
        <span class="medical-record-pdf-check" aria-hidden="true"></span>
        <span>Selecionar para PDF</span>
      `;

      mainInfo.insertBefore(label, mainInfo.firstChild);
      card.classList.toggle("pdf-selected", checked);
    });

    updateSelectionUI();
  }

  function escapeAttribute(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function setupObserver() {
    if (observer) observer.disconnect();

    observer = new MutationObserver((mutations) => {
      let shouldDecorate = false;

      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          shouldDecorate = true;
          break;
        }
      }

      if (shouldDecorate) {
        decorateRecordCards(document);
      }
    });

    const today = document.getElementById("medicalTodayList");
    const month = document.getElementById("medicalMonthList");

    if (today) observer.observe(today, { childList: true, subtree: true });
    if (month) observer.observe(month, { childList: true, subtree: true });
  }

  async function loadJsPDF() {
    if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;

    await new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-medical-jspdf="true"]');

      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.async = true;
      script.dataset.medicalJspdf = "true";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Não foi possível carregar o gerador de PDF."));
      document.head.appendChild(script);
    });

    if (!window.jspdf?.jsPDF) {
      throw new Error("Gerador de PDF não carregou corretamente.");
    }

    return window.jspdf.jsPDF;
  }

  function formatDateBR(value) {
    if (!value) return "Não informado";

    const text = String(value);
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);

    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return text;

    return new Intl.DateTimeFormat("pt-BR").format(date);
  }

  function cleanText(value, fallback = "Não informado") {
    const text = String(value ?? "").trim();
    return text || fallback;
  }

  function sanitizeFilename(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
  }

  function recordsFromResponse(response) {
    return response?.dados || response?.items || [];
  }

  async function getSelectedRecordsFresh() {
    if (!window.AmorSaudeAPI?.listar) {
      throw new Error("API Cloudflare não carregada.");
    }

    const response = await window.AmorSaudeAPI.listar(COLLECTION);
    const allRecords = recordsFromResponse(response);

    return allRecords
      .filter((record) => selectedRecordIds.has(String(record.id)))
      .sort((a, b) => {
        const dateA = `${a.visitDate || ""} ${a.visitTime || ""}`;
        const dateB = `${b.visitDate || ""} ${b.visitTime || ""}`;
        return dateB.localeCompare(dateA);
      });
  }

  function createPdfWriter(doc) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 16;
    const maxWidth = pageWidth - marginX * 2;
    const bottomLimit = pageHeight - 17;
    let y = 18;

    function ensureSpace(heightNeeded = 12) {
      if (y + heightNeeded <= bottomLimit) return;
      doc.addPage();
      y = 18;
    }

    function addHeader(record, index, total) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(37, 85, 99);
      doc.text("LAG Controller - Prontuario Medico", marginX, y);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(90, 110, 120);
      doc.text(`Documento ${index + 1} de ${total}`, pageWidth - marginX, y, { align: "right" });

      y += 7;

      doc.setDrawColor(210, 225, 230);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 8;

      addField("Paciente", record.patient);
      addField("Data de nascimento", formatDateBR(record.birthDate));
      addField("Telefone", record.phone);
      addField("Medico responsavel", record.doctor);
      addField("Especialidade", record.specialty);
      addField(
        "Atendimento",
        `${formatDateBR(record.visitDate)}${record.visitTime ? ` as ${record.visitTime}` : ""}`
      );
      addField("Cidade / unidade", record.city);
    }

    function addSectionTitle(title) {
      ensureSpace(12);
      y += 2;

      doc.setFillColor(241, 247, 248);
      doc.roundedRect(marginX, y - 5, maxWidth, 9, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(37, 85, 99);
      doc.text(title, marginX + 3, y + 1);

      y += 8;
    }

    function addField(label, value) {
      const text = cleanText(value);
      const lines = doc.splitTextToSize(text, maxWidth - 38);
      const blockHeight = Math.max(6, lines.length * 4.6 + 2);

      ensureSpace(blockHeight);

      doc.setFontSize(9.3);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(45, 64, 73);
      doc.text(`${label}:`, marginX, y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(32, 45, 53);
      doc.text(lines, marginX + 38, y);

      y += blockHeight;
    }

    function addLongField(label, value) {
      addSectionTitle(label);

      const text = cleanText(value);
      const lines = doc.splitTextToSize(text, maxWidth - 4);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(32, 45, 53);

      for (const line of lines) {
        ensureSpace(6);
        doc.text(line, marginX + 2, y);
        y += 4.8;
      }

      y += 2;
    }

    function addFooter(record) {
      ensureSpace(28);
      y += 7;

      doc.setDrawColor(150, 170, 180);
      doc.line(marginX, y, marginX + 70, y);
      y += 5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(60, 80, 90);
      doc.text("Assinatura e carimbo do medico", marginX, y);

      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.8);
      doc.setTextColor(115, 125, 132);
      doc.text(
        `Registro: ${cleanText(record.id, "-")} | Gerado em ${new Intl.DateTimeFormat("pt-BR", {
          dateStyle: "short",
          timeStyle: "short"
        }).format(new Date())}`,
        marginX,
        y
      );
    }

    function startRecord(record, index, total) {
      if (index > 0) {
        doc.addPage();
        y = 18;
      }

      addHeader(record, index, total);

      addSectionTitle("Dor e sintomas");
      addField("Intensidade da dor", `${cleanText(record.painLevel, "0")}/10`);
      addField("Tipo da dor", record.painType);
      addField("Inicio dos sintomas", record.symptomStart);
      addField(
        "Locais da dor",
        Array.isArray(record.painAreas) && record.painAreas.length
          ? record.painAreas.join(", ")
          : "Não informado"
      );

      addLongField("Queixa principal", record.complaint);
      addLongField("Anamnese", record.anamnesis);
      addLongField("Sinais vitais", record.vitals);
      addLongField("Alergias", record.allergies);
      addLongField("Medicamentos em uso", record.medicines);
      addLongField("Exame fisico", record.physicalExam);
      addLongField("Hipotese diagnostica / CID", record.diagnosis);
      addLongField("Conduta medica", record.conduct);
      addLongField("Exames solicitados", record.requestedTests);
      addLongField("Prescricao", record.prescription);

      if (record.createdByName || record.createdByEmail) {
        addSectionTitle("Registro no sistema");
        addField("Registrado por", record.createdByName || record.createdByEmail);
        addField("E-mail", record.createdByEmail);
        addField("Criado em", record.createdAtISO || record.createdAt);
      }

      addFooter(record);
    }

    return { startRecord };
  }

  async function downloadSelectedPdf(buttonClicked) {
    if (!selectedRecordIds.size) {
      alert("Selecione pelo menos um prontuário.");
      return;
    }

    const downloadButtons = Array.from(document.querySelectorAll("[data-pdf-download]"));
    const originalHtml = buttonClicked?.innerHTML;

    downloadButtons.forEach((button) => {
      button.disabled = true;
    });

    if (buttonClicked) {
      buttonClicked.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Gerando PDF...';
    }

    try {
      const [JsPDF, selectedRecords] = await Promise.all([
        loadJsPDF(),
        getSelectedRecordsFresh()
      ]);

      if (!selectedRecords.length) {
        throw new Error("Os prontuários selecionados não foram encontrados no banco.");
      }

      const doc = new JsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

      const writer = createPdfWriter(doc);

      selectedRecords.forEach((record, index) => {
        writer.startRecord(record, index, selectedRecords.length);
      });

      let filename = `prontuarios-selecionados-${new Date().toISOString().slice(0, 10)}.pdf`;

      const patientNames = [...new Set(
        selectedRecords
          .map((record) => cleanText(record.patient, ""))
          .filter(Boolean)
      )];

      if (patientNames.length === 1) {
        filename = `prontuarios-${sanitizeFilename(patientNames[0])}-${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`;
      }

      doc.save(filename);
    } catch (error) {
      console.error("Erro ao gerar PDF dos prontuários:", error);
      alert(error.message || "Não foi possível gerar o PDF.");
    } finally {
      if (buttonClicked && originalHtml) {
        buttonClicked.innerHTML = originalHtml;
      }

      updateSelectionUI();
    }
  }

  function toggleAllInScope(scope) {
    const checkboxes = getPanelCheckboxes(scope);

    if (!checkboxes.length) return;

    const allSelected = checkboxes.every((checkbox) =>
      selectedRecordIds.has(checkbox.dataset.pdfRecordSelect)
    );

    checkboxes.forEach((checkbox) => {
      const recordId = checkbox.dataset.pdfRecordSelect;

      if (allSelected) {
        selectedRecordIds.delete(recordId);
        syncDuplicateCheckboxes(recordId, false);
      } else {
        selectedRecordIds.add(recordId);
        syncDuplicateCheckboxes(recordId, true);
      }
    });

    updateSelectionUI();
  }

  function setupEvents() {
    document.addEventListener("change", (event) => {
      const checkbox = event.target.closest?.("[data-pdf-record-select]");
      if (!checkbox) return;

      const recordId = checkbox.dataset.pdfRecordSelect;

      if (checkbox.checked) {
        selectedRecordIds.add(recordId);
      } else {
        selectedRecordIds.delete(recordId);
      }

      syncDuplicateCheckboxes(recordId, checkbox.checked);
      updateSelectionUI();
    });

    document.addEventListener("click", (event) => {
      const selectAllButton = event.target.closest?.("[data-pdf-select-all]");
      const downloadButton = event.target.closest?.("[data-pdf-download]");

      if (selectAllButton) {
        toggleAllInScope(selectAllButton.dataset.pdfSelectAll);
        return;
      }

      if (downloadButton) {
        downloadSelectedPdf(downloadButton);
      }
    });
  }

  function initialize() {
    if (initialized) return;

    const todayList = document.getElementById("medicalTodayList");
    const monthList = document.getElementById("medicalMonthList");

    if (!todayList && !monthList) return;

    initialized = true;

    injectStyles();
    createToolbar("dia");
    createToolbar("mes");
    decorateRecordCards(document);
    setupObserver();
    setupEvents();
    updateSelectionUI();
  }

  function scheduleInitialize() {
    setTimeout(initialize, 250);
    setTimeout(() => decorateRecordCards(document), 700);
    setTimeout(() => decorateRecordCards(document), 1400);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleInitialize);
  } else {
    scheduleInitialize();
  }

  window.addEventListener("usuario-carregado", scheduleInitialize);
})();
