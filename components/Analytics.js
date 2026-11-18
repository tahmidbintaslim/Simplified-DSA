'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import posthog from 'posthog-js';

/**
 * Product analytics with PostHog, only after the learner agrees (kept in this
 * browser). Without NEXT_PUBLIC_POSTHOG_KEY nothing loads and track() is a no-op.
 * Signed-in learners are identified by their Clerk user id, never by email.
 */
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';
const CONSENT = 'simplified-dsa:analytics';
let ready = false;

export function track(event, properties) {
  if (ready) posthog.capture(event, properties);
}

const readConsent = () => {
  try {
    return localStorage.getItem(CONSENT);
  } catch {
    return null;
  }
};

export default function Analytics() {
  const [consent, setConsent] = useState('unknown');
  const { user } = useUser();
  const pathname = usePathname();

  useEffect(() => setConsent(readConsent() ?? 'ask'), []);

  useEffect(() => {
    if (!KEY || consent !== 'yes' || ready) return;
    posthog.init(KEY, { api_host: HOST, capture_pageview: false, persistence: 'localStorage+cookie', person_profiles: 'identified_only' });
    ready = true;
  }, [consent]);

  useEffect(() => {
    if (ready && user) posthog.identify(user.id);
  }, [consent, user]);

  useEffect(() => {
    if (ready) posthog.capture('$pageview');
  }, [consent, pathname]);

  const choose = (value) => {
    try {
      localStorage.setItem(CONSENT, value);
    } catch {
      // Not remembered; asked again next visit.
    }
    setConsent(value);
    if (value === 'no' && ready) posthog.opt_out_capturing();
  };

  if (!KEY || consent !== 'ask') return null;
  return (
    <div className="consent-banner" role="region" aria-label="Analytics consent">
      <p>
        We would like to measure how lessons are used (pages, demo use, quiz answers) to improve them. <a href="/privacy.html">Privacy</a>
      </p>
      <div className="consent-actions">
        <button type="button" className="demo-button" onClick={() => choose('no')}>No thanks</button>
        <button type="button" className="demo-button is-primary" onClick={() => choose('yes')}>Allow</button>
      </div>
    </div>
  );
}
