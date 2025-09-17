import { verifyToken } from './auth';
import { supabaseAdmin } from './supabaseAdmin';
import { setCors } from './cors';

export function withAuth(handler, { requireAdmin = false } = {}) {
  return async (req, res) => {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(204).end();

    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ error: 'Invalid token' });

    // load the user from DB
    const { data: user, error: userErr } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .maybeSingle();

    if (userErr || !user) return res.status(401).json({ error: 'User not found' });

    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('id', user.tenant_id)
      .maybeSingle();

    req.user = user;
    req.tenant = tenant;

    if (requireAdmin && user.role !== 'Admin') {
      return res.status(403).json({ error: 'Admin only' });
    }

    return handler(req, res);
  };
}
