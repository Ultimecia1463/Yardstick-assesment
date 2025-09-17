import { withAuth } from '../../lib/withAuth';
export default withAuth(async (req, res) => {
  res.json({
    user: { id: req.user.id, email: req.user.email, role: req.user.role },
    tenant: { id: req.tenant.id, slug: req.tenant.slug, name: req.tenant.name, plan: req.tenant.plan },
  });
});