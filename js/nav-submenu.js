'use strict';

// ==========================================================================
// 네비 "소개" 서브메뉴(About/Skill/Project): 클릭 → about 라우트로 이동 후
// 해당 하위 섹션으로 스크롤
// - about 라우트가 아니면 hashchange(라우터가 뷰 전환 + 스크롤 top 리셋)를
//   먼저 기다렸다가 스크롤 — 이미 about 라우트면 바로 스크롤
// - index.html 사용
// ==========================================================================
const submenuLinks = document.querySelectorAll('.nav__submenu-link');

const scrollToAboutSection = (targetId) => {
  const target = document.getElementById(targetId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
};

submenuLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const targetId = link.dataset.scrollTarget;

    if (getRouteFromHash() === 'about') {
      scrollToAboutSection(targetId);
    } else {
      window.addEventListener('hashchange', () => scrollToAboutSection(targetId), { once: true });
      navigateTo('about');
    }

    nav.classList.remove('header__nav--active'); // 모바일 드롭다운 닫기 (main.js와 동일 동작)
    hamburger.setAttribute('aria-expanded', 'false');
  });
});
