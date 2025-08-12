"use client";

import { useState } from 'react';

export default function PilotLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Signing in...');
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
      const url = base.replace(/\/$/, '') + '/auth/login/password';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        setStatus('Logged in (stub)');
      } else {
        const body = await res.json().catch(() => ({}));
        setStatus(`Error: ${body?.message || body?.error || res.status}`);
      }
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
        <button type="submit" style={{ padding: '10px 12px', borderRadius: 6, background: 'black', color: 'white' }}>Sign In</button>
      </form>
      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </main>
  );
}


