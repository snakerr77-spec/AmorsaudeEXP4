import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
    event.stopPropagation();
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
    event.stopPropagation();
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
    if (typeof value.toMillis === "function") return value.toMillis();
    if (typeof value.toDate === "function") return value.toDate().getTime();
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }

  function formatCommunicationDate(value) {
    const millis = dateMillis(value);
    if (!millis) return "Agora";

    const date = new Date(millis);
    const today = new Date();
    const sameDay = date.toDateString() === today.toDateString();

    if (sameDay) {
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

  function getIconByCategory(category = "") {
    const value = String(category).toLowerCase();
    if (value.includes("trein")) return "fa-graduation-cap";
    if (value.includes("méd") || value.includes("med") || value.includes("exame")) return "fa-stethoscope";
    if (value.includes("finan")) return "fa-chart-line";
    if (value.includes("urgent")) return "fa-triangle-exclamation";
    if (value.includes("sistema")) return "fa-gear";
    return "fa-bullhorn";
  }

  function getReadKey() {
    const userId = window.usuarioLogado?.uid || window.usuarioLogado?.email || "geral";
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
    icon.innerHTML = `<i class="fa-solid ${getIconByCategory(item.categoria)}"></i>`;

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

    homeNotifications = items.filter((item) => item.ativo !== false);

    if (!homeNotifications.length) {
      notificationList.innerHTML = '<p class="home-notification-empty">Nenhuma notificação nova por enquanto.</p>';
      setNotificationCount(0);
      return;
    }

    const fragment = document.createDocumentFragment();
    homeNotifications.forEach((item) => fragment.appendChild(createNotificationElement(item)));
    notificationList.appendChild(fragment);
    updateNotificationCount();
  }

  function renderNews(items) {
    if (!newsGrid) return;
    const activeNews = items.filter((item) => item.ativo !== false);

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
      tag.textContent = item.importante ? `${item.categoria || "Aviso"} importante` : item.categoria || "Aviso";

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

  function normalizeNotification(documento) {
    const dados = documento.data();
    return {
      id: documento.id,
      titulo: dados.titulo || dados.title || "Aviso",
      mensagem: dados.mensagem || dados.texto || dados.descricao || "",
      categoria: dados.categoria || dados.tag || "Aviso",
      importante: dados.importante === true,
      ativo: dados.ativo !== false,
      createdAt: dados.createdAt || dados.criadoEm || dados.data || ""
    };
  }

  function normalizeNews(documento) {
    const dados = documento.data();
    return {
      id: documento.id,
      titulo: dados.titulo || dados.title || "Anúncio",
      mensagem: dados.mensagem || dados.texto || dados.descricao || "",
      categoria: dados.categoria || dados.tag || "Aviso",
      importante: dados.importante === true,
      ativo: dados.ativo !== false,
      createdAt: dados.createdAt || dados.criadoEm || dados.data || ""
    };
  }

  async function carregarComunicadosHome() {
    if (notificationList) {
      notificationList.innerHTML = '<p class="home-notification-empty">Carregando avisos...</p>';
    }

    try {
      const [notificacoesSnap, noticiasSnap] = await Promise.all([
        getDocs(query(collection(db, "notificacoes"), orderBy("createdAt", "desc"), limit(12))),
        getDocs(query(collection(db, "noticias"), orderBy("createdAt", "desc"), limit(6)))
      ]);

      const notificacoes = notificacoesSnap.docs
        .map(normalizeNotification)
        .sort((a, b) => dateMillis(b.createdAt) - dateMillis(a.createdAt));

      const noticias = noticiasSnap.docs
        .map(normalizeNews)
        .sort((a, b) => dateMillis(b.createdAt) - dateMillis(a.createdAt));

      renderNotifications(notificacoes);
      renderNews(noticias);
    } catch (erro) {
      console.error("Erro ao carregar notificações e anúncios:", erro);
      if (notificationList) {
        notificationList.innerHTML = '<p class="home-notification-empty erro">Não consegui carregar os avisos. Confira sua conexão e permissões.</p>';
      }
      setNotificationCount(0);
      if (newsGrid && defaultNewsHTML) newsGrid.innerHTML = defaultNewsHTML;
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

      target.scrollIntoView({ behavior: "smooth", block: "start" });
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
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    item.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      const targetId = item.dataset.scrollTarget;
      const target = targetId ? document.querySelector(targetId) : null;
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
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

  document.querySelectorAll(".card, .news-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      if (window.innerWidth > 760) card.style.transform = "translateY(-6px)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  window.addEventListener("usuario-carregado", carregarComunicadosHome);

  if (window.usuarioLogado) {
    carregarComunicadosHome();
  }
});
