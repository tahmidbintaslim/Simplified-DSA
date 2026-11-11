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
};

export const icon = (name, className = 'icon') =>
  `<svg class="${className}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
