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
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Notes — Tenant: {me?.tenant?.name} (Plan: {me?.tenant?.plan})
          </h2>
          <button
            onClick={() => {
              localStorage.clear();
              router.push('/');
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold shadow transition-all duration-200 active:scale-95"
          >
            Logout
          </button>
        </div>

        <div className="text-zinc-400">
          Signed in as: {me?.user?.email} ({me?.user?.role})
        </div>

        <form onSubmit={createNote} className="space-y-4">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-1 rounded-lg bg-zinc-800 border border-zinc-700 placeholder:text-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-neutral-600"
          />

          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 placeholder:text-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-neutral-600 resize-none"
            rows={4}
          />

          <button
            type="submit"
            className="w-full py-1 bg-stone-200 hover:bg-stone-200/90 rounded-lg text-black font-semibold shadow-lg shadow-indigo-900/30 transition-all duration-200 active:bg-stone-200/40 "
          >
            Create
          </button>
        </form>

        {err && <div className="text-red-500">{err}</div>}

        {me?.tenant?.plan === 'free' && notes.length >= 3 && (
          <div className="mt-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
            <b>You reached Free plan limit (3 notes)</b>
            <div className="mt-2">
              {me?.user?.role === 'Admin' ? (
                <button
                  onClick={upgrade}
                  className="px-4 py-1 bg-indigo-600 hover:bg-indigo-900 rounded-lg text-white font-semibold shadow transition-all duration-200"
                >
                  Upgrade to Pro
                </button>
              ) : (
                <div className="text-zinc-400">Ask your Admin to upgrade</div>
              )}
            </div>
          </div>
        )}

        <ul className="space-y-4">
          {notes.map((n) => (
            <li
              key={n.id}
              className="p-4 bg-zinc-800 rounded-md border border-zinc-700 flex flex-col gap-2 shadow-sm"
            >
              <h4 className="font-medium text-white">{n.title}</h4>
              <p className="text-zinc-300">{n.content}</p>
              <div className="flex justify-between items-center">
                <small className="text-zinc-500">
                  created: {new Date(n.created_at).toLocaleString()}
                </small>
                <button
                  onClick={() => del(n.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-900 rounded text-white text-sm transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}