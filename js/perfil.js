import { auth, db } from "./firebase-config.js";
import {
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById("profileForm");
const nomeCompleto = document.getElementById("nomeCompleto");
const telefone = document.getElementById("telefone");
const cargo = document.getElementById("cargo");
const setor = document.getElementById("setor");
const cidade = document.getElementById("cidade");
const bio = document.getElementById("bio");
const fotoInput = document.getElementById("fotoInput");
const capaInput = document.getElementById("capaInput");
const avatarPreview = document.getElementById("avatarPreview");
const coverPreview = document.getElementById("coverPreview");
const profileTitle = document.getElementById("profileTitle");
const profileEmail = document.getElementById("profileEmail");
const rolePill = document.getElementById("rolePill");
const message = document.getElementById("profileMessage");
const doctorContractProfileLink = document.getElementById("doctorContractProfileLink");
const copyDoctorContractProfileLink = document.getElementById("copyDoctorContractProfileLink");
const openDoctorContractProfileLink = document.getElementById("openDoctorContractProfileLink");

let fotoBase64 = "";
let capaBase64 = "";

function prepararLinkContratoMedico() {
  if (!doctorContractProfileLink) return;
  const link = new URL("cadastro-medico.html", window.location.href).href;
  doctorContractProfileLink.value = link;
  if (openDoctorContractProfileLink) openDoctorContractProfileLink.href = link;
}

async function copiarLinkContratoMedico() {
  const link = doctorContractProfileLink?.value || new URL("cadastro-medico.html", window.location.href).href;
  try {
    await navigator.clipboard.writeText(link);
    setMessage("Link do contrato médico copiado.", "sucesso");
  } catch (erro) {
    doctorContractProfileLink?.select();
    document.execCommand("copy");
    setMessage("Link do contrato médico copiado.", "sucesso");
  }
}

function setMessage(texto, tipo = "") {
  message.textContent = texto;
  message.className = "profile-message" + (tipo ? ` ${tipo}` : "");
}

function preencherPerfil(usuario) {
  nomeCompleto.value = usuario.nomeCompleto || "";
  telefone.value = usuario.telefone || "";
  cargo.value = usuario.cargo || "";
  setor.value = usuario.setor || "";
  cidade.value = usuario.cidade || localStorage.getItem("amorSaudeCidadeSelecionada") || "Cerquilho";
  bio.value = usuario.bio || "";
  profileTitle.textContent = usuario.nomeCompleto || "Meu perfil";
  profileEmail.textContent = usuario.email || "";
  rolePill.textContent = usuario.nivelAcesso || "colaborador";

  if (usuario.foto) {
    fotoBase64 = usuario.foto;
    avatarPreview.src = usuario.foto;
  }

  if (usuario.capa) {
    capaBase64 = usuario.capa;
    coverPreview.style.backgroundImage = `linear-gradient(rgba(0,0,0,.10), rgba(0,0,0,.10)), url(${usuario.capa})`;
  }
}

function imageToBase64(file, maxWidth = 900, quality = 0.78) {
  return new Promise((resolve, reject) => {
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
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

fotoInput.addEventListener("change", async () => {
  const file = fotoInput.files?.[0];
  if (!file) return;
  fotoBase64 = await imageToBase64(file, 500, 0.78);
  avatarPreview.src = fotoBase64;
});

capaInput.addEventListener("change", async () => {
  const file = capaInput.files?.[0];
  if (!file) return;
  capaBase64 = await imageToBase64(file, 1200, 0.72);
  coverPreview.style.backgroundImage = `linear-gradient(rgba(0,0,0,.10), rgba(0,0,0,.10)), url(${capaBase64})`;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!auth.currentUser) {
    setMessage("Sessão expirada. Entre novamente.", "erro");
    return;
  }

  const payload = {
    nomeCompleto: nomeCompleto.value.trim(),
    telefone: telefone.value.trim(),
    cargo: cargo.value.trim(),
    setor: setor.value.trim(),
    cidade: cidade.value,
    bio: bio.value.trim(),
    foto: fotoBase64,
    capa: capaBase64,
    updatedAt: serverTimestamp()
  };

  const size = new Blob([JSON.stringify(payload)]).size;
  if (size > 900000) {
    setMessage("As imagens ficaram grandes demais. Escolha imagens mais leves.", "erro");
    return;
  }

  try {
    setMessage("Salvando perfil...");
    await updateDoc(doc(db, "usuarios", auth.currentUser.uid), payload);
    localStorage.setItem("amorSaudeCidadeSelecionada", payload.cidade);
    window.usuarioLogado = { ...(window.usuarioLogado || {}), ...payload };
    profileTitle.textContent = payload.nomeCompleto || "Meu perfil";
    setMessage("Perfil salvo com sucesso.", "sucesso");
  } catch (erro) {
    console.error("Erro ao salvar perfil:", erro);
    setMessage("Não foi possível salvar. Publique as novas regras do Firestore.", "erro");
  }
});

prepararLinkContratoMedico();
copyDoctorContractProfileLink?.addEventListener("click", copiarLinkContratoMedico);

window.addEventListener("usuario-carregado", (event) => preencherPerfil(event.detail));

if (window.usuarioLogado) {
  preencherPerfil(window.usuarioLogado);
}
