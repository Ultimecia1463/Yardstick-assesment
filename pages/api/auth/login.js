import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { setCors } from '../../../lib/cors';
import { comparePassword } from '../../../lib/auth';
import { signToken } from '../../../lib/auth';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing credentials' });

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error || !user) return res.status(401).json({ error: 'invalid credentials' });

  const ok = comparePassword(password, user.password);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });

  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('*')
    .eq('id', user.tenant_id)
    .maybeSingle();

  const token = signToken({ userId: user.id, tenantId: tenant.id, role: user.role });

  return res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
    tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name, plan: tenant.plan },
  });
}