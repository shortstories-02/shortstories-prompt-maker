ShortStories V4.8 — Forgot Password + Permanent Supabase Config

Ganti 3 file berikut di repository GitHub Pages:
1. auth.js
2. admin.js
3. index.html

Project URL sudah ditanam di frontend:
https://ppxckqbpuetulzmvusvg.supabase.co

Publishable key sudah ditanam di frontend. Ini aman untuk frontend selama yang digunakan
adalah Publishable/anon key. JANGAN pernah menaruh service_role/secret key di file ini.

Redirect reset password:
https://shortstories-02.github.io/shortstories-prompt-maker/

Perbaikan:
- Project URL/Publishable Key tidak lagi diminta di setiap device.
- Panel "Pengaturan Supabase" tidak lagi muncul.
- Tombol Lupa password mengirim email recovery dengan redirect yang benar.
- Link recovery menampilkan form "Buat Password Baru".
- Password baru + konfirmasi password.
- Setelah password berhasil diubah, pengguna dikembalikan ke login.
- Session akun expired dicek sebelum app ditampilkan, termasuk setelah refresh.
- Logout mengosongkan email/password.
- Admin Panel tetap menggunakan Edge Function create-customer.
