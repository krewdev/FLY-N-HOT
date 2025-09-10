import NotifySignup from './components/NotifySignup';
import CustomerReviews from './components/CustomerReviews';
import Image from 'next/image';

// Flights fetching removed from homepage per design request

export default async function HomePage() {
  const hero = process.env.NEXT_PUBLIC_HERO_IMAGE ?? '/hero.jpg';

  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="eyebrow">🎈 Fiahab • Fly higher</div>
          <h1 className="hero-title">Fiahab</h1>
          <p className="hero-sub">Book scenic hot‑air balloon flights with trusted local pilots. Reserve your seats and enjoy the view.</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
            <div className="panel hero-image" style={{ borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
              <Image
                src={hero}
                alt="Fiahab hot air balloon"
                width={1600}
                height={800}
                priority
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
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


