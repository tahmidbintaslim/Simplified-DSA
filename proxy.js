import { clerkMiddleware } from '@clerk/nextjs/server';

// Clerk reads the session on every request; each lesson page checks it
// (see app/[section]/[lesson]/page.js). /mcp stays public.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next internals and static files, unless found in search params.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
