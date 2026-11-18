import { headers } from 'next/headers';
import { SignIn } from '@clerk/nextjs';

export const metadata = { title: 'Sign in | Simplified DSA' };

const TEXT = {
  en: { title: 'Sign in to keep learning', lead: 'Simplified DSA is free. An account keeps your progress and helps us make the lessons better.' },
  bn: { title: 'শেখা চালিয়ে যেতে সাইন ইন করো', lead: 'Simplified DSA বিনামূল্যে। অ্যাকাউন্ট তোমার অগ্রগতি মনে রাখে আর পাঠগুলো আরও ভালো করতে সাহায্য করে।' },
};

export default async function Page() {
  const t = TEXT[(await headers()).get('x-locale')] ?? TEXT.en;
  return (
    <main className="auth-page">
      <div className="auth-intro">
        <h1>{t.title}</h1>
        <p>{t.lead}</p>
      </div>
      <SignIn />
    </main>
  );
}
