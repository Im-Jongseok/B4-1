'use strict';

// ==========================================================================
// Projects: GitHub API 저장소 목록 → 카드 렌더링
// - 상태: loading | success | error | empty
// - sessionStorage에 캐싱해 새로고침 시 중복 호출 방지
// ==========================================================================
const GITHUB_USERNAME = 'im-jongseok';
const GITHUB_REPOS_ENDPOINT = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`;
const PROJECTS_CACHE_KEY = 'github-repos';

const projectsGrid = document.querySelector('.projects__grid');
const projectsStatus = document.querySelector('.projects__status');

const renderProjectCard = ({ name, description, html_url, language, stargazers_count }) => `
  <article class="project-card card">
    <a class="project-card__link" href="${html_url}" target="_blank" rel="noopener noreferrer">
      <h4 class="project-card__title">${name}</h4>
      <p class="project-card__description">${description ?? '설명이 없습니다.'}</p>
      <p class="project-card__meta">${language ?? '-'} · [icon: star] ${stargazers_count}</p>
    </a>
  </article>
`;

const renderProjectsLoading = () => {
  projectsStatus.hidden = false;
  projectsStatus.textContent = '프로젝트를 불러오는 중입니다...';
  projectsGrid.innerHTML = '';
};

const renderProjectsEmpty = () => {
  projectsStatus.hidden = false;
  projectsStatus.textContent = '표시할 프로젝트가 없습니다.';
  projectsGrid.innerHTML = '';
};

const renderProjectsError = () => {
  projectsStatus.hidden = false;
  projectsStatus.innerHTML = `
    <p>프로젝트를 불러올 수 없습니다.</p>
    <button type="button" class="btn projects-retry" aria-label="다시 시도">[icon: refresh]</button>
  `;
  projectsGrid.innerHTML = '';
  projectsStatus.querySelector('.projects-retry').addEventListener('click', loadProjects);
};

const renderProjects = (repos) => {
  if (repos.length === 0) {
    renderProjectsEmpty();
    return;
  }
  const sortedRepos = [...repos].sort((a, b) => a.name.localeCompare(b.name));
  projectsStatus.hidden = true;
  projectsGrid.innerHTML = sortedRepos.map(renderProjectCard).join('');
};

const loadProjects = async () => {
  const cached = sessionStorage.getItem(PROJECTS_CACHE_KEY);
  if (cached) {
    renderProjects(JSON.parse(cached));
    return;
  }

  renderProjectsLoading();

  try {
    const response = await fetch(GITHUB_REPOS_ENDPOINT);
    if (!response.ok) {
      throw new Error(String(response.status));
    }
    const repos = await response.json();
    sessionStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(repos));
    renderProjects(repos);
  } catch (error) {
    renderProjectsError();
  }
};

loadProjects();
