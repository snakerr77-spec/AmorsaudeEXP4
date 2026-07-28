import type { LagUser, UserRole } from "../types";

export function normalizeRole(role?: string): UserRole {
  const value = String(role || "colaborador")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

  const roles: Record<string, UserRole> = {
    admin: "admin",
    administrador: "admin",
    administradora: "admin",
    adm: "admin",
    master: "admin",
    financeiro: "financeiro",
    financa: "financeiro",
    financas: "financeiro",
    gerencia: "gerencia",
    gerente: "gerencia",
    gerencial: "gerencia",
    cdt: "cdt",
    recepcao: "recepcao",
    recepcionista: "recepcao",
    medico: "medico",
    medica: "medico",
    colaborador: "colaborador",
    colaboradora: "colaborador"
  };

  return roles[value] || "colaborador";
}

export function displayName(user?: LagUser | null): string {
  return user?.nomeCompleto || user?.nome_completo || user?.nome || user?.email || "Usuário";
}

export function firstName(user?: LagUser | null): string {
  return displayName(user).trim().split(/\s+/)[0] || "Usuário";
}

export function roleLabel(role?: string): string {
  const labels: Record<UserRole, string> = {
    admin: "Administrador",
    financeiro: "Financeiro",
    gerencia: "Gerência",
    cdt: "CDT",
    recepcao: "Recepção",
    medico: "Médico",
    colaborador: "Colaborador"
  };
  return labels[normalizeRole(role)];
}

export function permissions(user?: LagUser | null) {
  const role = normalizeRole(String(user?.nivelAcesso || user?.nivel_acesso || "colaborador"));
  return {
    role,
    admin: role === "admin",
    management: ["admin", "financeiro", "gerencia"].includes(role),
    medical: ["admin", "financeiro", "medico"].includes(role),
    lag: ["admin", "financeiro", "gerencia"].includes(role)
  };
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function localDate(): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  }).format(new Date());
}
