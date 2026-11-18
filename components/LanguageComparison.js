'use client';
import { useRef, useState } from 'react';

/** The same idea in several languages, as ARIA tabs (arrows, Home, End). */
export default function LanguageComparison({ examples }) {
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
      <summary>Compare this in {examples.length} programming languages</summary>
      <section className="language-panel" aria-label="Language comparison">
        <div className="language-panel-header">
          <h2 id="language-comparison">Language comparison</h2>
          <p>Same core idea, different syntax, runtime, and memory model.</p>
        </div>
        <div className="language-tabs" role="tablist" aria-label="Programming languages" onKeyDown={onKeyDown}>
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
            <div><dt>Runtime</dt><dd>{example.runtime}</dd></div>
            <div><dt>Memory note</dt><dd>{example.memoryNote}</dd></div>
            <div><dt>Source</dt><dd><a href={example.sourceUrl} target="_blank" rel="noreferrer">{example.sourceName}</a></dd></div>
          </dl>
        </div>
      </section>
    </details>
  );
}
