import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug } = req.query;
  console.log(slug)

  try {
    // 1. Check tenant exists
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .select("*")
      .eq("slug", slug)
      .single();

    if (tenantError || !tenant) {
      console.error("❌ Tenant fetch error:", tenantError?.message);
      return res.status(404).json({ error: "Tenant not found" });
    }

    // 2. Update plan
    const { error: updateError } = await supabaseAdmin
      .from("tenants")
      .update({ plan: "pro" })
      .eq("slug", slug);

    if (updateError) {
      console.error("❌ Tenant update error:", updateError.message);
      return res.status(500).json({ error: updateError.message });
    }

    console.log(`🎉 Tenant ${slug} upgraded to Pro!`);
    return res.status(200).json({ message: `${tenant.name} upgraded to Pro!` });
  } catch (err) {
    console.error("💥 Unexpected error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
