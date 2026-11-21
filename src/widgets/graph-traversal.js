import { animate } from 'motion';
import { reduceMotion, SPRING } from '../demos/motion.js';
import { escapeHtml } from '../utils/markdown.js';

// The one idea: BFS and DFS are the same loop. The only choice is which end of
// the waiting list the next node comes from: the oldest (BFS) or the newest (DFS).

const WORDS = {
  en: {
    goal: 'You are the search. Nodes wait in the list below; each time, choose which end to take the next node from.',
    oldest: 'Take the oldest',
    newest: 'Take the newest',
    reset: 'Reset',
    list: 'Waiting list',
    endOld: 'oldest',
    endNew: 'newest',
    empty: 'empty',
    order: 'Visited',
    none: 'nobody yet',
    graph: 'A graph of 7 nodes. Rows show how many steps each node is from A.',
    level: (d) => (d === 0 ? 'start' : `${d} step${d === 1 ? '' : 's'}`),
    start: 'A is waiting. Take it out to visit it.',
    visit: (v, added) => `Visited ${v}. ${added.length ? `Its new neighbour${added.length === 1 ? '' : 's'} ${added.join(', ')} joined the newest end.` : 'It has no new neighbours, so nothing joined.'}`,
    bfs: (order) => `You always took the oldest: that is BFS. Look at the order, ${order}: every node 1 step from A came before any node 2 steps away.`,
    dfs: (order) => `You always took the newest: that is DFS. Look at the order, ${order}: it ran down one route as far as it could before coming back.`,
    mixed: (order) => `You mixed both ends. Every node still got visited (${order}), but the order is neither BFS nor DFS. Reset and stick to one end.`,
  },
  bn: {
    goal: 'এবার সার্চটা তুমি নিজেই। নোডগুলো নিচের তালিকায় অপেক্ষা করে; প্রতিবার ঠিক করো পরের নোডটা তালিকার কোন মাথা থেকে নেবে।',
    oldest: 'সবচেয়ে পুরোনোটা নাও',
    newest: 'সবচেয়ে নতুনটা নাও',
    reset: 'আবার শুরু',
    list: 'অপেক্ষার তালিকা',
    endOld: 'পুরোনো',
    endNew: 'নতুন',
    empty: 'খালি',
    order: 'ভিজিট করা হয়েছে',
    none: 'এখনো কেউ না',
    graph: '৭টি নোডের একটা গ্রাফ। কোন নোড A থেকে কত ধাপ দূরে, সারিগুলো তা দেখায়।',
    level: (d) => (d === 0 ? 'শুরু' : `${d} ধাপ`),
    start: 'A অপেক্ষা করছে। বের করে ভিজিট করো।',
    visit: (v, added) => `${v} ভিজিট হলো। ${added.length ? `তার নতুন প্রতিবেশী ${added.join(', ')} তালিকার নতুন মাথায় যোগ হলো।` : 'তার কোনো নতুন প্রতিবেশী নেই, তাই কিছুই যোগ হলো না।'}`,
    bfs: (order) => `তুমি প্রতিবার সবচেয়ে পুরোনোটা নিয়েছ: এটাই BFS। ক্রমটা দেখো, ${order}: A থেকে 1 ধাপ দূরের সব নোড এসেছে 2 ধাপ দূরের যেকোনো নোডের আগে।`,
    dfs: (order) => `তুমি প্রতিবার সবচেয়ে নতুনটা নিয়েছ: এটাই DFS। ক্রমটা দেখো, ${order}: একটা পথ ধরে যতদূর যাওয়া যায় গিয়ে তারপর ফিরে এসেছে।`,
    mixed: (order) => `তুমি দুই মাথা মিশিয়ে নিয়েছ। তবু সব নোডই ভিজিট হয়েছে (${order}), কিন্তু ক্রমটা BFS-ও না, DFS-ও না। আবার শুরু করে এক মাথায় লেগে থাকো।`,
  },
};

// Rows are distance from A, so BFS reads top to bottom and DFS dives.
const NODES = { A: [170, 28, 0], B: [110, 88, 1], C: [250, 88, 1], D: [70, 148, 2], E: [160, 148, 2], F: [250, 148, 2], G: [160, 208, 3] };
const EDGES = ['AB', 'AC', 'BD', 'BE', 'CF', 'EF', 'EG'];
const neighbours = (v) => EDGES.filter((e) => e.includes(v)).map((e) => e.replace(v, '')).sort();

function waitingList(root, { lang = 'en' }) {
  const w = WORDS[lang] ?? WORDS.en;
  let waiting;
  let visited;
  let picks; // which end was used each time there was a real choice

  root.innerHTML = `
    <p class="widget-goal">${w.goal}</p>
    <svg class="waiting-list-graph" viewBox="0 0 300 236" role="img" aria-label="${escapeHtml(w.graph)}">
      ${[0, 1, 2, 3].map((d) => `<line class="waiting-list-level" x1="4" x2="296" y1="${28 + d * 60}" y2="${28 + d * 60}"/><text class="waiting-list-level-label" x="4" y="${22 + d * 60}">${w.level(d)}</text>`).join('')}
      ${EDGES.map(([a, b]) => `<line class="waiting-list-edge" x1="${NODES[a][0]}" y1="${NODES[a][1]}" x2="${NODES[b][0]}" y2="${NODES[b][1]}"/>`).join('')}
      ${Object.entries(NODES).map(([name, [x, y]]) => `<g class="waiting-list-node" data-node="${name}" transform="translate(${x} ${y})"><circle r="17"/><text class="waiting-list-name" dy="5">${name}</text><text class="waiting-list-step" x="19" y="-12"></text></g>`).join('')}
    </svg>
    <div class="waiting-list-queue">
      <span class="waiting-list-label">${w.list}</span>
      <div class="waiting-list-track">
        <span class="waiting-list-end">${w.endOld}</span>
        <div class="array-row waiting-list-row"></div>
        <span class="waiting-list-end">${w.endNew}</span>
      </div>
    </div>
    <div class="widget-actions">
      <button type="button" class="demo-button" data-take="oldest">${w.oldest}</button>
      <button type="button" class="demo-button" data-take="newest">${w.newest}</button>
      <button type="button" class="demo-button" data-take="reset">${w.reset}</button>
    </div>
    <p class="waiting-list-order"></p>
    <p class="widget-message" aria-live="polite"></p>
  `;
  const row = root.querySelector('.waiting-list-row');
  const order = root.querySelector('.waiting-list-order');
  const message = root.querySelector('.widget-message');
  const takeButtons = root.querySelectorAll('[data-take="oldest"], [data-take="newest"]');

  const draw = () => {
    row.innerHTML = waiting.length ? waiting.map((v) => `<div class="array-cell is-hit"><span class="array-value">${v}</span></div>`).join('') : `<span class="waiting-list-empty">${w.empty}</span>`;
    order.textContent = `${w.order}: ${visited.length ? visited.join(' → ') : w.none}`;
    root.querySelectorAll('[data-node]').forEach((node) => {
      const name = node.dataset.node;
      const at = visited.indexOf(name);
      node.setAttribute('class', `waiting-list-node ${at >= 0 ? 'is-visited' : waiting.includes(name) ? 'is-waiting' : ''} ${at >= 0 && at === visited.length - 1 ? 'is-now' : ''}`);
      node.querySelector('.waiting-list-step').textContent = at >= 0 ? at + 1 : '';
    });
    takeButtons.forEach((button) => (button.disabled = waiting.length === 0));
  };

  const reset = () => {
    waiting = ['A'];
    visited = [];
    picks = new Set();
    message.textContent = w.start;
    draw();
  };

  root.addEventListener('click', (event) => {
    const end = event.target.closest('[data-take]')?.dataset.take;
    if (!end) return;
    if (end === 'reset') return reset();
    if (!waiting.length) return;
    if (waiting.length > 1) picks.add(end);
    const node = end === 'oldest' ? waiting.shift() : waiting.pop();
    visited.push(node);
    // A node joins the list once: skip neighbours already visited or already waiting.
    const added = neighbours(node).filter((n) => !visited.includes(n) && !waiting.includes(n));
    waiting.push(...added);
    draw();
    const said = visited.join(', ');
    message.textContent = waiting.length ? w.visit(node, added) : picks.size > 1 ? w.mixed(said) : picks.has('newest') ? w.dfs(said) : w.bfs(said);
    if (!reduceMotion()) {
      animate(root.querySelector(`[data-node="${node}"] circle`), { scale: [1.25, 1] }, SPRING);
      const fresh = [...row.children].slice(waiting.length - added.length);
      if (added.length) animate(fresh, { opacity: [0, 1], y: [-14, 0] }, SPRING);
    }
    if (!waiting.length) root.querySelector('[data-take="reset"]').focus({ preventScroll: true });
  });

  reset();
}

export default { 'waiting-list': waitingList };
