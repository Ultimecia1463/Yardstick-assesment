import { withAuth } from '../../../lib/withAuth';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default withAuth(async (req, res) => {
  const { id } = req.query;
  const tenant = req.tenant;

  // fetch and confirm tenant isolation
  const { data: note } = await supabaseAdmin
    .from('notes')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!note || note.tenant_id !== tenant.id) {
    return res.status(404).json({ error: 'note not found' });
  }

  if (req.method === 'GET') return res.json(note);

  if (req.method === 'PUT') {
    const { title, content } = req.body || {};
    const { data: updated, error } = await supabaseAdmin
      .from('notes')
      .update({ title: title ?? note.title, content: content ?? note.content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) return res.status(500).json({ error: 'update failed' });
    return res.json(updated);
  }

  if (req.method === 'DELETE') {
    await supabaseAdmin.from('notes').delete().eq('id', id);
    return res.status(204).end();
  }

  return res.status(405).end();
});