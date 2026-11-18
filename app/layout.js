import { Suspense } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '../src/style.css';
import SiteHeader from '../components/SiteHeader.js';
import SiteFooter from '../components/SiteFooter.js';
import Analytics from '../components/Analytics.js';
import { themeScript } from '../components/ThemeToggle.js';

export const metadata = {
  metadataBase: new URL('https://dsa.tahmid.space'),
  title: 'Simplified DSA | Data Structures and Algorithms',
  description: 'Free lessons for complete beginners: plain words, a small example traced by hand, and a demo you drive yourself, one step at a time.',
  icons: { icon: '/icon.png' },
  openGraph: { images: ['/og.png'] },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ClerkProvider>
          <a className="skip-link" href="#main">Skip to content</a>
          <Suspense>
            <SiteHeader />
          </Suspense>
          {children}
          <SiteFooter />
          <Suspense>
            <Analytics />
          </Suspense>
        </ClerkProvider>
      </body>
    </html>
  );
}
