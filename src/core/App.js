import { curriculum } from '../content/curriculum.js';
import { escapeHtml, MarkdownRenderer } from '../utils/markdown.js';
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
   */
  render() {
    this.root.innerHTML = `
      <div class="app-shell">
        <aside class="lesson-sidebar" aria-label="Course navigation">
          <div class="sidebar-header">
            <h1>Simplified DSA</h1>
            <p>Learn the shape of data first, then the steps that act on it.</p>
          </div>
          <nav aria-label="Lessons">
            ${this.renderSectionMenu()}
          </nav>
        </aside>
        <main class="lesson-main">
          ${this.renderLessonHeader()}
          <article class="lesson-content">
            ${this.markdownRenderer.render(this.activeLesson.markdown)}
          </article>
          ${this.renderLanguageComparison()}
        </main>
      </div>
    `;
    document.title = `${this.activeLesson.title} | Simplified DSA`;
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
    const path = lessonPath(sectionId, lessonId);
    if (path === window.location.pathname) return;

    window.history.pushState(null, '', path);
    this.applyRoute(path);
    this.render();
  }

  /**
   * Language tabs let learners compare syntax without leaving the concept.
   */
  selectLanguage(languageId) {
    const example = this.activeLesson.languageExamples?.find((item) => item.id === languageId);
    if (!example) return;

    this.activeLanguageId = example.id;
    this.render();
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
              class="section-link ${isActive ? 'is-active' : ''}"
              href="${lessonPath(section.id, firstLesson.id)}"
              data-section-id="${section.id}"
              data-lesson-id="${firstLesson.id}"
              ${isActive ? 'aria-current="true"' : ''}
            >
              <span>${escapeHtml(section.title)}</span>
              <span>${section.lessons.length}</span>
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
            const isActive = lesson.id === this.activeLessonId;

            return `
              <a
                class="lesson-link ${isActive ? 'is-active' : ''}"
                href="${lessonPath(section.id, lesson.id)}"
                data-section-id="${section.id}"
                data-lesson-id="${lesson.id}"
                ${isActive ? 'aria-current="page"' : ''}
              >
                <strong>${escapeHtml(lesson.title)}</strong>
                <span>${escapeHtml(lesson.summary)}</span>
              </a>
            `;
          })
          .join('')}
      </div>
    `;
  }

  /**
   * The header explains which section the current lesson belongs to.
   * The lesson title itself comes from the Markdown file as the article h1.
   */
  renderLessonHeader() {
    return `
      <header class="lesson-header">
        <strong>${this.activeSection.title}</strong>
        <p>${this.activeSection.description}</p>
      </header>
    `;
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
        <div class="language-example">
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
        class="language-tab ${isActive ? 'is-active' : ''}"
        type="button"
        role="tab"
        aria-selected="${isActive}"
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
