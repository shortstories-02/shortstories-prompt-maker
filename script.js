const themes = [
  ["Laut","🌊","Ocean","elemen laut seperti ikan lucu, terumbu karang, kerang, rumput laut, gelembung air, ombak lembut, dan suasana bawah laut yang ceria"],
  ["Sunflower Garden","🌻","Garden","bunga matahari besar, daun hijau, taman ceria, rumput, bunga kecil, papan kayu dekoratif, dan suasana taman sekolah yang hangat"],
  ["Hewan & Safari","🦁","Safari","hewan lucu seperti singa, jerapah, gajah, zebra, pepohonan tropis, daun, dan suasana safari ramah anak"],
  ["Luar Angkasa","🚀","Galaxy","planet, bintang, roket lucu, bulan, galaksi, astronaut anak, dan elemen luar angkasa yang menyenangkan"]
];

const templates = [
  ["Jadwal Pelajaran","📚","Manajemen Kelas","Jadwal pelajaran Senin–Jumat dengan panel informasi yang jelas."],
  ["Jadwal Piket","🧹","Manajemen Kelas","Daftar tugas piket harian dengan kolom nama siswa."],
  ["Struktur Organisasi Kelas","👥","Manajemen Kelas","Bagan wali kelas, ketua, wakil, bendahara, dan seksi."],
  ["Kesepakatan Kelas","🤝","Karakter & Budaya","Poster aturan dan kesepakatan kelas yang positif."],
  ["Tata Tertib Kelas","📌","Karakter & Budaya","Tata tertib dengan ikon sederhana dan mudah dibaca."],
  ["5 Kata Ajaib","💬","Karakter & Budaya","Tolong, Maaf, Terima Kasih, Permisi, Silakan."],
  ["Budaya 7S","😊","Karakter & Budaya","Senyum, Salam, Sapa, Sopan, Santun, Sabar, Syukur."],
  ["Absensi Bulanan","🗓️","Manajemen Kelas","Tabel absensi siswa dengan ruang nama dan tanggal."],
  ["Motivasi Belajar","⭐","Motivasi","Kutipan motivasi positif untuk siswa SD."],
  ["Peta Indonesia","🇮🇩","Edukasi","Peta Indonesia dengan elemen edukatif dan label yang jelas."],
  ["Tata Surya","🪐","Edukasi","Poster tata surya dengan planet yang mudah dikenali."],
  ["Bagian Tumbuhan","🌱","Edukasi","Akar, batang, daun, bunga, buah, dan biji."],
  ["Siklus Air","💧","Edukasi","Evaporasi, kondensasi, presipitasi, dan pengumpulan air."],
  ["Sistem Pernapasan","🫁","Edukasi","Organ pernapasan manusia dengan diagram edukatif."],
  ["Perubahan Wujud Benda","🧊","Edukasi","Mencair, membeku, menguap, mengembun, menyublim."],
  ["Angka 1–20","🔢","Edukasi","Poster angka untuk siswa kelas rendah."],
  ["Huruf A–Z","🔤","Edukasi","Alfabet ceria dengan ilustrasi objek."],
  ["Panca Indera","👀","Edukasi","Mata, telinga, hidung, lidah, dan kulit."],
  ["Rukun Islam","☪️","Edukasi","Lima rukun Islam dengan susunan yang rapi."],
  ["Rukun Iman","📖","Edukasi","Enam rukun iman dengan ilustrasi ramah anak."],
  ["Aku Suka Membaca","📖","Motivasi","Poster budaya membaca untuk sudut kelas."],
  ["Rajin Menabung","🐷","Motivasi","Motivasi menabung dengan karakter anak."],
  ["Jaga Kebersihan","🧼","Karakter & Budaya","Ajakan menjaga kebersihan kelas dan lingkungan."],
  ["Antre Itu Hebat","🚶","Karakter & Budaya","Poster budaya antre yang positif."],
  ["Berani Bertanya","🙋","Motivasi","Ajakan siswa aktif bertanya dan belajar."]
];

let selectedTheme = themes[0];
let lastPrompt = "";
let favorites = JSON.parse(localStorage.getItem("ss_favorites") || "[]");
let history = JSON.parse(localStorage.getItem("ss_history") || "[]");

const $ = id => document.getElementById(id);

function initThemes(){
  $("themeGrid").innerHTML = themes.map((t,i)=>`
    <button class="theme-card ${i===0?'active':''}" data-i="${i}" type="button">
      <span>${t[1]}</span><b>${t[0].replace(" & Safari","")}</b><small>${t[2]}</small>
    </button>`).join("");
  document.querySelectorAll(".theme-card").forEach(btn=>{
    btn.onclick=()=>{
      document.querySelectorAll(".theme-card").forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");
      selectedTheme=themes[Number(btn.dataset.i)];
      updatePreview();
    };
  });
}

function initTemplates(){
  $("templateSelect").innerHTML = templates.map((t,i)=>`<option value="${i}">${t[1]} ${t[0]}</option>`).join("");
  renderTemplateLibrary();
}
function useTemplate(i){
  const t=templates[i];
  $("templateSelect").value=i;
  $("title").value=t[0].toUpperCase();
  $("content").value=`${t[3]}\n\nTambahkan isi/data poster yang saya berikan berikutnya.`;
  showView("builder");
  updatePreview();
  showToast("Template dipilih");
}
function renderTemplateLibrary(){
  const q=($("templateSearch")?.value||"").toLowerCase();
  const cat=$("templateCategory")?.value||"Semua Kategori";
  const filtered=templates.map((t,i)=>({...{t},i})).filter(x=>(cat==="Semua Kategori"||x.t[2]===cat)&&x.t[0].toLowerCase().includes(q));
  $("templateGrid").innerHTML=filtered.map(x=>`
    <article class="template-item">
      <div class="template-icon">${x.t[1]}</div><h3>${x.t[0]}</h3>
      <p>${x.t[3]}</p><div class="template-meta"><span class="category">${x.t[2]}</span>
      <button class="use-template" onclick="useTemplate(${x.i})">Gunakan →</button></div>
    </article>`).join("") || `<div class="empty">Template tidak ditemukan.</div>`;
}
function themeDetails(){return selectedTheme[3]}

function generatePrompt(){
  const template=templates[Number($("templateSelect").value)];
  const kelas=$("classLevel").value, sem=$("semester").value;
  const title=$("title").value.trim()||template[0].toUpperCase();
  const content=$("content").value.trim()||"[ISI POSTER WAJIB DIISI]";
  const extra=$("extra").value.trim();
  const style=$("style").value, layout=$("layout").value, character=$("character").value;
  const font=$("fontStyle").value, size=$("size").value, res=$("resolution").value;
  const color=$("color").value, border=$("border").value;

  lastPrompt=`Buat desain poster kelas Sekolah Dasar (SD) berjudul "${title}".

JENIS / TEMPLATE:
${template[0]}

TARGET:
${kelas}, ${sem}.

TEMA VISUAL:
Gunakan tema "${selectedTheme[0]}" dengan ${themeDetails()}.
Gunakan gaya ${style}, ramah anak, edukatif, premium, detail tinggi, dan menarik.

KOMPOSISI:
- Layout: ${layout}
- Karakter: ${character}
- Tipografi: ${font}
- Border: ${border}
- Nuansa warna: ${color}
- Susunan elemen harus rapi, seimbang, modern, dan mudah dibaca dari jarak beberapa meter.
- Jangan membuat dekorasi mengganggu teks.

SPESIFIKASI:
- Ukuran: ${size}
- Resolusi: ${res}
- Kualitas tinggi, tajam, bersih, cocok untuk dekorasi kelas dan siap cetak.

TEKS / ISI YANG WAJIB DITAMPILKAN:
${content}

${extra?`PERMINTAAN TAMBAHAN:\n${extra}\n`:""}

ATURAN TEKS:
1. Pertahankan semua teks yang diberikan persis.
2. Jangan mengubah nama, angka, urutan, ejaan, atau isi.
3. Jangan membuat teks acak, gibberish, atau typo.
4. Jangan memotong, menyembunyikan, atau menumpuk teks.
5. Pastikan seluruh teks terbaca jelas.
6. Semua elemen wajib berada di dalam kanvas.

NEGATIVE PROMPT:
teks terpotong, teks acak, typo, huruf tidak terbaca, layout berantakan, elemen keluar kanvas, objek terlalu padat, warna kusam, watermark, logo yang tidak diminta, border terlalu tebal, karakter cacat, proporsi aneh, tangan/jari tidak proporsional, elemen tidak relevan.

Hasil akhir harus terlihat seperti poster pendidikan SD profesional, ceria, modern, penuh warna, konsisten dengan tema, dan siap digunakan di ruang kelas.`;

  $("promptOutput").textContent=lastPrompt;
  $("status").textContent="Berhasil dibuat";
  updatePreview();
  addHistory(lastPrompt,title);
  showToast("✓ Prompt berhasil dibuat");
}

function updatePreview(){
  $("previewTheme").textContent=selectedTheme[1];
  $("previewClass").textContent=$("classLevel").value.toUpperCase();
  $("previewTitle").textContent=$("title").value.trim()||"JUDUL POSTER";
  $("previewContent").textContent=$("content").value.trim()||"Isi poster akan tampil di sini.";
  $("previewStyle").textContent=$("style").value;
  const p=$("preview");
  const backgrounds={
    "Laut":"linear-gradient(145deg,#c9f4ff,#68c8e8 48%,#f9dd83)",
    "Sunflower Garden":"linear-gradient(145deg,#fff0a6,#f6c94d 48%,#9ddf8b)",
    "Hewan & Safari":"linear-gradient(145deg,#e9f4c8,#b8d77c 48%,#e8c47a)",
    "Luar Angkasa":"linear-gradient(145deg,#22255c,#4b3b8e 48%,#8d6fe0)"
  };
  p.style.background=backgrounds[selectedTheme[0]];
}
function addHistory(prompt,title){
  history.unshift({id:Date.now(),title,prompt});
  history=history.slice(0,12);localStorage.setItem("ss_history",JSON.stringify(history));renderHistory();
}
function renderHistory(){
  $("historyList").innerHTML=history.length?history.map(x=>savedItem(x,"history")).join(""):`<div class="empty">🕘 Belum ada riwayat prompt.</div>`;
}
function renderFavorites(){
  $("favoritesList").innerHTML=favorites.length?favorites.map(x=>savedItem(x,"favorite")).join(""):`<div class="empty">⭐ Belum ada prompt favorit.</div>`;
}
function savedItem(x,type){
  return `<article class="saved-item"><b>${escapeHtml(x.title)}</b><p>${escapeHtml(x.prompt)}</p>
  <div class="saved-actions"><button onclick="loadSaved(${x.id})">Buka</button><button onclick="deleteSaved(${x.id},'${type}')">Hapus</button></div></article>`;
}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function loadSaved(id){
  const x=[...favorites,...history].find(a=>a.id===id);if(!x)return;
  lastPrompt=x.prompt;$("promptOutput").textContent=x.prompt;$("status").textContent="Dimuat";showView("builder");showToast("Prompt dimuat");
}
function deleteSaved(id,type){
  if(type==="favorite")favorites=favorites.filter(x=>x.id!==id),localStorage.setItem("ss_favorites",JSON.stringify(favorites)),renderFavorites();
  else history=history.filter(x=>x.id!==id),localStorage.setItem("ss_history",JSON.stringify(history)),renderHistory();
}
function showView(name){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active-view"));
  $(name+"View").classList.add("active-view");
  document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.view===name));
  if(name==="templates")renderTemplateLibrary();
  if(name==="favorites")renderFavorites();
  if(name==="history")renderHistory();
}
document.querySelectorAll(".nav-item").forEach(n=>n.onclick=()=>showView(n.dataset.view));
$("generateBtn").onclick=generatePrompt;
["title","content","classLevel","style"].forEach(id=>$(id).addEventListener("input",updatePreview));
$("classLevel").onchange=updatePreview;$("style").onchange=updatePreview;
$("copyBtn").onclick=async()=>{
  if(!lastPrompt)generatePrompt();
  try{await navigator.clipboard.writeText($("promptOutput").textContent);showToast("✓ Prompt disalin");}
  catch(e){showToast("Pilih teks lalu salin manual");}
};
$("favoriteBtn").onclick=()=>{
  if(!lastPrompt)generatePrompt();
  const title=$("title").value.trim()||"Prompt Poster";
  if(!favorites.some(x=>x.prompt===lastPrompt)){favorites.unshift({id:Date.now(),title,prompt:lastPrompt});favorites=favorites.slice(0,20);localStorage.setItem("ss_favorites",JSON.stringify(favorites));$("favoriteBtn").textContent="★ FAVORIT";showToast("⭐ Ditambahkan ke favorit");}
  else showToast("Sudah ada di favorit");
};
$("downloadBtn").onclick=()=>{
  if(!lastPrompt)generatePrompt();
  const blob=new Blob([lastPrompt],{type:"text/plain;charset=utf-8"}),a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download="ShortStories-Prompt.txt";a.click();URL.revokeObjectURL(a.href);showToast("⬇ File TXT dibuat");
};
$("resetBtn").onclick=()=>{
  $("templateSelect").selectedIndex=0;$("classLevel").selectedIndex=1;$("semester").selectedIndex=0;
  $("title").value="JADWAL PELAJARAN";$("content").value="";$("extra").value="";
  document.querySelectorAll(".theme-card").forEach(x=>x.classList.remove("active"));document.querySelector(".theme-card").classList.add("active");selectedTheme=themes[0];
  $("style").selectedIndex=0;$("layout").selectedIndex=0;$("character").selectedIndex=0;$("fontStyle").selectedIndex=0;$("size").selectedIndex=0;$("resolution").selectedIndex=0;$("color").selectedIndex=0;$("border").selectedIndex=0;
  lastPrompt="";$("promptOutput").textContent="Pilih template dan isi data, lalu klik Generate Prompt.";$("status").textContent="Siap";updatePreview();showToast("Form direset");
};
$("templateSearch").oninput=renderTemplateLibrary;$("templateCategory").onchange=renderTemplateLibrary;
$("clearHistory").onclick=()=>{history=[];localStorage.removeItem("ss_history");renderHistory();showToast("Riwayat dihapus")};
$("darkModeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("ss_dark",document.body.classList.contains("dark")?"1":"0")};
if(localStorage.getItem("ss_dark")==="1")document.body.classList.add("dark");
$("menuBtn").onclick=()=>document.querySelector(".sidebar").classList.toggle("open");

initThemes();initTemplates();updatePreview();renderHistory();renderFavorites();
function showToast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>t.classList.remove("show"),2200)}
