import { NextResponse } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';
import { curriculum } from './src/content/curriculum.js';
import { DEFAULT_LOCALE, isLocale } from './lib/i18n.js';

const SECTIONS = new Set(curriculum.map((section) => section.id));
const COOKIE = 'lang';

// The learner's language: their last choice, else the browser's, else English.
const preferred = (req) => {
  const saved = req.cookies.get(COOKIE)?.value;
  if (isLocale(saved)) return saved;
  return /^bn\b/i.test(req.headers.get('accept-language') ?? '') ? 'bn' : DEFAULT_LOCALE;
};

/**
 * Clerk reads the session on every request; each lesson page checks it
 * (app/[lang]/[section]/[lesson]/page.js). /mcp stays public.
 * Language: "/" goes to /en or /bn, old lesson links (/algorithms/big-o) move
 * under /en, and the page language travels to the root layout as x-locale.
 */
export default clerkMiddleware((auth, req) => {
  const { pathname } = req.nextUrl;
  const first = pathname.split('/')[1];

  if (pathname === '/') return NextResponse.redirect(new URL(`/${preferred(req)}`, req.url));
  if (SECTIONS.has(first)) return NextResponse.redirect(new URL(`/en${pathname}`, req.url), 308);

  const lang = isLocale(first) ? first : preferred(req);
  const headers = new Headers(req.headers);
  headers.set('x-locale', lang);
  const res = NextResponse.next({ request: { headers } });
  if (isLocale(first) && req.cookies.get(COOKIE)?.value !== first) {
    res.cookies.set(COOKIE, first, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  }
  return res;
});

export const config = {
  matcher: [
    // Skip Next internals and static files, unless found in search params.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|pdf)).*)',
    '/(api|trpc)(.*)',
  ],
};
