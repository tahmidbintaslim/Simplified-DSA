import { animate } from 'motion';
import { reduceMotion, SPRING } from '../demos/motion.js';
import { escapeHtml } from '../utils/markdown.js';

// The one idea: a queue in an array stays O(1) by moving the `front` index
// instead of the values, and letting both indexes wrap round to slot 0.

const WORDS = {
  en: {
    goal: 'A queue living in 6 array slots. Dequeue a few, then keep enqueueing until the back goes past slot 5.',
    enqueue: 'Enqueue',
    dequeue: 'Dequeue',
    reset: 'Reset',
    slots: 'Array slots 0 to 5',
    front: 'front',
    back: 'back',
    empty: 'empty',
    start: 'front is the slot that leaves next. back is the slot the next value goes into.',
    tally: (shifts) => `Values shifted so far: 0. A plain array that always removes from index 0 would have shifted ${shifts}.`,
    enq: (v, at, to) => `${v} went into slot ${at}. back moves on: (${at} + 1) % 6 = ${to}.`,
    enqWrap: (v, at) => `${v} went into slot ${at}, the last one. back wraps round: (${at} + 1) % 6 = 0, so the slots freed at the start get used again.`,
    deq: (v, at, to) => `${v} left from slot ${at}. Only front moved: (${at} + 1) % 6 = ${to}. Every other value stayed where it was.`,
    deqWrap: (v, at) => `${v} left from slot ${at}. front wraps round too: (${at} + 1) % 6 = 0.`,
    full: 'Full: all 6 slots hold a waiting value. A real queue would copy itself into a bigger array here. Dequeue to make room.',
    none: 'Empty: there is nothing to dequeue. Enqueue a value first.',
  },
  bn: {
    goal: 'অ্যারের ৬টি ঘরে বসানো একটা কিউ। কয়েকটা dequeue করো, তারপর enqueue করতে থাকো যতক্ষণ না back ঘর 5 পার হয়।',
    enqueue: 'Enqueue',
    dequeue: 'Dequeue',
    reset: 'আবার শুরু',
    slots: 'অ্যারের ঘর 0 থেকে 5',
    front: 'front',
    back: 'back',
    empty: 'খালি',
    start: 'front হলো সেই ঘর, যেখান থেকে এরপর মান বের হবে। back হলো সেই ঘর, যেখানে পরের মানটা বসবে।',
    tally: (shifts) => `এ পর্যন্ত সরানো মান: 0টি। সাধারণ অ্যারে হলে, যে সবসময় ইনডেক্স 0 থেকে সরায়, তাকে সরাতে হতো ${shifts}টি।`,
    enq: (v, at, to) => `${v} বসল ঘর ${at}-এ। back এক ঘর এগোল: (${at} + 1) % 6 = ${to}।`,
    enqWrap: (v, at) => `${v} বসল ঘর ${at}-এ, একদম শেষ ঘরে। back ঘুরে শুরুতে ফিরল: (${at} + 1) % 6 = 0, তাই শুরুর দিকের খালি হওয়া ঘরগুলো আবার কাজে লাগছে।`,
    deq: (v, at, to) => `${v} বের হলো ঘর ${at} থেকে। নড়ল শুধু front: (${at} + 1) % 6 = ${to}। বাকি সব মান যেখানে ছিল সেখানেই আছে।`,
    deqWrap: (v, at) => `${v} বের হলো ঘর ${at} থেকে। front-ও ঘুরে শুরুতে ফিরল: (${at} + 1) % 6 = 0।`,
    full: 'ভরে গেছে: ৬টি ঘরেই অপেক্ষমাণ মান আছে। আসল কিউ এ সময় নিজেকে আরও বড় অ্যারেতে কপি করে নিত। জায়গা করতে dequeue করো।',
    none: 'খালি: dequeue করার মতো কিছু নেই। আগে একটা মান enqueue করো।',
  },
};

const SIZE = 6;

function ringQueue(root, { lang = 'en' } = {}) {
  const w = WORDS[lang] ?? WORDS.en;
  let slots;
  let front;
  let count;
  let made; // values created so far, so each one gets the next letter
  let shifts; // what a shift-on-dequeue array would have paid

  root.innerHTML = `
    <div class="widget-head">
      <p class="widget-goal">${w.goal}</p>
      <div class="widget-actions">
        <button type="button" class="demo-button" data-act="enqueue">${w.enqueue}</button>
        <button type="button" class="demo-button" data-act="dequeue">${w.dequeue}</button>
        <button type="button" class="demo-button" data-act="reset">${w.reset}</button>
      </div>
    </div>
    <div class="array-row ring-queue-row" role="group" aria-label="${w.slots}"></div>
    <p class="widget-message" aria-live="polite"></p>
    <p class="ring-queue-tally"></p>
  `;
  const row = root.querySelector('.ring-queue-row');
  const message = root.querySelector('.widget-message');
  const tally = root.querySelector('.ring-queue-tally');

  const draw = (hit = -1) => {
    const back = (front + count) % SIZE;
    row.innerHTML = slots
      .map((value, i) => {
        const tags = [i === front && count > 0 ? w.front : '', i === back ? w.back : ''].filter(Boolean);
        return `<div class="array-cell ${i === hit ? 'is-hit' : ''} ${value === null ? 'ring-queue-free' : ''}">
          <span class="array-value">${value === null ? '<span class="ring-queue-dot" aria-hidden="true">·</span>' : escapeHtml(value)}</span>
          <span class="array-index">${i}</span>
          <span class="ring-queue-tags">${tags.map((t) => `<span class="ring-queue-tag">${t}</span>`).join('')}</span>
        </div>`;
      })
      .join('');
    tally.textContent = w.tally(shifts);
    if (hit >= 0 && !reduceMotion()) animate(row.children[hit].querySelector('.array-value'), { scale: [1.18, 1] }, SPRING);
  };

  const reset = () => {
    slots = ['A', 'B', 'C', null, null, null];
    front = 0;
    count = 3;
    made = 3;
    shifts = 0;
    message.textContent = w.start;
    draw();
  };

  root.addEventListener('click', (event) => {
    const act = event.target.closest('[data-act]')?.dataset.act;
    if (act === 'reset') return reset();
    if (act === 'enqueue') {
      if (count === SIZE) return (message.textContent = w.full);
      const at = (front + count) % SIZE;
      const value = String.fromCharCode(65 + (made++ % 26));
      slots[at] = value;
      count += 1;
      const to = (at + 1) % SIZE;
      message.textContent = to === 0 ? w.enqWrap(value, at) : w.enq(value, at, to);
      draw(at);
    }
    if (act === 'dequeue') {
      if (count === 0) return (message.textContent = w.none);
      const at = front;
      const value = slots[at];
      slots[at] = null;
      count -= 1;
      shifts += count; // a plain array would slide every remaining value left
      front = (front + 1) % SIZE;
      message.textContent = front === 0 ? w.deqWrap(value, at) : w.deq(value, at, front);
      draw(at);
    }
  });

  reset();
}

export default { 'ring-queue': ringQueue };
