// 공통 include 로더: data-include="header.html", "footer.html" 등 처리
function loadIncludes() {
  const includeEls = document.querySelectorAll("[data-include]");
  const promises = [];

  includeEls.forEach((el) => {
    const file = el.getAttribute("data-include");
    if (!file) return;

    const p = fetch(file)
      .then((resp) => {
        if (!resp.ok) {
          throw new Error("Failed to load include: " + file);
        }
        return resp.text();
      })
      .then((html) => {
        // include 대상 요소 자체를 로드된 HTML로 교체
        el.outerHTML = html;
      })
      .catch((err) => {
        console.error(err);
      });

    promises.push(p);
  });

  return Promise.all(promises);
}

// header/footer 포함된 후에 초기화해야 하는 로직
function initSite() {
  // 언어 상태
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

  applyLanguage(currentLang);

  // 언어 토글 버튼
  if (langToggle && langDropdown) {
    langToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = langDropdown.classList.contains("open");
      langDropdown.classList.toggle("open", !isOpen);
      if (langArrowSpan) langArrowSpan.textContent = isOpen ? "▼" : "▲";
    });

    // Language 옵션 (Korean / English)
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

  // 데스크톱 메뉴 hover/active
  const menuItems = document.querySelectorAll(".main-menu .menu-item.has-sub");
  const searchToggleBtn = document.querySelector(".icon-button.search-toggle");
  const searchSubMenu = document.querySelector(".sub-menu-search-panel");

  menuItems.forEach((item) => {
    const arrow = item.querySelector(".menu-arrow");

    item.addEventListener("mouseenter", () => {
      // 다른 메뉴 비활성
      menuItems.forEach((m) => {
        m.classList.remove("active", "open");
        const a = m.querySelector(".menu-arrow");
        if (a) a.textContent = "▼";
      });
      item.classList.add("active", "open");
      if (arrow) arrow.textContent = "▲";
      // 검색 패널 닫기
      if (searchSubMenu) searchSubMenu.classList.remove("active");
    });
  });

  // 헤더 영역 밖으로 나가면 서브메뉴 닫기
  const header = document.querySelector(".site-header");
  if (header) {
    header.addEventListener("mouseleave", () => {
      menuItems.forEach((m) => {
        m.classList.remove("active", "open");
        const a = m.querySelector(".menu-arrow");
        if (a) a.textContent = "▼";
      });
      if (searchSubMenu) {
        searchSubMenu.classList.remove("active");
      }
    });
  }

  // 검색: 돋보기 클릭 시 서브메뉴 영역에서 처리
  if (searchToggleBtn && searchSubMenu) {
    searchToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isActive = searchSubMenu.classList.contains("active");
      // 다른 메뉴 닫기
      menuItems.forEach((m) => {
        m.classList.remove("active", "open");
        const a = m.querySelector(".menu-arrow");
        if (a) a.textContent = "▼";
      });
      searchSubMenu.classList.toggle("active", !isActive);
    });
  }

  // 모바일: 햄버거 메뉴
  const hamburger = document.querySelector(".hamburger");
  const mainNav = document.querySelector(".main-nav");
  if (hamburger && mainNav) {
    hamburger.addEventListener("click", () => {
      mainNav.classList.toggle("active");
    });
  }

  // Footer Inc. 클릭 시 관리자 모달
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
    el.addEventListener("click", openAdminModal);
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

// 페이지 로드 후: 먼저 include, 그 다음 초기화
document.addEventListener("DOMContentLoaded", () => {
  loadIncludes().then(() => {
    initSite();
  });
});
