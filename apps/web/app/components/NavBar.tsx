import Link from 'next/link';

export default function NavBar() {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="brand logo" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }} aria-label="FLY 'N' HOT Home">
          <img src="/brand-lockup.svg" alt="FLY 'N' HOT" width={180} height={40} />
        </Link>
        <nav className="nav">
          <Link href="/">Home</Link>
          <Link href="/pilot/login">Pilot Login</Link>
          <Link href="/pilot/register">Pilot Register</Link>
        </nav>
      </div>
    </header>
  );
}


