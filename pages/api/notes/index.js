import { withAuth } from '../../../lib/withAuth';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default withAuth(async (req, res) => {
  const user = req.user;
  const tenant = req.tenant;

  if (req.method === 'GET') {
    const { data: notes } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false });

    return res.json(notes || []);
  }

  if (req.method === 'POST') {
    const { title, content } = req.body || {};
    if (!title) return res.status(400).json({ error: 'title required' });

    // subscription gating: free = max 3 notes
    const { data: existing } = await supabaseAdmin
      .from('notes')
      .select('id')
      .eq('tenant_id', tenant.id);

    if (tenant.plan === 'free' && existing && existing.length >= 3) {
      return res.status(403).json({ error: 'note limit reached for Free plan' });
    }

    const { data: created, error } = await supabaseAdmin
      .from('notes')
      .insert({
        title,
        content: content || '',
        tenant_id: tenant.id,
        author_id: user.id,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'failed to create' });
    return res.status(201).json(created);
  }

  return res.status(405).end();
});