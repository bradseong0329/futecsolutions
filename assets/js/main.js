// 상단 메뉴/버튼 클릭 시 부드러운 스크롤
  document.querySelectorAll("[data-scroll]").forEach(function (el) {
    el.addEventListener("click", function () {
      var targetSelector = el.getAttribute("data-scroll");
      if (!targetSelector) return;
      var target = document.querySelector(targetSelector);
      if (!target) return;
      window.scrollTo({
        top: target.offsetTop - 70,
        behavior: "smooth",
      });
      var navMenu = document.getElementById("navMenu");
      navMenu.classList.remove("open");
    });
  });

// 모바일 메뉴 토글
document.getElementById("menuToggle").addEventListener("click", function () {
  var navMenu = document.getElementById("navMenu");
  navMenu.classList.toggle("open");
});

// 스크롤 위치에 따라 헤더 색상 변경
var headerEl = document.querySelector("header");
function handleHeaderScroll() {
  if (window.scrollY > 10) {
    headerEl.classList.add("scrolled");
  } else {
    headerEl.classList.remove("scrolled");
  }
}
window.addEventListener("scroll", handleHeaderScroll);
// 초기 로드 시에도 한 번 상태 반영
handleHeaderScroll();