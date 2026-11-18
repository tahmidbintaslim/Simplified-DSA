import { Suspense } from 'react';
import { headers } from 'next/headers';
import { ClerkProvider } from '@clerk/nextjs';
import { bnIN } from '@clerk/localizations';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@fontsource-variable/anek-bangla';
import '../src/style.css';
import SiteHeader from '../components/SiteHeader.js';
import SiteFooter from '../components/SiteFooter.js';
import Analytics from '../components/Analytics.js';
import { themeScript } from '../components/ThemeToggle.js';
import { dict, isLocale, DEFAULT_LOCALE } from '../lib/i18n.js';

export const metadata = {
  metadataBase: new URL('https://dsa.tahmid.space'),
  title: 'Simplified DSA | Data Structures and Algorithms',
  description: 'Free lessons for complete beginners: plain words, a small example traced by hand, and a demo you drive yourself, one step at a time.',
  icons: { icon: '/icon.png' },
  openGraph: { images: ['/og.png'] },
};

export default async function RootLayout({ children }) {
  // proxy.js puts the page language on every request.
  const value = (await headers()).get('x-locale');
  const lang = isLocale(value) ? value : DEFAULT_LOCALE;
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ClerkProvider localization={lang === 'bn' ? bnIN : undefined}>
          <a className="skip-link" href="#main">{dict(lang).skip}</a>
          <SiteHeader lang={lang} />
          {children}
          <SiteFooter lang={lang} />
          <Suspense>
            <Analytics lang={lang} />
          </Suspense>
        </ClerkProvider>
      </body>
    </html>
  );
}
