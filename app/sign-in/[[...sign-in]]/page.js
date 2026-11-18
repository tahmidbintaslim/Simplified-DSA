import { SignIn } from '@clerk/nextjs';

export const metadata = { title: 'Sign in | Simplified DSA' };

export default function SignInPage() {
  return (
    <main className="auth-page">
      <div className="auth-intro">
        <h1>Sign in to keep learning</h1>
        <p>Simplified DSA is free. An account keeps your progress and helps us make the lessons better.</p>
      </div>
      <SignIn />
    </main>
  );
}
