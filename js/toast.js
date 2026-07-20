'use strict';

// ==========================================================================
// 작은 진행/결과 토스트 — 문의 폼 전송 상태(로딩/성공/실패)를 모달과 별개로 표시
// - 상태: loading | success | error
// ==========================================================================
const TOAST_AUTO_HIDE_MS = 4000;

const toastEl = document.querySelector('.toast');
const toastMessage = toastEl.querySelector('.toast__message');

let toastHideTimer = null;

const showToast = (variant, icon, message) => {
  clearTimeout(toastHideTimer);
  toastEl.className = `toast toast--active toast--${variant}`;
  // lucide.createIcons()가 <i>를 <svg>로 통째로 교체하므로 매번 새로 조회해야 함
  toastEl.querySelector('.toast__icon').setAttribute('data-lucide', icon);
  toastMessage.textContent = message;
  lucide.createIcons();

  if (variant !== 'loading') {
    toastHideTimer = setTimeout(() => {
      toastEl.classList.remove('toast--active');
    }, TOAST_AUTO_HIDE_MS);
  }
};
