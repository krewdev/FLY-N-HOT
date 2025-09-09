import NotifySignup from '../components/NotifySignup';

export default function NotifyPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const pilotId = typeof searchParams.pilotId === 'string' ? searchParams.pilotId : undefined;
  const festivalId = typeof searchParams.festivalId === 'string' ? searchParams.festivalId : undefined;
  const pilotName = typeof searchParams.pilotName === 'string' ? searchParams.pilotName : undefined;
  const festivalName = typeof searchParams.festivalName === 'string' ? searchParams.festivalName : undefined;

  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="eyebrow">🎈 Fiahab Notifications</div>
          <h1 className="hero-title">Get Notified</h1>
          <p className="hero-sub">Sign up to receive updates from pilots and festivals you care about.</p>
        </div>
      </section>
      <div className="container section">
        <div className="panel pad">
          <NotifySignup
            preselectedPilotId={pilotId}
            preselectedPilotName={pilotName}
            preselectedFestivalId={festivalId}
            preselectedFestivalName={festivalName}
          />
        </div>
      </div>
    </main>
  );
}

