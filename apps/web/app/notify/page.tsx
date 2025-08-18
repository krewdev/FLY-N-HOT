import NotifySignup from '../components/NotifySignup';

export const metadata = {
	title: 'Get Notified - FIAHAB',
	description: 'Subscribe to get notified about flights for a specific pilot or festival',
};

export default function NotifyPage({ searchParams }: { searchParams: { pilot?: string; festival?: string } }) {
	const initialSelectionType = searchParams.pilot ? 'pilot' : (searchParams.festival ? 'festival' as const : undefined);
	const initialSelectionId = searchParams.pilot ?? searchParams.festival;

	return (
		<main>
			<section className="hero" style={{ padding: '60px 0' }}>
				<div className="container">
					<div className="eyebrow">🎫 QR-linked signup</div>
					<h1 className="hero-title">FIAHAB Notifications</h1>
					<p className="hero-sub">Subscribe to alerts for a specific pilot or festival. If you scanned a QR, your selection is prefilled.</p>
				</div>
			</section>
			<div className="container section">
				<div className="panel pad" style={{ maxWidth: 840, margin: '0 auto' }}>
					<NotifySignup initialSelectionType={initialSelectionType} initialSelectionId={initialSelectionId} />
				</div>
			</div>
		</main>
	);
}

