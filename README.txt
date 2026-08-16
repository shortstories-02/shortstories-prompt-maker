SHORTSTORIES PROMPT MAKER V4.7

Perubahan UI:
- Tampilan modern terinspirasi bahasa visual aplikasi video pendek: hitam/putih dengan aksen cyan + pink.
- Sidebar dan kartu lebih premium.
- Tombol Generate/Copy lebih menonjol.
- Input lebih rounded dan memiliki focus ring.
- Active menu lebih jelas.
- Mobile mendapatkan bottom navigation.
- Dark mode mengikuti identitas cyan/pink.
- Semua fungsi Prompt Builder, template, favorit, riwayat, referensi foto, copy, dan download tetap dipertahankan.

Update GitHub:
Ganti index.html, style.css, script.js lalu Commit changes.
Setelah online tekan Ctrl+Shift+R.


V4.8: Prompt Final output diubah dari gelap menjadi putih agar konsisten dengan textarea Isi Poster.


FORGOT PASSWORD V2:
- Login has a Forgot Password flow using Supabase resetPasswordForEmail.
- Recovery links return to the same page and open a new-password form.
- Password updates use Supabase auth.updateUser.
- Configure Supabase Authentication > URL Configuration > Redirect URLs with the deployed site URL.
