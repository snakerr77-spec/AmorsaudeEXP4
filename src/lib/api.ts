import type { ApiResponse, LagUser, MedicalRecord } from "../types";

const API_ORIGIN = window.location.protocol === "file:" ? "http://localhost:8787" : window.location.origin;

function storedToken(): string {
  return localStorage.getItem("amor_token") || "";
}

function storedEmail(): string {
  return localStorage.getItem("amor_email") || localStorage.getItem("usuarioEmail") || "";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_ORIGIN}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${storedToken()}`,
      "x-user-email": storedEmail(),
      ...(options.headers || {})
    }
  });

  let payload: ApiResponse<T> = {};
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.erro || payload.detalhe || "Não foi possível concluir a solicitação.");
  }

  return payload as T;
}

export async function getCurrentUser(): Promise<LagUser> {
  const payload = await request<ApiResponse<LagUser>>("/api/me");
  if (!payload.usuario) throw new Error("Sessão inválida.");
  return payload.usuario;
}

export async function logout(): Promise<void> {
  try {
    await request("/api/auth/logout", { method: "POST" });
  } catch {
    // A sessão local também será removida mesmo se o servidor estiver indisponível.
  }
  clearSession();
}

export function clearSession(): void {
  [
    "amor_token",
    "amor_token_expira_em",
    "amor_email",
    "usuarioEmail",
    "amor_usuario",
    "amorSaudeUsuario",
    "usuarioLogado",
    "amor_nivel_acesso",
    "nivelAcesso",
    "amorSaudeLogado",
    "isLoggedIn",
    "usuarioId",
    "usuarioNome",
    "usuarioCargo",
    "usuarioSetor"
  ].forEach((key) => localStorage.removeItem(key));
  sessionStorage.removeItem("amorSaudeSessaoAtiva");
}

export function getStoredUser(): LagUser | null {
  const keys = ["amor_usuario", "amorSaudeUsuario", "usuarioLogado"];
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      return JSON.parse(raw) as LagUser;
    } catch {
      // Tenta a próxima chave.
    }
  }
  return null;
}

export function saveUser(user: LagUser): void {
  const role = user.nivelAcesso || user.nivel_acesso || "colaborador";
  const city = user.cidade || localStorage.getItem("amorSaudeCidadeSelecionada") || "Cerquilho";
  const normalized = { ...user, nivelAcesso: role, nivel_acesso: role, cidade: city };

  localStorage.setItem("amor_usuario", JSON.stringify(normalized));
  localStorage.setItem("amorSaudeUsuario", JSON.stringify(normalized));
  localStorage.setItem("usuarioLogado", JSON.stringify(normalized));
  localStorage.setItem("amor_nivel_acesso", String(role));
  localStorage.setItem("nivelAcesso", String(role));
  localStorage.setItem("amor_cidade", city);
  localStorage.setItem("cidadeSelecionada", city);
  localStorage.setItem("amorSaudeCidadeSelecionada", city);
  if (user.email) {
    localStorage.setItem("amor_email", user.email);
    localStorage.setItem("usuarioEmail", user.email);
  }
}

export async function listMedicalRecords(): Promise<MedicalRecord[]> {
  const payload = await request<ApiResponse<MedicalRecord[]>>("/api/prontuariosMedicos");
  return payload.dados || payload.items || [];
}

export async function createMedicalRecord(record: MedicalRecord): Promise<MedicalRecord> {
  const payload = await request<ApiResponse<MedicalRecord>>("/api/prontuariosMedicos", {
    method: "POST",
    body: JSON.stringify(record)
  });
  return payload.dado || payload.item || record;
}

export async function deleteMedicalRecord(id: string): Promise<void> {
  await request(`/api/prontuariosMedicos/${encodeURIComponent(id)}`, { method: "DELETE" });
}
