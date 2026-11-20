'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { dict } from '../lib/i18n.js';
import Icon from './Icon.js';

/**
 * Site search on Ctrl/Cmd+K (or the header button): lessons, simulators and
 * quizzes in the page language. Items come from the server as plain data;
 * `text` holds both languages' titles, so "stack" also finds "স্ট্যাক".
 */
export default function SearchDialog({ lang, items }) {
  const t = dict(lang).search;
  const dialog = useRef(null);
  const input = useRef(null);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const q = query.trim().toLowerCase();
  const results = (q ? items.filter((item) => item.text.includes(q)) : items.filter((item) => item.kind === 'lesson')).slice(0, 8);

  const open = () => {
    setQuery('');
    setActive(0);
    dialog.current?.showModal();
    input.current?.focus();
  };
  useEffect(() => {
    const onKey = (event) => {
      if (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        open();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const go = (item) => {
    dialog.current?.close();
    router.push(item.href);
  };
  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (i + (event.key === 'ArrowDown' ? 1 : results.length - 1)) % Math.max(results.length, 1));
    } else if (event.key === 'Enter' && results[active]) {
      event.preventDefault();
      go(results[active]);
    }
  };

  return (
    <>
      <button type="button" className="search-button" onClick={open} aria-label={t.open}>
        <Icon name="search" />
        <span className="search-label">{t.open}</span>
        <kbd aria-hidden="true">⌘K</kbd>
      </button>
      {/* Clicking the backdrop (the dialog element itself) closes it. */}
      <dialog ref={dialog} className="search-dialog" aria-label={t.open} onClick={(e) => e.target === dialog.current && dialog.current.close()}>
        <div className="search-box">
          <Icon name="search" />
          <input
            ref={input}
            type="search"
            value={query}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `search-${active}` : undefined}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
          <button type="button" className="icon-button" onClick={() => dialog.current.close()} aria-label={t.close}>
            <kbd>Esc</kbd>
          </button>
        </div>
        <ul id="search-results" role="listbox" className="search-results">
          {results.map((item, i) => (
            <li key={item.href} id={`search-${i}`} role="option" aria-selected={i === active} className={i === active ? 'is-active' : ''} onMouseEnter={() => setActive(i)} onClick={() => go(item)}>
              <span className="search-kind">{t.kinds[item.kind]}</span>
              <strong>{item.title}</strong>
              <span className="search-sub">{item.sub}</span>
            </li>
          ))}
          {!results.length ? <li className="search-none">{t.none}</li> : null}
        </ul>
      </dialog>
    </>
  );
}
