import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

function api(path, opts = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return fetch(path, {
    headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
    ...opts,
  });
}

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [me, setMe] = useState(null);
  const [err, setErr] = useState('');
  const router = useRouter();

  async function load() {
    const r1 = await api('/api/me');
    if (!r1.ok) {
      router.push('/');
      return;
    }
    const meJson = await r1.json();
    setMe(meJson);

    const r2 = await api('/api/notes');
    const notesJson = await r2.json();
    setNotes(notesJson);
  }

  useEffect(() => {
    load();
  }, []);

  async function createNote(e) {
    e && e.preventDefault();
    setErr('');
    const res = await api('/api/notes', { method: 'POST', body: JSON.stringify({ title, content }) });
    if (!res.ok) {
      const j = await res.json().catch(() => ({ error: 'create failed' }));
      setErr(j?.error || 'create failed');
      return;
    }
    const j = await res.json();
    setTitle('');
    setContent('');
    setNotes([j, ...notes]);
  }

  async function del(id) {
    await api(`/api/notes/${id}`, { method: 'DELETE' });
    setNotes(notes.filter((n) => n.id !== id));
  }

  async function upgrade() {
    const slug = me?.tenant?.slug;
    if (!slug) return;
    const res = await api(`/api/tenants/${slug}/upgrade`, { method: 'POST' });
    if (!res.ok) {
      const j = await res.json().catch(() => ({ error: 'upgrade failed' }));
      setErr(j?.error || 'upgrade failed');
      return;
    }
    await load();
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Notes — Tenant: {me?.tenant?.name} (Plan: {me?.tenant?.plan})</h2>
      <div>Signed in as: {me?.user?.email} ({me?.user?.role})</div>

      <form onSubmit={createNote} style={{ marginTop: 15 }}>
        <input placeholder="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <br />
        <textarea placeholder="content" value={content} onChange={(e) => setContent(e.target.value)} />
        <br />
        <button type="submit">Create</button>
      </form>

      {err && <div style={{ color: 'red' }}>{err}</div>}

      {me?.tenant?.plan === 'free' && notes.length >= 3 && (
        <div style={{ marginTop: 10 }}>
          <b>You reached Free plan limit (3 notes)</b>
          <br />
          {me?.user?.role === 'Admin' ? (
            <button onClick={upgrade}>Upgrade to Pro</button>
          ) : (
            <div>Ask your Admin to upgrade</div>
          )}
        </div>
      )}

      <ul>
        {notes.map((n) => (
          <li key={n.id} style={{ marginTop: 10 }}>
            <h4>{n.title}</h4>
            <p>{n.content}</p>
            <small>created: {new Date(n.created_at).toLocaleString()}</small>
            <br />
            <button onClick={() => del(n.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}