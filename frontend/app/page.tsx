'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const response = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? 'Unable to sign in');
      localStorage.setItem('citadel_token', data.accessToken);
      localStorage.setItem('citadel_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in'); } finally { setLoading(false); }
  }

  return <main className="auth-shell"><section className="brand-panel"><div className="mark">C</div><p className="eyebrow">COLLABCIRCLE</p><h1>People, presence, and progress in one calm workspace.</h1><p className="muted-light">Citadel is the internal operating system for the people who make CollabCircle move.</p></section><section className="login-panel"><div className="login-card"><p className="eyebrow">WELCOME BACK</p><h2>Sign in to Citadel</h2><p className="muted">Use the company account created by your administrator.</p><form onSubmit={submit}><label>Company email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@collabcircle.com" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required /></label>{error && <p className="error">{error}</p>}<button className="primary" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button></form></div></section></main>;
}
