const modulos = [
  {
    titulo: "Apresentação do curso",
    descricao: "Entenda a importância das boas práticas de atendimento e como elas impactam a experiência do paciente.",
    tipo: "Vídeo",
    video: "https://www.youtube.com/embed/ysz5S6PUM-U",
    concluido: false
  },
  {
    titulo: "Recepção e primeiro contato",
    descricao: "Aprenda como receber o paciente com cordialidade, atenção e postura profissional.",
    tipo: "Vídeo",
    video: "https://www.youtube.com/embed/jNQXAC9IVRw",
    concluido: false
  },
  {
    titulo: "Comunicação humanizada",
    descricao: "Veja como falar com clareza, demonstrar empatia e orientar o paciente da forma correta.",
    tipo: "Vídeo",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    concluido: false
  },
  {
    titulo: "Organização e postura",
    descricao: "Entenda como organização, agilidade e comportamento profissional fortalecem a confiança do paciente.",
    tipo: "Vídeo",
    video: "https://www.youtube.com/embed/tgbNymZ7vqY",
    concluido: false
  },
  {
    titulo: "Quiz final",
    descricao: "Responda ao quiz para validar seu aprendizado sobre boas práticas de atendimento.",
    tipo: "Quiz",
    concluido: false,
    pergunta: "Qual atitude demonstra uma boa prática de atendimento ao paciente?",
    opcoes: [
      "Responder com pressa e sem atenção",
      "Ouvir o paciente com empatia e orientar com clareza",
      "Ignorar dúvidas para agilizar o atendimento",
      "Falar de forma fria e automática"
    ],
    correta: 1
  }
];

let moduloAtual = 0;
let quizFinalizado = false;

const botoesModulo = document.querySelectorAll(".modulo-item");
const tituloModulo = document.getElementById("tituloModulo");
const descricaoModulo = document.getElementById("descricaoModulo");
const tipoConteudo = document.getElementById("tipoConteudo");
const videoFrame = document.getElementById("videoFrame");
const btnConcluirAula = document.getElementById("btnConcluirAula");
const quizCard = document.getElementById("quizCard");
const perguntaQuiz = document.getElementById("perguntaQuiz");
const quizOpcoes = document.getElementById("quizOpcoes");
const quizResultado = document.getElementById("quizResultado");
const barraGeralFill = document.getElementById("barraGeralFill");
const porcentagemCurso = document.getElementById("porcentagemCurso");
const videosConcluidos = document.getElementById("videosConcluidos");
const quizConcluido = document.getElementById("quizConcluido");
const statusCurso = document.getElementById("statusCurso");
const areaConteudo = document.getElementById("areaConteudo");
const proximoModuloBox = document.getElementById("proximoModuloBox");

function atualizarPainel() {
  const modulo = modulos[moduloAtual];

  botoesModulo.forEach((botao, index) => {
    botao.classList.toggle("active", index === moduloAtual);
  });

  tituloModulo.textContent = modulo.titulo;
  descricaoModulo.textContent = modulo.descricao;
  tipoConteudo.textContent = modulo.tipo;

  if (modulo.tipo === "Vídeo") {
    areaConteudo.classList.remove("hidden");
    quizCard.classList.add("hidden");
    videoFrame.src = modulo.video;
    btnConcluirAula.classList.remove("hidden");
  } else {
    areaConteudo.classList.add("hidden");
    quizCard.classList.remove("hidden");
    btnConcluirAula.classList.add("hidden");

    perguntaQuiz.textContent = modulo.pergunta;
    montarQuiz(modulo);
  }

  atualizarResumo();
}

function montarQuiz(modulo) {
  quizOpcoes.innerHTML = "";
  quizResultado.textContent = "";

  modulo.opcoes.forEach((texto, index) => {
    const botao = document.createElement("button");
    botao.className = "opcao";
    botao.textContent = texto;

    botao.addEventListener("click", () => {
      if (quizFinalizado) return;

      if (index === modulo.correta) {
        botao.classList.add("certa-marcada");
        quizResultado.textContent = "Resposta correta! Quiz concluído.";
        modulos[4].concluido = true;
        quizFinalizado = true;
        atualizarStatusLateral();
        atualizarResumo();
      } else {
        botao.classList.add("errada-marcada");
        quizResultado.textContent = "Resposta incorreta. Tente novamente.";
      }
    });

    quizOpcoes.appendChild(botao);
  });
}

function atualizarStatusLateral() {
  botoesModulo.forEach((botao, index) => {
    const status = botao.querySelector(".status");

    if (modulos[index].concluido) {
      status.textContent = "✓";
      status.classList.remove("pendente");
      status.classList.add("concluido");
    } else {
      status.textContent = "•";
      status.classList.remove("concluido");
      status.classList.add("pendente");
    }
  });
}

function atualizarResumo() {
  const total = modulos.length;
  const concluidos = modulos.filter(modulo => modulo.concluido).length;
  const videosTotal = modulos.filter(modulo => modulo.tipo === "Vídeo").length;
  const videosOk = modulos.filter(modulo => modulo.tipo === "Vídeo" && modulo.concluido).length;
  const quizOk = modulos.filter(modulo => modulo.tipo === "Quiz" && modulo.concluido).length;

  const porcentagem = Math.round((concluidos / total) * 100);

  barraGeralFill.style.width = `${porcentagem}%`;
  porcentagemCurso.textContent = `${porcentagem}%`;

  videosConcluidos.textContent = `${videosOk}/${videosTotal}`;
  quizConcluido.textContent = `${quizOk}/1`;

  statusCurso.textContent = porcentagem === 100 ? "Concluído" : "Em andamento";
}

btnConcluirAula.addEventListener("click", () => {
  if (!modulos[moduloAtual].concluido) {
    modulos[moduloAtual].concluido = true;
    atualizarStatusLateral();
    atualizarResumo();
  }

  const proximo = moduloAtual + 1;
  if (proximo < modulos.length) {
    moduloAtual = proximo;
    atualizarPainel();
  }
});

botoesModulo.forEach((botao, index) => {
  botao.addEventListener("click", () => {
    moduloAtual = index;
    atualizarPainel();
  });
});

atualizarStatusLateral();
atualizarPainel();

const cursoBackToTop = document.getElementById("cursoBackToTop");
if (cursoBackToTop) {
  function updateCursoBackToTop() {
    cursoBackToTop.classList.toggle("show", window.scrollY > 420);
  }

  window.addEventListener("scroll", updateCursoBackToTop, { passive: true });
  updateCursoBackToTop();

  cursoBackToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
