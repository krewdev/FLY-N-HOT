"use client";

import { useState } from 'react';

export default function PilotRegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhone] = useState('');
  const [zipCode, setZip] = useState('');
  const [pilotLicenseNumber, setLicense] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Submitting application...');
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
      const url = base.replace(/\/$/, '') + '/auth/pilot/register';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phoneNumber, pilotLicenseNumber, zipCode: zipCode || undefined })
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('Application submitted. We will verify your identity shortly.');
      } else {
        setStatus(`Error: ${body?.error || res.status}`);
      }
    } catch (err: any) {
      setStatus(`Error: ${err?.message || 'network'}`);
    }
  }

  return (
    <main className="container section">
      <div className="panel pad" style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ marginTop: 0 }}>Pilot Registration</h1>
        <p className="muted">Tell us about you. After submitting, we’ll verify your identity (ID + face scan).</p>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
            <input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input placeholder="Phone number" value={phoneNumber} onChange={(e) => setPhone(e.target.value)} required />
          <input placeholder="Pilot license number" value={pilotLicenseNumber} onChange={(e) => setLicense(e.target.value)} required />
          <input placeholder="Home zip code (optional)" value={zipCode} onChange={(e) => setZip(e.target.value)} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary">Submit Application</button>
            <a className="btn btn-ghost" href="/pilot/login">Already have an account?</a>
          </div>
        </form>
        {status && <p style={{ marginTop: 10 }}>{status}</p>}
      </div>
    </main>
  );
}


