// Simple include loader
function loadIncludes() {
  const includeTargets = document.querySelectorAll("[data-include]");
  includeTargets.forEach((el) => {
    const src = el.getAttribute("data-include");
    if (!src) return;
    fetch(src)
      .then((res) => res.text())
      .then((html) => {
        el.innerHTML = html;
        if (src === "header.html") {
          initHeaderInteractions();
        }
        if (src === "footer.html") {
          initFooterInteractions();
        }
      })
      .catch((err) => console.error("Include load error:", src, err));
  });
}

// Language helpers
function getSavedLang() {
  try {
    return localStorage.getItem("futec_lang") || "ko";
  } catch {
    return "ko";
  }
}

function saveLang(lang) {
  try {
    localStorage.setItem("futec_lang", lang);
  } catch {
    /* ignore */
  }
}

function applyLang(lang) {
  const body = document.body;
  body.classList.remove("lang-ko", "lang-en");
  if (lang === "en") {
    body.classList.add("lang-en");
  } else {
    body.classList.add("lang-ko");
  }

  // Directly control visibility of language-marked elements
  const isEn = lang === "en";
  const koEls = document.querySelectorAll(".lang-ko");
  const enEls = document.querySelectorAll(".lang-en");

  koEls.forEach((el) => {
    el.style.display = isEn ? "none" : "";
  });
  enEls.forEach((el) => {
    el.style.display = isEn ? "" : "none";
  });

  // Update toggle text if header already loaded
  const toggle = document.querySelector(".lang-toggle .lang-code");
  const arrow = document.querySelector(".lang-toggle .lang-arrow");
  if (toggle && arrow) {
    toggle.textContent = isEn ? "ENG" : "KOR";
    arrow.textContent = "▾";
  }
}

// Header interactions
function initHeaderInteractions() {
  const body = document.body;

  // apply saved language
  applyLang(getSavedLang());

  const header = document.querySelector(".site-header");
  if (!header) return;

  const mainNav = header.querySelector(".main-nav");
  const mobileToggle = header.querySelector(".mobile-menu-toggle");
  const menuItems = header.querySelectorAll(".menu-item.has-submenu");
  const searchToggle = header.querySelector(".search-toggle");
  const searchPanel = document.querySelector(".search-panel");

  // Mega menu open/close logic
  let currentOpen = null;

  function openMenu(item) {
    if (currentOpen && currentOpen !== item) {
      currentOpen.classList.remove("open");
    }
    currentOpen = item;
    if (currentOpen) {
      currentOpen.classList.add("open");
    }
  }

  function closeMenu() {
    if (currentOpen) {
      currentOpen.classList.remove("open");
      currentOpen = null;
    }
  }

  menuItems.forEach((item) => {
    const btn = item.querySelector(".menu-link");
    item.addEventListener("mouseenter", () => {
      openMenu(item);
    });
    item.addEventListener("mouseleave", (e) => {
      const related = e.relatedTarget;
      if (!item.contains(related)) {
        closeMenu();
      }
    });
    // For keyboard / click toggling
    btn.addEventListener("click", (e) => {
      const menuKey = item.getAttribute("data-menu");
      if (menuKey === "products" || menuKey === "industry" || menuKey === "partners" || menuKey === "resources" || menuKey === "company") {
        e.preventDefault();
        if (item.classList.contains("open")) {
          closeMenu();
        } else {
          openMenu(item);
        }
      }
    });
  });

  // Close mega if clicking outside
  document.addEventListener("click", (e) => {
    if (!header.contains(e.target)) {
      closeMenu();
    }
  });

  // Mobile nav
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener("click", () => {
      mainNav.classList.toggle("open");
    });
  }

  // Search panel
  if (searchToggle && searchPanel) {
    searchToggle.addEventListener("click", () => {
      searchPanel.classList.toggle("open");
    });
  }

  // Language switcher
  const langToggleBtn = header.querySelector("#langToggleBtn");
  const langDropdown = header.querySelector("#langDropdown");
  const langOptions = header.querySelectorAll(".lang-option");

  if (langToggleBtn && langDropdown) {
    langToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle("open");
      const arrow = langToggleBtn.querySelector(".lang-arrow");
      if (arrow) {
        arrow.textContent = langDropdown.classList.contains("open") ? "▴" : "▾";
      }
    });

    document.addEventListener("click", (e) => {
      if (!langDropdown.contains(e.target) && e.target !== langToggleBtn) {
        if (langDropdown.classList.contains("open")) {
          langDropdown.classList.remove("open");
          const arrow = langToggleBtn.querySelector(".lang-arrow");
          if (arrow) arrow.textContent = "▾";
        }
      }
    });

    langOptions.forEach((opt) => {
      opt.addEventListener("click", () => {
        const targetLang = opt.getAttribute("data-lang") || "ko";
        saveLang(targetLang);
        applyLang(targetLang);
        langDropdown.classList.remove("open");
      });
    });
  }
}

// Footer interactions (admin modal)
function initFooterInteractions() {
  const modal = document.getElementById("adminLoginModal");
  const triggers = document.querySelectorAll(".footer-inc-trigger");
  const closeBtns = modal ? modal.querySelectorAll("[data-close-modal]") : [];

  if (!modal) return;

  function openModal() {
    modal.classList.add("open");
  }

  function closeModal() {
    modal.classList.remove("open");
  }

  triggers.forEach((el) => {
    el.addEventListener("click", openModal);
  });

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  const form = document.getElementById("adminLoginForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = form.adminId.value.trim();
      const pw = form.adminPw.value.trim();
      if (id === "administrator" && pw === "W@n831921@") {
        window.location.href = "admin.html";
      } else {
        alert("ID 또는 비밀번호가 올바르지 않습니다.");
        form.reset();
      }
    });
  }
  // Ensure footer language matches current setting
  applyLang(getSavedLang());
}

// On DOM ready
document.addEventListener("DOMContentLoaded", () => {
  loadIncludes();
  // If header not yet loaded, language will be applied when header init runs.
  if (!document.body.classList.contains("lang-ko") && !document.body.classList.contains("lang-en")) {
    applyLang(getSavedLang());
  }
});
