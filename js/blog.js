'use strict';

// ==========================================================================
// Blog: 글 목록 렌더링 + 글 클릭 시 상세(#post/{id})로 이동 — 시드 데이터만 표시
// (글쓰기 기능은 아직 미구현)
// - index.html 사용
// ==========================================================================
const posts = [
  { id: 1, title: '첫 번째 글', content: '블로그를 시작합니다.', createdAt: '2026-06-20T09:00:00.000Z' },
  { id: 2, title: '두 번째 글', content: '포트폴리오를 블로그 구조로 옮기는 중입니다.', createdAt: '2026-07-10T09:00:00.000Z' },
];

const blogListEl = document.querySelector('.blog__list');
const blogPostDetailBodyEl = document.querySelector('.blog-post-detail__body');

const formatPostDate = (isoString) => new Date(isoString).toLocaleDateString('ko-KR');

const renderPostCard = ({ id, title, content, createdAt }) => `
  <li>
    <article class="blog-post card">
      <a class="blog-post__link" href="#post/${id}">
        <h4 class="blog-post__title">${title}</h4>
        <p class="blog-post__date">${formatPostDate(createdAt)}</p>
        <p class="blog-post__excerpt">${content}</p>
      </a>
    </article>
  </li>
`;

const renderPosts = () => {
  const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  blogListEl.innerHTML = sortedPosts.map(renderPostCard).join('');
};

renderPosts();

// --------------------------------------------------------------------------
// 글 상세: 라우터(js/router.js)는 라우트 이름만 알고 파라미터 의미는 모름 —
// "post" 라우트일 때 실제 내용 렌더링은 여기서 담당
// --------------------------------------------------------------------------
const renderPostDetail = (id) => {
  const post = posts.find((p) => String(p.id) === String(id));
  if (!post) {
    return;
  }
  blogPostDetailBodyEl.innerHTML = `
    <h4 class="blog-post-detail__title">${post.title}</h4>
    <p class="blog-post-detail__date">${formatPostDate(post.createdAt)}</p>
    <p class="blog-post-detail__content">${post.content}</p>
  `;
};

const renderPostDetailFromHash = () => {
  const { route, param } = getRouteFromHash(); // js/router.js가 전역에 노출
  if (route === 'post') {
    renderPostDetail(param);
  }
};

window.addEventListener('hashchange', renderPostDetailFromHash);
renderPostDetailFromHash(); // #post/{id}로 바로 진입(새로고침)했을 때도 즉시 렌더링
