import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return response({ error: "Authorization header tidak ditemukan." }, 401);

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !user) return response({ error: "Sesi login tidak valid." }, 401);

    const { data: caller, error: callerError } = await adminClient
      .from("profiles").select("role").eq("id", user.id).maybeSingle();

    if (callerError) throw callerError;
    if (caller?.role !== "admin") return response({ error: "Akses ditolak. Hanya admin yang dapat mengelola pelanggan." }, 403);

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "list");

    if (action === "list") {
      const { data: profiles, error } = await adminClient
        .from("profiles")
        .select("id,email,role,status,expires_at")
        .eq("role", "customer")
        .order("expires_at", { ascending: true, nullsFirst: false });
      if (error) throw error;

      const { data: users, error: usersError } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (usersError) throw usersError;

      const names = new Map((users?.users || []).map((u) => [u.id, String(u.user_metadata?.nama || "")]));
      return response({
        customers: (profiles || []).map((p) => ({ ...p, nama: names.get(p.id) || "" }))
      });
    }

    const id = String(body?.id || "").trim();
    if (!id) return response({ error: "ID pelanggan wajib diisi." }, 400);
    if (id === user.id) return response({ error: "Akun admin yang sedang digunakan tidak dapat dikelola sebagai customer." }, 400);

    if (action === "set_status") {
      const status = body?.status === "inactive" ? "inactive" : "active";
      const { error } = await adminClient.from("profiles").update({ status }).eq("id", id).eq("role", "customer");
      if (error) throw error;
      return response({ ok: true, status });
    }

    if (action === "extend") {
      const daysMap: Record<string, number> = { "7": 7, "30": 30, "90": 90, "365": 365 };
      const days = daysMap[String(body?.days || "")];
      if (!days) return response({ error: "Masa perpanjangan tidak valid." }, 400);

      const { data: profile, error: pError } = await adminClient
        .from("profiles").select("expires_at,status,role").eq("id", id).maybeSingle();
      if (pError) throw pError;
      if (!profile || profile.role !== "customer") return response({ error: "Pelanggan tidak ditemukan." }, 404);

      let base = new Date();
      if (profile.expires_at) {
        const current = new Date(profile.expires_at);
        if (!Number.isNaN(current.getTime()) && current > base) base = current;
      }
      base.setDate(base.getDate() + days);

      const { error } = await adminClient.from("profiles").update({
        expires_at: base.toISOString(),
        status: "active",
      }).eq("id", id).eq("role", "customer");
      if (error) throw error;

      return response({ ok: true, expires_at: base.toISOString(), status: "active" });
    }

    if (action === "set_forever") {
      const { error } = await adminClient.from("profiles")
        .update({ expires_at: null, status: "active" }).eq("id", id).eq("role", "customer");
      if (error) throw error;
      return response({ ok: true, expires_at: null, status: "active" });
    }

    if (action === "reset_password") {
      const password = String(body?.password || "");
      if (password.length < 6) return response({ error: "Password minimal 6 karakter." }, 400);
      const { error } = await adminClient.auth.admin.updateUserById(id, { password });
      if (error) throw error;
      return response({ ok: true });
    }

    if (action === "delete") {
      const { error: profileError } = await adminClient.from("profiles").delete().eq("id", id).eq("role", "customer");
      if (profileError) throw profileError;
      const { error: userDeleteError } = await adminClient.auth.admin.deleteUser(id);
      if (userDeleteError) throw userDeleteError;
      return response({ ok: true });
    }

    return response({ error: "Aksi tidak dikenal." }, 400);
  } catch (error) {
    console.error(error);
    return response({ error: error instanceof Error ? error.message : "Terjadi kesalahan." }, 400);
  }
});
