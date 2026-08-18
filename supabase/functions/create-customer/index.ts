import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) throw new Error("Authorization header tidak ditemukan.");

    // Client dengan token user: hanya untuk memverifikasi siapa yang memanggil.
    const userClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } =
      await userClient.auth.getUser(token);

    if (userError || !user) throw new Error("Sesi login tidak valid.");

    // Service-role client untuk operasi administratif.
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (profile?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Akses ditolak. Hanya admin yang dapat membuat akun." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const nama = String(body?.nama || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const duration = String(body?.duration || "forever");

    if (!nama || !email || password.length < 6) {
      throw new Error("Nama, email, dan password minimal 6 karakter wajib diisi.");
    }

    const daysMap: Record<string, number> = {
      "7": 7,
      "30": 30,
      "90": 90,
      "365": 365,
    };

    let expiresAt: string | null = null;
    if (daysMap[duration]) {
      const date = new Date();
      date.setDate(date.getDate() + daysMap[duration]);
      expiresAt = date.toISOString();
    }

    const { data: created, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nama },
      });

    if (createError) throw createError;

    const { error: profileInsertError } = await adminClient
      .from("profiles")
      .insert({
        id: created.user.id,
        email,
        role: "customer",
        status: "active",
        expires_at: expiresAt,
      });

    if (profileInsertError) {
      await adminClient.auth.admin.deleteUser(created.user.id);
      throw profileInsertError;
    }

    return new Response(JSON.stringify({
      ok: true,
      customer: {
        id: created.user.id,
        email,
        role: "customer",
        status: "active",
        expires_at: expiresAt,
        duration
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Terjadi kesalahan."
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
