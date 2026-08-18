import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function makePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = new Uint8Array(14);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => chars[b % chars.length]).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceRole) {
      return json({ success: false, error: "Konfigurasi Supabase server tidak lengkap." }, 500);
    }

    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return json({ success: false, error: "Authorization header tidak ditemukan." }, 401);
    }

    const token = authorization.replace(/^Bearer\s+/i, "").trim();
    if (!token) return json({ success: false, error: "Token login tidak ditemukan." }, 401);

    const admin = createClient(url, serviceRole, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: authData, error: authError } = await admin.auth.getUser(token);
    if (authError || !authData.user) {
      return json({ success: false, error: "Sesi login admin tidak valid." }, 401);
    }

    const callerId = authData.user.id;
    const { data: callerProfile, error: callerProfileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", callerId)
      .maybeSingle();

    if (callerProfileError) {
      return json({ success: false, error: "Gagal memeriksa role admin: " + callerProfileError.message }, 500);
    }

    if (callerProfile?.role !== "admin") {
      return json({ success: false, error: "Akses ditolak. Hanya admin yang dapat mengelola pelanggan." }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "").trim().toLowerCase();

    // Accept several common field names so the function is tolerant of the
    // existing Admin Panel implementation.
    const customerId = String(
      body?.customerId ?? body?.customer_id ?? body?.userId ?? body?.user_id ?? body?.id ?? ""
    ).trim();

    if (action === "reset_password" || action === "reset-password" || action === "resetpassword") {
      if (!customerId) return json({ success: false, error: "ID pelanggan tidak ditemukan." }, 400);

      const { data: target, error: targetError } = await admin.auth.admin.getUserById(customerId);
      if (targetError || !target.user) {
        return json({ success: false, error: "Akun pelanggan tidak ditemukan." }, 404);
      }

      if (target.user.id === callerId) {
        return json({ success: false, error: "Gunakan pengaturan akun admin untuk mengganti password admin." }, 400);
      }

      const { data: targetProfile, error: targetProfileError } = await admin
        .from("profiles")
        .select("role")
        .eq("id", customerId)
        .maybeSingle();

      if (targetProfileError) {
        return json({ success: false, error: "Gagal memeriksa akun pelanggan: " + targetProfileError.message }, 500);
      }
      if (!targetProfile || targetProfile.role !== "customer") {
        return json({ success: false, error: "Akun yang dipilih bukan akun customer." }, 400);
      }

      const suppliedPassword = String(
        body?.newPassword ?? body?.new_password ?? body?.password ?? ""
      );
      const newPassword = suppliedPassword || makePassword();

      if (newPassword.length < 6) {
        return json({ success: false, error: "Password baru minimal 6 karakter." }, 400);
      }

      const { error: updateError } = await admin.auth.admin.updateUserById(
        customerId,
        { password: newPassword }
      );

      if (updateError) {
        console.error("reset_password updateUserById:", updateError);
        return json({
          success: false,
          error: "Gagal mengubah password: " + updateError.message,
          code: updateError.code ?? null,
        }, 400);
      }

      return json({
        success: true,
        message: "Password customer berhasil direset.",
        password: newPassword,
        temporary_password: newPassword,
        customer: {
          id: target.user.id,
          email: target.user.email ?? "",
        },
      });
    }

    if (action === "list") {
      const { data: profiles, error } = await admin
        .from("profiles")
        .select("id,email,role,status,expires_at")
        .eq("role", "customer")
        .order("email", { ascending: true });

      if (error) return json({ success: false, error: error.message }, 400);

      return json({ success: true, customers: profiles ?? [] });
    }

    if (!customerId) {
      return json({ success: false, error: "ID pelanggan tidak ditemukan." }, 400);
    }

    if (action === "set_status" || action === "status") {
      const status = String(body?.status ?? "").trim().toLowerCase();
      if (!["active", "inactive"].includes(status)) {
        return json({ success: false, error: "Status harus active atau inactive." }, 400);
      }

      const { error } = await admin
        .from("profiles")
        .update({ status })
        .eq("id", customerId)
        .eq("role", "customer");

      if (error) return json({ success: false, error: error.message }, 400);
      return json({ success: true, message: status === "active" ? "Customer diaktifkan." : "Customer dinonaktifkan.", status });
    }

    if (action === "set_forever" || action === "forever") {
      const { error } = await admin
        .from("profiles")
        .update({ expires_at: null })
        .eq("id", customerId)
        .eq("role", "customer");

      if (error) return json({ success: false, error: error.message }, 400);
      return json({ success: true, message: "Masa aktif customer diubah menjadi Selamanya.", expires_at: null });
    }

    if (action === "extend") {
      const days = Number(body?.days);
      if (!Number.isFinite(days) || ![7, 30, 90, 365].includes(days)) {
        return json({ success: false, error: "Jumlah hari harus 7, 30, 90, atau 365." }, 400);
      }

      const { data: profile, error: readError } = await admin
        .from("profiles")
        .select("expires_at")
        .eq("id", customerId)
        .eq("role", "customer")
        .maybeSingle();

      if (readError) return json({ success: false, error: readError.message }, 400);
      if (!profile) return json({ success: false, error: "Customer tidak ditemukan." }, 404);
      if (!profile.expires_at) {
        return json({ success: true, message: "Customer sudah Selamanya; masa aktif tidak berubah.", expires_at: null });
      }

      const current = new Date(profile.expires_at);
      const next = new Date(current.getTime() + days * 24 * 60 * 60 * 1000);

      const { error: updateError } = await admin
        .from("profiles")
        .update({ expires_at: next.toISOString() })
        .eq("id", customerId)
        .eq("role", "customer");

      if (updateError) return json({ success: false, error: updateError.message }, 400);
      return json({ success: true, message: `Masa aktif ditambah ${days} hari.`, expires_at: next.toISOString() });
    }

    if (action === "delete") {
      const { data: target, error: targetError } = await admin.auth.admin.getUserById(customerId);
      if (targetError || !target.user) return json({ success: false, error: "Akun pelanggan tidak ditemukan." }, 404);
      if (target.user.id === callerId) return json({ success: false, error: "Admin tidak dapat menghapus akun sendiri." }, 400);

      const { data: targetProfile, error: profileError } = await admin
        .from("profiles")
        .select("role")
        .eq("id", customerId)
        .maybeSingle();

      if (profileError) return json({ success: false, error: profileError.message }, 500);
      if (!targetProfile || targetProfile.role !== "customer") {
        return json({ success: false, error: "Akun yang dipilih bukan customer." }, 400);
      }

      const { error: deleteError } = await admin.auth.admin.deleteUser(customerId);
      if (deleteError) return json({ success: false, error: "Gagal menghapus akun: " + deleteError.message }, 400);

      return json({ success: true, message: "Akun customer berhasil dihapus." });
    }

    return json({ success: false, error: "Aksi tidak dikenali: " + action }, 400);
  } catch (error) {
    console.error("admin-customers:", error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan pada server.",
    }, 500);
  }
});
