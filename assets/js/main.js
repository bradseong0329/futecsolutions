// Futec Solutions main interactions
// 2025-11-29: Rebuilt to support header/footer includes, language toggle, and Genetec-style mega menu.

// ----------------------
// Include loader
// ----------------------
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

// ----------------------
// Language helpers
// ----------------------
function getSavedLang() {
  try {
    return localStorage.getItem("futec_lang") || "ko";
  } catch (e) {
    return "ko";
  }
}

function saveLang(lang) {
  try {
    localStorage.setItem("futec_lang", lang);
  } catch (e) {
    // ignore storage errors
  }
}

/**
 * Apply language to the whole page.
 * - Adds body.lang-ko / body.lang-en
 * - Shows elements with .lang-ko / .lang-en accordingly
 * - Updates header language code button if present
 */
function applyLang(lang) {
  const normalized = lang === "en" ? "en" : "ko";
  const isKo = normalized === "ko";

  const body = document.body;
  if (!body) return;

  body.classList.remove("lang-ko", "lang-en");
  body.classList.add(isKo ? "lang-ko" : "lang-en");

  // Toggle per-language elements
  const koNodes = document.querySelectorAll(".lang-ko");
  const enNodes = document.querySelectorAll(".lang-en");

  koNodes.forEach((el) => {
    el.style.display = isKo ? "" : "none";
  });
  enNodes.forEach((el) => {
    el.style.display = isKo ? "none" : "";
  });

  // Update language switcher label if present
  const header = document.querySelector(".site-header");
  if (header) {
    const langCodeEl = header.querySelector(".lang-toggle .lang-code");
    const koOption = header.querySelector('.lang-option[data-lang="ko"]');
    const enOption = header.querySelector('.lang-option[data-lang="en"]');

    if (langCodeEl) {
      langCodeEl.textContent = isKo ? "KOR" : "ENG";
    }

    [koOption, enOption].forEach((btn) => {
      if (!btn) return;
      if (btn.getAttribute("data-lang") === normalized) {
        btn.classList.add("is-active");
      } else {
        btn.classList.remove("is-active");
      }
    });
  }

  saveLang(normalized);
}

// ----------------------
// Header interactions (mega menu, mobile nav, search, language)
// ----------------------
function initHeaderInteractions() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const mainNav = header.querySelector(".main-nav");
  const mobileToggle = header.querySelector(".mobile-menu-toggle");
  const searchToggle = header.querySelector(".search-toggle");
  const searchPanel = header.querySelector(".search-panel");

  // Language switcher elements
  const langToggleBtn = header.querySelector("#langToggleBtn");
  const langDropdown = header.querySelector("#langDropdown");
  const langOptions = langDropdown ? langDropdown.querySelectorAll(".lang-option") : [];

  const menuItems = header.querySelectorAll(".menu-item.has-submenu");
  const desktopMq = window.matchMedia("(min-width: 961px)");

  // -------- Mobile main navigation toggle --------
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");

      // Close mega-menus and search panel when mobile nav state changes
      if (!isOpen) {
        closeAllMegaMenus();
      }
      if (searchPanel) {
        searchPanel.classList.remove("open");
      }
    });
  }

  // -------- Search panel toggle --------
  if (searchToggle && searchPanel) {
    searchToggle.addEventListener("click", () => {
      const nowOpen = !searchPanel.classList.contains("open");
      searchPanel.classList.toggle("open", nowOpen);

      // When opening search panel on desktop, close mega menus
      if (nowOpen && desktopMq.matches) {
        closeAllMegaMenus();
      }
    });
  }

  // -------- Mega menu (Genetec-style) --------
  function closeAllMegaMenus() {
    menuItems.forEach((item) => item.classList.remove("open"));
    header.classList.remove("submenu-open");
  }

  function openMegaMenu(item) {
    if (!item) return;
    menuItems.forEach((mi) => {
      if (mi === item) {
        mi.classList.add("open");
      } else {
        mi.classList.remove("open");
      }
    });
    header.classList.add("submenu-open");
  }

  menuItems.forEach((item) => {
    const trigger = item.querySelector(".menu-link");
    if (!trigger) return;

    // Hover / focus (desktop)
    item.addEventListener("mouseenter", () => {
      if (!desktopMq.matches) return;
      openMegaMenu(item);
    });

    // For keyboard navigation on desktop
    trigger.addEventListener("focus", () => {
      if (!desktopMq.matches) return;
      openMegaMenu(item);
    });

    // Click behavior:
    // - On desktop: click toggles the mega menu instead of navigating.
    // - On mobile: expands/collapses this section within the slide-down menu.
    trigger.addEventListener("click", (event) => {
      const isDesktop = desktopMq.matches;
      const isOpen = item.classList.contains("open");

      // Always prevent default navigation for the top-level buttons,
      // since actual navigation happens via links in the mega menu.
      event.preventDefault();

      if (isDesktop) {
        if (isOpen) {
          item.classList.remove("open");
          header.classList.remove("submenu-open");
        } else {
          openMegaMenu(item);
        }
      } else {
        // Mobile accordion behavior
        if (isOpen) {
          item.classList.remove("open");
        } else {
          // Close others and open this one
          menuItems.forEach((mi) => mi.classList.remove("open"));
          item.classList.add("open");
        }
      }
    });
  });

  // When mouse leaves the whole header area on desktop, close the mega menu
  header.addEventListener("mouseleave", () => {
    if (!desktopMq.matches) return;
    closeAllMegaMenus();
  });

  // Close mega menus on ESC key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllMegaMenus();
      if (langDropdown) {
        langDropdown.classList.remove("open");
      }
      if (searchPanel) {
        searchPanel.classList.remove("open");
      }
    }
  });

  // On viewport resize, close mega menus to avoid broken layouts
  desktopMq.addEventListener("change", () => {
    closeAllMegaMenus();
    if (mainNav) {
      mainNav.classList.remove("open");
    }
  });

  // -------- Language switcher --------
  if (langToggleBtn && langDropdown) {
    langToggleBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      langDropdown.classList.toggle("open");
    });

    langOptions.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        const lang = btn.getAttribute("data-lang") || "ko";
        applyLang(lang);
        langDropdown.classList.remove("open");
      });
    });

    // Close language dropdown when clicking outside
    document.addEventListener("click", (event) => {
      if (!langDropdown.classList.contains("open")) return;
      if (!header.contains(event.target)) {
        langDropdown.classList.remove("open");
      }
    });
  }

  // Initialize language based on saved preference
  applyLang(getSavedLang());
}

// ----------------------
// Footer interactions (admin login modal + language sync)
// ----------------------
function initFooterInteractions() {
  const modal = document.getElementById("adminLoginModal");
  if (!modal) {
    // Still ensure language is synced with header/body
    applyLang(getSavedLang());
    return;
  }

  const overlay = modal;
  const closeButtons = modal.querySelectorAll("[data-close-modal]");
  const adminLinks = document.querySelectorAll('[href="admin.html"], .js-open-admin-modal');

  function openModal(event) {
    if (event) event.preventDefault();
    overlay.classList.add("open");
    document.body.classList.add("modal-open");
  }

  function closeModal(event) {
    if (event) event.preventDefault();
    overlay.classList.remove("open");
    document.body.classList.remove("modal-open");
  }

  adminLinks.forEach((link) => {
    link.addEventListener("click", openModal);
  });

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (overlay.classList.contains("open")) {
        closeModal();
      }
    }
  });

  // Ensure footer language matches current setting
  applyLang(getSavedLang());
}

// ----------------------
// DOM ready
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  loadIncludes();

  // If header/footer not yet loaded (or language not set),
  // still apply saved language to the base document so that
  // non-included content follows the same rule.
  if (
    !document.body.classList.contains("lang-ko") &&
    !document.body.classList.contains("lang-en")
  ) {
    applyLang(getSavedLang());
  }
});
