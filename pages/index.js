import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password');
  const [err, setErr] = useState('');
  const router = useRouter();

  async function submit(e) {
    e?.preventDefault();
    setErr('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({ error: 'login failed' }));
      setErr(j?.error || 'login failed');
      return;
    }
    const j = await res.json();
    localStorage.setItem('token', j.token);
    // also store tenant slug for convenience
    localStorage.setItem('tenant_slug', j.tenant.slug);
    router.push('/notes');
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>SaaS Notes — Login</h2>
      <form onSubmit={submit}>
        <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <br />
        <input placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <br />
        <button type="submit">Login</button>
      </form>
      <div style={{ color: 'red' }}>{err}</div>

      <p>Test accounts (password: <b>password</b>):</p>
      <ul>
        <li>admin@acme.test (Admin — Acme)</li>
        <li>user@acme.test (Member — Acme)</li>
        <li>admin@globex.test (Admin — Globex)</li>
        <li>user@globex.test (Member — Globex)</li>
      </ul>
    </div>
  );
}