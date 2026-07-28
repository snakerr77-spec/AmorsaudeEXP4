const CIDADES_PERFIL = ["Embu das Artes", "Itapeva", "Tatui", "Cerquilho"];

const $ = (id) => document.getElementById(id);

const form = $("profileForm");
const nomeCompleto = $("nomeCompleto");
const telefone = $("telefone");
const cargo = $("cargo");
const setor = $("setor");
const cidade = $("cidade");
const bio = $("bio");
const fotoInput = $("fotoInput");
const capaInput = $("capaInput");
const avatarPreview = $("avatarPreview");
const coverPreview = $("coverPreview");
const profileTitle = $("profileTitle");
const profileEmail = $("profileEmail");
const rolePill = $("rolePill");
const message = $("profileMessage");

const doctorContractProfileLink = $("doctorContractProfileLink");
const copyDoctorContractProfileLink = $("copyDoctorContractProfileLink");
const openDoctorContractProfileLink = $("openDoctorContractProfileLink");

let usuarioAtual = null;
let fotoBase64 = "";
let capaBase64 = "";

function normalizarCidadePerfil(valor) {
  const cidadeTratada = String(valor || "").trim();
  if (cidadeTratada === "Tatuí") return "Tatui";
  return CIDADES_PERFIL.includes(cidadeTratada) ? cidadeTratada : "Cerquilho";
}

function normalizarNivelPerfil(valor) {
  const nivel = String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

  const mapa = {
    admin: "admin",
    administrador: "admin",
    adm: "admin",
    financeiro: "financeiro",
    financa: "financeiro",
    financas: "financeiro",
    gerencia: "gerencia",
    gerente: "gerencia",
    cdt: "cdt",
    recepcao: "recepcao",
    recepcionista: "recepcao",
    medico: "medico",
    medica: "medico",
    colaborador: "colaborador",
    colaboradora: "colaborador"
  };

  return mapa[nivel] || nivel || "colaborador";
}

function rotuloNivelPerfil(valor) {
  const mapa = {
    admin: "Admin",
    financeiro: "Financeiro",
    gerencia: "Gerência",
    cdt: "CDT",
    recepcao: "Recepção",
    medico: "Médico",
    colaborador: "Colaborador"
  };

  return mapa[normalizarNivelPerfil(valor)] || "Colaborador";
}

function primeiroTexto(...valores) {
  for (const valor of valores) {
    const texto = String(valor || "").trim();
    if (texto) return texto;
  }
  return "";
}

function setMessage(texto, tipo = "") {
  if (!message) return;

  message.textContent = texto || "";
  message.className = "profile-message";

  if (tipo) {
    message.classList.add(tipo);
  }
}

function lerUsuarioLocal() {
  const chaves = ["amor_usuario", "amorSaudeUsuario", "usuarioLogado"];

  for (const chave of chaves) {
    const raw = localStorage.getItem(chave);

    if (!raw) continue;

    try {
      const usuario = JSON.parse(raw);
      if (usuario && typeof usuario === "object") return usuario;
    } catch {
      continue;
    }
  }

  return null;
}

function salvarUsuarioLocal(usuario) {
  if (!usuario) return null;

  const anterior = lerUsuarioLocal() || {};
  const usuarioFinal = {
    ...anterior,
    ...usuario
  };

  const nome = primeiroTexto(
    usuarioFinal.nomeCompleto,
    usuarioFinal.nome_completo,
    usuarioFinal.nome,
    usuarioFinal.name,
    usuarioFinal.email
  );

  const nivel = normalizarNivelPerfil(
    usuarioFinal.nivelAcesso || usuarioFinal.nivel_acesso
  );

  const cidadeFinal = normalizarCidadePerfil(
    usuarioFinal.cidade ||
      localStorage.getItem("amorSaudeCidadeSelecionada") ||
      localStorage.getItem("amor_cidade") ||
      "Cerquilho"
  );

  usuarioFinal.nomeCompleto = nome;
  usuarioFinal.nome_completo = nome;
  usuarioFinal.nome = nome;
  usuarioFinal.nivelAcesso = nivel;
  usuarioFinal.nivel_acesso = nivel;
  usuarioFinal.cidade = cidadeFinal;
  usuarioFinal.authProvider = usuarioFinal.authProvider || "cloudflare-d1";

  localStorage.setItem("amor_usuario", JSON.stringify(usuarioFinal));
  localStorage.setItem("amorSaudeUsuario", JSON.stringify(usuarioFinal));
  localStorage.setItem("usuarioLogado", JSON.stringify(usuarioFinal));

  localStorage.setItem("amor_nivel_acesso", nivel);
  localStorage.setItem("nivelAcesso", nivel);

  localStorage.setItem("amor_cidade", cidadeFinal);
  localStorage.setItem("cidadeSelecionada", cidadeFinal);
  localStorage.setItem("amorSaudeCidadeSelecionada", cidadeFinal);

  if (usuarioFinal.id) {
    localStorage.setItem("usuarioId", usuarioFinal.id);
  }

  if (usuarioFinal.email) {
    localStorage.setItem("amor_email", usuarioFinal.email);
    localStorage.setItem("usuarioEmail", usuarioFinal.email);
  }

  localStorage.setItem("usuarioNome", nome || "");
  localStorage.setItem("usuarioCargo", usuarioFinal.cargo || "");
  localStorage.setItem("usuarioSetor", usuarioFinal.setor || "");

  window.usuarioLogado = usuarioFinal;
  usuarioAtual = usuarioFinal;

  return usuarioFinal;
}

function atualizarTextosGlobais(usuario) {
  if (!usuario) return;

  const nome = primeiroTexto(
    usuario.nomeCompleto,
    usuario.nome_completo,
    usuario.nome,
    usuario.name,
    usuario.email,
    "Usuário"
  );

  const email = primeiroTexto(usuario.email);
  const nivel = normalizarNivelPerfil(usuario.nivelAcesso || usuario.nivel_acesso);
  const cidadeFinal = normalizarCidadePerfil(usuario.cidade);

  document.querySelectorAll("[data-user-name]").forEach((el) => {
    el.textContent = nome;
  });

  document.querySelectorAll("[data-user-email]").forEach((el) => {
    el.textContent = email;
  });

  document.querySelectorAll("[data-user-role]").forEach((el) => {
    el.textContent = rotuloNivelPerfil(nivel);
  });

  document.querySelectorAll("[data-user-city]").forEach((el) => {
    el.textContent = cidadeFinal;
  });

  document.querySelectorAll("[data-city-select]").forEach((select) => {
    select.value = cidadeFinal;
  });
}

function preencherPerfil(usuarioRecebido) {
  const usuario = salvarUsuarioLocal(usuarioRecebido || lerUsuarioLocal() || {});
  if (!usuario) return;

  const nome = primeiroTexto(
    usuario.nomeCompleto,
    usuario.nome_completo,
    usuario.nome,
    usuario.name
  );

  const email = primeiroTexto(usuario.email);
  const nivel = normalizarNivelPerfil(usuario.nivelAcesso || usuario.nivel_acesso);
  const cidadeFinal = normalizarCidadePerfil(usuario.cidade);

  if (nomeCompleto) nomeCompleto.value = nome;
  if (telefone) telefone.value = usuario.telefone || "";
  if (cargo) cargo.value = usuario.cargo || "";
  if (setor) setor.value = usuario.setor || "";
  if (cidade) cidade.value = cidadeFinal;
  if (bio) bio.value = usuario.bio || "";

  if (profileTitle) profileTitle.textContent = nome || "Meu perfil";
  if (profileEmail) profileEmail.textContent = email || "";
  if (rolePill) rolePill.textContent = rotuloNivelPerfil(nivel);

  if (usuario.foto) {
    fotoBase64 = usuario.foto;
    if (avatarPreview) avatarPreview.src = usuario.foto;
  }

  if (usuario.capa) {
    capaBase64 = usuario.capa;
    if (coverPreview) {
      coverPreview.style.backgroundImage =
        `linear-gradient(rgba(0,0,0,.10), rgba(0,0,0,.10)), url(${usuario.capa})`;
    }
  }

  atualizarTextosGlobais(usuario);
}

function prepararLinkContratoMedico() {
  if (!doctorContractProfileLink) return;

  const link = new URL("cadastro-medico.html", window.location.href).href;

  doctorContractProfileLink.value = link;

  if (openDoctorContractProfileLink) {
    openDoctorContractProfileLink.href = link;
  }
}

async function copiarLinkContratoMedico() {
  const link =
    doctorContractProfileLink?.value ||
    new URL("cadastro-medico.html", window.location.href).href;

  try {
    await navigator.clipboard.writeText(link);
    setMessage("Link do contrato médico copiado.", "sucesso");
  } catch {
    doctorContractProfileLink?.select();
    document.execCommand("copy");
    setMessage("Link do contrato médico copiado.", "sucesso");
  }
}

function imageToBase64(file, maxWidth = 900, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Nenhum arquivo selecionado."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");

        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      img.onerror = () => reject(new Error("Não consegui carregar a imagem."));
      img.src = reader.result;
    };

    reader.onerror = () => reject(new Error("Não consegui ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

async function atualizarUsuarioNaApi(payloadCompleto, payloadSeguro) {
  if (!window.AmorSaudeAPI || typeof window.AmorSaudeAPI.apiFetch !== "function") {
    throw new Error("API Cloudflare não carregada nesta página.");
  }

  const usuario = usuarioAtual || lerUsuarioLocal() || {};
  const idsPossiveis = [
    usuario.id,
    localStorage.getItem("usuarioId"),
    usuario.uid,
    usuario.email,
    localStorage.getItem("amor_email"),
    localStorage.getItem("usuarioEmail")
  ]
    .map((valor) => String(valor || "").trim())
    .filter(Boolean);

  const idsUnicos = [...new Set(idsPossiveis)];

  if (!idsUnicos.length) {
    throw new Error("Não encontrei o ID do usuário para salvar.");
  }

  let ultimoErro = null;

  for (const id of idsUnicos) {
    try {
      return await window.AmorSaudeAPI.apiFetch(
        `/api/usuarios/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          body: JSON.stringify(payloadCompleto)
        }
      );
    } catch (erroCompleto) {
      ultimoErro = erroCompleto;

      const mensagemErro = String(erroCompleto?.message || "").toLowerCase();
      const pareceErroDeColuna =
        mensagemErro.includes("column") ||
        mensagemErro.includes("coluna") ||
        mensagemErro.includes("no such") ||
        mensagemErro.includes("unknown");

      if (!pareceErroDeColuna) continue;

      try {
        return await window.AmorSaudeAPI.apiFetch(
          `/api/usuarios/${encodeURIComponent(id)}`,
          {
            method: "PUT",
            body: JSON.stringify(payloadSeguro)
          }
        );
      } catch (erroSeguro) {
        ultimoErro = erroSeguro;
      }
    }
  }

  throw ultimoErro || new Error("Não consegui atualizar o usuário.");
}

async function recarregarUsuarioDaApi() {
  if (!window.AmorSaudeAPI || typeof window.AmorSaudeAPI.me !== "function") {
    return null;
  }

  try {
    const resposta = await window.AmorSaudeAPI.me();

    if (resposta?.usuario) {
      return salvarUsuarioLocal(resposta.usuario);
    }
  } catch (erro) {
    console.warn("Não consegui recarregar usuário pela API:", erro);
  }

  return null;
}

fotoInput?.addEventListener("change", async () => {
  const file = fotoInput.files?.[0];
  if (!file) return;

  try {
    setMessage("Preparando foto...");
    fotoBase64 = await imageToBase64(file, 500, 0.76);

    if (avatarPreview) {
      avatarPreview.src = fotoBase64;
    }

    setMessage("Foto pronta para salvar.", "sucesso");
  } catch (erro) {
    console.error("Erro ao preparar foto:", erro);
    setMessage("Não consegui preparar essa foto.", "erro");
  }
});

capaInput?.addEventListener("change", async () => {
  const file = capaInput.files?.[0];
  if (!file) return;

  try {
    setMessage("Preparando capa...");
    capaBase64 = await imageToBase64(file, 1200, 0.70);

    if (coverPreview) {
      coverPreview.style.backgroundImage =
        `linear-gradient(rgba(0,0,0,.10), rgba(0,0,0,.10)), url(${capaBase64})`;
    }

    setMessage("Capa pronta para salvar.", "sucesso");
  } catch (erro) {
    console.error("Erro ao preparar capa:", erro);
    setMessage("Não consegui preparar essa capa.", "erro");
  }
});

cidade?.addEventListener("change", () => {
  const usuario = usuarioAtual || lerUsuarioLocal() || {};
  const cidadeFinal = normalizarCidadePerfil(cidade.value);

  const atualizado = salvarUsuarioLocal({
    ...usuario,
    cidade: cidadeFinal
  });

  atualizarTextosGlobais(atualizado);
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const botaoSalvar = form.querySelector("button[type='submit'], .save-profile");

  const nomeFinal = primeiroTexto(nomeCompleto?.value);
  const telefoneFinal = primeiroTexto(telefone?.value);
  const cargoFinal = primeiroTexto(cargo?.value);
  const setorFinal = primeiroTexto(setor?.value);
  const cidadeFinal = normalizarCidadePerfil(cidade?.value);
  const bioFinal = primeiroTexto(bio?.value);

  if (!nomeFinal) {
    setMessage("Digite o nome completo antes de salvar.", "erro");
    nomeCompleto?.focus();
    return;
  }

  const payloadLocal = {
    ...(usuarioAtual || lerUsuarioLocal() || {}),
    nome: nomeFinal,
    nomeCompleto: nomeFinal,
    nome_completo: nomeFinal,
    telefone: telefoneFinal,
    cargo: cargoFinal,
    setor: setorFinal,
    cidade: cidadeFinal,
    bio: bioFinal,
    foto: fotoBase64,
    capa: capaBase64,
    updatedAt: new Date().toISOString()
  };

  const payloadCompletoApi = {
    nome: nomeFinal,
    nomeCompleto: nomeFinal,
    nome_completo: nomeFinal,
    telefone: telefoneFinal,
    cargo: cargoFinal,
    setor: setorFinal,
    cidade: cidadeFinal,
    bio: bioFinal,
    foto: fotoBase64,
    capa: capaBase64
  };

  const payloadSeguroApi = {
    nome: nomeFinal,
    telefone: telefoneFinal,
    cargo: cargoFinal,
    setor: setorFinal,
    cidade: cidadeFinal
  };

  const tamanhoPayload = new Blob([JSON.stringify(payloadCompletoApi)]).size;

  if (tamanhoPayload > 900000) {
    setMessage(
      "As imagens ficaram grandes demais. Escolha imagens mais leves.",
      "erro"
    );
    return;
  }

  try {
    if (botaoSalvar) {
      botaoSalvar.disabled = true;
      botaoSalvar.dataset.textoOriginal =
        botaoSalvar.dataset.textoOriginal || botaoSalvar.textContent;
      botaoSalvar.textContent = "Salvando...";
    }

    setMessage("Salvando perfil na Cloudflare...");

    await atualizarUsuarioNaApi(payloadCompletoApi, payloadSeguroApi);

    salvarUsuarioLocal(payloadLocal);

    const usuarioAtualizadoApi = await recarregarUsuarioDaApi();

    preencherPerfil({
      ...payloadLocal,
      ...(usuarioAtualizadoApi || {})
    });

    setMessage("Perfil salvo com sucesso.", "sucesso");
  } catch (erro) {
    console.error("Erro ao salvar perfil:", erro);

    salvarUsuarioLocal(payloadLocal);
    preencherPerfil(payloadLocal);

    setMessage(
      "Salvei nesta tela, mas a API não confirmou a atualização. Veja o Console para o erro.",
      "erro"
    );
  } finally {
    if (botaoSalvar) {
      botaoSalvar.disabled = false;
      botaoSalvar.textContent =
        botaoSalvar.dataset.textoOriginal || "Salvar perfil";
    }
  }
});

prepararLinkContratoMedico();
copyDoctorContractProfileLink?.addEventListener("click", copiarLinkContratoMedico);

window.addEventListener("usuario-carregado", (event) => {
  preencherPerfil(event.detail);
});

document.addEventListener("DOMContentLoaded", () => {
  const usuarioLocal = window.usuarioLogado || lerUsuarioLocal();

  if (usuarioLocal) {
    preencherPerfil(usuarioLocal);
  } else {
    setMessage("Carregando dados do usuário...");
  }
});

if (window.usuarioLogado || lerUsuarioLocal()) {
  preencherPerfil(window.usuarioLogado || lerUsuarioLocal());
}
