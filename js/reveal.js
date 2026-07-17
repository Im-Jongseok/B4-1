'use strict';

// ==========================================================================
// 스크롤 리빌: 섹션이 뷰포트에 threshold 이상 보이면 .visible 추가 → CSS 트랜지션으로 등장
// ==========================================================================
const REVEAL_THRESHOLD = 0.2;

const revealTargets = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: REVEAL_THRESHOLD }
);

revealTargets.forEach((target) => revealObserver.observe(target));
