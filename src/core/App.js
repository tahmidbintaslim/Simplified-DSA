import { curriculum } from '../content/curriculum.js';
import { demos } from '../demos/index.js';
import { DEMO_MARKER, escapeHtml, MarkdownRenderer } from '../utils/markdown.js';
import { icon } from '../utils/icons.js';
import { loadCompleted, saveCompleted } from './progress.js';

const HOME_DESCRIPTION =
  'Free, beginner-first lessons on data structures and algorithms: plain words, every step traced, a demo on every lesson.';

// "Cost Cheat Sheet" → "cost-cheat-sheet", for heading anchors.
const slugify = (html) =>
  html
    .replace(/<[^>]+>/g, '')
    .toLowerCase()
    .replace(/&[a-z#0-9]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// <details> folds whose open state survives a re-render of the same lesson.
// The home page shows the product's promise: one real step of a binary search.
const HOME_FIGURE = [
  '```cells',
  'values: 3 9 14 21 30 42 57',
  'pointers: lo=4 mid=5 hi=6',
  'highlight: 5',
  'dim: 0 1 2 3',
  'note: Step 2 of a binary search for 42. The middle value, 21, was too small, so it and everything left of it are ruled out. Now check the middle of what is left.',
  '```',
].join('\n');

// Banner colours for the home section cards (decorative art, not step states).
const SECTION_ART = [
  { a: '#bcd3ff', b: '#6d9bff', c: '#2f5fe0', icon: 'cells' },
  { a: '#bdeee6', b: '#4fc2b1', c: '#0f7f74', icon: 'halve' },
  { a: '#d9d0ff', b: '#9d86f5', c: '#5b3fd0', icon: 'pointers' },
];

// Three layered wave bands, coloured by the card's --art-* custom properties.
const waves = () => `
  <svg viewBox="0 0 400 160" preserveAspectRatio="none" focusable="false">
    <rect width="400" height="160" fill="var(--art-a)"/>
    <path d="M0 70 C70 40 130 95 200 70 S330 40 400 64 V160 H0Z" fill="var(--art-b)" opacity="0.75"/>
    <path d="M0 104 C80 78 150 128 230 102 S350 80 400 98 V160 H0Z" fill="var(--art-b)"/>
    <path d="M0 134 C90 112 170 150 260 128 S360 118 400 128 V160 H0Z" fill="var(--art-c)"/>
  </svg>`;

const FOLDS = ['answer', 'sources', 'language-details'];

// Matches the 760px layout breakpoint in style.css.
const WIDE_SCREEN = '(min-width: 761px)';
import { lessonPath, resolvePath } from './router.js';

/**
 * App owns the small amount of state needed by the page.
 *
 * OOP idea:
 * - The constructor prepares the object.
 * - Methods describe what the object can do.
 * - `this` means "this App object".
 */
export class App {
  constructor(rootSelector) {
    this.root = document.querySelector(rootSelector);
    this.sections = curriculum;
    this.markdownRenderer = new MarkdownRenderer();
    // Lessons marked complete, as "section/lesson" keys. Stored in this browser only.
    this.completed = loadCompleted();
    // Folded parts of the open lesson the learner has expanded (see FOLDS).
    this.openFolds = new Set();
    // Sidebar sections the learner opened or closed by hand, and the search text.
    this.openSections = new Map();
    this.navQuery = '';
    this.activeSectionId = this.sections[0].id;
    this.activeLessonId = this.sections[0].lessons[0].id;
    this.activeLanguageId = this.activeLesson.languageExamples?.[0]?.id ?? null;
  }

  init() {
    if (!this.root) return;

    const route = this.applyRoute(window.location.pathname);
    if (route.path !== window.location.pathname) {
      // Clean up unknown or partial URLs without adding a history entry.
      const { search, hash } = window.location;
      window.history.replaceState(null, '', `${route.path}${search}${hash}`);
    }

    this.render();
    this.bindEvents();
  }

  /**
   * Render converts current state into HTML.
   * When activeSectionId or activeLessonId changes, render runs again.
   *
   * innerHTML replaces every element, including the one that has keyboard
   * focus, and focus would drop to <body>. So render remembers the focused
   * element's id and focuses the new element with that id afterwards.
   * `focusId` overrides that, for example when an arrow key picks a new tab.
   */
  render({ focusId } = {}) {
    const focused = document.activeElement;
    const hadFocus = focused !== this.root && this.root.contains(focused);
    const restoreId = focusId ?? (hadFocus ? focused.id : '');

    // On wide screens the lesson list is always open. On phones it folds into a
    // "Lessons" bar so the lesson itself starts on the first screen.
    const wide = window.matchMedia(WIDE_SCREEN).matches;
    const onLesson = !this.notFound && !this.home;
    const current = onLesson ? `${this.activeSection.title} · ${this.activeLesson.title}` : 'Choose a lesson';

    const sidebar = this.home
      ? ''
      : `
        <aside class="lesson-sidebar" aria-label="Course navigation">
          <details class="nav-drawer" ${wide ? 'open' : ''}>
            <summary><span>Lessons</span><span class="nav-current">${escapeHtml(current)}</span>${icon('chevronDown')}</summary>
            <label class="nav-search">
              ${icon('search')}
              <span class="sr-only">Search lessons</span>
              <input id="lesson-search" type="search" placeholder="Search lessons" autocomplete="off" value="${escapeHtml(this.navQuery)}" />
              <kbd aria-hidden="true">/</kbd>
            </label>
            <nav aria-label="Lessons">
              ${this.renderSectionMenu()}
            </nav>
            <p class="nav-empty" hidden>No lesson matches that search.</p>
          </details>
        </aside>`;

    this.root.innerHTML = `
      <a class="skip-link" href="#main">Skip to the lesson</a>
      <header class="topbar">
        <div class="topbar-inner">
          <a class="brand" href="/" data-home>
            <img src="/icon.png" alt="" width="28" height="28" />
            <span>Simplified DSA</span>
          </a>
          <nav class="topnav" aria-label="Site">
            <a href="/" data-home ${this.home ? 'aria-current="page"' : ''}>Course map</a>
            <a href="${lessonPath(this.sections[0].id, this.sections[0].lessons[0].id)}" data-section-id="${this.sections[0].id}" data-lesson-id="${this.sections[0].lessons[0].id}" ${onLesson ? 'aria-current="true"' : ''}>Lessons</a>
          </nav>
          <div class="topbar-actions">
            <a class="icon-button" href="https://github.com/tahmidbintaslim/Simplified-DSA" target="_blank" rel="noreferrer" aria-label="Source code on GitHub">${icon('github')}</a>
            <button id="theme-toggle" class="icon-button" type="button" data-theme-toggle aria-label="Switch to ${this.isDark ? 'light' : 'dark'} theme">${icon(this.isDark ? 'sun' : 'moon')}</button>
          </div>
        </div>
      </header>
      <div class="app-shell ${this.home ? 'is-home' : ''}">
        ${sidebar}
        <main id="main" class="lesson-main" tabindex="-1">
          ${this.notFound ? this.renderNotFound() : this.home ? this.renderHome() : this.renderLesson()}
        </main>
      </div>
      <footer class="site-footer">
        <div class="site-footer-inner">
          <a class="brand" href="/" data-home><img src="/icon.png" alt="" width="22" height="22" /><span>Simplified DSA</span></a>
          <p>Free, open lessons that show every step. No account, no tracking.</p>
          <nav aria-label="Footer">
            <a href="/privacy.html">Privacy</a>
            <a href="https://github.com/tahmidbintaslim/Simplified-DSA" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://dsa.tahmid.space/mcp">Claude connector</a>
          </nav>
        </div>
      </footer>
    `;
    document.title = this.home
      ? 'Simplified DSA | Data Structures and Algorithms'
      : `${this.notFound ? 'Page not found' : this.activeLesson.title} | Simplified DSA`;
    // Search engines and link previews read the description of the open page.
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        this.notFound ? 'This page does not exist.' : this.home ? HOME_DESCRIPTION : this.activeLesson.summary,
      );
    if (onLesson) {
      this.attachDemo();
      this.buildToc();
    }
    if (!this.home) this.filterLessons();

    if (restoreId || hadFocus) {
      // If that element no longer exists, the current lesson link takes focus.
      const target =
        (restoreId && document.getElementById(restoreId)) ||
        this.root.querySelector('[aria-current="page"]');
      target?.focus({ preventScroll: true });
    }
  }

  /**
   * Event delegation:
   * Instead of adding a click listener to every button, we add one listener to
   * the app root and check which button was clicked.
   */
  bindEvents() {
    this.root.addEventListener('click', (event) => {
      const lessonLink = event.target.closest('a[data-lesson-id]');
      const homeLink = event.target.closest('a[data-home]');
      const jumpLink = event.target.closest('a[href^="#"]');
      const languageButton = event.target.closest('[data-language-id]');
      const quizOption = event.target.closest('[data-quiz-option]');
      const completeButton = event.target.closest('[data-complete]');

      if (event.target.closest('[data-theme-toggle]')) {
        this.toggleTheme();
        return;
      }

      if (quizOption) {
        this.answerQuiz(quizOption);
        return;
      }

      if (completeButton) {
        this.toggleComplete();
        return;
      }

      const plainClick = event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

      if (homeLink && plainClick) {
        event.preventDefault();
        this.openHome();
        return;
      }

      // In-page links (skip link, jump list) scroll and move focus without a
      // hash change, which would otherwise fire popstate and re-render the page.
      if (jumpLink) {
        const target = document.getElementById(jumpLink.getAttribute('href').slice(1));
        if (!target) return;
        event.preventDefault();
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.scrollIntoView({ block: 'start' });
        target.focus({ preventScroll: true });
        return;
      }

      if (lessonLink) {
        // Let the browser handle Ctrl/Cmd/Shift/Alt clicks (new tab, new window).
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }
        event.preventDefault();
        this.openLesson(lessonLink.dataset.sectionId, lessonLink.dataset.lessonId);
        return;
      }

      if (languageButton) {
        this.selectLanguage(languageButton.dataset.languageId);
      }
    });

    // Tabs follow the ARIA tabs pattern: only the selected tab is in the Tab
    // order, and arrow keys, Home and End move between tabs.
    this.root.addEventListener('keydown', (event) => {
      const tab = event.target.closest('[role="tab"]');
      // Alt+Arrow is the browser's back/forward shortcut; leave it alone.
      if (!tab || event.altKey || event.ctrlKey || event.metaKey) return;

      const tabs = [...this.root.querySelectorAll('[role="tab"]')];
      const index = tabs.indexOf(tab);
      const nextIndex = {
        ArrowRight: (index + 1) % tabs.length,
        ArrowLeft: (index - 1 + tabs.length) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      }[event.key];
      if (nextIndex === undefined) return;

      event.preventDefault();
      this.selectLanguage(tabs[nextIndex].dataset.languageId, { moveFocus: true });
    });

    this.root.addEventListener('input', (event) => {
      if (event.target.id !== 'lesson-search') return;
      this.navQuery = event.target.value;
      this.filterLessons();
    });

    // "/" or Ctrl/Cmd+K jumps to lesson search, as on most docs sites.
    document.addEventListener('keydown', (event) => {
      const typing = event.target.closest?.('input, textarea, select, [contenteditable="true"]');
      const shortcut = (event.key === '/' && !typing) || (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey));
      const search = this.root.querySelector('#lesson-search');
      if (!shortcut || !search) return;
      event.preventDefault();
      search.closest('details').open = true;
      search.focus();
    });

    // Remember which folds (answer, sources, languages) are open, so a re-render
    // (a tab click, Mark as complete) keeps them open. "toggle" does not bubble.
    this.root.addEventListener(
      'toggle',
      (event) => {
        if (event.target.classList?.contains('nav-section')) {
          // Opening for a search is not the learner's choice; do not remember it.
          if (this.navQuery.trim()) return;
          this.openSections.set(event.target.dataset.sectionId, event.target.open);
          return;
        }
        const fold = FOLDS.find((name) => event.target.classList?.contains(name));
        if (!fold) return;
        if (event.target.open) this.openFolds.add(fold);
        else this.openFolds.delete(fold);
      },
      true,
    );

    // Crossing the phone/desktop breakpoint opens or folds the lesson list.
    window.matchMedia(WIDE_SCREEN).addEventListener('change', () => this.render());

    // Back and forward buttons change the URL; show the lesson it names.
    window.addEventListener('popstate', () => {
      this.applyRoute(window.location.pathname);
      this.render();
    });
  }

  /**
   * Routing: the URL decides which lesson is open, so a refresh, the back
   * button, or a shared link all land on the same lesson.
   * Moving to another lesson also resets the language tabs to the first one.
   */
  applyRoute(pathname) {
    const route = resolvePath(this.sections, pathname);
    this.notFound = Boolean(route.notFound);
    this.home = Boolean(route.home);
    const lessonChanged =
      route.sectionId !== this.activeSectionId || route.lessonId !== this.activeLessonId;

    if (lessonChanged) {
      this.openFolds.clear();
      this.activeSectionId = route.sectionId;
      this.activeLessonId = route.lessonId;
      this.activeLanguageId = this.activeLesson.languageExamples?.[0]?.id ?? null;
    }

    return route;
  }

  /**
   * Opening a lesson adds a history entry. pushState changes the URL without
   * reloading the page. A section link opens the first lesson in that section.
   */
  openLesson(sectionId, lessonId) {
    // Opening the lesson that is already open adds no history entry. On "/"
    // the first lesson is open, so a click there must not push its path.
    // From the not-found page every lesson link must navigate, even the open one.
    if (!this.notFound && !this.home && sectionId === this.activeSectionId && lessonId === this.activeLessonId) return;

    const path = lessonPath(sectionId, lessonId);
    window.history.pushState(null, '', path);
    this.applyRoute(path);
    this.render();
    // A new lesson starts at its title, even when opened from the footer's Next link.
    window.scrollTo(0, 0);
    // On phones the clicked link is now inside the folded drawer, so focus would
    // be lost; send it to the lesson instead.
    if (!this.root.contains(document.activeElement) || !document.activeElement.offsetParent) {
      document.getElementById('main')?.focus({ preventScroll: true });
    }
  }

  /** Back to the course map, from the site title, a lesson ending or the 404. */
  openHome() {
    if (this.home) return;
    window.history.pushState(null, '', '/');
    this.applyRoute('/');
    this.render();
    window.scrollTo(0, 0);
    if (!this.root.contains(document.activeElement) || !document.activeElement.offsetParent) {
      document.getElementById('main')?.focus({ preventScroll: true });
    }
  }

  /**
   * Language tabs let learners compare syntax without leaving the concept.
   */
  selectLanguage(languageId, { moveFocus = false } = {}) {
    const example = this.activeLesson.languageExamples?.find((item) => item.id === languageId);
    if (!example) return;

    this.activeLanguageId = example.id;
    this.render({ focusId: moveFocus ? `language-tab-${example.id}` : undefined });
  }

  /**
   * Build the left menu from curriculum data.
   * Adding a new lesson in curriculum.js automatically updates this menu.
   */
  renderSectionMenu() {
    return this.sections
      .map((section) => {
        const isActive = !this.notFound && section.id === this.activeSectionId;
        // Sections expand in place; the active one starts open.
        const open = this.openSections.get(section.id) ?? isActive;
        const done = section.lessons.filter((lesson) => this.completed.has(`${section.id}/${lesson.id}`)).length;

        return `
          <details class="nav-section" data-section-id="${section.id}" ${open ? 'open' : ''}>
            <summary id="section-link-${section.id}" class="section-link ${isActive ? 'is-active' : ''}">
              <span>${escapeHtml(section.title)}</span>
              <span class="section-count">${done}/${section.lessons.length}</span>
              ${icon('chevronDown')}
            </summary>
            ${this.renderLessonMenu(section)}
          </details>
        `;
      })
      .join('');
  }

  /**
   * The lessons of one section, with done / here / not yet marks.
   */
  renderLessonMenu(section) {
    return `
      <div class="lesson-list">
        ${section.lessons
          .map((lesson) => {
            const isActive = !this.notFound && !this.home && lesson.id === this.activeLessonId;
            const isDone = this.completed.has(`${section.id}/${lesson.id}`);

            return `
              <a
                id="lesson-link-${section.id}-${lesson.id}"
                class="lesson-link ${isActive ? 'is-active' : ''}"
                href="${lessonPath(section.id, lesson.id)}"
                data-section-id="${section.id}"
                data-lesson-id="${lesson.id}"
                ${isActive ? 'aria-current="page"' : ''}
              >
                <span class="lesson-status ${isDone ? 'is-done' : ''}">${isDone ? `${icon('check')}<span class="sr-only">Completed: </span>` : ''}</span>
                <strong>${escapeHtml(lesson.title)}</strong>
                <span class="lesson-summary">${escapeHtml(lesson.summary)}</span>
              </a>
            `;
          })
          .join('')}
      </div>
    `;
  }

  /**
   * The header says where the lesson sits, how long it takes and what the
   * learner will be able to do afterwards. The lesson title itself comes from
   * the Markdown file as the article h1.
   */
  renderLessonHeader(jumps = []) {
    const lesson = this.activeLesson;
    const position = this.activeSection.lessons.indexOf(lesson) + 1;
    const goals = lesson.goals?.length
      ? `<div class="lesson-goals"><p>You will be able to:</p><ul>${lesson.goals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join('')}</ul></div>`
      : '';

    return `
      <header class="lesson-header">
        <p class="lesson-meta">
          <span>${escapeHtml(this.activeSection.title)} · Lesson ${position} of ${this.activeSection.lessons.length}</span>
          ${lesson.minutes ? `<span>About ${lesson.minutes} min</span>` : ''}
          ${lesson.level ? `<span class="lesson-level">${escapeHtml(lesson.level)}</span>` : ''}
        </p>
        ${goals}
        ${
          jumps.length
            ? `<nav class="lesson-jumps" aria-label="Jump to"><span>Jump to</span>${jumps.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}</nav>`
            : ''
        }
      </header>
    `;
  }

  /**
   * A lesson opens on its title and the one-paragraph promise under it; where
   * it sits, how long it takes and the goals follow, so the page never opens on
   * admin text. A lesson can place its demo with a ```demo block, so learners
   * try the idea right after reading it. Without one, the demo follows the text.
   */
  renderLesson() {
    // Shortcuts for interview preppers: the parts they scan for, in page order.
    const markdown = this.activeLesson.markdown;
    const jumps = [
      this.activeLesson.demo && ['demo-title', 'Demo'],
      /\*\*When to use it:\*\*/.test(markdown) && ['when-to-use', 'When to use it'],
      /^## Cost Cheat Sheet$/m.test(markdown) && ['cost-cheat-sheet', 'Cost'],
      /^## What To Remember$/m.test(markdown) && ['what-to-remember', 'Key points'],
      /^## Practice Prompt$/m.test(markdown) && ['practice-prompt', 'Practice'],
    ].filter(Boolean);
    const header = this.renderLessonHeader(jumps);
    const reopen = (html) =>
      FOLDS.reduce((out, fold) => (this.openFolds.has(fold) ? out.replace(`<details class="${fold}">`, `<details class="${fold}" open>`) : out), html);
    // Every section heading gets an id, for "On this page" and the jump list.
    let article = this.markdownRenderer.render(markdown)
      .replace(/<h2>((?!Sources Checked<)[\s\S]*?)<\/h2>/g, (_, text) => `<h2 id="${slugify(text)}">${text}</h2>`)
      .replace('<aside class="callout callout-when-to-use-it">', '<aside class="callout callout-when-to-use-it" id="when-to-use">');
    const opening = /(<h1>[\s\S]*?<\/h1>)<p>([\s\S]*?<\/p>)/;
    article = opening.test(article)
      ? article.replace(opening, (_, title, lead) => `${title}<p class="lead">${lead}${header}`)
      : header + article;
    // The paragraph written just before a ```demo block explains how to use the
    // demo, so it moves inside the panel, under its heading.
    let intro;
    article = article.replace(/<p>((?:(?!<p>)[\s\S])*?)<\/p>(?=<div data-demo-here><\/div>)/, (_, text) => {
      intro = text;
      return '';
    });
    // Sources matter, but they are reference, not the lesson's last word.
    article = article.replace(
      /<h2>Sources Checked<\/h2>(<ul>[\s\S]*?<\/ul>)/,
      '<details class="sources"><summary>Sources checked</summary>$1</details>',
    );
    const panel = this.renderDemoPanel(intro);
    const inline = article.includes(DEMO_MARKER);

    return reopen(`
      <div class="lesson-layout">
        <div class="lesson-column">
          <article class="lesson-content">
            ${inline ? article.replace(DEMO_MARKER, () => panel) : article}
          </article>
          ${inline ? '' : panel}
          ${this.renderLanguageComparison()}
          ${this.renderLessonFooter()}
        </div>
        <nav class="toc" aria-label="On this page">
          <p>${icon('list')} On this page</p>
          <ol></ol>
        </nav>
      </div>
    `);
  }

  /** Mark-as-complete plus previous and next lessons, across sections. */
  renderLessonFooter() {
    const all = this.sections.flatMap((section) => section.lessons.map((lesson) => ({ section, lesson })));
    const index = all.findIndex(({ lesson }) => lesson === this.activeLesson);
    const link = (entry, label) =>
      entry
        ? `<a class="lesson-step" href="${lessonPath(entry.section.id, entry.lesson.id)}" data-section-id="${entry.section.id}" data-lesson-id="${entry.lesson.id}">
            <span>${label}</span><strong>${escapeHtml(entry.lesson.title)}</strong><small>${escapeHtml(entry.lesson.summary)}</small>
          </a>`
        : '<span></span>';
    const done = this.completed.has(this.activeKey);
    const next = all[index + 1];
    // A lesson ends on what was achieved and what comes next, not on a reference list.
    const note = done
      ? `Lesson done. You have finished ${this.completed.size} of ${all.length} lessons.${
          next ? ` Up next: <strong>${escapeHtml(next.lesson.title)}</strong>.` : ' That is the whole course so far.'
        } <a href="/" data-home>See your course map</a>`
      : 'Tried the practice prompt? Mark the lesson complete to track your progress.';

    return `
      <footer class="lesson-footer ${done ? 'is-done' : ''}">
        <p class="completion-note" role="status">${note}</p>
        <button id="complete-button" type="button" class="demo-button ${done ? 'is-done' : 'is-primary'}" data-complete aria-pressed="${done}">
          ${done ? `${icon('check')} Completed` : 'Mark as complete'}
        </button>
        <nav class="lesson-steps" aria-label="Previous and next lesson">
          ${link(all[index - 1], `${icon('arrowLeft')} Previous`)}
          ${link(all[index + 1], `Next ${icon('arrowRight')}`)}
        </nav>
      </footer>
    `;
  }

  /** The theme follows the system until the learner picks one (stored in this browser). */
  get isDark() {
    const picked = document.documentElement.dataset.theme;
    return picked ? picked === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggleTheme() {
    const next = this.isDark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('simplified-dsa:theme', next);
    } catch {
      // Blocked storage: the choice lasts until the page reloads.
    }
    this.render({ focusId: 'theme-toggle' });
  }

  /** Hide lessons that do not match the search; open every section while searching. */
  filterLessons() {
    const query = this.navQuery.trim().toLowerCase();
    let shown = 0;
    this.root.querySelectorAll('.nav-section').forEach((section) => {
      let sectionShown = 0;
      section.querySelectorAll('.lesson-link').forEach((link) => {
        const match = !query || link.textContent.toLowerCase().includes(query);
        link.hidden = !match;
        sectionShown += match ? 1 : 0;
      });
      section.hidden = sectionShown === 0;
      // While searching every section opens; clearing the search restores them.
      const id = section.dataset.sectionId;
      section.open = query ? true : (this.openSections.get(id) ?? (!this.notFound && id === this.activeSectionId));
      shown += sectionShown;
    });
    const empty = this.root.querySelector('.nav-empty');
    if (empty) empty.hidden = shown > 0;
  }

  /**
   * "On this page": every h2 in the lesson and demo, with the one being read
   * marked as the reader scrolls. Built from the rendered page, so it always
   * matches the headings.
   */
  buildToc() {
    this.tocObserver?.disconnect();
    const list = this.root.querySelector('.toc ol');
    if (!list) return;
    const headings = [...this.root.querySelectorAll('.lesson-main h2[id]')];
    list.innerHTML = headings
      .map((h) => `<li><a href="#${h.id}" data-toc="${h.id}">${escapeHtml(h.textContent.replace(/^Try it: /, 'Demo: '))}</a></li>`)
      .join('');
    if (typeof IntersectionObserver !== 'function') return;
    const links = new Map([...list.querySelectorAll('a')].map((a) => [a.dataset.toc, a]));
    this.tocObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!visible) return;
        links.forEach((a, id) => a.toggleAttribute('aria-current', id === visible.target.id));
      },
      { rootMargin: '0px 0px -70% 0px' },
    );
    headings.forEach((h) => this.tocObserver.observe(h));
  }

  get activeKey() {
    return `${this.activeSectionId}/${this.activeLessonId}`;
  }

  toggleComplete() {
    if (this.completed.has(this.activeKey)) this.completed.delete(this.activeKey);
    else this.completed.add(this.activeKey);
    saveCompleted(this.completed);
    this.render({ focusId: 'complete-button' });
  }

  /**
   * Quizzes answer instantly. A wrong pick says "try again" without the
   * answer, so the learner gets a second think; the explanation appears on a
   * right answer, or after two wrong ones together with the right option.
   * This changes only the quiz's own elements, so no re-render is needed.
   */
  answerQuiz(option) {
    const quiz = option.closest('.quiz');
    // Once the answer is shown, more clicks would only stack marks and announcements.
    if (quiz.dataset.solved) return;
    const correct = option.dataset.quizOption === 'true';
    const misses = Number(quiz.dataset.misses ?? 0) + (correct ? 0 : 1);
    quiz.dataset.misses = misses;
    option.classList.add(correct ? 'is-right' : 'is-wrong');
    option.setAttribute('aria-pressed', 'true');
    // A written mark as well as the colour, so the state never depends on colour alone.
    option.dataset.mark = correct ? 'Correct' : 'Not this one';

    const reveal = correct || misses >= 2;
    if (reveal) {
      quiz.dataset.solved = 'true';
      quiz.querySelectorAll('[data-quiz-option]').forEach((button) => button.setAttribute('aria-disabled', 'true'));
      const right = quiz.querySelector('[data-quiz-option="true"]');
      right.classList.add('is-right');
      right.dataset.mark = 'Correct';
    }
    const why = quiz.querySelector('.quiz-why').textContent;
    quiz.querySelector('.quiz-feedback').textContent = correct
      ? `Correct. ${why}`
      : reveal
        ? `Not quite. The answer is highlighted. ${why}`
        : 'Not quite. Have another think and try again.';
  }

  /**
   * The home page: what this is, where to start (or continue), and the whole
   * course as a map, so a first-time visitor never lands mid-curriculum.
   */
  renderHome() {
    const all = this.sections.flatMap((section) => section.lessons.map((lesson) => ({ section, lesson })));
    const isDone = ({ section, lesson }) => this.completed.has(`${section.id}/${lesson.id}`);
    const doneCount = all.filter(isDone).length;
    const nextUp = all.find((entry) => !isDone(entry)) ?? all[0];
    const startLabel = doneCount ? `Continue: ${nextUp.lesson.title}` : `Start with ${nextUp.lesson.title}`;
    const linkTo = (entry) => `href="${lessonPath(entry.section.id, entry.lesson.id)}" data-section-id="${entry.section.id}" data-lesson-id="${entry.lesson.id}"`;
    const lessonLink = (entry) => `
      <li>
        <a class="course-lesson" ${linkTo(entry)}>
          <span class="lesson-status ${isDone(entry) ? 'is-done' : ''}">${isDone(entry) ? `${icon('check')}<span class="sr-only">Completed: </span>` : ''}</span>
          <strong>${escapeHtml(entry.lesson.title)}</strong>
          <span class="lesson-summary">${escapeHtml(entry.lesson.summary)}</span>
          <span class="course-meta">${[entry.lesson.minutes && `${entry.lesson.minutes} min`, entry.lesson.level].filter(Boolean).map(escapeHtml).join(' · ')}</span>
        </a>
      </li>`;
    // One card per section; it opens the first lesson the learner has not finished.
    const sectionCard = (section, i) => {
      const entries = section.lessons.map((lesson) => ({ section, lesson }));
      const done = entries.filter(isDone).length;
      const target = entries.find((entry) => !isDone(entry)) ?? entries[0];
      const art = SECTION_ART[i % SECTION_ART.length];
      return `
        <li>
          <a class="section-card" ${linkTo(target)}>
            <span class="section-card-art" style="--art-a:${art.a};--art-b:${art.b};--art-c:${art.c}" aria-hidden="true">
              ${waves()}
              <span class="section-card-mark">${icon(art.icon)}</span>
            </span>
            <span class="section-card-tab">${section.lessons.length} lessons</span>
            <strong>${escapeHtml(section.title)}</strong>
            <span class="lesson-summary">${escapeHtml(section.description)}</span>
            <span class="course-meta">${done ? `${done} of ${section.lessons.length} done` : `Starts with ${escapeHtml(target.lesson.title)}`}</span>
          </a>
        </li>`;
    };

    return `
      <div class="home">
        <section class="hero" aria-labelledby="home-title">
          <div class="hero-text">
            <h1 id="home-title">See every step.<span>Learn DSA by tracing it.</span></h1>
            <p class="lead">Free lessons for complete beginners: plain words, a small example traced by hand, and a demo you drive yourself, one step at a time.</p>
            <p class="home-actions">
              <a class="demo-button is-primary" ${linkTo(nextUp)}>${escapeHtml(startLabel)} ${icon('arrowRight')}</a>
              <a class="demo-button" href="#course-map">${icon('list')} Browse all lessons</a>
            </p>
            <ul class="hero-checks">
              <li>${icon('check')} ${all.length} lessons, basics to patterns</li>
              <li>${icon('check')} A demo you drive in every lesson</li>
              <li>${icon('check')} No account, no tracking</li>
            </ul>
          </div>
          <div class="hero-figure">${this.markdownRenderer.render(HOME_FIGURE)}</div>
        </section>

        <section class="home-block" aria-labelledby="sections-title">
          <h2 id="sections-title">Three parts, one path</h2>
          <p class="home-block-lead">Start with the shapes data takes, then the steps that act on it, then the patterns interviews reuse.</p>
          <ol class="section-cards">${this.sections.map(sectionCard).join('')}</ol>
        </section>

        <section class="home-block" id="course-map" aria-labelledby="map-title" tabindex="-1">
          <div class="home-block-head">
            <h2 id="map-title">Course map</h2>
            <span class="home-progress">${doneCount} of ${all.length} lessons done</span>
          </div>
          ${this.sections
            .map(
              (section) => `
            <section class="course-section" aria-labelledby="course-${section.id}">
              <h3 id="course-${section.id}">${escapeHtml(section.title)}</h3>
              <ol class="course-list">${section.lessons.map((lesson) => lessonLink({ section, lesson })).join('')}</ol>
            </section>`,
            )
            .join('')}
        </section>

        <section class="home-closing" aria-labelledby="closing-title">
          <h2 id="closing-title">Your first lesson takes about ${nextUp.lesson.minutes ?? 12} minutes.</h2>
          <p>Read it, trace it, then drive the demo yourself. Progress stays in this browser.</p>
          <a class="demo-button is-primary" ${linkTo(nextUp)}>${escapeHtml(startLabel)} ${icon('arrowRight')}</a>
        </section>
      </div>
    `;
  }

  /**
   * Unknown URLs show this instead of quietly opening another lesson, so a
   * mistyped or outdated link is obvious. The lesson list stays in the sidebar.
   */
  renderNotFound() {
    const first = this.sections[0];
    return `
      <article class="lesson-content">
        <h1>Page not found</h1>
        <p>There is no lesson at <code>${escapeHtml(window.location.pathname)}</code>. Pick one from the list, or start from the beginning.</p>
        <p class="home-actions">
          <a class="demo-button is-primary" href="/" data-home>See the course map</a>
          <a href="${lessonPath(first.id, first.lessons[0].id)}" data-section-id="${first.id}" data-lesson-id="${first.lessons[0].id}">Start with ${escapeHtml(first.lessons[0].title)}</a>
        </p>
      </article>
    `;
  }

  /**
   * Lessons with a `demo` id get an interactive panel after the text.
   * The panel only holds an empty slot; attachDemo fills it.
   */
  renderDemoPanel(introHtml) {
    const demo = demos[this.activeLesson.demo];
    if (!demo) return '';

    // `introHtml` is the lesson's own "how to use it" paragraph (already rendered
    // and escaped by MarkdownRenderer); otherwise the demo's generic intro.
    return `
      <section class="demo-panel" aria-labelledby="demo-title">
        <div class="language-panel-header">
          <h2 id="demo-title">Try it: ${escapeHtml(demo.title)}</h2>
          <p>${introHtml ?? escapeHtml(demo.intro)}</p>
        </div>
        <div data-demo-slot></div>
      </section>
    `;
  }

  /**
   * render() rebuilds the page with innerHTML, which would wipe the demo's
   * state every time a language tab changes. So the demo is mounted once per
   * lesson into its own element, and each render moves that same element
   * into the new slot.
   */
  attachDemo() {
    const slot = this.root.querySelector('[data-demo-slot]');
    if (!slot) return;

    const key = lessonPath(this.activeSectionId, this.activeLessonId);
    if (this.demoKey !== key) {
      this.demoKey = key;
      this.demoElement = document.createElement('div');
      this.demoElement.className = 'demo';
      demos[this.activeLesson.demo].mount(this.demoElement);
    }
    slot.replaceWith(this.demoElement);
  }

  /**
   * Some lessons include examples for multiple programming languages.
   * The lesson stays language-neutral; this panel shows language-specific syntax.
   */
  renderLanguageComparison() {
    const examples = this.activeLesson.languageExamples;
    if (!examples?.length) return '';

    const activeExample =
      examples.find((example) => example.id === this.activeLanguageId) ?? examples[0];

    return `
      <details class="language-details">
      <summary>Compare this in ${examples.length} programming languages</summary>
      <section class="language-panel" aria-label="Language comparison">
        <div class="language-panel-header">
          <h2 id="language-comparison">Language comparison</h2>
          <p>Same core idea, different syntax, runtime, and memory model.</p>
        </div>
        <div class="language-tabs" role="tablist" aria-label="Programming languages">
          ${examples
            .map((example) => this.renderLanguageTab(example, activeExample.id))
            .join('')}
        </div>
        <div
          id="language-tabpanel"
          class="language-example"
          role="tabpanel"
          aria-labelledby="language-tab-${activeExample.id}"
          tabindex="0"
        >
          <div class="language-meta">
            <strong>${escapeHtml(activeExample.language)}</strong>
            <span>${escapeHtml(activeExample.dataStructure)}</span>
          </div>
          <pre><code>${escapeHtml(activeExample.code)}</code></pre>
          <dl>
            <div>
              <dt>Runtime</dt>
              <dd>${escapeHtml(activeExample.runtime)}</dd>
            </div>
            <div>
              <dt>Memory note</dt>
              <dd>${escapeHtml(activeExample.memoryNote)}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>
                <a href="${escapeHtml(activeExample.sourceUrl)}" target="_blank" rel="noreferrer">
                  ${escapeHtml(activeExample.sourceName)}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>
      </details>
    `;
  }

  renderLanguageTab(example, activeLanguageId) {
    const isActive = example.id === activeLanguageId;

    return `
      <button
        id="language-tab-${example.id}"
        class="language-tab ${isActive ? 'is-active' : ''}"
        type="button"
        role="tab"
        aria-selected="${isActive}"
        aria-controls="language-tabpanel"
        tabindex="${isActive ? '0' : '-1'}"
        data-language-id="${example.id}"
      >
        ${escapeHtml(example.language)}
      </button>
    `;
  }

  /**
   * Getters calculate values from current state.
   * They avoid repeating `.find(...)` logic in every method.
   */
  get activeSection() {
    return this.sections.find((section) => section.id === this.activeSectionId);
  }

  get activeLesson() {
    return this.activeSection.lessons.find((lesson) => lesson.id === this.activeLessonId);
  }
}
