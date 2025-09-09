import NotifySignup from './components/NotifySignup';
import CustomerReviews from './components/CustomerReviews';

async function fetchFlights() {
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
    const url = base.replace(/\/$/, '') + '/flights';
    
    const res = await fetch(url, { 
      next: { revalidate: 10 },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch flights: ${res.status} ${res.statusText}`);
    }
    
    return res.json() as Promise<any[]>;
  } catch (error) {
    // During build time or when API is unavailable, return empty array
    console.warn('API not available during build:', error);
    return [];
  }
}

export default async function HomePage() {
  let flights: any[] = [];
  let error: string | null = null;
  
  try {
    flights = await fetchFlights();
  } catch (err) {
    console.error('Failed to fetch flights:', err);
    error = err instanceof Error ? err.message : 'Failed to load flights';
  }

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
            <a className="btn btn-primary" href="#flights">Explore Flights</a>
            <a className="btn btn-ghost" href="/pilot/login">Are you a pilot?</a>
          </div>
        </div>
      </section>
      <div className="container section">
        <div className="panel pad" style={{ marginBottom: 18 }}>
          <NotifySignup />
        </div>
        <h2 id="flights" style={{ marginTop: 0 }}>Available Flights</h2>
      {error ? (
        <div className="panel pad" style={{ backgroundColor: '#fee', border: '1px solid #fcc', marginBottom: 18 }}>
          <p style={{ color: '#c33', margin: 0 }}>⚠️ Error loading flights: {error}</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.9em', color: '#666' }}>
            Please check that the API server is running on the expected URL.
          </p>
        </div>
      ) : null}
      {flights.length === 0 && !error ? (
        <div className="panel pad" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', marginBottom: 18 }}>
          <p style={{ margin: 0, color: '#666' }}>No flights available yet.</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.9em', color: '#999' }}>
            Check back soon for new flight opportunities!
          </p>
        </div>
      ) : (
        <ul className="grid" style={{ listStyle: 'none', padding: 0 }}>
          {flights.map((f) => (
            <li key={f.flightId} className="card">
              <h4>Price per seat: ${f.pricePerSeat}</h4>
              <div className="muted">Meetup: {new Date(f.meetupTimestamp).toLocaleString()}</div>
              <div className="row" style={{ marginTop: 6 }}>
                <span className="muted">Seats:</span>
                <span>{f.seatsReserved}/{f.totalSeats}</span>
              </div>
              <div className="row" style={{ marginTop: 4 }}>
                <span className="muted">Status:</span>
                <span>{f.status}</span>
              </div>
              {f.description ? <div className="muted" style={{ marginTop: 8 }}>{f.description}</div> : null}
              <div className="sp" />
              <a className="link-btn" href={`/flights/${f.flightId}`}>View & Reserve →</a>
            </li>
          ))}
        </ul>
                )}
      </div>

      {/* Customer Reviews Slideshow */}
      <CustomerReviews />
    </main>
  );
}


