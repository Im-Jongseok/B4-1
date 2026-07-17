'use strict';

// ==========================================================================
// Projects: GitHub API 저장소 목록 → 카드 렌더링
// - 상태: loading | success | error | empty
// - sessionStorage에 캐싱해 새로고침 시 중복 호출 방지
// ==========================================================================
let GITHUB_REPOS_ENDPOINT = '';
const PROJECTS_CACHE_KEY = 'github-repos';
const PROJECTS_CACHE_TTL_MS = 30 * 60 * 1000; // 캐시 유효 시간 30분 — 레이트 리밋(60회/시간) 보호

const projectsGrid = document.querySelector('.projects__grid');
const projectsStatus = document.querySelector('.projects__status');
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
      <span class="project-card__star"><i data-lucide="star" aria-hidden="true"></i> ${stargazers_count}</span>
    </a>
  </article>
`;

const renderProjectsLoading = () => {
  projectsStatus.hidden = false;
  projectsStatus.innerHTML = '<i data-lucide="loader-circle" aria-hidden="true"></i>';
  projectsGrid.innerHTML = '';
  lucide.createIcons();
};

const renderProjectsEmpty = () => {
  projectsStatus.hidden = false;
  projectsStatus.innerHTML = '<i data-lucide="inbox" aria-hidden="true"></i>';
  projectsGrid.innerHTML = '';
  lucide.createIcons();
};

const renderProjectsError = () => {
  projectsStatus.hidden = false;
  projectsStatus.innerHTML = `
    <p><i data-lucide="triangle-alert" aria-hidden="true"></i></p>
    <button type="button" class="btn projects-retry" aria-label="다시 시도" title="다시 시도"><i data-lucide="refresh-cw" aria-hidden="true"></i></button>
  `;
  projectsGrid.innerHTML = '';
  projectsStatus.querySelector('.projects-retry').addEventListener('click', () => loadProjects(true));
  lucide.createIcons();
};

const renderProjectCards = (repos) => {
  if (repos.length === 0) {
    renderProjectsEmpty();
    return;
  }
  const sortedRepos = [...repos].sort((a, b) => a.name.localeCompare(b.name));
  projectsStatus.hidden = true;
  projectsGrid.innerHTML = sortedRepos.map(renderProjectCard).join('');
  lucide.createIcons();
};

// --------------------------------------------------------------------------
// Skills = 언어 필터: 저장소 language 목록 추출 → 버튼 동적 생성
// - 중복 선택 가능(Set), 선택된 언어를 전부 포함하는 저장소만 표시(교집합), 빈 선택은 전체 표시
// --------------------------------------------------------------------------
const applyLanguageFilter = () => {
  const filteredRepos = selectedLanguages.size === 0
    ? allRepos
    : allRepos.filter((repo) => [...selectedLanguages].every((language) => repo.languages.includes(language)));
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

// 언어명 → devicons.io 아이콘 slug 매핑 (https://devicons.io/#icons)
// 아이콘 폰트(-plain + colored)는 단색이라 브랜드 고유 색(예: Python 파랑/노랑)을 못 살려서
// SVG 원본(-original)을 <img>로 사용
const DEVICON_MAP = {
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  HTML: 'html5',
  CSS: 'css3',
  Python: 'python',
  Java: 'java',
  C: 'c',
  'C++': 'cplusplus',
  'C#': 'csharp',
  Ruby: 'ruby',
  Go: 'go',
  PHP: 'php',
  Swift: 'swift',
  Kotlin: 'kotlin',
  Rust: 'rust',
  Shell: 'bash',
};

const DEVICON_SVG_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

const renderSkillButton = (language) => {
  const slug = DEVICON_MAP[language];
  const iconMarkup = slug
    ? `<img class="skills__filter-icon" src="${DEVICON_SVG_BASE}/${slug}/${slug}-original.svg" alt="" aria-hidden="true"> `
    : '';
  return `<li><button type="button" class="skills__filter" data-language="${language}">${iconMarkup}${language}</button></li>`;
};

const renderSkills = (repos) => {
  const languages = [...new Set(repos.flatMap((repo) => repo.languages))].sort((a, b) =>
    a.localeCompare(b)
  );

  skillsList.innerHTML = languages.map(renderSkillButton).join('');
  skillsList.querySelectorAll('.skills__filter').forEach((button) => {
    button.addEventListener('click', () => toggleLanguageFilter(button));
  });
};

const renderProjects = (repos, { updateSkills = true } = {}) => {
  allRepos = repos;
  if (updateSkills) {
    renderSkills(repos);
  }
  applyLanguageFilter();
};

// 저장소별 사용 언어 상세 조회 (languages_url) — 대표 language 하나가 아닌 실제 사용된 전체 언어 목록
const fetchRepoLanguages = async (repo) => {
  const response = await fetch(repo.languages_url);
  const languages = response.ok ? Object.keys(await response.json()) : [];
  return { ...repo, languages };
};

const loadProjects = async (force = false) => {
  const cached = sessionStorage.getItem(PROJECTS_CACHE_KEY);
  const cachedData = cached ? JSON.parse(cached) : null;

  // 캐시가 아직 유효하면(강제 새로고침이 아닐 때) 재요청 없이 그대로 사용
  if (!force && cachedData && Date.now() - cachedData.timestamp < PROJECTS_CACHE_TTL_MS) {
    renderProjects(cachedData.repos);
    return;
  }

  // 새로고침(force)일 땐 카드만 다시 그리고 Skills 필터 목록은 그대로 유지
  if (!force) {
    renderProjectsLoading();
  }

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
    renderProjects(reposWithLanguages, { updateSkills: !force });
  } catch (error) {
    // 새 요청 실패 시, 만료됐더라도 이전에 저장해둔 값이 있으면 그걸로 표시
    if (cachedData) {
      renderProjects(cachedData.repos, { updateSkills: !force });
    } else {
      renderProjectsError();
    }
  }
};

// data.js가 profile.github.username을 받아온 후 호출 — 저장소 fetch를 시작
const initProjects = (githubUsername) => {
  GITHUB_REPOS_ENDPOINT = `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=12`;
  loadProjects();
};
