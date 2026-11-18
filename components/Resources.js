import { dict } from '../lib/i18n.js';

/**
 * "Go deeper": hand-picked outside resources from the database, grouped by
 * goal (learn it, interview prep, contests). Links open in a new tab; our own
 * one-line note says why each is worth the click.
 */
export default function Resources({ lang, resources, id = 'go-deeper', title }) {
  const t = dict(lang);
  const tracks = ['basics', 'interview', 'cp'].map((track) => [track, resources.filter((r) => r.track === track)]).filter(([, list]) => list.length);
  return (
    <section className="resources" aria-labelledby={id}>
      <h2 id={id}>{title ?? t.goDeeper}</h2>
      <p className="resources-lead">{t.goDeeperLead}</p>
      {tracks.map(([track, list]) => (
        <div key={track} className="resources-track">
          <h3>{t.tracks[track]}</h3>
          <ul className="resources-list">
            {list.map((r) => (
              <li key={r.url}>
                <a className="resource-card" href={r.url} target="_blank" rel="noreferrer">
                  <span className="resource-tags">
                    <span className={`resource-lang is-${r.lang}`}>{r.lang === 'bn' ? t.inBangla : t.inEnglish}</span>
                    <span>{t.kinds[r.kind]}</span>
                    {!r.free && <span>{t.paid}</span>}
                  </span>
                  <strong lang={r.lang}>{r.title}</strong>
                  <span className="resource-author">{r.author}</span>
                  <span className="resource-note">{lang === 'bn' ? r.note_bn : r.note_en}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
