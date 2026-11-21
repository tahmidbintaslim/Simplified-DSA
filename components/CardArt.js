/**
 * The banner on a hub card: layered waves in the topic's hue with a small
 * drawing of the structure itself on a frosted tile, so a card shows what
 * the topic looks like before it is opened. Pure SVG, drawn on the server.
 * The waves drift apart on hover (see .card-art in style.css).
 */

// One hue per topic, spread around the wheel so neighbours differ.
const HUES = {
  'arrays-and-strings': 222, 'linked-lists': 172, 'stacks-and-queues': 268, 'hash-tables': 32,
  'binary-search-trees': 142, 'big-o': 338, 'binary-search': 204, sorting: 48,
  'graph-traversal': 286, 'two-pointers': 14, 'sliding-window': 190, 'fast-and-slow-pointers': 252,
  'prefix-sums': 96, heaps: 356, tries: 158, 'dynamic-programming': 236,
};

const box = (x, y, w = 14, h = 14, on = false) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" class="${on ? 'on' : ''}"/>`;
const dot = (x, y, on = false, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" class="${on ? 'on' : ''}"/>`;
const line = (d) => `<path d="${d}"/>`;

// Each glyph is drawn in a 72 x 44 box: stroke for structure, .on for the highlighted part.
const GLYPHS = {
  'arrays-and-strings': [0, 1, 2, 3].map((i) => box(4 + i * 17, 15, 14, 14, i === 2)).join(''),
  'linked-lists': [0, 1, 2].map((i) => box(4 + i * 25, 15, 14, 14, i === 0)).join('') + line('M18 22h11M43 22h11m-4-4 4 4-4 4M25 18l4 4-4 4'),
  'stacks-and-queues': [0, 1, 2].map((i) => box(8, 30 - i * 12, 24, 9, i === 2)).join('') + [0, 1, 2].map((i) => box(40 + i * 10, 17, 8, 12, i === 0)).join(''),
  'hash-tables': [0, 1, 2].map((i) => box(4, 5 + i * 13, 12, 9, i === 1)).join('') + line('M16 9.5h14M16 22.5h14M16 35.5h14') + box(32, 18, 14, 9, true) + line('M46 22.5h6') + box(52, 18, 14, 9),
  'binary-search-trees': line('M36 10 20 24M36 10l16 14M20 24l-8 12M20 24l8 12') + dot(36, 10, true) + dot(20, 24) + dot(52, 24) + dot(12, 36, false, 4) + dot(28, 36, false, 4),
  'big-o': line('M8 38h56M8 38V6') + line('M8 34h54') + line('M8 36 62 12') + `<path class="on-line" d="M8 36C34 34 50 26 58 6"/>`,
  'binary-search': [0, 1, 2, 3, 4].map((i) => box(3 + i * 13.5, 15, 11, 14, i === 2)).join('') + line('M36 35v6m-4-3 4-4 4 4'),
  sorting: [14, 26, 8, 32, 20].map((h, i) => box(9 + i * 11.5, 40 - h, 8, h, i === 3)).join(''),
  'graph-traversal': line('M14 12h22M14 12v20M36 12l20 10M14 32h22M36 32l20-10M36 12v20') + dot(14, 12, true) + dot(36, 12, true) + dot(14, 32) + dot(36, 32) + dot(56, 22),
  'two-pointers': [0, 1, 2, 3, 4].map((i) => box(3 + i * 13.5, 8, 11, 14, i === 0 || i === 4)).join('') + line('M8.5 38v-9m-4 4 4-4 4 4M62.5 38v-9m-4 4 4-4 4 4M18 34h10m-4-3 4 3-4 3M53 34H43m4-3-4 3 4 3'),
  'sliding-window': [0, 1, 2, 3, 4].map((i) => box(3 + i * 13.5, 15, 11, 14)).join('') + `<rect x="14.5" y="10" width="42" height="24" rx="5" class="frame"/>`,
  'fast-and-slow-pointers': `<circle cx="44" cy="22" r="14" class="ring"/>` + line('M4 22h26') + dot(12, 22) + dot(30, 22) + dot(58, 22, true) + dot(44, 8) + dot(44, 36, true),
  'prefix-sums': [0, 1, 2, 3].map((i) => box(4 + i * 17, 6, 14, 12)).join('') + [0, 1, 2, 3].map((i) => box(4 + i * 17, 26, 14, 12, i === 3)).join('') + line('M11 18v8M28 18v8M45 18v8M62 18v8'),
  heaps: line('M36 8 22 22M36 8l14 14M22 22l-8 14M22 22l8 14') + dot(36, 8, true, 6) + dot(22, 22) + dot(50, 22) + dot(14, 36, false, 4) + dot(30, 36, false, 4),
  tries: line('M36 6 20 20M36 6l16 14M20 20v16M52 20 44 36M52 20l8 16') + dot(36, 6, true, 4) + dot(20, 20, true, 4) + dot(52, 20, false, 4) + dot(20, 36, true, 4) + dot(44, 36, false, 4) + dot(60, 36, false, 4),
  'dynamic-programming': [0, 1, 2].flatMap((r) => [0, 1, 2, 3].map((c) => box(6 + c * 16, 4 + r * 13, 12, 9, r + c >= 4 || (r === 2 && c === 1)))).join(''),
};

export const cardHue = (topic) => HUES[topic] ?? 222;

export default function CardArt({ topic, tab }) {
  const glyph = GLYPHS[topic] ?? GLYPHS['arrays-and-strings'];
  return (
    <span className="card-art" style={{ '--hue': cardHue(topic) }} aria-hidden="true">
      <svg className="card-waves" viewBox="0 0 320 120" preserveAspectRatio="none">
        <path className="wave w1" d="M0 46C54 22 96 62 160 44s110-30 160-6v82H0Z" />
        <path className="wave w2" d="M0 70c48-18 92 14 150 2s112-34 170-10v58H0Z" />
        <path className="wave w3" d="M0 92c60-20 100 10 164 0s104-22 156-8v36H0Z" />
      </svg>
      <span className="card-tile">
        <svg viewBox="0 0 72 44" dangerouslySetInnerHTML={{ __html: glyph }} />
      </span>
      {tab ? <span className="card-tab">{tab}</span> : null}
    </span>
  );
}
