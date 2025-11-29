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

// Header interactions (수정된 버전)
function initHeaderInteractions() {
  const body = document.body;

  // 저장된 언어 먼저 적용
  applyLang(getSavedLang());

  const header = document.querySelector(".site-header");
  if (!header) return;

  const mainNav = header.querySelector(".main-nav");
  const mobileToggle = header.querySelector(".mobile-menu-toggle");
  const menuItems = header.querySelectorAll(".menu-item.has-submenu");
  const searchToggle = header.querySelector(".search-toggle");
  const searchPanel = header.querySelector(".search-panel");

  // 언어 스위처 요소
  const langToggleBtn = header.querySelector("#langToggleBtn");
  const langDropdown = header.querySelector("#langDropdown");
  const langOptions = langDropdown ? langDropdown.querySelectorAll(".lang-option") : [];

  // 데스크톱 / 모바일 판별
  const desktopMq = window.matchMedia("(min-width: 961px)");
  let currentOpen = null;

  function setHeaderSubmenuState() {
    if (currentOpen && desktopMq.matches) {
      header.classList.add("submenu-open");
    } else {
      header.classList.remove("submenu-open");
    }
  }

  function openMenu(item) {
    if (currentOpen && currentOpen !== item) {
      currentOpen.classList.remove("open");
    }
    currentOpen = item;
    if (currentOpen) {
      currentOpen.classList.add("open");
    }
    setHeaderSubmenuState();
  }

  function closeMenu() {
    if (currentOpen) {
      currentOpen.classList.remove("open");
      currentOpen = null;
    }
    setHeaderSubmenuState();
  }

  // 메가 메뉴: hover / focus / click 처리
  menuItems.forEach((item) => {
    const btn = item.querySelector(".menu-link");
    if (!btn) return;

    // 데스크톱: 마우스 올렸을 때 열기
    item.addEventListener("mouseenter", () => {
      if (!desktopMq.matches) return;
      openMenu(item);
    });

    // 데스크톱: 메뉴 영역(버튼 + 메가 메뉴) 전체에서 벗어났을 때 닫기
    item.addEventListener("mouseleave", (e) => {
      if (!desktopMq.matches) return;
      const related = e.relatedTarget;
      if (!item.contains(related)) {
        closeMenu();
      }
    });

    // 키보드 탭으로 상단 메뉴에 포커스 갔을 때 열기
    btn.addEventListener("focus", () => {
      if (!desktopMq.matches) return;
      openMenu(item);
    });

    // 클릭 동작:
    // - 데스크톱: 링크 이동 대신 메가 메뉴 열기/닫기
    // - 모바일: 아코디언처럼 펼치기/접기
    btn.addEventListener("click", (e) => {
      const menuKey = item.getAttribute("data-menu");
      if (
        menuKey === "products" ||
        menuKey === "industry" ||
        menuKey === "partners" ||
        menuKey === "resources" ||
        menuKey === "company"
      ) {
        e.preventDefault();

        if (desktopMq.matches) {
          // 데스크톱: 토글
          if (item.classList.contains("open")) {
            closeMenu();
          } else {
            openMenu(item);
          }
        } else {
          // 모바일: 아코디언 방식
          const isOpen = item.classList.contains("open");
          menuItems.forEach((mi) => mi.classList.remove("open"));
          if (!isOpen) {
            item.classList.add("open");
          }
          // 모바일에서는 header.submenu-open 은 굳이 쓰지 않음
        }
      }
    });
  });

  // 데스크톱: 헤더 전체 영역에서 벗어나면 서브 메뉴 닫기
  header.addEventListener("mouseleave", () => {
    if (!desktopMq.matches) return;
    closeMenu();
  });

  // ESC 키로 메가 메뉴 / 언어 드롭다운 / 검색 패널 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
      if (langDropdown) langDropdown.classList.remove("open");
      if (searchPanel) searchPanel.classList.remove("open");
    }
  });

  // 모바일: 메인 메뉴 열기/닫기
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener("click", () => {
      mainNav.classList.toggle("open");
      // 모바일 메뉴를 닫을 때 서브 메뉴 상태도 초기화
      if (!mainNav.classList.contains("open")) {
        closeMenu();
      }
    });
  }

  // 검색 패널 열기/닫기
  if (searchToggle && searchPanel) {
    searchToggle.addEventListener("click", () => {
      const willOpen = !searchPanel.classList.contains("open");
      searchPanel.classList.toggle("open", willOpen);

      // 데스크톱에서 검색창 열면 메가 메뉴 닫기
      if (willOpen && desktopMq.matches) {
        closeMenu();
      }
    });
  }

  // 언어 스위처
  if (langToggleBtn && langDropdown) {
    langToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle("open");
    });

    langOptions.forEach((opt) => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        const targetLang = opt.getAttribute("data-lang") || "ko";
        saveLang(targetLang);
        applyLang(targetLang);
        langDropdown.classList.remove("open");
      });
    });

    // 헤더 밖 클릭 시 언어 드롭다운 닫기
    document.addEventListener("click", (e) => {
      if (!langDropdown.classList.contains("open")) return;
      if (!header.contains(e.target)) {
        langDropdown.classList.remove("open");
      }
    });
  }

  // 화면 크기 변경 시 상태 초기화
  desktopMq.addEventListener("change", () => {
    closeMenu();
    if (mainNav) {
      mainNav.classList.remove("open");
    }
  });
}

/* Footer interactions */
function initFooterInteractions() {
  const modal = document.getElementById("adminLoginModal");
  if (!modal) {
    applyLang(getSavedLang());
    return;
  }

  const closeButtons = modal.querySelectorAll("[data-close-modal]");
  const openButtons = document.querySelectorAll("[data-open-admin-modal]");

  function openModal() {
    modal.classList.add("open");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    modal.classList.remove("open");
    document.body.classList.remove("modal-open");
  }

  openButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
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
