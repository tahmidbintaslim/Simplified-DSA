// Self-hosted, OFL-licensed typefaces (nothing is fetched from a font CDN).
import '@fontsource-variable/literata';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/jetbrains-mono';
import './style.css';
import { App } from './core/App.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = new App('#app');
  app.init();
});
