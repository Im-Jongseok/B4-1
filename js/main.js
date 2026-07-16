'use strict';

// ==========================================================================
// Portfolio Main Script
// - 사용자 이벤트 → 상태 변경 → DOM 업데이트 흐름으로 구성
// ==========================================================================

// --------------------------------------------------------------------------
// 상수 — 동작 기준값 (README에 명시)
// --------------------------------------------------------------------------
const NAV_BACKGROUND_SCROLL_Y = 60; // 이 값 이상 스크롤 시 네비 배경 변경

// --------------------------------------------------------------------------
// 요소 선택
// --------------------------------------------------------------------------
const header = document.querySelector('.header');
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('.header__nav');
const navLinks = document.querySelectorAll('.nav__link');
const scrollTopButton = document.querySelector('.scroll-top');

// --------------------------------------------------------------------------
// 햄버거 메뉴: 클릭 → 열림 상태 토글 → 오른쪽 드롭다운 패널 표시/숨김
// --------------------------------------------------------------------------
hamburger.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('active');
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

// 메뉴 링크 클릭 → 메뉴 닫기 (섹션 이동은 앵커 + CSS smooth scroll이 처리)
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// --------------------------------------------------------------------------
// 스크롤 상태 → 화면 업데이트
// - 네비 배경: 기준값 이상 스크롤 시 .scrolled
// - 스크롤 탑 버튼: 스크롤을 내리기 시작하면 .visible
// --------------------------------------------------------------------------
const renderScrollState = () => {
  const { scrollY } = window;
  header.classList.toggle('scrolled', scrollY > NAV_BACKGROUND_SCROLL_Y);
  scrollTopButton.classList.toggle('visible', scrollY > 0);
};

window.addEventListener('scroll', renderScrollState);
renderScrollState(); // 새로고침 시 현재 스크롤 위치 반영

// 스크롤 탑 버튼: 클릭 → 페이지 맨 위로 부드럽게 이동
scrollTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
