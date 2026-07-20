'use strict';

// ==========================================================================
// Projects: GitHub API 저장소 목록 → 카드 렌더링
// - 상태: loading | success | error | empty
// - sessionStorage에 캐싱해 새로고침 시 중복 호출 방지
// ==========================================================================
const GITHUB_USERNAME = 'Im-Jongseok';
const GITHUB_REPOS_ENDPOINT = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`;
const PROJECTS_CACHE_KEY = 'github-repos-v3';
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
  projectsStatus.innerHTML = `
    <i data-lucide="loader-circle" class="projects__status-icon projects__status-icon--spin" aria-hidden="true"></i>
    <p>불러오는 중입니다...</p>
  `;
  projectsGrid.innerHTML = '';
  lucide.createIcons();
};

const renderProjectsEmpty = () => {
  projectsStatus.hidden = false;
  projectsStatus.innerHTML = `
    <i data-lucide="inbox" class="projects__status-icon" aria-hidden="true"></i>
    <p>표시할 프로젝트가 없습니다.</p>
  `;
  projectsGrid.innerHTML = '';
  lucide.createIcons();
};

const renderProjectsError = () => {
  projectsStatus.hidden = false;
  projectsStatus.innerHTML = `
    <i data-lucide="triangle-alert" class="projects__status-icon" aria-hidden="true"></i>
    <p>프로젝트를 불러올 수 없습니다.</p>
    <button type="button" class="btn projects__retry" aria-label="다시 시도" title="다시 시도"><i data-lucide="refresh-cw" aria-hidden="true"></i></button>
  `;
  projectsGrid.innerHTML = '';
  projectsStatus.querySelector('.projects__retry').addEventListener('click', () => loadProjects(true));
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
  button.classList.toggle('skills__filter--active', !isActive);

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
  Docker: 'docker',
  Git: 'git',
  Linux: 'linux',
};

// GitHub linguist가 세분화해서 잡는 Docker 관련 언어명 → 하나로 합쳐서 "Docker"로 표시
const SKILL_ALIAS_MAP = {
  Dockerfile: 'Docker',
  'Docker Compose': 'Docker',
};

// GitHub 언어 감지로는 절대 안 잡히는 항목(도구/OS) — Skills 목록에 항상 고정으로 포함
const HARDCODED_SKILLS = ['Git', 'Linux'];

// 카테고리 분류 — 순서가 곧 렌더링 순서. 매핑 없는 언어는 CATEGORY_FALLBACK로 감.
// Frontend/Backend는 프레임워크·라이브러리 전용 — GitHub API로는 감지가 안 되는 정보라
// 지금은 매핑이 없어 비어있음(항목 없으면 렌더링 자체가 생략됨), 언어는 전부 Language로 우선 분류
const SKILL_CATEGORIES = ['Language', 'Frontend', 'Backend', 'DevOps', 'Collaboration'];
const CATEGORY_FALLBACK = 'Language';
const SKILL_CATEGORY_MAP = {
  JavaScript: 'Language',
  TypeScript: 'Language',
  HTML: 'Language',
  CSS: 'Language',
  Python: 'Language',
  Java: 'Language',
  Ruby: 'Language',
  Go: 'Language',
  PHP: 'Language',
  C: 'Language',
  'C++': 'Language',
  'C#': 'Language',
  Swift: 'Language',
  Kotlin: 'Language',
  Rust: 'Language',
  Shell: 'DevOps',
  Docker: 'DevOps',
  Linux: 'DevOps',
  Git: 'Collaboration',
};

const DEVICON_SVG_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

const renderSkillButton = (language) => {
  const slug = DEVICON_MAP[language];
  const iconMarkup = slug
    ? `<img class="skills__filter-icon" src="${DEVICON_SVG_BASE}/${slug}/${slug}-original.svg" alt="" aria-hidden="true"> `
    : '';
  return `<li><button type="button" class="skills__filter" data-language="${language}">${iconMarkup}${language}</button></li>`;
};

const renderSkillGroup = (category, languages) => `
  <div class="skills__group">
    <h4 class="skills__group-title">${category}</h4>
    <ul class="skills__group-list">${languages.map(renderSkillButton).join('')}</ul>
  </div>
`;

const renderSkills = (repos) => {
  const languages = [...new Set([...repos.flatMap((repo) => repo.languages), ...HARDCODED_SKILLS])].sort(
    (a, b) => a.localeCompare(b)
  );

  const groupedLanguages = SKILL_CATEGORIES.map((category) => [
    category,
    languages.filter((language) => (SKILL_CATEGORY_MAP[language] ?? CATEGORY_FALLBACK) === category),
  ]).filter(([, langs]) => langs.length > 0);

  skillsList.innerHTML = groupedLanguages.map(([category, langs]) => renderSkillGroup(category, langs)).join('');
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
// languages_url 요청은 저장소 개수만큼 추가로 호출돼 레이트 리밋에 걸리기 쉬움 —
// 실패해도 빈 배열로 덮어쓰지 않고, 저장소 목록에 이미 포함된 대표 language 하나로 대체
const fetchRepoLanguages = async (repo) => {
  const response = await fetch(repo.languages_url);
  const rawLanguages = response.ok ? Object.keys(await response.json()) : [repo.language].filter(Boolean);
  // Dockerfile/Docker Compose 등 세분화된 이름을 하나로 합쳐서(SKILL_ALIAS_MAP) 중복 제거
  const languages = [...new Set(rawLanguages.map((language) => SKILL_ALIAS_MAP[language] ?? language))];
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

  // 최초 자동 로드는 로딩 스피너를 보여주지 않고 데이터가 준비된 뒤 한 번에 렌더링
  // (컴포넌트가 이미 보인 다음에 상태를 바꾸면 레이아웃이 흔들리므로, 데이터부터 받고 그 다음에 그림)
  // 새로고침 버튼처럼 사용자가 직접 요청한 재조회일 때만 진행 상태를 보여줌
  if (force) {
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
    renderProjects(reposWithLanguages);
  } catch (error) {
    // 새 요청 실패 시, 만료됐더라도 이전에 저장해둔 값이 있으면 그걸로 표시
    if (cachedData) {
      renderProjects(cachedData.repos);
    } else {
      renderProjectsError();
    }
  }
};

loadProjects();
