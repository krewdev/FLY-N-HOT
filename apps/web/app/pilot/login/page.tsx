"use client";

import { useState } from 'react';

export default function PilotLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [pilotId, setPilotId] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Signing in...');
    try {
      // Dev bypass: store pilotId for API calls that accept ?pilotId= in dev
      if (pilotId) {
        localStorage.setItem('pilotId_dev', pilotId);
        setStatus('Dev pilot bypass enabled');
        return;
      }
      // Fallback to stub login
      setStatus('Provide a pilotId to bypass in development.');
    } catch (err: any) {
      setStatus(`Error: ${err?.message || 'network'}`);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <h1>Pilot Login</h1>
      <p style={{ color: '#555' }}>Enter your credentials to access the pilot dashboard.</p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 6 }} />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 6 }} />
        </label>
        <div style={{ borderTop: '1px solid #eee', paddingTop: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Developer Pilot Bypass</div>
          <label>
            Pilot ID (dev only)
            <input value={pilotId} onChange={(e) => setPilotId(e.target.value)} placeholder="00000000-0000-0000-0000-000000000000" style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 6 }} />
          </label>
          <div className="muted" style={{ fontSize: '0.9em' }}>When provided, API calls will include ?pilotId= to bypass auth in development.</div>
        </div>
        <button type="submit" style={{ padding: '10px 12px', borderRadius: 6, background: 'black', color: 'white' }}>Sign In</button>
      </form>
      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </main>
  );
}


