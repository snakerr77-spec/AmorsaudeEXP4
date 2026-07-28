import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  ChevronDown,
  Home,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  UserRound,
  X
} from "./icons";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { LagUser } from "../types";
import { displayName, roleLabel } from "../lib/session";
import { logout } from "../lib/api";

interface AppShellProps {
  user: LagUser;
  title: string;
  section?: string;
  children: ReactNode;
  onMenuOpen?: () => void;
  compact?: boolean;
}

const notifications = [
  { title: "Portal atualizado", text: "A nova home do LAG Controller já está ativa.", time: "Agora" },
  { title: "Prontuário médico", text: "O fluxo clínico foi reorganizado para reduzir etapas.", time: "Hoje" },
  { title: "Segurança", text: "Seu acesso está protegido pela sessão do Cloudflare.", time: "Sistema" }
];

export function AppShell({ user, title, section = "Portal interno", children, onMenuOpen, compact = false }: AppShellProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    localStorage.getItem("lag-theme") === "dark" ? "dark" : "light"
  );
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const name = displayName(user);
  const initials = useMemo(() => {
    const parts = name.split(/\s+/).filter(Boolean);
    return `${parts[0]?.[0] || "L"}${parts[1]?.[0] || ""}`.toUpperCase();
  }, [name]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("lag-theme", theme);
  }, [theme]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setNotificationsOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function handleLogout() {
    await logout();
    window.location.replace("/pages/login");
  }

  return (
    <div className={`app-shell${compact ? " app-shell-compact" : ""}`}>
      <header className="app-topbar">
        <div className="topbar-left">
          {onMenuOpen ? (
            <button className="topbar-icon topbar-menu" type="button" onClick={onMenuOpen} aria-label="Abrir menu">
              <Menu size={20} />
            </button>
          ) : null}

          <a className="lag-brand" href="/pages/home" aria-label="LAG Controller">
            <img src="/assets/images/logo-lag-sem-fundo-cortada.png" alt="LAG Controller" />
          </a>

          <span className="topbar-divider" />
          <div className="topbar-context">
            <span>{section}</span>
            <strong>{title}</strong>
          </div>
        </div>

        <div className="topbar-actions">
          <a className="topbar-home-link" href="/pages/home">
            <Home size={18} />
            <span>Home</span>
          </a>

          <button
            className="topbar-icon"
            type="button"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label={theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <div className="topbar-popover-wrap" ref={notificationRef}>
            <button
              className="topbar-icon notification-button"
              type="button"
              onClick={() => setNotificationsOpen((current) => !current)}
              aria-expanded={notificationsOpen}
              aria-label="Abrir notificações"
            >
              <Bell size={18} />
              <span className="notification-dot">3</span>
            </button>

            <AnimatePresence>
              {notificationsOpen ? (
                <motion.div
                  className="topbar-popover notification-popover"
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="popover-heading">
                    <div><span>Central</span><strong>Notificações</strong></div>
                    <button type="button" onClick={() => setNotificationsOpen(false)}><X size={16} /></button>
                  </div>
                  <div className="notification-list">
                    {notifications.map((item, index) => (
                      <article key={item.title} className="notification-item">
                        <span className={`notification-index notification-index-${index + 1}`} />
                        <div><strong>{item.title}</strong><p>{item.text}</p><small>{item.time}</small></div>
                      </article>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="topbar-popover-wrap" ref={profileRef}>
            <button
              className="profile-trigger"
              type="button"
              onClick={() => setProfileOpen((current) => !current)}
              aria-expanded={profileOpen}
            >
              <span className="profile-avatar">{user.foto ? <img src={user.foto} alt="" /> : initials}</span>
              <span className="profile-trigger-copy">
                <strong>{name}</strong>
                <small>{roleLabel(String(user.nivelAcesso || user.nivel_acesso))}</small>
              </span>
              <ChevronDown size={16} />
            </button>

            <AnimatePresence>
              {profileOpen ? (
                <motion.div
                  className="topbar-popover profile-popover"
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="profile-popover-head">
                    <span className="profile-avatar large">{user.foto ? <img src={user.foto} alt="" /> : initials}</span>
                    <div><strong>{name}</strong><small>{user.email || "Conta LAG"}</small></div>
                  </div>
                  <a href="/pages/perfil.html"><UserRound size={17} /><span>Meu perfil</span></a>
                  <button type="button" onClick={handleLogout}><LogOut size={17} /><span>Sair da conta</span></button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="app-main">{children}</main>

      <button className="mobile-search-fab" type="button" aria-label="Pesquisar">
        <Search size={20} />
      </button>
    </div>
  );
}
