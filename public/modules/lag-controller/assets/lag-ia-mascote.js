/* ==================================================
   LAG AI - CHAT HUMANIZADO SEM PET
   Substitua o arquivo assets/lag-ia-mascote.js por este conteúdo.
================================================== */

const chat = document.getElementById("lagWolfChat");
const closeBtn = document.getElementById("lagWolfClose");
const form = document.getElementById("lagWolfForm");
const input = document.getElementById("lagWolfInput");
const messages = document.getElementById("lagWolfMessages");
const speech = document.getElementById("lagWolfSpeech");
const openBtn = document.querySelector("#lagWolfButton, .lag-wolf-button");

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function addMessage(type, html) {
  if (!messages) return null;

  const div = document.createElement("div");
  div.className = `lag-wolf-message ${type}`;
  div.innerHTML = html;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;

  return div;
}

function user(text) {
  addMessage("user", escapeHTML(text));
}

function bot(text) {
  if (!messages) return;

  const typing = addMessage(
    "bot",
    `<span class="lag-wolf-typing"><i></i><i></i><i></i></span>`
  );

  const delay = Math.min(900, Math.max(350, String(text).length * 6));

  setTimeout(() => {
    if (typing) {
      typing.innerHTML = text;
      messages.scrollTop = messages.scrollHeight;
    }
  }, delay);
}

function dashboardDisponivel() {
  return typeof getTotals === "function" && Array.isArray(window.doctors || doctors);
}

function totalGeral() {
  if (typeof getTotals !== "function" || typeof doctors === "undefined") {
    return "Ainda não consegui acessar os dados do dashboard. Confira se o arquivo <b>dados-medicos.js</b> está carregando antes do chat.";
  }

  const total = getTotals(doctors);

  return `
    <b>Resumo geral do dashboard</b> 📊<br><br>
    Médicos ativos: <b>${total.medicos}</b><br>
    Consultas realizadas: <b>${total.consultas}</b><br>
    Arrecadação: <b>${formatMoney(total.valor)}</b><br>
    Faltas registradas: <b>${total.faltas}</b><br>
    Ticket médio: <b>${formatMoney(total.ticketMedio)}</b><br><br>
    <small>Posso também separar isso por ranking, faltas ou arrecadação.</small>
  `;
}

function rankingMedicos() {
  if (typeof doctors === "undefined" || !doctors.length) {
    return "Ainda não existem médicos cadastrados. Você pode clicar em <b>Cadastro</b> para começar.";
  }

  const agrupado = {};

  doctors.forEach((d) => {
    if (!agrupado[d.nome]) {
      agrupado[d.nome] = {
        nome: d.nome,
        consultas: 0,
        valor: 0,
        faltas: 0
      };
    }

    agrupado[d.nome].consultas += Number(d.consultas || 0);
    agrupado[d.nome].valor += Number(d.valor || 0);
    agrupado[d.nome].faltas += Number(d.faltas || 0);
  });

  const linhas = Object.values(agrupado)
    .sort((a, b) => b.consultas - a.consultas)
    .slice(0, 5)
    .map((d, i) => `${i + 1}º <b>${d.nome}</b><br>${d.consultas} consultas, ${formatMoney(d.valor)} arrecadados`)
    .join("<br><br>");

  return `<b>Ranking de médicos por consultas</b> 🏆<br><br>${linhas}`;
}

function abrirCadastro() {
  if (typeof openPanel === "function") {
    openPanel();
    return "Pronto, abri o painel de cadastro para você. Pode lançar os dados do médico por lá. 🩺";
  }

  const btn = document.getElementById("openDoctorPanel");

  if (btn) {
    btn.click();
    return "Pronto, abri o painel de cadastro para você. 🩺";
  }

  return "Procurei o painel de cadastro, mas não encontrei o botão na página.";
}

function extrairCadastro(texto) {
  const nome = texto.match(/dr\.?\s?[a-záéíóúâêôãõç\s]+|dra\.?\s?[a-záéíóúâêôãõç\s]+/i)?.[0];
  const consultas = texto.match(/(\d+)\s*consultas?/i)?.[1];
  const faltas = texto.match(/(\d+)\s*faltas?/i)?.[1];
  const valor = texto.match(/r\$?\s?([\d.,]+)/i)?.[1];
  const mes = texto.match(/janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro/i)?.[0];

  const especialidades = [
    "Clínico Geral",
    "Neurologista",
    "Oftalmologista",
    "Urologista",
    "Dermatologista",
    "Endocrinologista",
    "Psicologia",
    "Psicólogo",
    "Pediatria",
    "Pediatra",
    "Cardiologia",
    "Ortopedia",
    "Fisioterapia",
    "Ginecologia",
    "Nutrição"
  ];

  const especialidadeEncontrada = especialidades.find((esp) =>
    normalizeText(texto).includes(normalizeText(esp))
  );

  if (!nome || !consultas || !valor) return null;

  return {
    id: crypto.randomUUID(),
    nome: nome.trim().replace(/\s+/g, " "),
    especialidade: especialidadeEncontrada || "Outras",
    periodo: typeof normalizePeriodo === "function" ? normalizePeriodo(mes || "Maio de 2026") : "Maio de 2026",
    consultas: Number(consultas),
    valor: Number(String(valor).replace(".", "").replace(",", ".")),
    faltas: Number(faltas || 0)
  };
}

function cadastrarPorTexto(texto) {
  if (typeof doctors === "undefined") {
    return "Não consegui acessar a lista de médicos agora. Confira se o arquivo principal do dashboard carregou primeiro.";
  }

  const novo = extrairCadastro(texto);

  if (!novo) {
    return `
      Consigo cadastrar por texto também. Use assim:<br><br>
      <b>Adicione Dra. Ana Souza, Dermatologista, Maio, 80 consultas, R$ 12000, 4 faltas</b><br><br>
      Ou clique em <b>Cadastro</b> que eu abro o painel para você.
    `;
  }

  doctors.push(novo);

  if (typeof saveDoctors === "function") saveDoctors();
  if (typeof renderAll === "function") renderAll();
  if (typeof animateNumbers === "function") animateNumbers();
  if (typeof pulseCards === "function") pulseCards();

  return `
    Médico cadastrado com sucesso. ✅<br><br>
    <b>${novo.nome}</b><br>
    Especialidade: ${novo.especialidade}<br>
    Mês: ${novo.periodo}<br>
    Consultas: ${novo.consultas}<br>
    Valor: ${formatMoney(novo.valor)}<br>
    Faltas: ${novo.faltas}<br><br>
    <small>Já atualizei o dashboard para refletir esse lançamento.</small>
  `;
}

function saudacao() {
  return `
    Oi! Que bom te ver por aqui. 👋<br><br>
    Eu sou a <b>LAG AI</b>, sua assistente do dashboard. Posso te ajudar a entender os números, mostrar ranking, analisar faltas, ver arrecadação ou abrir o cadastro de médicos.<br><br>
    <small>Experimente perguntar: “como está o resumo?” ou “quem está em primeiro no ranking?”</small>
  `;
}

function ajuda() {
  return `
    Eu posso ajudar nestas frentes:<br><br>
    <b>Resumo:</b> visão geral do dashboard<br>
    <b>Ranking:</b> médicos com mais consultas<br>
    <b>Faltas:</b> total e índice de ausência<br>
    <b>Arrecadação:</b> valor total e ticket médio<br>
    <b>Cadastro:</b> abrir painel ou lançar por texto<br><br>
    <small>Exemplo: “Adicione Dr. Carlos, Cardiologia, Maio, 100 consultas, R$ 14000, 5 faltas”.</small>
  `;
}

function respostaIA(texto) {
  const msg = normalizeText(texto);

  if (/^(oi|ola|opa|bom dia|boa tarde|boa noite|e ai|eae|hey|hello|hi)\b/.test(msg)) {
    return saudacao();
  }

  if (msg.includes("tudo bem") || msg.includes("como voce esta") || msg.includes("como vc esta")) {
    return "Estou bem e com os circuitos alinhados. 🤖✨ E você? Quer que eu olhe algum número do dashboard agora?";
  }

  if (msg.includes("obrigado") || msg.includes("obrigada") || msg.includes("valeu")) {
    return "Por nada! Sempre que quiser, eu posso olhar os dados com você sem bagunçar a planilha do universo. 🧾✨";
  }

  if (msg.includes("tchau") || msg.includes("ate mais") || msg.includes("até mais")) {
    return "Combinado. Vou ficar por aqui, em modo sentinela dos indicadores. Até mais! 👋";
  }

  if (msg.includes("quem e voce") || msg.includes("quem é você") || msg.includes("o que voce faz") || msg.includes("ajuda")) {
    return ajuda();
  }

  if (msg.includes("abrir cadastro") || msg.includes("abrir painel") || msg === "cadastro") {
    return abrirCadastro();
  }

  if (msg.includes("resumo") || msg.includes("dashboard") || msg.includes("resultado") || msg.includes("geral")) {
    return totalGeral();
  }

  if (msg.includes("ranking") || msg.includes("melhor medico") || msg.includes("melhor médico") || msg.includes("mais consultas") || msg.includes("primeiro")) {
    return rankingMedicos();
  }

  if (msg.includes("cadastrar") || msg.includes("adicionar") || msg.includes("lancar") || msg.includes("lançar")) {
    return cadastrarPorTexto(texto);
  }

  if (msg.includes("faltas") || msg.includes("ausencia") || msg.includes("ausência")) {
    const total = getTotals(doctors);
    return `Foram registradas <b>${total.faltas}</b> faltas. O índice de faltas está em <b>${total.indiceFaltas}%</b>.`;
  }

  if (msg.includes("valor") || msg.includes("arrecadacao") || msg.includes("arrecadação") || msg.includes("dinheiro") || msg.includes("faturamento") || msg.includes("receita")) {
    const total = getTotals(doctors);
    return `A arrecadação total está em <b>${formatMoney(total.valor)}</b>. O ticket médio é de <b>${formatMoney(total.ticketMedio)}</b>.`;
  }

  if (msg.includes("medicos") || msg.includes("médicos")) {
    const total = getTotals(doctors);
    return `Hoje o dashboard tem <b>${total.medicos}</b> médicos ativos e <b>${doctors.length}</b> lançamentos cadastrados.`;
  }

  return `
    Entendi. Ainda estou aprendendo o jeito que você pergunta, mas consigo ajudar com <b>resumo</b>, <b>ranking</b>, <b>faltas</b>, <b>arrecadação</b> e <b>cadastro</b>.<br><br>
    <small>Você pode escrever: “Oi”, “mostre o resumo”, “mostrar ranking” ou “abrir cadastro”.</small>
  `;
}

function enviarMensagem(texto) {
  const mensagem = String(texto || "").trim();
  if (!mensagem) return;

  user(mensagem);

  setTimeout(() => {
    bot(respostaIA(mensagem));
  }, 180);
}

if (openBtn && chat) {
  openBtn.addEventListener("click", () => {
    const isActive = chat.classList.toggle("active");
    chat.setAttribute("aria-hidden", String(!isActive));

    if (speech) {
      speech.textContent = "Pode perguntar, eu cuido dos números.";
    }

    if (isActive && input) {
      setTimeout(() => input.focus(), 220);
    }
  });
}

if (closeBtn && chat) {
  closeBtn.addEventListener("click", () => {
    chat.classList.remove("active");
    chat.setAttribute("aria-hidden", "true");
  });
}

if (form && input) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const texto = input.value.trim();
    if (!texto) return;

    input.value = "";
    enviarMensagem(texto);
  });
}

document.querySelectorAll("[data-lag-wolf-action]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.lagWolfAction;

    const prompts = {
      resumo: "mostre o resumo",
      ranking: "mostrar ranking",
      cadastro: "abrir cadastro"
    };

    enviarMensagem(prompts[action] || btn.textContent.trim());
  });
});
