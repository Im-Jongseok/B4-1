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
const formSuccess = contactFormEl.querySelector('.form__success');

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

const renderSending = () => {
  submitButton.disabled = true;
  formSuccess.classList.remove('form__success--error');
  formSuccess.innerHTML = '<i data-lucide="loader-circle" aria-hidden="true"></i>';
  lucide.createIcons();
};

const renderSuccess = () => {
  submitButton.disabled = false;
  formSuccess.classList.remove('form__success--error');
  formSuccess.innerHTML = '<i data-lucide="check" aria-hidden="true"></i>';
  lucide.createIcons();
  contactFormEl.reset();
};

const renderError = () => {
  submitButton.disabled = false;
  formSuccess.classList.add('form__success--error');
  formSuccess.innerHTML = '<i data-lucide="triangle-alert" aria-hidden="true"></i>';
  lucide.createIcons();
};

contactFormEl.addEventListener('submit', async (event) => {
  event.preventDefault();

  const isNameValid = validateField(nameInput);
  const isEmailValid = validateField(emailInput);
  const isMessageValid = validateField(messageInput);

  if (!isNameValid || !isEmailValid || !isMessageValid) {
    return;
  }

  renderSending();

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(contactFormEl),
    });

    if (!response.ok) {
      throw new Error(String(response.status));
    }

    renderSuccess();
  } catch (error) {
    renderError();
  }
});
