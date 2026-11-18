import { cellHtml, motionRow, motionRowHtml } from '../demos/motion.js';

/**
 * Worked examples you scrub through, in the middle of the reading.
 *
 * The Markdown renderer groups back-to-back ```cells figures into a
 * .cells-steps block with every step in the page (hidden). This turns each
 * block into one live figure: a slider and Back / Next move between steps,
 * cells cross-fade between states, and pointer labels (lo, mid, L, R…) glide
 * to their new cells instead of jumping.
 *
 * `memory` (a Map) keeps each figure's step across re-renders of the lesson.
 */
const ENGLISH = { back: 'Back', next: 'Next', step: (k, n) => `Step ${k} of ${n}`, label: 'Worked example step', previous: 'Previous step' };

// `words` (from lib/i18n.js dict(lang).stepper) translates the controls.
export function hydrateSteppers(root, memory, words = ENGLISH) {
  root.querySelectorAll('.cells-steps').forEach((block, figureIndex) => {
    const frames = [...block.querySelectorAll('.cells-step')].map((figure) => {
      const pointers = {};
      const cells = [...figure.querySelectorAll('.array-cell')].map((cell, i) => {
        for (const name of cell.querySelector('.cell-pointer')?.textContent.trim().split(/\s+/) ?? []) if (name) pointers[name] = i;
        return { className: cell.className, value: cell.querySelector('.array-value').innerHTML, index: cell.querySelector('.array-index')?.textContent };
      });
      return { cells, pointers, note: figure.querySelector('figcaption')?.innerHTML ?? '' };
    });
    // Every pointer name used anywhere in the example, so a token can hide when it is not used.
    const names = [...new Set(frames.flatMap((frame) => Object.keys(frame.pointers)))];
    const total = frames.length;

    block.insertAdjacentHTML(
      'beforeend',
      `<figure class="cells-figure cells-live">
        ${motionRowHtml()}
        <figcaption aria-live="polite"></figcaption>
        <div class="cells-steps-controls">
          <button type="button" class="demo-button" data-stepper="prev" aria-label="${words.previous}">${words.back}</button>
          <label class="demo-scrub"><span class="sr-only">${words.label}</span>
            <input type="range" min="1" max="${total}" step="1" value="1" data-stepper="scrub" />
          </label>
          <button type="button" class="demo-button is-primary" data-stepper="next">${words.next}</button>
          <span class="cells-steps-count" aria-hidden="true"></span>
        </div>
      </figure>`,
    );
    const live = block.querySelector('.cells-live');
    const stage = motionRow(live.querySelector('.motion-row'));
    const caption = live.querySelector('figcaption');
    const scrub = live.querySelector('[data-stepper="scrub"]');
    const prev = live.querySelector('[data-stepper="prev"]');
    const next = live.querySelector('[data-stepper="next"]');
    const count = live.querySelector('.cells-steps-count');
    block.classList.add('is-live');

    const show = (step) => {
      const k = Math.min(total - 1, Math.max(0, step));
      memory.set(figureIndex, k);
      const frame = frames[k];
      stage.update(
        frame.cells.map((cell, i) => ({ key: `i${i}`, className: cell.className, html: cellHtml(cell.value, cell.index) })),
        { pointers: Object.fromEntries(names.map((name) => [name, frame.pointers[name] ?? null])) },
      );
      caption.innerHTML = frame.note;
      scrub.value = String(k + 1);
      scrub.setAttribute('aria-valuetext', words.step(k + 1, total));
      scrub.style.setProperty('--progress', `${(k / (total - 1)) * 100}%`);
      count.textContent = `${k + 1} / ${total}`;
      prev.disabled = k === 0;
      next.disabled = k === total - 1;
    };

    live.addEventListener('click', (event) => {
      const action = event.target.closest('[data-stepper]')?.dataset.stepper;
      const k = memory.get(figureIndex) ?? 0;
      if (action === 'prev') show(k - 1);
      if (action === 'next') show(k + 1);
      // A button that just became disabled cannot keep focus: hand it to the other one.
      if (action && document.activeElement?.disabled) (action === 'next' ? prev : next).focus();
    });
    scrub.addEventListener('input', () => show(Number(scrub.value) - 1));
    show(memory.get(figureIndex) ?? 0);
  });
}
