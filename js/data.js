'use strict';

// ==========================================================================
// 사이트 데이터: data/data.json → profile(개인정보)/hero(고정 인사말) 렌더링
// - 스키마: { profile: { name, logo, about, email, github: { username, url } }, hero: { title, subtitle } }
// - 추후 DB 연동 시 이 fetch만 API 호출로 교체하면 되도록 스키마 분리
// - fetch 실패 시 HTML에 이미 있는 플레이스홀더를 그대로 유지(콘솔 경고만)
// ==========================================================================
const DATA_ENDPOINT = 'data/data.json';

const headerLogo = document.querySelector('.header__logo');
const heroTitle = document.querySelector('.hero__title');
const heroSubtitle = document.querySelector('.hero__subtitle');
const aboutPhoto = document.querySelector('.about__photo');
const aboutText = document.querySelector('.about__text p');
const footerCopyright = document.querySelector('.footer__copyright');
const pageDescription = document.querySelector('meta[name="description"]');
const contactGithub = document.querySelector('.contact__github');
const contactEmail = document.querySelector('.contact__email');

const renderProfile = ({ name, logo, about, email, github }) => {
  document.title = `${name} | 포트폴리오`;
  pageDescription.setAttribute('content', `${name}의 포트폴리오 웹사이트`);
  headerLogo.textContent = logo;
  aboutPhoto.setAttribute('src', `https://github.com/${github.username}.png`);
  aboutPhoto.setAttribute('alt', `${name} 프로필 이미지`);
  aboutText.textContent = about;
  footerCopyright.textContent = `© ${new Date().getFullYear()} ${name}. All rights reserved.`;
  contactGithub.setAttribute('href', github.url);
  contactEmail.setAttribute('href', `mailto:${email}`);
  initProjects(github.username);
};

const renderHero = ({ title, subtitle }) => {
  heroTitle.textContent = title;
  heroSubtitle.textContent = subtitle;
};

const loadData = async () => {
  try {
    const response = await fetch(DATA_ENDPOINT);
    if (!response.ok) {
      throw new Error(String(response.status));
    }
    const { profile, hero } = await response.json();
    renderProfile(profile);
    renderHero(hero);
  } catch (error) {
    console.warn('데이터를 불러오지 못했습니다:', error);
  }
};

loadData();
