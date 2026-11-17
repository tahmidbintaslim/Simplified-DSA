/**
 * A small authored icon set, drawn in the style of Iconly's "Light (Outline)":
 * a 24px grid, 1.5px stroke, round caps and joins, colour from the text.
 * Icons are decorative (aria-hidden); the button or link next to them names
 * the action in words.
 */
const paths = {
  first: '<path d="M6 5v14"/><path d="M18 6.2v11.6a1 1 0 0 1-1.5.86L8.2 13.7a2 2 0 0 1 0-3.4l8.3-4.96A1 1 0 0 1 18 6.2Z"/>',
  back: '<path d="M15 5.5 8.5 12l6.5 6.5"/>',
  next: '<path d="m9 5.5 6.5 6.5L9 18.5"/>',
  play: '<path d="M7.5 5.6v12.8a1 1 0 0 0 1.52.85l10.24-6.4a1 1 0 0 0 0-1.7L9.02 4.75A1 1 0 0 0 7.5 5.6Z"/>',
  pause: '<rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/>',
  check: '<path d="m5.5 12.5 4 4 9-9"/>',
  chevronDown: '<path d="m6 9.5 6 6 6-6"/>',
  arrowLeft: '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
  list: '<path d="M4 6.5h16"/><path d="M4 12h10"/><path d="M4 17.5h13"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
  moon: '<path d="M19.5 14.2A7.8 7.8 0 0 1 9.8 4.5a7.8 7.8 0 1 0 9.7 9.7Z"/>',
  github: '<path d="M9 19.5c-4 1.2-4-2-5.6-2.5M15 21.5v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.6-1.3 5.6-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.6 1.6 5.6 1.9 5.6 1.9a4.3 4.3 0 0 0-.1 3.2 4.6 4.6 0 0 0-1.3 3.2c0 4.6 2.8 5.7 5.5 6a3 3 0 0 0-.8 2.3v3.9"/>',
  // Section marks for the home cards: a row of cells, a halving search, two pointers.
  cells: '<rect x="2.5" y="8" width="5.5" height="8" rx="1.2"/><rect x="9.25" y="8" width="5.5" height="8" rx="1.2"/><rect x="16" y="8" width="5.5" height="8" rx="1.2"/>',
  halve: '<path d="M3 7h18"/><path d="M12 7v10"/><path d="M12 17h9"/><circle cx="16.5" cy="17" r="1.6"/>',
  pointers: '<rect x="3" y="5" width="18" height="6" rx="1.2"/><path d="M6 20v-6M18 20v-6"/><path d="m4 16 2-2 2 2M16 16l2-2 2 2"/>',
};

export const icon = (name, className = 'icon') =>
  `<svg class="${className}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
