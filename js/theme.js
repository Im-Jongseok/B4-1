'use strict';

// ==========================================================================
// 다크 모드: 토글 클릭 → 테마 상태 변경 → data-theme 속성으로 전체 화면 전환
// - 상태는 localStorage에 저장되어 새로고침 후에도 유지
// - index.html 사용
// ==========================================================================
const THEME_STORAGE_KEY = 'theme';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

const themeToggle = document.querySelector('.theme-toggle');

const renderTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === THEME_DARK ? '[icon: sun]' : '[icon: moon]';
};

const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) ?? THEME_LIGHT;
renderTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const nextTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  renderTheme(nextTheme);
});
