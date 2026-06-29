document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("homeNavigation");
  const menuToggle = document.getElementById("homeMenuToggle");
  const sideDrawer = document.getElementById("homeSideDrawer");
  const drawerOverlay = document.getElementById("homeDrawerOverlay");
  const drawerClose = document.getElementById("homeDrawerClose");

  const notifyToggle = document.getElementById("homeNotificationToggle");
  const notifyPanel = document.getElementById("homeNotificationPanel");
  const notifyCount = document.getElementById("homeNotificationCount");
  const notificationList = document.getElementById("homeNotificationList");
  const newsGrid = document.getElementById("homeNewsGrid");
  const markAllRead = document.getElementById("homeMarkAllRead");

  const profileToggle = document.getElementById("homeProfileToggle");
  const profilePanel = document.getElementById("homeProfilePanel");
  const backToTop = document.getElementById("backToTop");

  const defaultNewsHTML = newsGrid?.innerHTML || "";
  let homeNotifications = [];

  function closeMenu() {
    nav?.classList.remove("open");
    sideDrawer?.classList.remove("active");
    drawerOverlay?.classList.remove("active");
    sideDrawer?.setAttribute("aria-hidden", "true");
    drawerOverlay?.setAttribute("aria-hidden", "true");
    menuToggle?.classList.remove("active");
    menuToggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open", "drawer-open");
  }

  function toggleMenu(event) {
    event?.stopPropagation();
    if (!sideDrawer || !menuToggle) return;

    const isOpen = !sideDrawer.classList.contains("active");

    sideDrawer.classList.toggle("active", isOpen);
    drawerOverlay?.classList.toggle("active", isOpen);
    sideDrawer.setAttribute("aria-hidden", String(!isOpen));
    drawerOverlay?.setAttribute("aria-hidden", String(!isOpen));
    menuToggle.classList.toggle("active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("drawer-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);

    if (isOpen) {
      closeNotifications();
      closeProfile();
    }
  }

  function closeNotifications() {
    if (!notifyPanel || !notifyToggle) return;
    notifyPanel.classList.remove("active");
    notifyPanel.setAttribute("aria-hidden", "true");
    notifyToggle.setAttribute("aria-expanded", "false");
  }

  function toggleNotifications(event) {
    event?.stopPropagation();
    if (!notifyPanel || !notifyToggle) return;

    const isOpen = notifyPanel.classList.toggle("active");
    notifyPanel.setAttribute("aria-hidden", String(!isOpen));
    notifyToggle.setAttribute("aria-expanded", String(isOpen));

    if (isOpen) {
      closeMenu();
      closeProfile();
    }
  }

  function closeProfile() {
    if (!profilePanel || !profileToggle) return;
    profilePanel.classList.remove("active");
    profilePanel.setAttribute("aria-hidden", "true");
    profileToggle.setAttribute("aria-expanded", "false");
  }

  function toggleProfile(event) {
    event?.stopPropagation();
    if (!profilePanel || !profileToggle) return;

    const isOpen = profilePanel.classList.toggle("active");
    profilePanel.setAttribute("aria-hidden", String(!isOpen));
    profileToggle.setAttribute("aria-expanded", String(isOpen));

    if (isOpen) {
      closeMenu();
      closeNotifications();
    }
  }

  function dateMillis(value) {
    if (!value) return 0;
    if (typeof value === "number") return value;

    if (typeof value === "object") {
      if (typeof value.toMillis === "function") return value.toMillis();
      if (typeof value.toDate === "function") return value.toDate().getTime();
      if (value.seconds) return Number(value.seconds) * 1000;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }

  function formatCommunicationDate(value) {
    const millis = dateMillis(value);
    if (!millis) return "Agora";

    const date = new Date(millis);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
      }).format(date);
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit"
    }).format(date);
  }

  function getReadKey() {
    const userId =
      window.usuarioLogado?.uid ||
      window.usuarioLogado?.id ||
      window.usuarioLogado?.email ||
      "geral";

    return `amorSaudeNotificacoesLidas_${userId}`;
  }

  function getReadSet() {
    try {
      const saved = JSON.parse(localStorage.getItem(getReadKey()) || "[]");
      return new Set(Array.isArray(saved) ? saved : []);
    } catch {
      return new Set();
    }
  }

  function saveReadSet(readSet) {
    localStorage.setItem(getReadKey(), JSON.stringify([...readSet]));
  }

  function setNotificationCount(total) {
    if (!notifyCount) return;
    notifyCount.textContent = String(total);
    notifyCount.style.display = total > 0 ? "grid" : "none";
  }

  function updateNotificationCount() {
    const readSet = getReadSet();
    const unreadTotal = homeNotifications.filter((item) => !readSet.has(item.id)).length;
    setNotificationCount(unreadTotal);
  }

  function createNotificationElement(item) {
    const readSet = getReadSet();

    const article = document.createElement("article");
    article.className = "home-notification-item" + (readSet.has(item.id) ? "" : " unread");
    article.dataset.notificationId = item.id;

    const icon = document.createElement("div");
    icon.className = "notification-item-icon";
    icon.innerHTML = '<i class="fa-solid fa-bullhorn"></i>';

    const content = document.createElement("div");

    const title = document.createElement("b");
    title.textContent = item.titulo;

    const text = document.createElement("p");
    text.textContent = item.mensagem;

    const small = document.createElement("small");
    small.textContent = `${item.importante ? "Importante · " : ""}${item.categoria || "Aviso"} · ${formatCommunicationDate(item.createdAt)}`;

    content.append(title, text, small);
    article.append(icon, content);

    article.addEventListener("click", () => {
      const currentReadSet = getReadSet();
      currentReadSet.add(item.id);
      saveReadSet(currentReadSet);
      article.classList.remove("unread");
      updateNotificationCount();
    });

    return article;
  }

  function renderNotifications(items) {
    if (!notificationList) return;

    notificationList.innerHTML = "";
    homeNotifications = items.filter((item) => item.ativo !== false && item.ativo !== 0 && item.ativo !== "0");

    if (!homeNotifications.length) {
      notificationList.innerHTML = "<p>Nenhuma notificação nova por enquanto.</p>";
      setNotificationCount(0);
      return;
    }

    const fragment = document.createDocumentFragment();

    homeNotifications.forEach((item) => {
      fragment.appendChild(createNotificationElement(item));
    });

    notificationList.appendChild(fragment);
    updateNotificationCount();
  }

  function renderNews(items) {
    if (!newsGrid) return;

    const activeNews = items.filter((item) => item.ativo !== false && item.ativo !== 0 && item.ativo !== "0");

    if (!activeNews.length) {
      newsGrid.innerHTML = defaultNewsHTML;
      return;
    }

    newsGrid.innerHTML = "";
    const fragment = document.createDocumentFragment();

    activeNews.forEach((item, index) => {
      const article = document.createElement("article");
      article.className = "news-card" + (index === 0 ? " featured" : "");

      const tag = document.createElement("span");
      tag.className = "news-tag";
      tag.textContent = item.importante
        ? `${item.categoria || "Aviso"} importante`
        : item.categoria || "Aviso";

      const title = document.createElement("h3");
      title.textContent = item.titulo;

      const text = document.createElement("p");
      text.textContent = item.mensagem;

      const small = document.createElement("small");
      small.textContent = `Publicado ${formatCommunicationDate(item.createdAt)}`;

      article.append(tag, title, text, small);
      fragment.appendChild(article);
    });

    newsGrid.appendChild(fragment);
  }

  function gerarIdTemporario() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `temp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function normalizeCommunication(item = {}) {
    return {
      id: item.id || item.doc_id || item.uuid || gerarIdTemporario(),
      titulo: item.titulo || item.title || "Aviso",
      mensagem: item.mensagem || item.texto || item.descricao || "",
      categoria: item.categoria || item.tag || "Aviso",
      importante: item.importante === true || item.importante === 1 || item.importante === "1",
      ativo: item.ativo !== false && item.ativo !== 0 && item.ativo !== "0",
      createdAt:
        item.createdAt ||
        item.criado_em ||
        item.criadoEm ||
        item.data ||
        item.atualizado_em ||
        ""
    };
  }

  async function carregarComunicadosHome() {
    if (notificationList) {
      notificationList.innerHTML = "<p>Carregando avisos...</p>";
    }

    try {
      if (!window.AmorSaudeAPI) {
        throw new Error("API Cloudflare não carregada.");
      }

      const [notificacoesResp, noticiasResp] = await Promise.all([
        window.AmorSaudeAPI.listar("notificacoes"),
        window.AmorSaudeAPI.listar("noticias")
      ]);

      const notificacoes = (notificacoesResp.dados || notificacoesResp.items || [])
        .map(normalizeCommunication)
        .sort((a, b) => dateMillis(b.createdAt) - dateMillis(a.createdAt))
        .slice(0, 12);

      const noticias = (noticiasResp.dados || noticiasResp.items || [])
        .map(normalizeCommunication)
        .sort((a, b) => dateMillis(b.createdAt) - dateMillis(a.createdAt))
        .slice(0, 6);

      renderNotifications(notificacoes);
      renderNews(noticias);
    } catch (erro) {
      console.error("Erro ao carregar notificações e notícias pela Cloudflare:", erro);

      if (notificationList) {
        notificationList.innerHTML = "<p>Não consegui carregar os avisos agora.</p>";
      }

      setNotificationCount(0);

      if (newsGrid && defaultNewsHTML) {
        newsGrid.innerHTML = defaultNewsHTML;
      }
    }
  }

  menuToggle?.addEventListener("click", toggleMenu);
  notifyToggle?.addEventListener("click", toggleNotifications);
  profileToggle?.addEventListener("click", toggleProfile);

  notifyPanel?.addEventListener("click", (event) => event.stopPropagation());
  profilePanel?.addEventListener("click", (event) => event.stopPropagation());
  sideDrawer?.addEventListener("click", (event) => event.stopPropagation());

  drawerOverlay?.addEventListener("click", closeMenu);
  drawerClose?.addEventListener("click", closeMenu);

  sideDrawer?.querySelectorAll("a, button").forEach((item) => {
    item.addEventListener("click", () => {
      if (item.classList.contains("home-drawer-close")) return;
      closeMenu();
    });
  });

  markAllRead?.addEventListener("click", () => {
    const readSet = getReadSet();
    homeNotifications.forEach((item) => readSet.add(item.id));
    saveReadSet(readSet);

    document.querySelectorAll(".home-notification-item.unread").forEach((item) => {
      item.classList.remove("unread");
    });

    setNotificationCount(0);
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (event) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      closeMenu();
      closeNotifications();
      closeProfile();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  document.querySelectorAll("[data-scroll-target]").forEach((item) => {
    item.addEventListener("click", (event) => {
      if (event.target.closest("a, button, input, select, textarea")) return;

      const targetId = item.dataset.scrollTarget;
      const target = targetId ? document.querySelector(targetId) : null;
      if (!target) return;

      closeMenu();
      closeNotifications();
      closeProfile();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  document.querySelectorAll("[data-open-url]").forEach((item) => {
    item.addEventListener("click", (event) => {
      if (event.target.closest("a, button, input, select, textarea")) return;

      const url = item.dataset.openUrl;
      if (url) window.location.href = url;
    });

    item.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();

      const url = item.dataset.openUrl;
      if (url) window.location.href = url;
    });
  });

  document.addEventListener("click", () => {
    closeMenu();
    closeNotifications();
    closeProfile();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      closeNotifications();
      closeProfile();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) closeMenu();
  });

  function updateBackToTop() {
    if (!backToTop) return;
    backToTop.classList.toggle("show", window.scrollY > 420);
  }

  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("usuario-carregado", carregarComunicadosHome);

  if (window.usuarioLogado) {
    carregarComunicadosHome();
  }
});
