'use client';
import { useEffect, useRef, useState } from 'react';
import { demos } from '../src/demos/index.js';
import { missions } from '../src/demos/missions.js';
import { dict } from '../lib/i18n.js';
import { track } from './Analytics.js';
import { loadMissions, saveMissions } from '../app/actions.js';
import Icon from './Icon.js';

const KEY = (id) => `simplified-dsa:missions:${id}`;
const load = (id) => {
  try {
    return JSON.parse(localStorage.getItem(KEY(id)) ?? '{}');
  } catch {
    return {};
  }
};

/**
 * One demo, full width, with its missions beside it. The demo reports what the
 * learner did through `demo-op` events; each mission counts the ones it needs.
 * Progress shows at once from this browser, then merges with the account's
 * copy (the higher count wins) and is saved back as it changes.
 */
export default function SimulatorView({ lang, demoId }) {
  const t = dict(lang).simulators;
  const list = missions[demoId] ?? [];
  const stage = useRef(null);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const el = stage.current;
    if (el.dataset.mounted) return;
    el.dataset.mounted = '1';
    demos[demoId].mount(el, { lang });
    const local = load(demoId);
    setCounts(local);
    loadMissions(demoId)
      .then((saved) => {
        if (!saved) return;
        setCounts((now) => {
          const merged = { ...now };
          for (const [id, n] of Object.entries(saved)) merged[id] = Math.max(merged[id] ?? 0, n);
          saveMissions(demoId, merged).catch(() => {});
          return merged;
        });
      })
      .catch(() => {});
    const onOp = (event) => {
      setCounts((before) => {
        const after = { ...before };
        for (const m of list) if ((after[m.id] ?? 0) < (m.times ?? 1) && m.done(event.detail)) after[m.id] = (after[m.id] ?? 0) + 1;
        if (list.some((m) => after[m.id] !== before[m.id])) saveMissions(demoId, after).catch(() => {});
        try {
          localStorage.setItem(KEY(demoId), JSON.stringify(after));
        } catch {
          // Not remembered; the page still counts.
        }
        for (const m of list) if ((after[m.id] ?? 0) >= (m.times ?? 1) && (before[m.id] ?? 0) < (m.times ?? 1)) track('mission_done', { demo: demoId, mission: m.id });
        return after;
      });
    };
    el.addEventListener('demo-op', onOp);
    return () => el.removeEventListener('demo-op', onOp);
  }, [demoId, lang, list]);

  const doneCount = list.filter((m) => (counts[m.id] ?? 0) >= (m.times ?? 1)).length;
  return (
    <div className="sim-layout">
      <div className="demo-panel sim-stage">
        <div className="demo" ref={stage} lang={lang} />
      </div>
      <aside className="sim-missions" aria-labelledby="missions-title">
        <h2 id="missions-title">
          {t.missions} {list.length ? <span className="sim-count">{t.missionsCount(doneCount, list.length)}</span> : null}
        </h2>
        {list.length ? (
          <ol className="mission-list">
            {list.map((m) => {
              const n = counts[m.id] ?? 0;
              const need = m.times ?? 1;
              const done = n >= need;
              return (
                <li key={m.id} className={`mission ${done ? 'is-done' : ''}`}>
                  <span className="mission-check" aria-hidden="true">{done ? <Icon name="check" /> : null}</span>
                  <span>
                    <strong>{m[lang] ?? m.en}</strong>
                    <small>{done ? m.hint[lang] ?? m.hint.en : need > 1 ? t.progressTimes(n, need) : m.hint[lang] ?? m.hint.en}</small>
                  </span>
                  <span className="sr-only">{done ? dict(lang).completedButton : ''}</span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="sim-free">{t.noMissions}</p>
        )}
        {list.length > 0 && doneCount === list.length ? <p className="sim-all-done" role="status">{t.allDone}</p> : null}
      </aside>
    </div>
  );
}
