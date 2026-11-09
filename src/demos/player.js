/**
 * A small step player shared by the algorithm demos.
 *
 * Algorithms record frames up front (see algorithms.js); the player only moves
 * an index through them. Step back, step forward, play and pause all reuse
 * the same `show()` call, so the picture always matches the caption.
 */
export function createPlayer(root, onFrame) {
  root.insertAdjacentHTML(
    'beforeend',
    `
    <div class="demo-player">
      <button type="button" class="demo-button" data-player="back">◀ Back</button>
      <button type="button" class="demo-button is-primary" data-player="play">Play</button>
      <button type="button" class="demo-button" data-player="next">Step ▶</button>
      <label class="demo-speed">Speed
        <input type="range" min="1" max="10" value="5" data-player="speed" />
      </label>
      <span class="demo-count" aria-hidden="true"></span>
    </div>
    <p class="demo-caption" aria-live="polite"></p>
  `,
  );

  const playButton = root.querySelector('[data-player="play"]');
  const speedInput = root.querySelector('[data-player="speed"]');
  const count = root.querySelector('.demo-count');
  const caption = root.querySelector('.demo-caption');
  let frames = [];
  let index = 0;
  let timer = null;

  const show = () => {
    onFrame(frames[index]);
    caption.textContent = frames[index].caption;
    count.textContent = `Step ${index + 1} / ${frames.length}`;
  };

  const stop = () => {
    clearInterval(timer);
    timer = null;
    playButton.textContent = 'Play';
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
    playButton.textContent = 'Pause';
    caption.setAttribute('aria-live', 'off');
    timer = setInterval(() => {
      // Stop when the learner has moved to another lesson or reached the end.
      if (!root.isConnected || !step(1)) stop();
    }, 1100 - Number(speedInput.value) * 100);
  };

  root.addEventListener('click', (event) => {
    const action = event.target.closest('[data-player]')?.dataset.player;
    if (!action || action === 'speed') return;
    if (action === 'play') {
      if (timer) stop();
      else play();
      return;
    }
    stop();
    step(action === 'next' ? 1 : -1);
  });

  // A new speed takes effect right away by restarting the timer.
  speedInput.addEventListener('input', () => {
    if (!timer) return;
    stop();
    play();
  });

  return {
    load(newFrames) {
      stop();
      frames = newFrames;
      index = 0;
      show();
    },
  };
}
