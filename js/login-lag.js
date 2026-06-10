/* =========================================================
   JS visual do Login LAG.
   Não altera banco, não altera endpoint e não interfere no login.js.
   ========================================================= */

(function () {
  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  ready(() => {
    document.body.classList.add("lag-ui-ready");

    const citySelect = document.querySelector("#cidadeSelecionada, #loginCity, select[name='cidade']");
    const emailInput = document.querySelector("#email, #loginEmail, input[type='email']");
    const passwordInput = document.querySelector("#senha, #password, #loginPassword, input[type='password']");
    const rememberInput = document.querySelector("#lembrarAcesso, #rememberAccess, input[name='remember']");
    const form = document.querySelector("#loginForm, form");
    const submitButton = document.querySelector("#loginButton, button[type='submit']");
    const message = document.querySelector("#loginMessage, #loginStatus, .login-message");

    // Cidade persistida apenas no navegador, mantendo a lógica antiga.
    const savedCity = localStorage.getItem("amorSaudeCidadeSelecionada") || localStorage.getItem("lagCidadeSelecionada");
    if (citySelect && savedCity) {
      [...citySelect.options].forEach((opt) => {
        if (normalizeText(opt.value) === normalizeText(savedCity) || normalizeText(opt.textContent) === normalizeText(savedCity)) {
          citySelect.value = opt.value;
        }
      });
    }

    citySelect?.addEventListener("change", () => {
      localStorage.setItem("amorSaudeCidadeSelecionada", citySelect.value);
      localStorage.setItem("lagCidadeSelecionada", citySelect.value);
      toast(`Unidade selecionada: ${citySelect.value}`, "success");
    });

    // Lembrar e-mail de forma local.
    const savedEmail = localStorage.getItem("lagLoginEmail");
    if (emailInput && savedEmail && rememberInput) {
      emailInput.value = savedEmail;
      rememberInput.checked = true;
    }

    rememberInput?.addEventListener("change", () => {
      if (!rememberInput.checked) localStorage.removeItem("lagLoginEmail");
      if (rememberInput.checked && emailInput?.value) localStorage.setItem("lagLoginEmail", emailInput.value.trim());
    });

    emailInput?.addEventListener("input", () => {
      if (rememberInput?.checked) localStorage.setItem("lagLoginEmail", emailInput.value.trim());
    });

    // Mostrar/ocultar senha.
    const toggle = document.querySelector("#lagTogglePassword, [data-toggle-password]");
    toggle?.addEventListener("click", () => {
      if (!passwordInput) return;
      const showing = passwordInput.type === "text";
      passwordInput.type = showing ? "password" : "text";
      toggle.setAttribute("aria-label", showing ? "Mostrar senha" : "Ocultar senha");
      toggle.innerHTML = `<i class="fa-regular ${showing ? "fa-eye" : "fa-eye-slash"}"></i>`;
      passwordInput.focus();
    });

    // Feedback visual no submit. O login.js continua fazendo a autenticação.
    form?.addEventListener("submit", () => {
      if (rememberInput?.checked && emailInput?.value) {
        localStorage.setItem("lagLoginEmail", emailInput.value.trim());
      }

      if (submitButton) {
        submitButton.classList.add("loading");
        const icon = submitButton.querySelector("i");
        if (icon) icon.className = "fa-solid fa-circle-notch";
      }

      if (message && !message.textContent.trim()) {
        message.textContent = "Verificando seu acesso...";
        message.classList.add("active");
      }

      window.setTimeout(() => {
        submitButton?.classList.remove("loading");
        const icon = submitButton?.querySelector("i");
        if (icon) icon.className = "fa-solid fa-arrow-right";
      }, 5000);
    }, { capture: true });

    // Micro animação nos cards.
    const motionTargets = document.querySelectorAll(".lag-feature-grid article, .lag-login-card, .lag-hero-visual");
    motionTargets.forEach((el, index) => {
      el.style.setProperty("--lag-delay", `${index * 80}ms`);
      el.classList.add("lag-animate-in");
    });

    function toast(text, type = "success") {
      if (!message) return;
      message.textContent = text;
      message.className = `lag-login-message active ${type}`;
      window.clearTimeout(message.__lagToastTimer);
      message.__lagToastTimer = window.setTimeout(() => {
        message.classList.remove("active");
      }, 2400);
    }

    function normalizeText(value = "") {
      return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
    }
  });
})();
