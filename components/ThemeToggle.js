'use client';
import { useEffect, useState } from 'react';
import Icon from './Icon.js';

const KEY = 'simplified-dsa:theme';
const systemDark = () => matchMedia('(prefers-color-scheme: dark)').matches;

/** Follows the system until the learner picks a theme (kept in this browser). */
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const picked = document.documentElement.dataset.theme;
    setDark(picked ? picked === 'dark' : systemDark());
  }, []);
  const toggle = () => {
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Blocked storage: the choice lasts until reload.
    }
    setDark(!dark);
  };
  return (
    <button id="theme-toggle" className="icon-button" type="button" onClick={toggle} aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}>
      <Icon name={dark ? 'sun' : 'moon'} />
    </button>
  );
}

// Runs before paint so a stored theme never flashes the wrong colours.
export const themeScript = `try{var t=localStorage.getItem('${KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;
