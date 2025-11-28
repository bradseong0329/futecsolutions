// include 로더: data-include="header.html" / "footer.html" 등
function loadIncludes() {
  const includeEls = document.querySelectorAll("[data-include]");
  const promises = [];

  includeEls.forEach((el) => {
    const file = el.getAttribute("data-include");
    if (!file) return;

    const p = fetch(file)
      .then((resp) => {
        if (!resp.ok) throw new Error("Failed to load include: " + file);
        return resp.text();
      })
      .then((html) => {
        el.outerHTML = html;
      })
      .catch((err) => console.error(err));

    promises.push(p);
  });

  return Promise.all(promises);
}

function isMobile() {
  return window.matchMedia("(max-width: 720px)").matches;
}

function initLanguageSwitcher() {
  let currentLang = localStorage.getItem("futec_lang") || "ko";
  const langToggle = document.querySelector(".lang-toggle");
  const langDropdown = document.querySelector(".lang-dropdown-panel");
  const langCodeSpan = document.querySelector(".lang-code");
  const langArrowSpan = document.querySelector(".lang-arrow");

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("futec_lang", lang);

    const koEls = document.querySelectorAll(".lang-ko");
    const enEls = document.querySelectorAll(".lang-en");

    if (lang === "ko") {
      koEls.forEach((el) => (el.style.display = ""));
      enEls.forEach((el) => (el.style.display = "none"));
      if (langCodeSpan) langCodeSpan.textContent = "KOR";
    } else {
      koEls.forEach((el) => (el.style.display = "none"));
      enEls.forEach((el) => (el.style.display = ""));
      if (langCodeSpan) langCodeSpan.textContent = "ENG";
    }
  }

  // 초기 적용
  applyLanguage(currentLang);

  if (!langToggle || !langDropdown) return;

  langToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = langDropdown.classList.contains("open");
    langDropdown.classList.toggle("open", !isOpen);
    if (langArrowSpan) langArrowSpan.textContent = isOpen ? "▼" : "▲";
  });

  langDropdown.querySelectorAll(".lang-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetLang = btn.dataset.lang;
      applyLanguage(targetLang);
      langDropdown.classList.remove("open");
      if (langArrowSpan) langArrowSpan.textContent = "▼";
    });
  });

  document.addEventListener("click", (e) => {
    if (!langDropdown.contains(e.target) && !langToggle.contains(e.target)) {
      langDropdown.classList.remove("open");
      if (langArrowSpan) langArrowSpan.textContent = "▼";
    }
  });
}

function initMenusAndSearch() {
  const menuItems = document.querySelectorAll(".main-menu .menu-item.has-sub");
  const searchToggleBtn = document.querySelector(".icon-button.search-toggle");
  const searchSubMenu = document.querySelector(".sub-menu-search-panel");
  const hamburger = document.querySelector(".hamburger");
  const mainNav = document.querySelector(".main-nav");

  function closeAllMenus() {
    menuItems.forEach((m) => {
      m.classList.remove("active", "open");
      const a = m.querySelector(".menu-arrow");
      if (a) a.textContent = "▼";
    });
    if (searchSubMenu) searchSubMenu.classList.remove("active");
  }

  function openMenu(item) {
    closeAllMenus();
    item.classList.add("active", "open");
    const arrow = item.querySelector(".menu-arrow");
    if (arrow) arrow.textContent = "▲";
  }

  function closeMenu(item) {
    item.classList.remove("active", "open");
    const arrow = item.querySelector(".menu-arrow");
    if (arrow) arrow.textContent = "▼";
  }

  // 데스크톱 모드 (호버)
  if (!isMobile()) {
    menuItems.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        openMenu(item);
      });
      item.addEventListener("mouseleave", (e) => {
        if (!item.contains(e.relatedTarget)) {
          closeMenu(item);
        }
      });
    });

    // 헤더 전체 영역에서 완전히 벗어나는 경우 닫기 (옵션)
    const header = document.querySelector(".site-header");
    if (header) {
      header.addEventListener("mouseleave", () => {
        closeAllMenus();
      });
    }
  } else {
    // 모바일 모드 (클릭 아코디언)
    menuItems.forEach((item) => {
      const link = item.querySelector("a");
      if (!link) return;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const isOpen = item.classList.contains("active");
        if (isOpen) {
          closeMenu(item);
        } else {
          closeAllMenus();
          openMenu(item);
        }
      });
    });
  }

  // 검색 서브메뉴 (돋보기 클릭 시)
  if (searchToggleBtn && searchSubMenu) {
    searchToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isActive = searchSubMenu.classList.contains("active");
      closeAllMenus();
      searchSubMenu.classList.toggle("active", !isActive);
    });
  }

  // 모바일 햄버거 토글
  if (hamburger && mainNav) {
    hamburger.addEventListener("click", () => {
      mainNav.classList.toggle("active");
      if (!mainNav.classList.contains("active")) {
        closeAllMenus();
      }
    });
  }
}

function initAdminModal() {
  const adminModal = document.getElementById("admin-modal");
  const adminLoginForm = document.getElementById("admin-login-form");
  const adminCancelBtn = document.getElementById("admin-cancel-btn");
  const incTriggers = document.querySelectorAll(".footer-inc-trigger");

  function openAdminModal() {
    if (adminModal) adminModal.classList.add("active");
  }

  function closeAdminModal() {
    if (adminModal) adminModal.classList.remove("active");
  }

  incTriggers.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openAdminModal();
    });
  });

  if (adminCancelBtn) {
    adminCancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeAdminModal();
    });
  }

  if (adminModal) {
    adminModal.addEventListener("click", (e) => {
      if (e.target === adminModal) {
        closeAdminModal();
      }
    });
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("admin-id").value.trim();
      const pw = document.getElementById("admin-password").value.trim();
      if (id === "administrator" && pw === "W@n831921@") {
        closeAdminModal();
        window.location.href = "admin.html";
      } else {
        alert("ID 또는 비밀번호가 올바르지 않습니다.");
        closeAdminModal();
      }
    });
  }
}

function initSite() {
  initLanguageSwitcher();
  initMenusAndSearch();
  initAdminModal();
}

document.addEventListener("DOMContentLoaded", () => {
  loadIncludes().then(() => {
    initSite();
  });
});
