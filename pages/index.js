import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl shadow-2xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-white">Notes — Login</h2>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-1 rounded-lg bg-zinc-800 border border-zinc-700 placeholder:text-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-neutral-600"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-1 rounded-lg bg-zinc-800 border border-zinc-700 placeholder:text-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-neutral-600"
            />
          </div>

          <button
            type="submit"
            className="w-full py-1 bg-stone-200 hover:bg-stone-200/90 rounded-lg text-black font-semibold shadow-lg shadow-indigo-900/30 transition-all duration-200 active:scale-95"
          >
            Login
          </button>
        </form>

        {err && <div className="text-red-500 text-center">{err}</div>}

        <div className="text-zinc-400 text-sm">
          <p>Test accounts (password: <b>password</b>):</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>admin@acme.test (Admin — Acme)</li>
            <li>user@acme.test (Member — Acme)</li>
            <li>admin@globex.test (Admin — Globex)</li>
            <li>user@globex.test (Member — Globex)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}