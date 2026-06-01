const STORAGE_MEDICOS = "amorSaude_medicos_organizado_v1";
const STORAGE_EXAMES = "amorSaude_exames_organizado_v1";

const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const medicosBase = [
  {
    id: "med-1",
    nome: "Dra. Lisa",
    especialidade: "Oftalmologia",
    crm: "CRM a confirmar",
    unidade: "Sala 1",
    idade: "Livre",
    valor: "Consultar unidade",
    status: "Atendendo",
    observacao: "Saúde ocular. Confirmar agenda oficial antes de passar horário ao paciente.",
    horarios: [
      { dia: "Segunda", inicio: "08:00", fim: "12:00", sala: "Sala 1", tipo: "Consulta", vagas: "6 vagas" },
      { dia: "Quarta", inicio: "13:00", fim: "17:00", sala: "Sala 1", tipo: "Consulta", vagas: "5 vagas" }
    ]
  },
  {
    id: "med-2",
    nome: "Dra. Flávia",
    especialidade: "Clínico Geral",
    crm: "CRM a confirmar",
    unidade: "Sala 2",
    idade: "Adulto",
    valor: "Consultar unidade",
    status: "Horário limitado",
    observacao: "Atendimento clínico sujeito à disponibilidade da unidade.",
    horarios: [
      { dia: "Terça", inicio: "09:00", fim: "12:00", sala: "Sala 2", tipo: "Consulta", vagas: "4 vagas" },
      { dia: "Quinta", inicio: "14:00", fim: "18:00", sala: "Sala 2", tipo: "Consulta", vagas: "5 vagas" }
    ]
  },
  {
    id: "med-3",
    nome: "Dr. Pedro Lucas",
    especialidade: "Clínico Geral",
    crm: "CRM a confirmar",
    unidade: "Sala 3",
    idade: "Livre",
    valor: "Consultar unidade",
    status: "Atendendo",
    observacao: "Consulta clínica geral. Validar retornos e encaixes com a recepção.",
    horarios: [
      { dia: "Segunda", inicio: "13:30", fim: "18:00", sala: "Sala 3", tipo: "Consulta", vagas: "8 vagas" },
      { dia: "Sexta", inicio: "08:00", fim: "12:00", sala: "Sala 3", tipo: "Consulta", vagas: "6 vagas" }
    ]
  },
  {
    id: "med-4",
    nome: "Dra. Larissa Junqueira Akl",
    especialidade: "Dermatologia",
    crm: "CRM a confirmar",
    unidade: "Sala 4",
    idade: "Adulto",
    valor: "Consultar unidade",
    status: "Atendendo",
    observacao: "Atendimento dermatológico. Confirmar procedimentos disponíveis na unidade.",
    horarios: [
      { dia: "Quarta", inicio: "08:00", fim: "12:00", sala: "Sala 4", tipo: "Consulta", vagas: "5 vagas" }
    ]
  }
];

const examesBase = [
  {
    id: "exa-1",
    nome: "Hemograma completo",
    categoria: "Laboratorial",
    valor: "R$ 40,00",
    precisaJejum: false,
    jejumHoras: "Não precisa",
    preparo: "Sem preparo especial. Levar documento e pedido médico, quando houver.",
    prazo: "24 horas",
    observacao: "Confirmar valores atualizados na recepção."
  },
  {
    id: "exa-2",
    nome: "Glicemia de jejum",
    categoria: "Laboratorial",
    valor: "R$ 25,00",
    precisaJejum: true,
    jejumHoras: "8 horas",
    preparo: "Manter jejum mínimo de 8 horas. Água liberada em pequena quantidade.",
    prazo: "24 horas",
    observacao: "Orientar o paciente a avisar uso de medicamentos."
  },
  {
    id: "exa-3",
    nome: "Ultrassom abdominal total",
    categoria: "Imagem",
    valor: "Consultar unidade",
    precisaJejum: true,
    jejumHoras: "6 a 8 horas",
    preparo: "Jejum conforme orientação da unidade. Pode exigir bexiga cheia dependendo do protocolo.",
    prazo: "Até 2 dias úteis",
    observacao: "Confirmar preparo específico antes do agendamento."
  },
  {
    id: "exa-4",
    nome: "Eletrocardiograma",
    categoria: "Cardiologia",
    valor: "Consultar unidade",
    precisaJejum: false,
    jejumHoras: "Não precisa",
    preparo: "Sem jejum. Evitar creme ou óleo no tórax no dia do exame.",
    prazo: "No mesmo dia ou conforme unidade",
    observacao: "Confirmar se precisa de laudo médico."
  }
];

let medicos = carregar(STORAGE_MEDICOS, medicosBase);
let exames = carregar(STORAGE_EXAMES, examesBase);
let medicoSelecionadoId = medicos[0]?.id || null;

function $(id) {
  return document.getElementById(id);
}

function carregar(chave, padrao) {
  try {
    const dados = JSON.parse(localStorage.getItem(chave));
    return Array.isArray(dados) ? dados : padrao;
  } catch {
    return padrao;
  }
}

function salvarMedicos() {
  localStorage.setItem(STORAGE_MEDICOS, JSON.stringify(medicos));
}

function salvarExames() {
  localStorage.setItem(STORAGE_EXAMES, JSON.stringify(exames));
}

function escapeHTML(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizar(valor) {
  return String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function gerarId(prefixo) {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function statusBadge(status) {
  const texto = normalizar(status);
  if (texto.includes("limitado")) return "orange";
  if (texto.includes("sem")) return "red";
  return "green";
}

function mostrarToast(mensagem) {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = mensagem;
  toast.classList.add("show");
  clearTimeout(mostrarToast.timer);
  mostrarToast.timer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function horariosParaTexto(horarios = []) {
  return horarios.map(h => `${h.dia || ""} | ${h.inicio || ""} | ${h.fim || ""} | ${h.sala || ""} | ${h.tipo || ""} | ${h.vagas || ""}`).join("\n");
}

function textoParaHorarios(texto) {
  return String(texto || "")
    .split("\n")
    .map(linha => linha.trim())
    .filter(Boolean)
    .map((linha) => {
      const partes = linha.split("|").map(parte => parte.trim());
      return {
        dia: partes[0] || "A confirmar",
        inicio: partes[1] || "",
        fim: partes[2] || "",
        sala: partes[3] || "",
        tipo: partes[4] || "Consulta",
        vagas: partes[5] || ""
      };
    });
}

function fecharMenu() {
  const menu = $("topbarMenu");
  const button = $("menuToggle");
  menu?.classList.remove("open");
  button?.classList.remove("open");
  button?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

function abrirAba(nome) {
  document.querySelectorAll(".tab").forEach(tab => {
    const ativa = tab.dataset.tab === nome;
    tab.classList.toggle("active", ativa);
    tab.setAttribute("aria-selected", String(ativa));
  });

  document.querySelectorAll(".tab-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === nome);
  });

  fecharMenu();

  if (window.innerWidth <= 720) {
    $(nome)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarMenu();
  iniciarAbas();
  iniciarMedicos();
  iniciarExames();
  iniciarModais();
  iniciarVoltarTopo();
  atualizarTudo();
});

function iniciarMenu() {
  const button = $("menuToggle");
  const menu = $("topbarMenu");
  if (!button || !menu) return;

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const aberto = menu.classList.toggle("open");
    button.classList.toggle("open", aberto);
    button.setAttribute("aria-expanded", String(aberto));
    document.body.classList.toggle("menu-open", aberto);
  });

  menu.addEventListener("click", event => event.stopPropagation());
  document.addEventListener("click", fecharMenu);
  window.addEventListener("resize", () => { if (window.innerWidth > 980) fecharMenu(); });
}

function iniciarAbas() {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => abrirAba(tab.dataset.tab));
  });

  document.querySelectorAll("[data-open-tab]").forEach(btn => {
    btn.addEventListener("click", () => abrirAba(btn.dataset.openTab));
  });
}

function iniciarMedicos() {
  $("btnNovoMedico")?.addEventListener("click", abrirModalMedico);
  $("btnLimparFiltroMedicos")?.addEventListener("click", limparFiltrosMedicos);
  $("buscaMedico")?.addEventListener("input", renderizarMedicos);
  $("filtroEspecialidade")?.addEventListener("change", renderizarMedicos);
  $("filtroDia")?.addEventListener("change", renderizarMedicos);
  $("formMedico")?.addEventListener("submit", salvarFormularioMedico);
}

function iniciarExames() {
  $("btnNovoExame")?.addEventListener("click", abrirModalExame);
  $("btnLimparFiltroExames")?.addEventListener("click", limparFiltrosExames);
  $("buscaExame")?.addEventListener("input", renderizarExames);
  $("filtroJejum")?.addEventListener("change", renderizarExames);
  $("filtroCategoria")?.addEventListener("change", renderizarExames);
  $("formExame")?.addEventListener("submit", salvarFormularioExame);
  $("exameJejum")?.addEventListener("change", () => {
    const horas = $("exameJejumHoras");
    if (!horas) return;
    horas.value = $("exameJejum").value === "sim" ? (horas.value === "Não precisa" ? "8 horas" : horas.value) : "Não precisa";
  });
}

function iniciarModais() {
  $("fecharModalMedicoBtn")?.addEventListener("click", fecharModalMedico);
  $("cancelarModalMedico")?.addEventListener("click", fecharModalMedico);
  $("fecharModalExameBtn")?.addEventListener("click", fecharModalExame);
  $("cancelarModalExame")?.addEventListener("click", fecharModalExame);

  $("modalMedicoOverlay")?.addEventListener("click", event => {
    if (event.target.id === "modalMedicoOverlay") fecharModalMedico();
  });

  $("modalExameOverlay")?.addEventListener("click", event => {
    if (event.target.id === "modalExameOverlay") fecharModalExame();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      fecharModalMedico();
      fecharModalExame();
      fecharMenu();
    }
  });
}

function iniciarVoltarTopo() {
  const button = $("pageBackTop");
  if (!button) return;
  const update = () => button.classList.toggle("show", window.scrollY > 420);
  window.addEventListener("scroll", update, { passive: true });
  update();
  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function atualizarTudo() {
  popularFiltros();
  atualizarResumo();
  renderizarMedicos();
  renderizarDetalheMedico();
  renderizarExames();
}

function atualizarResumo() {
  const totalHorarios = medicos.reduce((total, medico) => total + (medico.horarios?.length || 0), 0);
  $("resumoMedicos").textContent = medicos.length;
  $("resumoHorarios").textContent = totalHorarios;
  $("resumoExames").textContent = exames.length;
  $("resumoJejum").textContent = exames.filter(exame => exame.precisaJejum).length;
}

function popularFiltros() {
  const filtroEspecialidade = $("filtroEspecialidade");
  const filtroCategoria = $("filtroCategoria");

  if (filtroEspecialidade) {
    const valorAtual = filtroEspecialidade.value;
    const especialidades = [...new Set(medicos.map(m => m.especialidade).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    filtroEspecialidade.innerHTML = `<option value="">Todas</option>`;
    especialidades.forEach(item => filtroEspecialidade.add(new Option(item, item)));
    filtroEspecialidade.value = especialidades.includes(valorAtual) ? valorAtual : "";
  }

  if (filtroCategoria) {
    const valorAtual = filtroCategoria.value;
    const categorias = [...new Set(exames.map(e => e.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    filtroCategoria.innerHTML = `<option value="">Todas</option>`;
    categorias.forEach(item => filtroCategoria.add(new Option(item, item)));
    filtroCategoria.value = categorias.includes(valorAtual) ? valorAtual : "";
  }
}

function getMedicosFiltrados() {
  const busca = normalizar($("buscaMedico")?.value);
  const especialidade = $("filtroEspecialidade")?.value || "";
  const dia = $("filtroDia")?.value || "";

  return medicos.filter(medico => {
    const horariosTexto = (medico.horarios || []).map(h => `${h.dia} ${h.inicio} ${h.fim} ${h.sala} ${h.tipo} ${h.vagas}`).join(" ");
    const texto = normalizar(`${medico.nome} ${medico.especialidade} ${medico.crm} ${medico.unidade} ${medico.idade} ${medico.valor} ${medico.status} ${medico.observacao} ${horariosTexto}`);
    const atendeBusca = !busca || texto.includes(busca);
    const atendeEspecialidade = !especialidade || medico.especialidade === especialidade;
    const atendeDia = !dia || (medico.horarios || []).some(h => h.dia === dia);
    return atendeBusca && atendeEspecialidade && atendeDia;
  });
}

function renderizarMedicos() {
  const lista = $("listaMedicos");
  const vazio = $("semResultadoMedicos");
  if (!lista || !vazio) return;

  const filtrados = getMedicosFiltrados();

  lista.innerHTML = "";
  vazio.style.display = filtrados.length ? "none" : "block";

  if (!filtrados.some(m => m.id === medicoSelecionadoId)) {
    medicoSelecionadoId = filtrados[0]?.id || medicos[0]?.id || null;
  }

  filtrados.forEach(medico => {
    const horarios = medico.horarios || [];
    const dias = [...new Set(horarios.map(h => h.dia).filter(Boolean))].join(", ") || "Sem horários";
    const card = document.createElement("article");
    card.className = `doctor-item ${medico.id === medicoSelecionadoId ? "active" : ""}`;
    card.innerHTML = `
      <div class="doctor-main">
        <h3>${escapeHTML(medico.nome)}</h3>
        <p class="doctor-meta">${escapeHTML(medico.especialidade)} • ${escapeHTML(medico.crm || "CRM a confirmar")}</p>
        <div class="doctor-badges">
          <span class="badge ${statusBadge(medico.status)}">${escapeHTML(medico.status)}</span>
          <span class="badge">${escapeHTML(medico.idade)}</span>
          <span class="badge">${escapeHTML(horarios.length)} horário(s)</span>
          <span class="badge red">${escapeHTML(medico.valor || "Consultar")}</span>
        </div>
        <p class="doctor-meta">Dias: ${escapeHTML(dias)}</p>
      </div>
      <div class="doctor-actions">
        <button type="button" class="icon-btn" data-action="ver" data-id="${escapeHTML(medico.id)}">Ver</button>
        <button type="button" class="icon-btn" data-action="editar" data-id="${escapeHTML(medico.id)}">Editar</button>
        <button type="button" class="icon-btn delete" data-action="excluir" data-id="${escapeHTML(medico.id)}">Excluir</button>
      </div>
    `;
    lista.appendChild(card);
  });

  lista.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      const action = button.dataset.action;
      if (action === "ver") selecionarMedico(id);
      if (action === "editar") editarMedico(id);
      if (action === "excluir") excluirMedico(id);
    });
  });

  renderizarDetalheMedico();
}

function selecionarMedico(id) {
  medicoSelecionadoId = id;
  renderizarMedicos();
}

function renderizarDetalheMedico() {
  const detail = $("detalheMedico");
  if (!detail) return;

  const medico = medicos.find(m => m.id === medicoSelecionadoId);
  if (!medico) {
    detail.innerHTML = `<div class="empty-detail"><strong>Selecione um médico</strong><span>Os horários disponíveis aparecem aqui.</span></div>`;
    return;
  }

  const horarios = medico.horarios || [];
  const agenda = horarios.length
    ? horarios.map(h => `
      <div class="schedule-item">
        <strong>${escapeHTML(h.dia)} • ${escapeHTML(h.inicio)} às ${escapeHTML(h.fim)}</strong>
        <span>${escapeHTML(h.tipo || "Consulta")} • ${escapeHTML(h.sala || medico.unidade || "Sala a confirmar")} • ${escapeHTML(h.vagas || "Vagas a confirmar")}</span>
      </div>
    `).join("")
    : `<div class="schedule-item"><strong>Sem horário cadastrado</strong><span>Adicione horários no botão editar.</span></div>`;

  detail.innerHTML = `
    <div class="detail-head">
      <h3>${escapeHTML(medico.nome)}</h3>
      <p>${escapeHTML(medico.especialidade)} • ${escapeHTML(medico.crm || "CRM a confirmar")}</p>
    </div>
    <div class="detail-body">
      <div class="detail-line"><small>Status</small><strong>${escapeHTML(medico.status)}</strong></div>
      <div class="detail-line"><small>Unidade / sala</small><strong>${escapeHTML(medico.unidade || "A confirmar")}</strong></div>
      <div class="detail-line"><small>Idade atendida</small><strong>${escapeHTML(medico.idade)}</strong></div>
      <div class="detail-line"><small>Valor</small><strong>${escapeHTML(medico.valor || "Consultar unidade")}</strong></div>
      <div class="detail-line"><small>Observação</small><span>${escapeHTML(medico.observacao || "Sem observação")}</span></div>
      <div class="schedule-list">${agenda}</div>
    </div>
  `;
}

function abrirModalMedico() {
  $("tituloModalMedico").textContent = "Novo médico";
  $("formMedico").reset();
  $("medicoId").value = "";
  $("medicoHorarios").value = "";
  abrirModal("modalMedicoOverlay");
}

function editarMedico(id) {
  const medico = medicos.find(m => m.id === id);
  if (!medico) return;
  $("tituloModalMedico").textContent = "Editar médico";
  $("medicoId").value = medico.id;
  $("medicoNome").value = medico.nome || "";
  $("medicoEspecialidade").value = medico.especialidade || "";
  $("medicoCrm").value = medico.crm || "";
  $("medicoUnidade").value = medico.unidade || "";
  $("medicoIdade").value = medico.idade || "";
  $("medicoValor").value = medico.valor || "";
  $("medicoStatus").value = medico.status || "Atendendo";
  $("medicoObservacao").value = medico.observacao || "";
  $("medicoHorarios").value = horariosParaTexto(medico.horarios);
  abrirModal("modalMedicoOverlay");
}

function salvarFormularioMedico(event) {
  event.preventDefault();
  const id = $("medicoId").value || gerarId("med");
  const medico = {
    id,
    nome: $("medicoNome").value.trim(),
    especialidade: $("medicoEspecialidade").value.trim(),
    crm: $("medicoCrm").value.trim() || "CRM a confirmar",
    unidade: $("medicoUnidade").value.trim() || "Sala a confirmar",
    idade: $("medicoIdade").value.trim(),
    valor: $("medicoValor").value.trim() || "Consultar unidade",
    status: $("medicoStatus").value,
    observacao: $("medicoObservacao").value.trim(),
    horarios: textoParaHorarios($("medicoHorarios").value)
  };

  const index = medicos.findIndex(m => m.id === id);
  if (index >= 0) {
    medicos[index] = medico;
    mostrarToast("Médico atualizado com sucesso.");
  } else {
    medicos.push(medico);
    mostrarToast("Médico cadastrado com sucesso.");
  }

  medicoSelecionadoId = id;
  salvarMedicos();
  fecharModalMedico();
  atualizarTudo();
}

function excluirMedico(id) {
  const medico = medicos.find(m => m.id === id);
  if (!medico) return;
  if (!confirm(`Excluir ${medico.nome}?`)) return;
  medicos = medicos.filter(m => m.id !== id);
  medicoSelecionadoId = medicos[0]?.id || null;
  salvarMedicos();
  atualizarTudo();
  mostrarToast("Médico removido.");
}

function limparFiltrosMedicos() {
  $("buscaMedico").value = "";
  $("filtroEspecialidade").value = "";
  $("filtroDia").value = "";
  renderizarMedicos();
}

function renderizarExames() {
  const tbody = document.querySelector("#tabelaExames tbody");
  const vazio = $("semResultadoExames");
  if (!tbody || !vazio) return;

  const busca = normalizar($("buscaExame")?.value);
  const filtroJejum = $("filtroJejum")?.value || "";
  const categoria = $("filtroCategoria")?.value || "";

  const filtrados = exames.filter(exame => {
    const texto = normalizar(`${exame.nome} ${exame.categoria} ${exame.valor} ${exame.jejumHoras} ${exame.preparo} ${exame.prazo} ${exame.observacao}`);
    const atendeBusca = !busca || texto.includes(busca);
    const atendeJejum = !filtroJejum || (filtroJejum === "sim" ? exame.precisaJejum : !exame.precisaJejum);
    const atendeCategoria = !categoria || exame.categoria === categoria;
    return atendeBusca && atendeJejum && atendeCategoria;
  });

  tbody.innerHTML = "";
  vazio.style.display = filtrados.length ? "none" : "block";

  filtrados.forEach(exame => {
    const tr = document.createElement("tr");
    const jejumClasse = exame.precisaJejum ? "red" : "green";
    const jejumTexto = exame.precisaJejum ? `Sim • ${exame.jejumHoras}` : "Não precisa";

    tr.innerHTML = `
      <td data-label="Exame" class="exam-name"><strong>${escapeHTML(exame.nome)}</strong><span class="exam-note">${escapeHTML(exame.observacao || "")}</span></td>
      <td data-label="Categoria">${escapeHTML(exame.categoria)}</td>
      <td data-label="Valor"><span class="badge red">${escapeHTML(exame.valor)}</span></td>
      <td data-label="Jejum"><span class="badge ${jejumClasse}">${escapeHTML(jejumTexto)}</span></td>
      <td data-label="Preparo"><p class="exam-preparo">${escapeHTML(exame.preparo)}</p></td>
      <td data-label="Prazo">${escapeHTML(exame.prazo)}</td>
      <td data-label="Ações"><div class="actions-cell"><button type="button" class="icon-btn" data-exame-action="editar" data-id="${escapeHTML(exame.id)}">Editar</button><button type="button" class="icon-btn delete" data-exame-action="excluir" data-id="${escapeHTML(exame.id)}">Excluir</button></div></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("[data-exame-action]").forEach(button => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      if (button.dataset.exameAction === "editar") editarExame(id);
      if (button.dataset.exameAction === "excluir") excluirExame(id);
    });
  });
}

function abrirModalExame() {
  $("tituloModalExame").textContent = "Novo exame";
  $("formExame").reset();
  $("exameId").value = "";
  $("exameJejum").value = "nao";
  $("exameJejumHoras").value = "Não precisa";
  abrirModal("modalExameOverlay");
}

function editarExame(id) {
  const exame = exames.find(e => e.id === id);
  if (!exame) return;
  $("tituloModalExame").textContent = "Editar exame";
  $("exameId").value = exame.id;
  $("exameNome").value = exame.nome || "";
  $("exameCategoria").value = exame.categoria || "";
  $("exameValor").value = exame.valor || "";
  $("exameJejum").value = exame.precisaJejum ? "sim" : "nao";
  $("exameJejumHoras").value = exame.jejumHoras || "Não precisa";
  $("examePrazo").value = exame.prazo || "";
  $("examePreparo").value = exame.preparo || "";
  $("exameObservacao").value = exame.observacao || "";
  abrirModal("modalExameOverlay");
}

function salvarFormularioExame(event) {
  event.preventDefault();
  const id = $("exameId").value || gerarId("exa");
  const precisaJejum = $("exameJejum").value === "sim";
  const exame = {
    id,
    nome: $("exameNome").value.trim(),
    categoria: $("exameCategoria").value.trim(),
    valor: $("exameValor").value.trim(),
    precisaJejum,
    jejumHoras: precisaJejum ? ($("exameJejumHoras").value.trim() || "A confirmar") : "Não precisa",
    prazo: $("examePrazo").value.trim(),
    preparo: $("examePreparo").value.trim(),
    observacao: $("exameObservacao").value.trim()
  };

  const index = exames.findIndex(e => e.id === id);
  if (index >= 0) {
    exames[index] = exame;
    mostrarToast("Exame atualizado com sucesso.");
  } else {
    exames.push(exame);
    mostrarToast("Exame cadastrado com sucesso.");
  }

  salvarExames();
  fecharModalExame();
  atualizarTudo();
}

function excluirExame(id) {
  const exame = exames.find(e => e.id === id);
  if (!exame) return;
  if (!confirm(`Excluir ${exame.nome}?`)) return;
  exames = exames.filter(e => e.id !== id);
  salvarExames();
  atualizarTudo();
  mostrarToast("Exame removido.");
}

function limparFiltrosExames() {
  $("buscaExame").value = "";
  $("filtroJejum").value = "";
  $("filtroCategoria").value = "";
  renderizarExames();
}

function abrirModal(id) {
  const modal = $(id);
  modal?.classList.add("active");
  modal?.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function fecharModalMedico() {
  const modal = $("modalMedicoOverlay");
  modal?.classList.remove("active");
  modal?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function fecharModalExame() {
  const modal = $("modalExameOverlay");
  modal?.classList.remove("active");
  modal?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}
