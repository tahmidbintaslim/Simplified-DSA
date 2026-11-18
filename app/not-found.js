import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main" className="lesson-main">
      <article className="lesson-content">
        <h1>Page not found</h1>
        <p>There is no page here. Start from the course map.</p>
        <p className="home-actions">
          <Link className="demo-button is-primary" href="/">See the course map</Link>
        </p>
      </article>
    </main>
  );
}
