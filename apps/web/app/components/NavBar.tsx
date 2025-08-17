import Link from 'next/link';
import Image from 'next/image';

export default function NavBar() {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="brand logo" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }} aria-label="fiahab.com Home">
          <span style={{ fontSize: '24px', marginRight: '8px' }}>🎈</span>
          <span style={{ background: 'linear-gradient(135deg, #ff4757, #4ecdc4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 'bold' }}>fiahab.com</span>
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


