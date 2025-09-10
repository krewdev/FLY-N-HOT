'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Flight {
  flightId: string;
  launchLocation: any;
  meetupTimestamp: string;
  estimatedDurationMinutes: number;
  pricePerSeat: number;
  totalSeats: number;
  seatsReserved: number;
  description?: string;
  status: string;
  stripePaymentLinkId?: string;
  createdAt: string;
}

interface StripeAccountStatus {
  connected: boolean;
  status: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

export default function PilotDashboard() {
  return (
    <Suspense fallback={<div className="container"><div className="panel pad"><p>Loading...</p></div></div>}>
      <Dashboard />
    </Suspense>
  );
}

function Dashboard() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [stripeStatus, setStripeStatus] = useState<StripeAccountStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000').replace(/\/$/, '');
  const isDevBypass = (process.env.NEXT_PUBLIC_DEV_MODE === 'true');
  const devPilotId = (searchParams?.get('pilotId') || process.env.NEXT_PUBLIC_DEV_PILOT_ID) as string | null;

  useEffect(() => {
    loadPilotData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPilotData = async () => {
    try {
      // Dev bypass: if no token and dev mode, fetch using pilotId query param
      const token = typeof window !== 'undefined' ? localStorage.getItem('pilotToken') : null;
      const pilotIdForFetch = (token ? null : (isDevBypass ? devPilotId : null));

      const flightsUrl = pilotIdForFetch
        ? `${apiBase}/pilots/flights?pilotId=${encodeURIComponent(pilotIdForFetch)}`
        : `${apiBase}/pilots/flights`;

      const flightsResponse = await fetch(flightsUrl, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });

      if (flightsResponse.ok) {
        const flightsData = await flightsResponse.json();
        setFlights(flightsData);
      } else {
        throw new Error('Failed to load flights');
      }

      if (token) {
        const stripeResponse = await fetch(`${apiBase}/pilot/stripe-status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (stripeResponse.ok) {
          const stripeData = await stripeResponse.json();
          setStripeStatus(stripeData);
        }
      } else if (isDevBypass) {
        // Fake ACTIVE Stripe status in dev bypass so UI is usable
        setStripeStatus({
          connected: true,
          status: 'ACTIVE',
          chargesEnabled: true,
          payoutsEnabled: true,
          detailsSubmitted: true
        });
      }
    } catch (err) {
      setError('Failed to load pilot data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlight = () => {
    // Preserve dev pilotId param if present so the create page can use it
    const param = devPilotId && isDevBypass ? `?pilotId=${encodeURIComponent(devPilotId)}` : '';
    router.push('/pilot/flights/create' + param);
  };

  const handleNotifyPassengers = async (flightId: string) => {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
      const pilotIdDev = localStorage.getItem('pilotId_dev');
      const qs = pilotIdDev ? `?pilotId=${encodeURIComponent(pilotIdDev)}` : '';
      const response = await fetch(base.replace(/\/$/, '') + `/pilots/flights/${flightId}/notify${qs}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('pilotToken') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to send notifications');
      }

      alert('Notifications sent successfully!');
    } catch (err) {
      setError('Failed to send notifications');
      console.error(err);
    }
  };

  const connectStripe = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('pilotToken') : null;
      const response = await fetch(`${apiBase}/pilot/connect-stripe`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });

      if (!response.ok) {
        throw new Error('Failed to connect Stripe');
      }

      const data = await response.json();
      window.location.href = data.accountLink;
    } catch (err) {
      setError('Failed to connect Stripe');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="panel pad">
          <p>Loading pilot dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="panel pad" style={{ backgroundColor: '#fee', border: '1px solid #fcc' }}>
          <p style={{ color: '#c33', margin: 0 }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      <div className="container">
        <h1>Pilot Dashboard</h1>

        {/* Stripe Connect Status */}
        <div className="section">
          <h2>Stripe Account Status</h2>
          <div className="panel pad">
            {stripeStatus ? (
              <div>
                <div className="row">
                  <span className="muted">Status:</span>
                  <span style={{ 
                    color: stripeStatus.status === 'ACTIVE' ? '#0a0' : 
                           stripeStatus.status === 'PENDING' ? '#aa0' : '#a00'
                  }}>
                    {stripeStatus.status}
                  </span>
                </div>
                <div className="row">
                  <span className="muted">Charges Enabled:</span>
                  <span>{stripeStatus.chargesEnabled ? '✅' : '❌'}</span>
                </div>
                <div className="row">
                  <span className="muted">Payouts Enabled:</span>
                  <span>{stripeStatus.payoutsEnabled ? '✅' : '❌'}</span>
                </div>
                
                {stripeStatus.status !== 'ACTIVE' && (
                  <div style={{ marginTop: 16 }}>
                    <button onClick={connectStripe} className="btn btn-primary">
                      {stripeStatus.connected ? 'Complete Stripe Setup' : 'Connect Stripe Account'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p>Not connected to Stripe</p>
                <button onClick={connectStripe} className="btn btn-primary">
                  Connect Stripe Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Flight Management */}
        <div className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2>My Flights</h2>
            <button 
              onClick={handleCreateFlight}
              className="btn btn-primary"
              disabled={stripeStatus?.status !== 'ACTIVE'}
            >
              Create New Flight
            </button>
          </div>

          {flights.length === 0 ? (
            <div className="panel pad">
              <p>No flights created yet.</p>
              {stripeStatus?.status !== 'ACTIVE' && (
                <p className="muted">Complete your Stripe setup to create flights.</p>
              )}
            </div>
          ) : (
            <div className="grid">
              {flights.map((flight) => (
                <div key={flight.flightId} className="card">
                  <h4>Flight to {flight.launchLocation.city || 'Unknown Location'}</h4>
                  <div className="muted">
                    Meetup: {new Date(flight.meetupTimestamp).toLocaleString()}
                  </div>
                  <div className="muted">
                    Duration: {flight.estimatedDurationMinutes} minutes
                  </div>
                  <div className="row">
                    <span className="muted">Price per seat:</span>
                    <span>${flight.pricePerSeat}</span>
                  </div>
                  <div className="row">
                    <span className="muted">Seats:</span>
                    <span>{flight.seatsReserved}/{flight.totalSeats}</span>
                  </div>
                  <div className="row">
                    <span className="muted">Status:</span>
                    <span>{flight.status}</span>
                  </div>
                  
                  {flight.description && (
                    <div className="muted" style={{ marginTop: 8 }}>
                      {flight.description}
                    </div>
                  )}

                  <div className="sp" />
                  
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link 
                      href={`/pilot/flights/${flight.flightId}/edit`}
                      className="btn btn-ghost"
                    >
                      Edit
                    </Link>
                    
                    {flight.stripePaymentLinkId && (
                      <button
                        onClick={() => handleNotifyPassengers(flight.flightId)}
                        className="btn btn-primary"
                      >
                        Notify Passengers
                      </button>
                    )}
                    
                    <Link 
                      href={`/pilot/flights/${flight.flightId}`}
                      className="btn btn-ghost"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}