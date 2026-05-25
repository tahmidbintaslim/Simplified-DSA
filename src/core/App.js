import { curriculum } from '../content/curriculum.js';
import { escapeHtml, MarkdownRenderer } from '../utils/markdown.js';

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
          ${this.renderSectionMenu()}
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
  }

  /**
   * Event delegation:
   * Instead of adding a click listener to every button, we add one listener to
   * the app root and check which button was clicked.
   */
  bindEvents() {
    this.root.addEventListener('click', (event) => {
      const sectionButton = event.target.closest('[data-section-id]');
      const lessonButton = event.target.closest('[data-lesson-id]');
      const languageButton = event.target.closest('[data-language-id]');

      if (sectionButton) {
        this.selectSection(sectionButton.dataset.sectionId);
        return;
      }

      if (lessonButton) {
        this.selectLesson(lessonButton.dataset.lessonId);
        return;
      }

      if (languageButton) {
        this.selectLanguage(languageButton.dataset.languageId);
      }
    });
  }

  /**
   * Selecting a section also selects its first lesson.
   * That gives the learner something useful immediately after switching menus.
   */
  selectSection(sectionId) {
    const section = this.sections.find((item) => item.id === sectionId);
    if (!section) return;

    this.activeSectionId = section.id;
    this.activeLessonId = section.lessons[0].id;
    this.activeLanguageId = section.lessons[0].languageExamples?.[0]?.id ?? null;
    this.render();
  }

  /**
   * Selecting a lesson only changes activeLessonId.
   * The section does not change because lessons live inside one section.
   */
  selectLesson(lessonId) {
    const lesson = this.activeSection.lessons.find((item) => item.id === lessonId);
    if (!lesson) return;

    this.activeLessonId = lesson.id;
    this.activeLanguageId = lesson.languageExamples?.[0]?.id ?? null;
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

        return `
          <section class="nav-section">
            <button
              class="section-button ${isActive ? 'is-active' : ''}"
              type="button"
              data-section-id="${section.id}"
              aria-pressed="${isActive}"
            >
              <span>${section.title}</span>
              <span>${section.lessons.length}</span>
            </button>
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
              <button
                class="lesson-button ${isActive ? 'is-active' : ''}"
                type="button"
                data-lesson-id="${lesson.id}"
                aria-pressed="${isActive}"
              >
                <strong>${lesson.title}</strong>
                <span>${lesson.summary}</span>
              </button>
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
