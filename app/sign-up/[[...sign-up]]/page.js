import { headers } from 'next/headers';
import { SignUp } from '@clerk/nextjs';

export const metadata = { title: 'Create your account | Simplified DSA' };

const TEXT = {
  en: { title: 'Create your free account', lead: 'Every lesson, every demo, free. Your account keeps your progress.' },
  bn: { title: 'তোমার ফ্রি অ্যাকাউন্ট খোলো', lead: 'সব পাঠ, সব ডেমো, বিনামূল্যে। অ্যাকাউন্ট তোমার অগ্রগতি মনে রাখে।' },
};

export default async function Page() {
  const t = TEXT[(await headers()).get('x-locale')] ?? TEXT.en;
  return (
    <main className="auth-page">
      <div className="auth-intro">
        <h1>{t.title}</h1>
        <p>{t.lead}</p>
      </div>
      <SignUp />
    </main>
  );
}
