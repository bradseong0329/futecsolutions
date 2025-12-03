// assets/js/main.js

/**
 * Load header and footer partials, then initialize interactions.
 */
document.addEventListener("DOMContentLoaded", () => {
  setInitialLanguageOnHtml();
  loadHeaderAndFooter().then(() => {
    initLanguageToggle();
    initMegaMenu();
    initMobileNav();
    initSearchUI();
  });
});

function loadHeaderAndFooter() {
  const headerPlaceholder = document.getElementById("header-placeholder");
  const footerPlaceholder = document.getElementById("footer-placeholder");

  const headerPromise = fetch("partials/header.html")
    .then((res) => res.text())
    .then((html) => {
      if (headerPlaceholder) {
        headerPlaceholder.innerHTML = html;
      }
    });

  const footerPromise = fetch("partials/footer.html")
    .then((res) => res.text())
    .then((html) => {
      if (footerPlaceholder) {
        footerPlaceholder.innerHTML = html;
      }
    });

  return Promise.all([headerPromise, footerPromise]);
}

/* ================================
   Language
   ================================ */

function getStoredLanguage() {
  const saved = localStorage.getItem("siteLanguage");
  return saved === "en" ? "en" : "ko";
}

function setInitialLanguageOnHtml() {
  const lang = getStoredLanguage();
  const html = document.documentElement;
  html.setAttribute("data-lang", lang);
  html.setAttribute("lang", lang === "ko" ? "ko" : "en");
}

function applyLanguage(lang) {
  const html = document.documentElement;
  html.setAttribute("data-lang", lang);
  html.setAttribute("lang", lang === "ko" ? "ko" : "en");
  localStorage.setItem("siteLanguage", lang);

  const labels = document.querySelectorAll(".lang-toggle-label");
  labels.forEach((el) => {
    el.textContent = lang === "ko" ? "KOR" : "ENG";
  });
}

function initLanguageToggle() {
  const current = getStoredLanguage();
  applyLanguage(current);

  // Desktop dropdown
  document.querySelectorAll("[data-lang-select]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang-select");
      applyLanguage(lang);
      closeLangDropdowns();
    });
  });

  document.querySelectorAll(".lang-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const parent = btn.closest(".has-lang");
      if (!parent) return;
      parent.classList.toggle("open");
    });
  });

  document.addEventListener("click", (e) => {
    const isLang = e.target.closest(".has-lang");
    if (!isLang) {
      closeLangDropdowns();
    }
  });

  // Mobile quick buttons
  document.querySelectorAll("[data-mobile-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-mobile-lang");
      applyLanguage(lang);
    });
  });
}

function closeLangDropdowns() {
  document.querySelectorAll(".has-lang.open").forEach((item) => {
    item.classList.remove("open");
  });
}

/* ================================
   Mega menu (desktop)
   ================================ */

function initMegaMenu() {
  const header = document.querySelector(".site-header-wrapper");
  const mega = document.getElementById("mega-menu");
  const divider = document.querySelector(".mega-divider");

  if (!header || !mega || !divider) return;

  const mainMenuItems = document.querySelectorAll(
    ".main-nav__item.has-mega, .main-nav__item.has-search"
  );

  mainMenuItems.forEach((item) => {
    const trigger = item.querySelector(".main-nav__link");
    if (!trigger) return;




    const menu = item.getAttribute("data-menu");
    if (!menu) return;

    // 마우스를 올리면 기존처럼 메가 메뉴 오픈
    item.addEventListener("mouseenter", () => {
      openMega(menu, item, mega, divider);
    });

     // 키보드 포커스로 진입 시에도 오픈
    item.addEventListener("focusin", () => {
      openMega(menu, item, mega, divider);
    });

    // 🔍 검색 아이콘은 아래의 공통 클릭 토글에서 제외 (검색 전용 로직에서 처리)
    if (menu === "search") return;

    // 주 메뉴(텍스트/화살표 포함)를 클릭하면 토글
    trigger.addEventListener("click", (event) => {
      event.preventDefault();

      const isActiveItem = item.classList.contains("active");
      const isMegaOpen = mega.classList.contains("active");

      if (isMegaOpen && isActiveItem) {
        // 이미 이 메뉴의 서브메뉴가 열린 상태에서 다시 클릭 → 닫기
        closeMega(mega, divider);
      } else {
        // 닫혀 있거나 다른 메뉴가 열린 상태에서 클릭 → 이 메뉴 열기
        openMega(menu, item, mega, divider);
      }
     });
   });

  header.addEventListener("mouseleave", (e) => {
    const toElement = e.relatedTarget;
    const isInsideMega =
      toElement && (mega.contains(toElement) || header.contains(toElement));
    if (!isInsideMega) {
      closeMega(mega, divider);
    }
  });

  mega.addEventListener("mouseleave", (e) => {
    const toElement = e.relatedTarget;
    const isInsideHeader = toElement && header.contains(toElement);
    if (!isInsideHeader) {
      closeMega(mega, divider);
    }
  });
}

function openMega(menu, item, mega, divider) {
  const panels = mega.querySelectorAll(".mega-menu__panel");
  panels.forEach((panel) => {
    panel.classList.remove("active");
  });

  const activePanel = mega.querySelector(
    `.mega-menu__panel[data-menu-panel="${menu}"]`
  );
  if (activePanel) {
    activePanel.classList.add("active");
    mega.classList.add("active");
    divider.style.display = "block";
  } else {
    mega.classList.remove("active");
    divider.style.display = "none";
  }

  document
    .querySelectorAll(".main-nav__item.has-mega, .main-nav__item.has-search")
    .forEach((i) => i.classList.remove("active"));

  item.classList.add("active");
}

function closeMega(mega, divider) {
  mega.classList.remove("active");
  divider.style.display = "none";
  document
    .querySelectorAll(".main-nav__item.has-mega, .main-nav__item.has-search")
    .forEach((i) => i.classList.remove("active"));
}

/* ================================
   Mobile navigation
   ================================ */

function initMobileNav() {
  const toggle = document.querySelector(".site-header__mobile-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  if (!toggle || !mobileNav) return;

  const closeAllItems = () => {
    document.querySelectorAll(".mobile-nav__item.expanded").forEach((item) => {
      item.classList.remove("expanded");
      const btn = item.querySelector(".mobile-nav__toggle");
      if (btn) {
        btn.setAttribute("aria-expanded", "false");
      }
    });
  };

  // 햄버거 버튼 클릭 시 전체 모바일 메뉴 열기/닫기
  toggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    if (!isOpen) {
      // 닫힐 때는 펼쳐진 서브메뉴 모두 접기
      closeAllItems();
    }
  });

  // 어코디온 형태의 1뎁스 메뉴 토글
  document.querySelectorAll(".mobile-nav__toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".mobile-nav__item");
      if (!item) return;

      const isExpanded = item.classList.contains("expanded");

      // 다른 항목은 모두 접기
      closeAllItems();

      // 현재 클릭한 항목만 토글
      if (!isExpanded) {
        item.classList.add("expanded");
        btn.setAttribute("aria-expanded", "true");
      } else {
        item.classList.remove("expanded");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  });
}

/* ================================
   Search (UI only)
   ================================ */

function initSearchUI() {
  const searchToggle = document.querySelector(".search-toggle-btn");
  if (!searchToggle) return;

  const mega = document.getElementById("mega-menu");
  const divider = document.querySelector(".mega-divider");

  searchToggle.addEventListener("click", (e) => {
    e.preventDefault();
    const parentItem = searchToggle.closest(".main-nav__item");
    if (!parentItem) return;

    const panel = mega.querySelector('[data-menu-panel="search"]');
    if (!panel) return;

    const isActive = panel.classList.contains("active");

    if (isActive) {
      closeMega(mega, divider);
    } else {
      openMega("search", parentItem, mega, divider);
      const input = panel.querySelector('input[type="text"]');
      if (input) {
        setTimeout(() => input.focus(), 50);
      }
    }
  });

  // Mobile search placeholder
  document.querySelectorAll("[data-mobile-search]").forEach((btn) => {
    btn.addEventListener("click", () => {
      alert(
        "검색 기능은 곧 제공될 예정입니다.\n\nSearch functionality will be available soon."
      );
    });
  });
}
