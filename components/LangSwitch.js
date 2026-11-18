'use client';
import { usePathname } from 'next/navigation';
import { dict, isLocale } from '../lib/i18n.js';

/**
 * Opens the same page in the other language (the lesson, not the home page).
 * A plain link on purpose: the header, footer and <html lang> live in the root
 * layout, which a client-side navigation would keep in the old language.
 */
export default function LangSwitch({ lang }) {
  const pathname = usePathname() ?? '/';
  const other = lang === 'bn' ? 'en' : 'bn';
  const parts = pathname.split('/');
  const href = isLocale(parts[1]) ? ['', other, ...parts.slice(2)].join('/') : `/${other}`;
  return (
    <a className="lang-switch" href={href} hrefLang={other} lang={other} aria-label={dict(lang).switchLang}>
      {dict(lang).otherLang}
    </a>
  );
}
