'use strict';

// ==========================================================================
// 문의 폼 팝업: mail 아이콘 버튼 클릭 → 모달 표시 상태 토글
// - 닫기: 닫기 버튼, 배경(backdrop) 클릭, Esc 키
// ==========================================================================
const formToggle = document.querySelector('.form-toggle');
const contactModal = document.querySelector('.contact__modal');
const contactFormClose = document.querySelector('.contact__form-close');

const openContactModal = () => {
  contactModal.classList.add('visible');
  formToggle.setAttribute('aria-expanded', 'true');
};

const closeContactModal = () => {
  contactModal.classList.remove('visible');
  formToggle.setAttribute('aria-expanded', 'false');
};

formToggle.addEventListener('click', openContactModal);
contactFormClose.addEventListener('click', closeContactModal);

// 배경(모달 바깥) 클릭 시 닫기 — 폼 내부 클릭은 무시
contactModal.addEventListener('click', (event) => {
  if (event.target === contactModal) {
    closeContactModal();
  }
});

// Esc 키로 닫기
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && contactModal.classList.contains('visible')) {
    closeContactModal();
  }
});
