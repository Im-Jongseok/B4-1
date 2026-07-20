'use strict';

// ==========================================================================
// 문의 폼: 입력 검증 → 에러 상태 렌더링, 유효하면 Formspree로 전송
// - 상태: idle | sending | success | error
// ==========================================================================
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xkodjrbp';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const contactFormEl = document.querySelector('.contact__form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');
const submitButton = document.querySelector('.contact__form-send');

const setFieldError = (input, message) => {
  document.getElementById(`${input.id}-error`).textContent = message;
};

const validateField = (input) => {
  const value = input.value.trim();

  if (value === '') {
    setFieldError(input, '필수 입력 항목입니다.');
    return false;
  }

  if (input.type === 'email' && !EMAIL_PATTERN.test(value)) {
    setFieldError(input, '올바른 이메일 형식이 아닙니다.');
    return false;
  }

  setFieldError(input, '');
  return true;
};

[nameInput, emailInput, messageInput].forEach((input) => {
  input.addEventListener('input', () => validateField(input));
});

contactFormEl.addEventListener('submit', async (event) => {
  event.preventDefault();

  const isNameValid = validateField(nameInput);
  const isEmailValid = validateField(emailInput);
  const isMessageValid = validateField(messageInput);

  if (!isNameValid || !isEmailValid || !isMessageValid) {
    return;
  }

  // 폼 모달은 닫고, 전송 진행 상황은 별개의 작은 토스트로 보여줌
  closeContactModal();
  submitButton.disabled = true;
  showToast('loading', 'loader-circle', '전송 중입니다...');

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(contactFormEl),
    });

    if (!response.ok) {
      throw new Error(String(response.status));
    }

    showToast('success', 'circle-check', '메일이 성공적으로 전송되었습니다.');
    contactFormEl.reset();
  } catch (error) {
    showToast('error', 'circle-x', '전송에 실패했습니다.');
  } finally {
    submitButton.disabled = false;
  }
});
