import Link from 'next/link';
import Image from 'next/image';

export default function NavBar() {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="brand logo" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }} aria-label="Fiahab Home">
          <span style={{ fontSize: '24px', marginRight: '8px' }}>🎈</span>
          <span style={{ background: 'linear-gradient(135deg, #a78bfa, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 'bold' }}>Fiahab</span>
        </Link>
        <nav className="nav">
          <Link href="/">Home</Link>
          <Link href="/notify">Get Notified</Link>
          <Link href="/pilot/login">Pilot Login</Link>
          <Link href="/pilot/register">Pilot Register</Link>
        </nav>
      </div>
    </header>
  );
}


