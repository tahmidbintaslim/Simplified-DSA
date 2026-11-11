import { curriculum } from '../content/curriculum.js';
import { demos } from '../demos/index.js';
import { DEMO_MARKER, escapeHtml, MarkdownRenderer } from '../utils/markdown.js';
import { loadCompleted, saveCompleted } from './progress.js';

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
    const current = this.notFound ? 'Choose a lesson' : `${this.activeSection.title} · ${this.activeLesson.title}`;

    this.root.innerHTML = `
      <a class="skip-link" href="#main">Skip to the lesson</a>
      <div class="app-shell">
        <aside class="lesson-sidebar" aria-label="Course navigation">
          <div class="sidebar-header">
            <p class="site-title">Simplified DSA</p>
            <p class="site-tagline">Learn the shape of data first, then the steps that act on it.</p>
          </div>
          <details class="nav-drawer" ${wide ? 'open' : ''}>
            <summary><span>Lessons</span><span class="nav-current">${escapeHtml(current)}</span></summary>
            <nav aria-label="Lessons">
              ${this.renderSectionMenu()}
            </nav>
            <p class="sidebar-footer"><a href="/privacy.html">Privacy</a></p>
          </details>
        </aside>
        <main id="main" class="lesson-main" tabindex="-1">
          ${this.notFound ? this.renderNotFound() : this.renderLesson()}
        </main>
      </div>
    `;
    const title = this.notFound ? 'Page not found' : this.activeLesson.title;
    document.title = `${title} | Simplified DSA`;
    // Search engines and link previews read the description of the open lesson.
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', this.notFound ? 'This page does not exist.' : this.activeLesson.summary);
    if (!this.notFound) this.attachDemo();

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
      const languageButton = event.target.closest('[data-language-id]');
      const quizOption = event.target.closest('[data-quiz-option]');
      const completeButton = event.target.closest('[data-complete]');

      if (quizOption) {
        this.answerQuiz(quizOption);
        return;
      }

      if (completeButton) {
        this.toggleComplete();
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
    const lessonChanged =
      route.sectionId !== this.activeSectionId || route.lessonId !== this.activeLessonId;

    if (lessonChanged) {
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
    if (!this.notFound && sectionId === this.activeSectionId && lessonId === this.activeLessonId) return;

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
        const isActive = section.id === this.activeSectionId;
        const lessons = isActive ? this.renderLessonMenu(section) : '';
        const firstLesson = section.lessons[0];

        // aria-current="true" marks the current section in the list of
        // sections; the lesson link below carries aria-current="page".
        return `
          <section class="nav-section">
            <a
              id="section-link-${section.id}"
              class="section-link ${isActive ? 'is-active' : ''}"
              href="${lessonPath(section.id, firstLesson.id)}"
              data-section-id="${section.id}"
              data-lesson-id="${firstLesson.id}"
              ${isActive ? 'aria-current="true"' : ''}
            >
              <span>${escapeHtml(section.title)}</span>
              <span>${section.lessons.filter((lesson) => this.completed.has(`${section.id}/${lesson.id}`)).length}/${section.lessons.length}</span>
            </a>
            ${lessons}
          </section>
        `;
      })
      .join('');
  }

  /**
   * The lesson menu is shown only for the active section.
   * This keeps the navigation small while the course grows.
   */
  renderLessonMenu(section) {
    return `
      <div class="lesson-list">
        ${section.lessons
          .map((lesson) => {
            const isActive = !this.notFound && lesson.id === this.activeLessonId;
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
                <strong>${isDone ? '<span class="lesson-done" aria-label="Completed">✓</span> ' : ''}${escapeHtml(lesson.title)}</strong>
                <span>${escapeHtml(lesson.summary)}</span>
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
  renderLessonHeader() {
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
      </header>
    `;
  }

  /**
   * A lesson can place its demo with a ```demo block, so learners try the idea
   * right after reading it. Without one, the demo follows the text.
   */
  renderLesson() {
    const article = this.markdownRenderer.render(this.activeLesson.markdown);
    const panel = this.renderDemoPanel();
    const inline = article.includes(DEMO_MARKER);

    return `
      ${this.renderLessonHeader()}
      <article class="lesson-content">
        ${inline ? article.replace(DEMO_MARKER, () => panel) : article}
      </article>
      ${inline ? '' : panel}
      ${this.renderLanguageComparison()}
      ${this.renderLessonFooter()}
    `;
  }

  /** Mark-as-complete plus previous and next lessons, across sections. */
  renderLessonFooter() {
    const all = this.sections.flatMap((section) => section.lessons.map((lesson) => ({ section, lesson })));
    const index = all.findIndex(({ lesson }) => lesson === this.activeLesson);
    const link = (entry, label) =>
      entry
        ? `<a class="lesson-step" href="${lessonPath(entry.section.id, entry.lesson.id)}" data-section-id="${entry.section.id}" data-lesson-id="${entry.lesson.id}">
            <span>${label}</span><strong>${escapeHtml(entry.lesson.title)}</strong>
          </a>`
        : '<span></span>';
    const done = this.completed.has(this.activeKey);

    return `
      <footer class="lesson-footer">
        <button id="complete-button" type="button" class="demo-button ${done ? 'is-done' : 'is-primary'}" data-complete aria-pressed="${done}">
          ${done ? '✓ Completed' : 'Mark as complete'}
        </button>
        <nav class="lesson-steps" aria-label="Previous and next lesson">
          ${link(all[index - 1], '← Previous')}
          ${link(all[index + 1], 'Next →')}
        </nav>
      </footer>
    `;
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
    const correct = option.dataset.quizOption === 'true';
    const misses = Number(quiz.dataset.misses ?? 0) + (correct ? 0 : 1);
    quiz.dataset.misses = misses;
    option.classList.add(correct ? 'is-right' : 'is-wrong');
    option.setAttribute('aria-pressed', 'true');
    // A written mark as well as the colour, so the state never depends on colour alone.
    option.dataset.mark = correct ? 'Correct' : 'Not this one';

    const reveal = correct || misses >= 2;
    if (reveal) {
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
   * Unknown URLs show this instead of quietly opening another lesson, so a
   * mistyped or outdated link is obvious. The lesson list stays in the sidebar.
   */
  renderNotFound() {
    const first = this.sections[0];
    return `
      <article class="lesson-content">
        <h1>Page not found</h1>
        <p>There is no lesson at <code>${escapeHtml(window.location.pathname)}</code>. Pick one from the list, or start from the beginning.</p>
        <p>
          <a href="/" data-section-id="${first.id}" data-lesson-id="${first.lessons[0].id}">
            Start with ${escapeHtml(first.lessons[0].title)}
          </a>
        </p>
      </article>
    `;
  }

  /**
   * Lessons with a `demo` id get an interactive panel after the text.
   * The panel only holds an empty slot; attachDemo fills it.
   */
  renderDemoPanel() {
    const demo = demos[this.activeLesson.demo];
    if (!demo) return '';

    return `
      <section class="demo-panel" aria-labelledby="demo-title">
        <div class="language-panel-header">
          <h2 id="demo-title">Try it: ${escapeHtml(demo.title)}</h2>
          <p>${escapeHtml(demo.intro)}</p>
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
      <section class="language-panel" aria-label="Language comparison">
        <div class="language-panel-header">
          <h2>Language comparison</h2>
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
