'use strict';

// ==========================================================================
// 해시 기반 라우터: location.hash → 네 개의 .view 중 하나만 표시
// - 화면 깜빡임 방지: theme.js의 renderTheme()과 동일한 패턴으로 스크립트
//   최상단에서 즉시 동기 실행 (load/DOMContentLoaded 리스너 안에 넣지 않음)
// - 잘못되었거나 없는 해시는 기본 라우트(home)로 대체
// - "post/3"처럼 라우트 뒤에 파라미터가 붙을 수 있음(글 상세) — 라우터는 이 파라미터의
//   의미를 모르고 그냥 넘겨주기만 함(blog.js가 실제 상세 렌더링을 담당, 관심사 분리)
// - index.html 사용
// ==========================================================================
const DEFAULT_ROUTE = 'home';
const ROUTES = ['home', 'about', 'blog', 'post'];

const viewEls = document.querySelectorAll('.view');
const navLinkEls = document.querySelectorAll('.nav__link');

const getRouteFromHash = () => {
  const [route, param] = location.hash.slice(1).split('/');
  return ROUTES.includes(route) ? { route, param } : { route: DEFAULT_ROUTE, param: undefined };
};

const renderRoute = ({ route }) => {
  viewEls.forEach((view) => {
    view.classList.toggle('view--active', view.dataset.view === route);
  });

  navLinkEls.forEach((link) => {
    const isActive = link.getAttribute('href').slice(1) === route;
    link.classList.toggle('nav__link--active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  // scroll-behavior: smooth가 라우트 전환에도 걸려 눈에 보이게 스크롤되는 것 방지
  window.scrollTo({ top: 0, behavior: 'instant' });
};

const navigateTo = (route) => {
  location.hash = route; // hashchange 이벤트가 자동으로 renderRoute를 호출함
};

window.addEventListener('hashchange', () => renderRoute(getRouteFromHash()));
renderRoute(getRouteFromHash()); // 최초 로드 시 즉시 동기 실행 — 깜빡임 방지
