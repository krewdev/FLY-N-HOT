"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

type Flight = {
  flightId: string;
  pricePerSeat: number;
  meetupTimestamp: string;
  seatsReserved: number;
  totalSeats: number;
  description?: string | null;
};

export default function FlightDetailPage() {
  const params = useParams();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState(1);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
        const url = base.replace(/\/$/, '') + `/flights/${params.flightId}`;
        const res = await fetch(url);
        if (res.ok) setFlight(await res.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.flightId]);

  async function reserve() {
    if (!flight) return;
    setStatus('Creating booking...');
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
      const url = base.replace(/\/$/, '') + `/bookings`;
      // For demo, create a passenger placeholder id from email
      const passengerId = crypto.randomUUID();
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId: flight.flightId, passengerId, numberOfSeats: seats })
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        // If Stripe payment link is available for this flight, redirect to it
        const flightRes = await fetch(base.replace(/\/$/, '') + `/flights/${flight.flightId}`);
        if (flightRes.ok) {
          const fresh = await flightRes.json();
          if (fresh.stripePaymentLinkId && fresh.stripePaymentLinkUrl) {
            window.location.href = fresh.stripePaymentLinkUrl;
            return;
          }
        }
        setStatus('Booking created. Complete payment via Stripe.');
      } else {
        setStatus(`Error: ${body?.error || res.status}`);
      }
    } catch (err: any) {
      setStatus(`Error: ${err?.message || 'network'}`);
    }
  }

  if (loading) return <main style={{ padding: 24 }}>Loading...</main>;
  if (!flight) return <main style={{ padding: 24 }}>Flight not found.</main>;

  const remaining = flight.totalSeats - flight.seatsReserved;

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1>Reserve Seats</h1>
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <div style={{ fontWeight: 600 }}>Price per seat: ${flight.pricePerSeat}</div>
        <div>Meetup: {new Date(flight.meetupTimestamp).toLocaleString()}</div>
        <div>Seats: {flight.seatsReserved}/{flight.totalSeats} (Remaining: {remaining})</div>
        {flight.description ? <div style={{ marginTop: 8 }}>{flight.description}</div> : null}
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        <label>
          Your email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 6 }} />
        </label>
        <label>
          Number of seats
          <input value={seats} onChange={(e) => setSeats(Number(e.target.value))} min={1} max={remaining} type="number" style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 6 }} />
        </label>
        <button disabled={remaining <= 0} onClick={reserve} style={{ padding: '10px 12px', borderRadius: 6, background: 'black', color: 'white' }}>Reserve & Pay</button>
      </div>
      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </main>
  );
}


