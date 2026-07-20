'use strict';

// ==========================================================================
// Blog: 글 목록 렌더링 — 시드 데이터만 표시 (글쓰기 기능은 아직 미구현)
// - index.html 사용
// ==========================================================================
const posts = [
  { id: 1, title: '첫 번째 글', content: '블로그를 시작합니다.', createdAt: '2026-06-20T09:00:00.000Z' },
  { id: 2, title: '두 번째 글', content: '포트폴리오를 블로그 구조로 옮기는 중입니다.', createdAt: '2026-07-10T09:00:00.000Z' },
];

const blogListEl = document.querySelector('.blog__list');

const formatPostDate = (isoString) => new Date(isoString).toLocaleDateString('ko-KR');

const renderPostCard = ({ title, content, createdAt }) => `
  <li>
    <article class="blog-post card">
      <h4 class="blog-post__title">${title}</h4>
      <p class="blog-post__date">${formatPostDate(createdAt)}</p>
      <p class="blog-post__excerpt">${content}</p>
    </article>
  </li>
`;

const renderPosts = () => {
  const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  blogListEl.innerHTML = sortedPosts.map(renderPostCard).join('');
};

renderPosts();
