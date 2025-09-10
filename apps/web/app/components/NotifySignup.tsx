"use client";

import { useEffect, useMemo, useState } from 'react';

interface SignupData {
  name: string;
  email: string;
  phone: string;
  birthday: string;
  weight: number;
  zipCode: string;
  pilotId?: string;
  festivalId?: string;
}

interface NotifySignupProps {
  preselectedPilotId?: string;
  preselectedPilotName?: string;
  preselectedFestivalId?: string;
  preselectedFestivalName?: string;
}

export default function NotifySignup(props: NotifySignupProps) {
  const [formData, setFormData] = useState<SignupData>({
    name: '',
    email: '',
    phone: '',
    birthday: '',
    weight: 0,
    zipCode: '',
    pilotId: undefined,
    festivalId: undefined
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pilots, setPilots] = useState<Array<{ pilotId: string; name: string }>>([]);
  const [festivals, setFestivals] = useState<Array<{ festivalId: string; name: string }>>([]);

  useEffect(() => {
    const loadLists = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
        const [pRes, fRes] = await Promise.all([
          fetch(base.replace(/\/$/, '') + '/pilots'),
          fetch(base.replace(/\/$/, '') + '/festivals/upcoming')
        ]);
        if (pRes.ok) setPilots(await pRes.json());
        if (fRes.ok) setFestivals(await fRes.json());
      } catch {
        // ignore list load errors silently for UX
      }
    };
    loadLists();
  }, []);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      pilotId: props.preselectedPilotId ?? prev.pilotId,
      festivalId: props.preselectedFestivalId ?? prev.festivalId,
    }));
  }, [props.preselectedPilotId, props.preselectedFestivalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
      const response = await fetch(base.replace(/\/$/, '') + '/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        birthday: '',
        weight: 0,
        zipCode: '',
        pilotId: undefined,
        festivalId: undefined
      });
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SignupData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (success) {
    return (
      <div className="panel pad" style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(167,139,250,0.4)' }}>
        <h3 style={{ color: '#a78bfa', margin: '0 0 8px 0' }}>🎉 Successfully Subscribed!</h3>
        <p style={{ color: '#e5e7eb', margin: 0 }}>
          You&apos;ll be notified about hot air balloon flights in your area. Check your email for confirmation!
        </p>
      </div>
    );
  }

  return (
    <div className="panel pad">
      <h2 style={{ background: 'linear-gradient(135deg, #a78bfa, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>🎈 Get notified about new flights</h2>
      <p className="muted">
        Subscribe to receive notifications about available flights, special events, and last-minute opportunities in your area.
      </p>
      
      <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          <div>
            <label htmlFor="pilot" className="form-label">
              Pilot *
            </label>
            <select
              id="pilot"
              className="form-input"
              value={formData.pilotId || ''}
              onChange={(e) => handleInputChange('pilotId', e.target.value || undefined)}
              required
            >
              <option value="">Select a pilot</option>
              {props.preselectedPilotId && props.preselectedPilotName && (
                <option value={props.preselectedPilotId}>{props.preselectedPilotName}</option>
              )}
              {pilots.map((p) => (
                <option key={p.pilotId} value={p.pilotId}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="festival" className="form-label">
              Festival *
            </label>
            <select
              id="festival"
              className="form-input"
              value={formData.festivalId || ''}
              onChange={(e) => handleInputChange('festivalId', e.target.value || undefined)}
              required
            >
              <option value="">Select a festival</option>
              {props.preselectedFestivalId && props.preselectedFestivalName && (
                <option value={props.preselectedFestivalId}>{props.preselectedFestivalName}</option>
              )}
              {festivals.map((f) => (
                <option key={f.festivalId} value={f.festivalId}>{(f as any).name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="name" className="form-label">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="form-input"
              required
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="form-label">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="form-input"
              required
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="form-label">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="form-input"
              required
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label htmlFor="birthday" className="form-label">
              Birthday *
            </label>
            <input
              type="date"
              id="birthday"
              value={formData.birthday}
              onChange={(e) => handleInputChange('birthday', e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="weight" className="form-label">
              Weight (lbs) * ⚠️
            </label>
            <input
              type="number"
              id="weight"
              value={formData.weight || ''}
              onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
              className="form-input"
              required
              min="50"
              max="300"
              placeholder="150"
            />
            <div style={{ fontSize: '0.8em', color: '#dc2626', marginTop: 4 }}>
              ⚠️ Weight is required for safety - balloons have weight limits to prevent overloading
            </div>
          </div>

          <div>
            <label htmlFor="zipCode" className="form-label">
              ZIP Code
            </label>
            <input
              type="text"
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              className="form-input"
              placeholder="12345"
            />
          </div>
        </div>

        {error && (
          <div className="error" style={{ padding: 12, borderRadius: 8, marginTop: 16 }}>
            <p style={{ margin: 0 }}>Error: {error}</p>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <button
            type="submit"
            disabled={loading || !formData.name || !formData.email || !formData.phone || !formData.birthday || !formData.weight || !formData.pilotId || !formData.festivalId}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? 'Subscribing...' : 'Subscribe to Notifications'}
          </button>
        </div>

        <p style={{ fontSize: '0.8em', color: '#666', marginTop: 12, textAlign: 'center' }}>
                          We&apos;ll only use your information to send flight notifications. No spam, ever!
        </p>
      </form>
    </div>
  );
}


