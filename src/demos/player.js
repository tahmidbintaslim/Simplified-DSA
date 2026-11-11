import { icon } from '../utils/icons.js';
import { escapeHtml } from '../utils/markdown.js';

/**
 * A small step player shared by the algorithm demos.
 *
 * Algorithms record frames up front (see algorithms.js); the player only moves
 * an index through them. Step back, step forward, play and pause all reuse
 * the same `show()` call, so the picture, the caption, the highlighted code
 * line and the variables always describe the same moment.
 *
 * Keyboard: ← and → step, Space plays or pauses (when focus is not on a
 * button or field, which already use those keys).
 */
export function createPlayer(root, onFrame) {
  root.insertAdjacentHTML(
    'beforeend',
    `
    <div class="demo-player">
      <button type="button" class="demo-button" data-player="first" aria-label="First step">${icon('first')}</button>
      <button type="button" class="demo-button" data-player="back">${icon('back')} Back</button>
      <button type="button" class="demo-button is-primary" data-player="play">${icon('play')} Play</button>
      <button type="button" class="demo-button" data-player="next">Step ${icon('next')}</button>
      <label class="demo-speed">Speed
        <input type="range" min="1" max="10" value="5" data-player="speed" />
      </label>
      <span class="demo-count" aria-hidden="true"></span>
    </div>
    <p class="demo-caption" aria-live="polite"></p>
    <div class="trace" hidden>
      <div class="trace-code">
        <p class="trace-title">Pseudocode</p>
        <ol class="trace-lines"></ol>
      </div>
      <div class="trace-vars">
        <p class="trace-title">Variables</p>
        <dl class="trace-var-list"></dl>
      </div>
    </div>
  `,
  );

  const playButton = root.querySelector('[data-player="play"]');
  const speedInput = root.querySelector('[data-player="speed"]');
  const count = root.querySelector('.demo-count');
  const caption = root.querySelector('.demo-caption');
  const trace = root.querySelector('.trace');
  const codeList = root.querySelector('.trace-lines');
  const varList = root.querySelector('.trace-var-list');
  let frames = [];
  let index = 0;
  let timer = null;

  const show = () => {
    const frame = frames[index];
    onFrame(frame);
    // The visible counter is aria-hidden, so screen readers hear the step in the caption.
    // A numbered step badge, like a numbered fold in a diagram; screen readers get the words.
    caption.innerHTML = `<span class="step-badge" aria-hidden="true">${index + 1}</span><span class="sr-only">Step ${index + 1} of ${frames.length}. </span>${escapeHtml(frame.caption)}`;
    count.textContent = `Step ${index + 1} / ${frames.length}`;
    keepActiveCellInView();
    [...codeList.children].forEach((li, i) => li.classList.toggle('is-current', i === frame.line));
    varList.innerHTML = Object.entries(frame.vars ?? {})
      .map(([name, value]) => `<div><dt>${escapeHtml(name)}</dt><dd>${escapeHtml(value)}</dd></div>`)
      .join('');
  };

  // Wide arrays scroll sideways inside the stage. Centre the cell the caption
  // talks about, so "mid = 7" is never describing a cell that is off-screen.
  const keepActiveCellInView = () => {
    const stage = root.querySelector('.demo-stage');
    const cell = stage?.querySelector('.array-cell.is-hit, .array-cell.is-mid, .array-cell.is-active');
    if (!cell || stage.scrollWidth <= stage.clientWidth) return;
    stage.scrollLeft = cell.offsetLeft - stage.clientWidth / 2 + cell.offsetWidth / 2;
  };

  const stop = () => {
    clearInterval(timer);
    timer = null;
    playButton.innerHTML = `${icon('play')} Play`;
    // Announce captions again once playback stops; during play they change too fast.
    caption.setAttribute('aria-live', 'polite');
  };

  const step = (delta) => {
    const next = Math.min(frames.length - 1, Math.max(0, index + delta));
    if (next === index) return false;
    index = next;
    show();
    return true;
  };

  const play = () => {
    if (index >= frames.length - 1) index = -1; // Replay from the start.
    playButton.innerHTML = `${icon('pause')} Pause`;
    caption.setAttribute('aria-live', 'off');
    timer = setInterval(() => {
      // Stop when the learner has moved to another lesson or reached the end.
      if (!root.isConnected || !step(1)) stop();
    }, 1100 - Number(speedInput.value) * 100);
  };

  const toggle = () => (timer ? stop() : play());

  root.addEventListener('click', (event) => {
    const action = event.target.closest('[data-player]')?.dataset.player;
    if (!action || action === 'speed') return;
    if (action === 'play') return toggle();
    stop();
    if (action === 'first') step(-index);
    else step(action === 'next' ? 1 : -1);
  });

  root.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const onControl = event.target.closest('input, select, textarea');
    if (event.key === 'ArrowRight' && !onControl) {
      event.preventDefault();
      stop();
      step(1);
    } else if (event.key === 'ArrowLeft' && !onControl) {
      event.preventDefault();
      stop();
      step(-1);
    } else if (event.key === ' ' && !onControl && !event.target.closest('button')) {
      event.preventDefault();
      toggle();
    }
  });

  // A new speed takes effect right away by restarting the timer.
  speedInput.addEventListener('input', () => {
    if (!timer) return;
    stop();
    play();
  });

  return {
    /** Load new frames; pass `code` (an array of lines) to show the code tracer. */
    load(newFrames, code) {
      stop();
      if (code) {
        codeList.innerHTML = code.map((line) => `<li><code>${escapeHtml(line)}</code></li>`).join('');
        trace.hidden = false;
      }
      frames = newFrames;
      index = 0;
      show();
    },
  };
}
