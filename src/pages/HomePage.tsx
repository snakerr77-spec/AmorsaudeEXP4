import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  BriefcaseMedical,
  Building2,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  FileHeart,
  FileText,
  FolderKanban,
  GraduationCap,
  HeartPulse,
  LayoutDashboard,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  UserRoundCheck,
  UsersRound,
  X
} from "../components/icons";
import { useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { displayName, firstName, greeting, localDate, permissions, roleLabel } from "../lib/session";
import type { LagUser } from "../types";

interface HomePageProps {
  user: LagUser;
}

interface ModuleItem {
  title: string;
  description: string;
  href: string;
  category: "Clínica" | "Gestão" | "Desenvolvimento";
  icon: typeof Stethoscope;
  accent: string;
  featured?: boolean;
  permission?: "medical" | "management" | "lag" | "admin";
}

const modules: ModuleItem[] = [
  {
    title: "Médicos e exames",
    description: "Consulte especialidades, horários, valores e preparos.",
    href: "/modules/medicos-exames/medicos-exames.html",
    category: "Clínica",
    icon: Stethoscope,
    accent: "teal",
    featured: true
  },
  {
    title: "Prontuário médico",
    description: "Atendimento clínico, mapa corporal e histórico do paciente.",
    href: "/modules/prontuario-medico/prontuario-medico",
    category: "Clínica",
    icon: FileHeart,
    accent: "blue",
    permission: "medical",
    featured: true
  },
  {
    title: "Treinamentos",
    description: "Trilhas, conteúdos e evolução profissional da equipe.",
    href: "/modules/treinamentos/treinamentos.html",
    category: "Desenvolvimento",
    icon: GraduationCap,
    accent: "violet"
  },
  {
    title: "Boas práticas",
    description: "Orientações rápidas para atendimento e rotina clínica.",
    href: "/modules/curso-boas-praticas/modulo-curso-boas-praticas.html",
    category: "Desenvolvimento",
    icon: BookOpenCheck,
    accent: "amber"
  },
  {
    title: "LAG Dashboard",
    description: "Indicadores, rankings e acompanhamento operacional.",
    href: "/modules/lag-controller/index.html",
    category: "Gestão",
    icon: LayoutDashboard,
    accent: "navy",
    permission: "lag"
  },
  {
    title: "Controladoria",
    description: "Documentos, contratos, termos e informações internas.",
    href: "/modules/controladoria/controladoria.html",
    category: "Gestão",
    icon: FolderKanban,
    accent: "cyan",
    permission: "management"
  },
  {
    title: "Contratação médica",
    description: "Acompanhe candidatos e o fluxo de contratação.",
    href: "/modules/contratacao-medicos/contratacao-medicos.html",
    category: "Gestão",
    icon: UserRoundCheck,
    accent: "green",
    permission: "management"
  },
  {
    title: "Administração",
    description: "Usuários, permissões, unidades e acessos do sistema.",
    href: "/pages/admin-usuarios.html",
    category: "Gestão",
    icon: UsersRound,
    accent: "rose",
    permission: "admin"
  }
];

const updates = [
  {
    icon: Sparkles,
    title: "Nova home LAG",
    text: "Interface mais rápida, responsiva e organizada para a rotina da clínica.",
    tag: "Novo"
  },
  {
    icon: HeartPulse,
    title: "Prontuário reorganizado",
    text: "Fluxo clínico com etapas claras, mapa corporal e histórico em um só lugar.",
    tag: "Clínica"
  },
  {
    icon: ShieldCheck,
    title: "Acesso protegido",
    text: "O login voltou e todas as áreas respeitam o perfil do usuário.",
    tag: "Segurança"
  }
];

export function HomePage({ user }: HomePageProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"Todos" | ModuleItem["category"]>("Todos");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const access = permissions(user);

  const visibleModules = useMemo(() => {
    const term = query.trim().toLowerCase();
    return modules.filter((item) => {
      if (item.permission && !access[item.permission]) return false;
      if (category !== "Todos" && item.category !== category) return false;
      if (!term) return true;
      return `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(term);
    });
  }, [access, category, query]);

  const name = displayName(user);
  const city = user.cidade || "Cerquilho";

  return (
    <AppShell user={user} title="Home" section="Portal interno" onMenuOpen={() => setDrawerOpen(true)}>
      <AnimatePresence>
        {drawerOpen ? (
          <>
            <motion.button
              className="drawer-backdrop"
              type="button"
              aria-label="Fechar menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              className="home-drawer"
              initial={{ x: -380 }}
              animate={{ x: 0 }}
              exit={{ x: -380 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              <div className="home-drawer-head">
                <img src="/assets/images/logo-lag-sem-fundo-cortada.png" alt="LAG Controller" />
                <button type="button" onClick={() => setDrawerOpen(false)}><X size={19} /></button>
              </div>
              <div className="drawer-user">
                <span>{name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("")}</span>
                <div><strong>{name}</strong><small>{roleLabel(String(user.nivelAcesso || user.nivel_acesso))}</small></div>
              </div>
              <nav>
                {modules.filter((item) => !item.permission || access[item.permission]).map((item) => {
                  const Icon = item.icon;
                  return (
                    <a key={item.title} href={item.href} onClick={() => setDrawerOpen(false)}>
                      <span className={`module-icon module-icon-${item.accent}`}><Icon size={18} /></span>
                      <div><strong>{item.title}</strong><small>{item.description}</small></div>
                      <ChevronRight size={16} />
                    </a>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <div className="home-page page-container">
        <motion.section
          className="home-hero"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="home-hero-grid" aria-hidden="true" />
          <div className="home-hero-copy">
            <span className="eyebrow"><Activity size={15} /> Portal operacional</span>
            <h1>{greeting()}, <strong>{firstName(user)}.</strong></h1>
            <p>Seu ambiente central para acompanhar a rotina clínica, acessar ferramentas e manter a equipe conectada.</p>

            <div className="hero-search-wrap">
              <Search size={20} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pesquisar módulo ou ferramenta..."
                aria-label="Pesquisar módulo"
              />
              <kbd>Ctrl K</kbd>
            </div>

            <div className="hero-meta-row">
              <span><MapPin size={15} /> Unidade {city}</span>
              <span><CalendarDays size={15} /> {localDate()}</span>
              <span><ShieldCheck size={15} /> Sessão protegida</span>
            </div>
          </div>

          <div className="home-hero-visual">
            <motion.div
              className="hero-orbit hero-orbit-one"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
            />
            <motion.div
              className="hero-orbit hero-orbit-two"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
            />
            <div className="hero-main-card">
              <span><BriefcaseMedical size={21} /></span>
              <div><small>Operação ativa</small><strong>LAG Controller</strong></div>
              <i />
            </div>
            <div className="hero-floating-card hero-floating-card-a">
              <TrendingUp size={18} />
              <div><strong>8 módulos</strong><small>Conectados</small></div>
            </div>
            <div className="hero-floating-card hero-floating-card-b">
              <Building2 size={18} />
              <div><strong>{city}</strong><small>Unidade atual</small></div>
            </div>
          </div>
        </motion.section>

        <section className="home-kpis" aria-label="Resumo do portal">
          {[
            { icon: BriefcaseMedical, value: visibleModules.length, label: "Módulos disponíveis", tone: "teal" },
            { icon: ShieldCheck, value: roleLabel(String(user.nivelAcesso || user.nivel_acesso)), label: "Nível de acesso", tone: "blue" },
            { icon: MapPin, value: city, label: "Unidade selecionada", tone: "violet" },
            { icon: Activity, value: "Online", label: "Status da plataforma", tone: "green" }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.label}
                className="home-kpi-card"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index, duration: 0.35 }}
              >
                <span className={`kpi-icon kpi-icon-${item.tone}`}><Icon size={20} /></span>
                <div><strong>{item.value}</strong><small>{item.label}</small></div>
              </motion.article>
            );
          })}
        </section>

        <section className="home-section">
          <div className="section-head-row">
            <div>
              <span className="section-kicker">Acessos rápidos</span>
              <h2>Ferramentas da sua rotina</h2>
              <p>Encontre cada módulo sem perder tempo navegando por menus longos.</p>
            </div>
            <div className="category-switcher" role="group" aria-label="Filtrar módulos">
              {(["Todos", "Clínica", "Gestão", "Desenvolvimento"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={category === item ? "active" : ""}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <motion.div layout className="module-grid">
            <AnimatePresence mode="popLayout">
              {visibleModules.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    layout
                    key={item.title}
                    href={item.href}
                    className={`module-card${item.featured ? " featured" : ""}`}
                    initial={{ opacity: 0, scale: 0.98, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: Math.min(index * 0.04, 0.2), duration: 0.28 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="module-card-top">
                      <span className={`module-icon module-icon-${item.accent}`}><Icon size={23} /></span>
                      <span className="module-category">{item.category}</span>
                    </div>
                    <div className="module-card-copy">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                    <div className="module-card-footer">
                      <span>Acessar módulo</span>
                      <ArrowRight size={18} />
                    </div>
                  </motion.a>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {!visibleModules.length ? (
            <div className="empty-search-state">
              <Search size={28} />
              <h3>Nenhum módulo encontrado</h3>
              <p>Tente outro termo ou limpe o filtro selecionado.</p>
              <button type="button" onClick={() => { setQuery(""); setCategory("Todos"); }}>Limpar pesquisa</button>
            </div>
          ) : null}
        </section>

        <section className="home-bottom-grid">
          <div className="home-section update-panel">
            <div className="section-head-row compact">
              <div><span className="section-kicker">Atualizações</span><h2>O que mudou no portal</h2></div>
              <a href="#updates">Ver tudo <ArrowRight size={16} /></a>
            </div>
            <div className="update-list" id="updates">
              {updates.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.article
                    key={item.title}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.07 }}
                  >
                    <span><Icon size={19} /></span>
                    <div><strong>{item.title}</strong><p>{item.text}</p></div>
                    <small>{item.tag}</small>
                  </motion.article>
                );
              })}
            </div>
          </div>

          <aside className="home-section support-card">
            <div className="support-illustration">
              <img src="/modules/lag-controller/assets/lobo-laptop.png" alt="Mascote LAG usando notebook" />
            </div>
            <span className="section-kicker">Suporte rápido</span>
            <h2>Precisa de ajuda?</h2>
            <p>Acesse seu perfil, confira permissões ou fale com a administração da unidade.</p>
            <div className="support-links">
              <a href="/pages/perfil.html"><UserRoundCheck size={17} /> Meu perfil</a>
              <a href="/modules/controladoria/controladoria.html"><FileText size={17} /> Documentos internos</a>
              <a href="mailto:snakerr77@gmail.com"><ClipboardCheck size={17} /> Abrir suporte</a>
            </div>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
