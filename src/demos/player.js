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
 * button or field, which already use those keys). The timeline slider scrubs
 * through every step and announces the step's caption.
 *
 * Predict, then reveal: a demo can pass `predict` ({ question(now, next),
 * answer(next) → cell index or null, explain(next), cells() }). With
 * "Predict first" switched on, Step asks the question, the learner picks a
 * cell (click, or Tab and Enter), and only then does the step play, with a
 * line saying whether the guess was right and why.
 */
export const PLAYER_WORDS = {
  en: {
    first: 'First step', back: 'Back', play: 'Play', pause: 'Pause', step: 'Step', speed: 'Speed', predictFirst: 'Predict first',
    justShow: 'Just show me', stepLabel: 'Step', pseudocode: 'Pseudocode', variables: 'Variables',
    stepOf: (k, n) => `Step ${k} of ${n}`, count: (k, n) => `Step ${k} / ${n}`,
    predict: (q) => `Predict: ${q} Pick a cell.`, pickCell: (i) => `Pick cell ${i}`,
    itWas: (a, why) => `It was cell ${a}. ${why}`, right: (a, why) => `Right: cell ${a}. ${why}`,
    wrong: (p, a, why) => `You picked cell ${p}; it was cell ${a}. ${why}`,
  },
  bn: {
    first: 'প্রথম ধাপ', back: 'পেছনে', play: 'চালাও', pause: 'থামাও', step: 'ধাপ', speed: 'গতি', predictFirst: 'আগে আন্দাজ করো',
    justShow: 'শুধু দেখাও', stepLabel: 'ধাপ', pseudocode: 'সিউডোকোড', variables: 'ভেরিয়েবল',
    stepOf: (k, n) => `${n}টির মধ্যে ${k} নম্বর ধাপ`, count: (k, n) => `ধাপ ${k} / ${n}`,
    predict: (q) => `আন্দাজ করো: ${q} একটা ঘর বেছে নাও।`, pickCell: (i) => `${i} নম্বর ঘর বেছে নাও`,
    itWas: (a, why) => `উত্তর ছিল ${a} নম্বর ঘর। ${why}`, right: (a, why) => `ঠিক: ${a} নম্বর ঘর। ${why}`,
    wrong: (p, a, why) => `তুমি ${p} বেছেছিলে; উত্তর ছিল ${a}। ${why}`,
  },
};

// `lang` picks the control words (PLAYER_WORDS); the frames bring their own captions.
export function createPlayer(root, onFrame, { predict, lang = 'en' } = {}) {
  const w = PLAYER_WORDS[lang] ?? PLAYER_WORDS.en;
  root.insertAdjacentHTML(
    'beforeend',
    `
    <div class="demo-player">
      <div class="player-buttons">
        <button type="button" class="demo-button" data-player="first" aria-label="${w.first}">${icon('first')}</button>
        <button type="button" class="demo-button" data-player="back">${icon('back')} ${w.back}</button>
        <button type="button" class="demo-button is-primary" data-player="play">${icon('play')} ${w.play}</button>
        <button type="button" class="demo-button" data-player="next">${w.step} ${icon('next')}</button>
      </div>
      <label class="demo-speed">${w.speed}
        <input type="range" min="1" max="10" value="5" data-player="speed" />
      </label>
      ${predict ? `<label class="predict-toggle"><input type="checkbox" data-player="predict" /> ${w.predictFirst}</label>` : ''}
    </div>
    ${predict ? `<div class="predict-card" hidden><p class="predict-question" aria-live="polite"></p><button type="button" class="demo-button" data-player="reveal">${w.justShow}</button></div>` : ''}
    <div class="demo-timeline">
      <label class="demo-scrub"><span class="sr-only">${w.stepLabel}</span>
        <input type="range" min="1" max="1" value="1" step="1" data-player="scrub" />
      </label>
      <span class="demo-count" aria-hidden="true"></span>
    </div>
    <p class="demo-caption" aria-live="polite"></p>
    <div class="trace" hidden>
      <div class="trace-code">
        <p class="trace-title">${w.pseudocode}</p>
        <ol class="trace-lines"></ol>
      </div>
      <div class="trace-vars">
        <p class="trace-title">${w.variables}</p>
        <dl class="trace-var-list"></dl>
      </div>
    </div>
  `,
  );

  const playButton = root.querySelector('[data-player="play"]');
  const speedInput = root.querySelector('[data-player="speed"]');
  const count = root.querySelector('.demo-count');
  const scrub = root.querySelector('[data-player="scrub"]');
  const caption = root.querySelector('.demo-caption');
  const trace = root.querySelector('.trace');
  const codeList = root.querySelector('.trace-lines');
  const varList = root.querySelector('.trace-var-list');
  const predictToggle = root.querySelector('[data-player="predict"]');
  const predictCard = root.querySelector('.predict-card');
  const predictQuestion = root.querySelector('.predict-question');
  let frames = [];
  let index = 0;
  let awaiting = null; // { answer } while the learner is choosing a cell
  let timer = null;

  const show = () => {
    const frame = frames[index];
    onFrame(frame);
    // The visible counter is aria-hidden, so screen readers hear the step in the caption.
    // A numbered step badge, like a numbered fold in a diagram; screen readers get the words.
    caption.innerHTML = `<span class="step-badge" aria-hidden="true">${index + 1}</span><span class="sr-only">${w.stepOf(index + 1, frames.length)}. </span>${escapeHtml(frame.caption)}`;
    count.textContent = w.count(index + 1, frames.length);
    // The timeline: drag through every step, like scrubbing a video.
    scrub.max = String(frames.length);
    scrub.value = String(index + 1);
    scrub.setAttribute('aria-valuetext', `${w.stepOf(index + 1, frames.length)}: ${frame.caption}`);
    scrub.style.setProperty('--progress', frames.length > 1 ? `${(index / (frames.length - 1)) * 100}%` : '100%');
    // The first frame can draw before the demo is attached and laid out; centre after layout too.
    keepActiveCellInView();
    requestAnimationFrame(keepActiveCellInView);
    [...codeList.children].forEach((li, i) => li.classList.toggle('is-current', i === frame.line));
    varList.innerHTML = Object.entries(frame.vars ?? {})
      .map(([name, value]) => `<div><dt>${escapeHtml(name)}</dt><dd>${escapeHtml(value)}</dd></div>`)
      .join('');
  };

  // Wide arrays scroll sideways inside the stage. Centre the cell the caption
  // talks about, so "mid = 7" is never describing a cell that is off-screen.
  const keepActiveCellInView = () => {
    const stage = root.querySelector('.demo-stage');
    const cell = stage?.querySelector('.array-cell.is-found, .array-cell.is-hit, .array-cell.is-mid, .array-cell.is-active');
    if (!cell || stage.scrollWidth <= stage.clientWidth) return;
    stage.scrollLeft = cell.offsetLeft - stage.clientWidth / 2 + cell.offsetWidth / 2;
  };

  const stop = () => {
    clearInterval(timer);
    timer = null;
    playButton.innerHTML = `${icon('play')} ${w.play}`;
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
    playButton.innerHTML = `${icon('pause')} ${w.pause}`;
    caption.setAttribute('aria-live', 'off');
    timer = setInterval(() => {
      // Stop when the learner has moved to another lesson or reached the end.
      if (!root.isConnected || !step(1)) stop();
    }, 1100 - Number(speedInput.value) * 100);
  };

  const toggle = () => (timer ? stop() : play());

  /* ---------- Predict, then reveal ---------- */

  const pickable = () => [...(predict?.cells() ?? [])];
  const endPredict = () => {
    awaiting = null;
    for (const cell of pickable()) {
      cell.classList.remove('is-pickable');
      cell.removeAttribute('tabindex');
      cell.removeAttribute('role');
      cell.removeAttribute('aria-label');
    }
  };
  // Ask before stepping, when the next step has a cell to predict.
  const ask = () => {
    const next = frames[index + 1];
    const answer = next ? predict.answer(next, frames[index]) : null;
    if (answer === null || answer === undefined || answer < 0) return false;
    awaiting = { answer };
    predictCard.hidden = false;
    predictCard.classList.remove('is-right', 'is-wrong');
    predictQuestion.textContent = w.predict(predict.question(frames[index], next));
    pickable().forEach((cell, i) => {
      cell.classList.add('is-pickable');
      cell.tabIndex = 0;
      cell.setAttribute('role', 'button');
      cell.setAttribute('aria-label', w.pickCell(i));
    });
    return true;
  };
  const reveal = (picked) => {
    const { answer } = awaiting;
    // The picked cell stops being a button: keep keyboard focus on Step.
    const hadFocus = pickable().includes(document.activeElement);
    endPredict();
    if (hadFocus) root.querySelector('[data-player="next"]').focus();
    step(1);
    const why = predict.explain(frames[index], frames[index - 1]);
    const right = picked === answer;
    predictCard.classList.toggle('is-right', picked !== null && right);
    predictCard.classList.toggle('is-wrong', picked !== null && !right);
    predictQuestion.textContent =
      picked === null ? w.itWas(answer, why) : right ? w.right(answer, why) : w.wrong(picked, answer, why);
  };
  const stepOrAsk = () => {
    if (awaiting) return;
    if (predictToggle?.checked && ask()) return;
    if (predictCard) predictCard.hidden = !predictToggle?.checked;
    step(1);
  };

  root.addEventListener('click', (event) => {
    const picked = awaiting && event.target.closest('.is-pickable');
    if (picked) return reveal(pickable().indexOf(picked));
    const action = event.target.closest('[data-player]')?.dataset.player;
    if (!action || action === 'speed' || action === 'scrub' || action === 'predict') return;
    if (action === 'reveal') return awaiting && reveal(null);
    if (action === 'play') {
      endPredict();
      return toggle();
    }
    stop();
    if (action === 'next') return stepOrAsk();
    endPredict();
    if (action === 'first') step(-index);
    else step(-1);
  });

  predictToggle?.addEventListener('change', () => {
    endPredict();
    predictCard.hidden = true;
  });

  root.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const onControl = event.target.closest('input, select, textarea');
    if (awaiting && (event.key === 'Enter' || event.key === ' ') && event.target.classList.contains('is-pickable')) {
      event.preventDefault();
      reveal(pickable().indexOf(event.target));
    } else if (event.key === 'ArrowRight' && !onControl) {
      event.preventDefault();
      stop();
      stepOrAsk();
    } else if (event.key === 'ArrowLeft' && !onControl) {
      event.preventDefault();
      stop();
      endPredict();
      step(-1);
    } else if (event.key === ' ' && !onControl && !event.target.closest('button')) {
      event.preventDefault();
      toggle();
    }
  });

  scrub.addEventListener('input', () => {
    stop();
    endPredict();
    index = Math.min(frames.length - 1, Math.max(0, Number(scrub.value) - 1));
    show();
  });

  // A new speed takes effect right away by restarting the timer.
  speedInput.addEventListener('input', () => {
    if (!timer) return;
    stop();
    play();
  });

  // Phones rotate and windows resize: keep the active cell centred.
  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(() => keepActiveCellInView());
    requestAnimationFrame(() => {
      const stage = root.querySelector('.demo-stage');
      if (stage) observer.observe(stage);
    });
  }

  return {
    /** Load new frames; pass `code` (an array of lines) to show the code tracer. */
    load(newFrames, code) {
      stop();
      endPredict();
      if (predictCard) predictCard.hidden = true;
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
