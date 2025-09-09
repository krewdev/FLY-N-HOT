import NotifySignup from './components/NotifySignup';
import CustomerReviews from './components/CustomerReviews';

// Flights fetching removed from homepage per design request

export default async function HomePage() {

  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="eyebrow">🎈 Fiahab • Fly higher</div>
          <h1 className="hero-title">Fiahab</h1>
          <p className="hero-sub">Book scenic hot‑air balloon flights with trusted local pilots. Reserve your seats and enjoy the view.</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
            <div className="panel" style={{ borderRadius: 16, overflow: 'hidden' }}>
              <svg viewBox="0 0 960 480" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block', height: 'auto' }}>
                <defs>
                  <linearGradient id="sky" x1="0" x2="1">
                    <stop offset="0%" stopColor="#171a2b" />
                    <stop offset="100%" stopColor="#101528" />
                  </linearGradient>
                  <radialGradient id="glow" cx="50%" cy="0%" r="80%">
                    <stop offset="0%" stopColor="rgba(167,139,250,0.35)" />
                    <stop offset="100%" stopColor="rgba(167,139,250,0)" />
                  </radialGradient>
                  <linearGradient id="balloon" x1="0" x2="1">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <rect width="960" height="480" fill="url(#sky)" />
                <circle cx="720" cy="60" r="220" fill="url(#glow)" />
                <g transform="translate(320,60)">
                  <ellipse cx="160" cy="140" rx="140" ry="170" fill="url(#balloon)" />
                  <path d="M160,310 C120,260 200,260 160,310 Z" fill="#0ea5e9" opacity="0.08" />
                  <rect x="145" y="322" width="30" height="34" rx="4" fill="#0f172a" stroke="#a78bfa" strokeOpacity="0.4" />
                  <line x1="135" y1="300" x2="145" y2="322" stroke="#a78bfa" strokeOpacity="0.7" />
                  <line x1="185" y1="300" x2="175" y2="322" stroke="#10b981" strokeOpacity="0.7" />
                </g>
                <g opacity="0.3">
                  <circle cx="140" cy="90" r="2" fill="#a78bfa" />
                  <circle cx="200" cy="140" r="1.5" fill="#10b981" />
                  <circle cx="80" cy="200" r="1.2" fill="#a78bfa" />
                </g>
              </svg>
            </div>
          </div>
          <div className="hero-cta">
            <a className="btn btn-primary" href="/flights/search">Explore Flights</a>
            <a className="btn btn-ghost" href="/pilot/login">Are you a pilot?</a>
          </div>
        </div>
      </section>
      <div className="container section">
        <div className="panel pad" style={{ marginBottom: 18 }}>
          <NotifySignup />
        </div>
      </div>

      {/* Customer Reviews Slideshow */}
      <CustomerReviews />
    </main>
  );
}


