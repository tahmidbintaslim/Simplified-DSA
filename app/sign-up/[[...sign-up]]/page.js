import { SignUp } from '@clerk/nextjs';

export const metadata = { title: 'Create your account | Simplified DSA' };

export default function SignUpPage() {
  return (
    <main className="auth-page">
      <div className="auth-intro">
        <h1>Create your free account</h1>
        <p>Every lesson, every demo, free. Your account keeps your progress.</p>
      </div>
      <SignUp />
    </main>
  );
}
