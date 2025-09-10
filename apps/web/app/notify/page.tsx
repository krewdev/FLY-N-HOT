import NotifySignup from '../components/NotifySignup';

export const metadata = {
	title: 'Get Notified - Fiahab',
	description: 'Subscribe to get notified about flights for a specific pilot or festival',
};

export default function NotifyPage() {
	return (
		<main>
			<section className="hero" style={{ padding: '60px 0' }}>
				<div className="container">
					<div className="eyebrow">🎫 QR-linked signup</div>
					<h1 className="hero-title">Fiahab Notifications</h1>
					<p className="hero-sub">Subscribe to alerts for a specific pilot or festival. If you scanned a QR, your selection is prefilled.</p>
				</div>
			</section>
			<div className="container section">
				<div className="panel pad" style={{ maxWidth: 840, margin: '0 auto' }}>
					<NotifySignup />
				</div>
			</div>
		</main>
	);
}

