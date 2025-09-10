'use client';

import { useEffect, useState } from 'react';

interface StripeAccountStatus {
	connected: boolean;
	status: string;
	chargesEnabled: boolean;
	payoutsEnabled: boolean;
	detailsSubmitted: boolean;
}

export default function PilotOnboardingPage() {
	const [stripeStatus, setStripeStatus] = useState<StripeAccountStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function load() {
			try {
				const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
				const pilotIdDev = localStorage.getItem('pilotId_dev');
				const qs = pilotIdDev ? `?pilotId=${encodeURIComponent(pilotIdDev)}` : '';
				const res = await fetch(base.replace(/\/$/, '') + `/pilots/stripe-status${qs}`, {
					headers: {
						'Authorization': `Bearer ${localStorage.getItem('pilotToken') || ''}`
					}
				});
				if (res.ok) setStripeStatus(await res.json());
			} catch (e) {
				setError('Failed to load onboarding status');
			} finally {
				setLoading(false);
			}
		}
		load();
	}, []);

	const connectStripe = async () => {
		try {
			const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
			const pilotIdDev = localStorage.getItem('pilotId_dev');
			const qs = pilotIdDev ? `?pilotId=${encodeURIComponent(pilotIdDev)}` : '';
			const response = await fetch(base.replace(/\/$/, '') + `/pilots/connect-stripe${qs}`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('pilotToken') || ''}`
				}
			});
			if (!response.ok) throw new Error('Failed to connect Stripe');
			const data = await response.json();
			window.location.href = data.accountLink;
		} catch (e) {
			setError('Failed to connect Stripe');
		}
	};

	return (
		<main>
			<div className="container">
				<h1>Pilot Onboarding</h1>
				<p className="muted">Follow these steps to start accepting bookings.</p>

				{error && (
					<div className="panel pad" style={{ backgroundColor: '#fee', border: '1px solid #fcc' }}>
						<p style={{ color: '#c33', margin: 0 }}>Error: {error}</p>
					</div>
				)}

				<div className="grid" style={{ gap: 16 }}>
					<div className="card">
						<h3>1) Get Approved by Admin</h3>
						<p className="muted">Submit your pilot registration. An admin will review and approve your profile.</p>
						<a className="btn btn-ghost" href="/pilot/register">Start Registration</a>
					</div>

					<div className="card">
						<h3>2) Connect Stripe</h3>
						<p className="muted">Connect your Stripe Express account to receive payouts. Status: {stripeStatus ? stripeStatus.status : '...'}</p>
						<button onClick={connectStripe} className="btn btn-primary" disabled={loading}>
							{stripeStatus?.connected ? 'Complete Stripe Setup' : 'Connect Stripe'}
						</button>
					</div>

					<div className="card">
						<h3>3) Create Your First Flight</h3>
						<p className="muted">Once approved and connected, create a flight to generate a Stripe payment link.</p>
						<a className="btn btn-ghost" href="/pilot/flights/create">Create Flight</a>
					</div>

					<div className="card">
						<h3>4) Notify Passengers</h3>
						<p className="muted">When you have openings, use your dashboard to notify subscribers via SMS and email.</p>
						<a className="btn btn-ghost" href="/pilot/dashboard">Open Dashboard</a>
					</div>
				</div>
			</div>
		</main>
	);
}


