const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function upsertTenant(slug, name) {
  const { data } = await supabase.from('tenants').select('*').eq('slug', slug).limit(1);
  if (data && data.length) return data[0];
  const { data: inserted } = await supabase.from('tenants').insert({ slug, name }).select().limit(1);
  return inserted[0];
}

async function upsertUser(email, role, tenant_id) {
  const { data } = await supabase.from('users').select('*').eq('email', email).limit(1);
  if (data && data.length) return data[0];
  const hash = bcrypt.hashSync('password', 10);
  const { data: inserted } = await supabase
    .from('users')
    .insert({ email, password: hash, role, tenant_id })
    .select()
    .limit(1);
  return inserted[0];
}

async function main() {
  console.log('Seeding...');
  const acme = await upsertTenant('acme', 'Acme');
  const globex = await upsertTenant('globex', 'Globex');

  await upsertUser('admin@acme.test', 'Admin', acme.id);
  await upsertUser('user@acme.test', 'Member', acme.id);
  await upsertUser('admin@globex.test', 'Admin', globex.id);
  await upsertUser('user@globex.test', 'Member', globex.id);

  console.log('Seed completed.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});