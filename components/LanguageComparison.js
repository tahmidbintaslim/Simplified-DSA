'use client';
import { useRef, useState } from 'react';
import { dict } from '../lib/i18n.js';

/** The same idea in several languages, as ARIA tabs (arrows, Home, End). */
export default function LanguageComparison({ lang, examples }) {
  const t = dict(lang).languages;
  const [active, setActive] = useState(examples[0].id);
  const tabs = useRef({});
  const example = examples.find((e) => e.id === active) ?? examples[0];

  const onKeyDown = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const i = examples.findIndex((e) => e.id === active);
    const n = examples.length;
    const to = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[event.key];
    if (to === undefined) return;
    event.preventDefault();
    setActive(examples[to].id);
    tabs.current[examples[to].id]?.focus();
  };

  return (
    <details className="language-details">
      <summary>{t.summary(examples.length)}</summary>
      <section className="language-panel" aria-label={t.title}>
        <div className="language-panel-header">
          <h2 id="language-comparison">{t.title}</h2>
          <p>{t.lead}</p>
        </div>
        <div className="language-tabs" role="tablist" aria-label={t.tabs} onKeyDown={onKeyDown}>
          {examples.map((e) => (
            <button
              key={e.id}
              ref={(el) => (tabs.current[e.id] = el)}
              id={`language-tab-${e.id}`}
              className={`language-tab ${e.id === example.id ? 'is-active' : ''}`}
              type="button"
              role="tab"
              aria-selected={e.id === example.id}
              aria-controls="language-tabpanel"
              tabIndex={e.id === example.id ? 0 : -1}
              onClick={() => setActive(e.id)}
            >
              {e.language}
            </button>
          ))}
        </div>
        <div id="language-tabpanel" className="language-example" role="tabpanel" aria-labelledby={`language-tab-${example.id}`} tabIndex={0}>
          <div className="language-meta">
            <strong>{example.language}</strong>
            <span>{example.dataStructure}</span>
          </div>
          <pre><code>{example.code}</code></pre>
          <dl>
            <div><dt>{t.runtime}</dt><dd>{example.runtime}</dd></div>
            <div><dt>{t.memory}</dt><dd>{example.memoryNote}</dd></div>
            <div><dt>{t.source}</dt><dd><a href={example.sourceUrl} target="_blank" rel="noreferrer">{example.sourceName}</a></dd></div>
          </dl>
        </div>
      </section>
    </details>
  );
}
