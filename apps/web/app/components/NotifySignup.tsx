"use client";

import { useState } from 'react';

export default function NotifySignup() {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhone] = useState('');
  const [zipCode, setZip] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Subscribing...');
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
      const url = base.replace(/\/$/, '') + '/notifications/subscribe';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || undefined, phoneNumber: phoneNumber || undefined, zipCode: zipCode || undefined })
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus(body?.alreadySubscribed ? 'You are already subscribed.' : 'Subscribed!');
        setEmail(''); setPhone(''); setZip('');
      } else {
        setStatus(`Error: ${body?.error || res.status}`);
      }
    } catch (err: any) {
      setStatus(`Error: ${err?.message || 'network'}`);
    }
  }

  return (
    <div>
      <h3>Get notified about new flights</h3>
      <p className="muted">Leave your email or phone, and we’ll notify you when pilots have openings near you.</p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
        <input placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={{ padding: 10 }} />
        <input placeholder="Phone (optional)" value={phoneNumber} onChange={(e) => setPhone(e.target.value)} type="tel" style={{ padding: 10 }} />
        <input placeholder="Zip code (optional)" value={zipCode} onChange={(e) => setZip(e.target.value)} style={{ padding: 10 }} />
        <button type="submit" className="btn btn-primary">Notify Me</button>
      </form>
      {status && <p style={{ marginTop: 8 }}>{status}</p>}
    </div>
  );
}


