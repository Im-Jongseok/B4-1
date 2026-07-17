'use strict';

// ==========================================================================
// Projects: GitHub API 저장소 목록 → 카드 렌더링
// - 상태: loading | success | error | empty
// - sessionStorage에 캐싱해 새로고침 시 중복 호출 방지
// ==========================================================================
const GITHUB_USERNAME = 'im-jongseok';
const GITHUB_REPOS_ENDPOINT = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`;
const PROJECTS_CACHE_KEY = 'github-repos';
const PROJECTS_CACHE_TTL_MS = 5 * 60 * 1000; // 캐시 유효 시간 5분 — 레이트 리밋(60회/시간) 보호

const projectsGrid = document.querySelector('.projects__grid');
const projectsStatus = document.querySelector('.projects__status');
const projectsRefresh = document.querySelector('.projects__refresh');
const skillsList = document.querySelector('.skills__list');

let allRepos = [];
const selectedLanguages = new Set();

const renderLanguageBadges = (languages) =>
  languages.length === 0
    ? '<span class="project-card__lang">-</span>'
    : languages.map((language) => `<span class="project-card__lang">${language}</span>`).join('');

const renderProjectCard = ({ name, description, html_url, languages, stargazers_count }) => `
  <article class="project-card card">
    <a class="project-card__link" href="${html_url}" target="_blank" rel="noopener noreferrer">
      <h4 class="project-card__title">${name}</h4>
      <p class="project-card__description">${description ?? '설명이 없습니다.'}</p>
      <div class="project-card__langs">${renderLanguageBadges(languages)}</div>
      <span class="project-card__star">[icon: star] ${stargazers_count}</span>
    </a>
  </article>
`;

const renderProjectsLoading = () => {
  projectsStatus.hidden = false;
  projectsStatus.textContent = '[icon: loader]';
  projectsGrid.innerHTML = '';
};

const renderProjectsEmpty = () => {
  projectsStatus.hidden = false;
  projectsStatus.textContent = '[icon: inbox]';
  projectsGrid.innerHTML = '';
};

const renderProjectsError = () => {
  projectsStatus.hidden = false;
  projectsStatus.innerHTML = `
    <p>[icon: alert-triangle]</p>
    <button type="button" class="btn projects-retry" aria-label="다시 시도">[icon: refresh]</button>
  `;
  projectsGrid.innerHTML = '';
  projectsStatus.querySelector('.projects-retry').addEventListener('click', () => loadProjects(true));
};

const renderProjectCards = (repos) => {
  if (repos.length === 0) {
    renderProjectsEmpty();
    return;
  }
  const sortedRepos = [...repos].sort((a, b) => a.name.localeCompare(b.name));
  projectsStatus.hidden = true;
  projectsGrid.innerHTML = sortedRepos.map(renderProjectCard).join('');
};

// --------------------------------------------------------------------------
// Skills = 언어 필터: 저장소 language 목록 추출 → 버튼 동적 생성
// - 중복 선택 가능(Set), 선택된 언어 중 하나라도 해당하면 표시, 빈 선택은 전체 표시
// --------------------------------------------------------------------------
const applyLanguageFilter = () => {
  const filteredRepos = selectedLanguages.size === 0
    ? allRepos
    : allRepos.filter((repo) => repo.languages.some((language) => selectedLanguages.has(language)));
  renderProjectCards(filteredRepos);
};

const toggleLanguageFilter = (button) => {
  const { language } = button.dataset;
  const isActive = selectedLanguages.has(language);

  if (isActive) {
    selectedLanguages.delete(language);
  } else {
    selectedLanguages.add(language);
  }
  button.classList.toggle('active', !isActive);

  applyLanguageFilter();
};

const renderSkillButton = (language) => `
  <li><button type="button" class="skills__filter" data-language="${language}">[badge: ${language}]</button></li>
`;

const renderSkills = (repos) => {
  const languages = [...new Set(repos.flatMap((repo) => repo.languages))].sort((a, b) =>
    a.localeCompare(b)
  );

  skillsList.innerHTML = languages.map(renderSkillButton).join('');
  skillsList.querySelectorAll('.skills__filter').forEach((button) => {
    button.addEventListener('click', () => toggleLanguageFilter(button));
  });
};

const renderProjects = (repos) => {
  allRepos = repos;
  renderSkills(repos);
  applyLanguageFilter();
};

// 저장소별 사용 언어 상세 조회 (languages_url) — 대표 language 하나가 아닌 실제 사용된 전체 언어 목록
const fetchRepoLanguages = async (repo) => {
  const response = await fetch(repo.languages_url);
  const languages = response.ok ? Object.keys(await response.json()) : [];
  return { ...repo, languages };
};

const loadProjects = async (force = false) => {
  const cached = force ? null : sessionStorage.getItem(PROJECTS_CACHE_KEY);
  if (cached) {
    const { timestamp, repos } = JSON.parse(cached);
    if (Date.now() - timestamp < PROJECTS_CACHE_TTL_MS) {
      renderProjects(repos);
      return;
    }
  }

  renderProjectsLoading();

  try {
    const response = await fetch(GITHUB_REPOS_ENDPOINT);
    if (!response.ok) {
      throw new Error(String(response.status));
    }
    const repos = await response.json();
    const reposWithLanguages = await Promise.all(repos.map(fetchRepoLanguages));
    sessionStorage.setItem(
      PROJECTS_CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), repos: reposWithLanguages })
    );
    renderProjects(reposWithLanguages);
  } catch (error) {
    renderProjectsError();
  }
};

projectsRefresh.addEventListener('click', () => loadProjects(true));

loadProjects();
