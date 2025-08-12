import NotifySignup from './components/NotifySignup';
import Image from 'next/image';

async function fetchFlights() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  const url = base.replace(/\/$/, '') + '/flights';
  const res = await fetch(url, { next: { revalidate: 10 } });
  if (!res.ok) {
    throw new Error('Failed to fetch flights');
  }
  return res.json() as Promise<any[]>;
}

export default async function HomePage() {
  let flights: any[] = [];
  try {
    flights = await fetchFlights();
  } catch {}

  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="eyebrow">Aerial adventures</div>
          <h1 className="hero-title">FLY 'N' HOT</h1>
          <p className="hero-sub">Book scenic hot‑air balloon flights with trusted local pilots. Reserve your seats and enjoy the view.</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
            <div className="panel" style={{ borderRadius: 16, overflow: 'hidden' }}>
              <Image
                src="https://images.unsplash.com/photo-1529687337930-97e505103a5b?q=80&w=1600&auto=format&fit=crop"
                alt="Hot air balloons at sunrise"
                width={960}
                height={480}
                priority
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
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
      {flights.length === 0 ? (
        <p>No flights yet.</p>
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
    </main>
  );
}


