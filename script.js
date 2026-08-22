
const THEMES=[["Laut & Bawah Laut","🌊","Laut"],["Sunflower Garden","🌻","Taman"],["Hewan Safari","🦁","Hewan"],["Hewan Hutan","🐯","Hewan"],["Hewan Laut","🐳","Hewan"],["Hewan Peternakan","🐮","Hewan"],["Dinosaurus","🦖","Fantasi"],["Luar Angkasa","🚀","Fantasi"],["Galaksi Pastel","🪐","Fantasi"],["Pelangi","🌈","Fantasi"],["Unicorn","🦄","Fantasi"],["Putri & Kerajaan","👑","Fantasi"],["Taman Bunga","🌷","Alam"],["Hutan Tropis","🌴","Alam"],["Pegunungan","🏔️","Alam"],["Air Terjun","💦","Alam"],["Kebun Buah","🍎","Alam"],["Kebun Sayur","🥕","Alam"],["Taman Sekolah","🏫","Sekolah"],["Kelas Ceria","🎒","Sekolah"],["Perpustakaan","📚","Sekolah"],["Laboratorium Sains","🔬","Sekolah"],["Matematika","🔢","Edukasi"],["Bahasa Indonesia","✏️","Edukasi"],["IPAS","🌱","Edukasi"],["Seni Rupa","🎨","Edukasi"],["PJOK","⚽","Edukasi"],["Musik","🎵","Edukasi"],["Membaca","📖","Literasi"],["Menulis","🖊️","Literasi"],["Islami Ceria","☪️","Religi"],["Masjid & Ramadhan","🌙","Religi"],["Hewan Nusantara","🦧","Indonesia"],["Budaya Indonesia","🇮🇩","Indonesia"],["Gorontalo","🏠","Indonesia"],["Pahlawan Indonesia","🇮🇩","Indonesia"],["Kemerdekaan","🎈","Indonesia"],["Lingkungan Hijau","🌿","Lingkungan"],["Kebersihan","🧹","Lingkungan"],["Hemat Energi","💡","Lingkungan"],["Air Bersih","💧","Lingkungan"],["Keselamatan","🦺","Kehidupan"],["Kesehatan","❤️","Kehidupan"],["Emosi Positif","😊","Kehidupan"],["Persahabatan","🤝","Kehidupan"],["Robot & Teknologi","🤖","Teknologi"],["Coding Anak","💻","Teknologi"],["Transportasi","🚌","Kehidupan"],["Kota Mini","🏙️","Kehidupan"],["Kampung Ceria","🏡","Kehidupan"]];
const TEMPLATES=[
["Jadwal Pelajaran","📚","Manajemen Kelas"],["Jadwal Piket Kelas","🧹","Manajemen Kelas"],["Struktur Organisasi Kelas","👥","Manajemen Kelas"],["Kesepakatan Kelas","🤝","Budaya & Karakter"],["Tata Tertib Kelas","📌","Budaya & Karakter"],["5 Kata Ajaib","💬","Budaya & Karakter"],["Budaya 7S","😊","Budaya & Karakter"],["Poster Kebersihan","🧼","Budaya & Karakter"],["Poster Disiplin","⏰","Budaya & Karakter"],["Poster Sopan Santun","🙇","Budaya & Karakter"],["Absensi Bulanan","🗓️","Administrasi"],["Daftar Piket","📋","Administrasi"],["Data Siswa","👧","Administrasi"],["Kalender Kelas","📅","Administrasi"],["Tata Surya","🪐","Edukasi"],["Bagian Tumbuhan","🌱","Edukasi"],["Siklus Air","💧","Edukasi"],["Perubahan Wujud Benda","🧊","Edukasi"],["Sistem Pernapasan","🫁","Edukasi"],["Panca Indera","👀","Edukasi"],["Energi dan Perubahannya","⚡","Edukasi"],["Gaya dan Gerak","🏃","Edukasi"],["Daur Hidup Hewan","🦋","Edukasi"],["Siklus Hidup Tumbuhan","🌻","Edukasi"],["Angka 1–20","🔢","Edukasi"],["Huruf A–Z","🔤","Edukasi"],["Kata Benda","📝","Edukasi"],["Kata Kerja","🏃","Edukasi"],["Motivasi Belajar","⭐","Motivasi"],["Aku Suka Membaca","📖","Motivasi"],["Berani Bertanya","🙋","Motivasi"],["Rajin Menabung","🐷","Motivasi"],["Aku Anak Hebat","🌟","Motivasi"],["Rukun Islam","☪️","Edukasi"],["Rukun Iman","📖","Edukasi"],["Doa Sehari-hari","🤲","Edukasi"],["Pakaian Adat Indonesia","👘","Edukasi"],["Rumah Adat Indonesia","🏠","Edukasi"],["Peta Indonesia","🇮🇩","Edukasi"],["Hewan dan Habitat","🐾","Edukasi"],["Makanan Sehat","🍎","Edukasi"],["5 Indera + Kesehatan","❤️","Edukasi"],["Poster Anti Bullying","🛡️","Budaya & Karakter"],["Kata Motivasi Harian","💡","Motivasi"],["Sudut Baca","📚","Literasi"],["Cover Portofolio Siswa","🐠","Portofolio"],["Selamat Datang di Kelas","🌊","Hiasan Kelas"]];
let selectedTheme=THEMES[0], lastPrompt="", favorites=[], history=[], savedUserId=null, savedReady=Promise.resolve();
const SAVED_TABLE="saved_prompts";
const $=id=>document.getElementById(id);
const esc=s=>(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

function populateTemplateSelect(){
  const sel=$("templateSelect");
  if(!sel)return;
  const current=sel.value;
  sel.innerHTML='<option value="" disabled>Pilih template poster...</option>'+TEMPLATES.map((t,i)=>`<option value="${i}">${t[1]} ${t[0]} — ${t[2]}</option>`).join("");
  if(current!=="" && TEMPLATES[+current]) sel.value=current; else sel.value="0";
  sel.onchange=()=>{
    const i=+sel.value, t=TEMPLATES[i];
    if(!t)return;
    $("title").value=t[0].toUpperCase();
    $("content").value=templateStarter(t[0]);
    applySpecialTemplateSettings(t[0]);
    updatePreviewV3();
    toast("Template: "+t[0]);
  };
}
function templateStarter(name){


  if(name==="Cover Portofolio Siswa"){
    return `PORTOFOLIO SISWA
KELAS: __________

Nama: ______________________________
NIS: _______________________________
Sekolah: ____________________________
Tahun Ajaran: ______________________`;
  }
  if(name==="Selamat Datang di Kelas"){
    return `SELAMAT DATANG
DI KELAS
KELAS: __________`;
  }

  const starters={
    "Jadwal Pelajaran":"SENIN\n- Mata Pelajaran 1\n- Mata Pelajaran 2\n- Mata Pelajaran 3\n\nSELASA\n- Mata Pelajaran 1\n- Mata Pelajaran 2\n- Mata Pelajaran 3",
    "Jadwal Piket Kelas":"SENIN\n- Nama 1\n- Nama 2\n- Nama 3\n\nSELASA\n- Nama 1\n- Nama 2\n- Nama 3",
    "Struktur Organisasi Kelas":"WALI KELAS: __________\nKETUA: __________\nWAKIL KETUA: __________\nBENDAHARA: __________\nSEKRETARIS: __________",
    "Kesepakatan Kelas":"1. Datang tepat waktu.\n2. Saling menghargai.\n3. Menjaga kebersihan.\n4. Bertanggung jawab.\n5. Belajar dengan semangat.",
    "5 Kata Ajaib":"TOLONG\nMAAF\nTERIMA KASIH\nPERMISI\nSILAKAN",
    "Budaya 7S":"SENYUM • SALAM • SAPA • SOPAN • SANTUN • SABAR • SYUKUR",
    "Rukun Islam":"1. Syahadat\n2. Salat\n3. Zakat\n4. Puasa\n5. Haji",
    "Rukun Iman":"1. Iman kepada Allah\n2. Malaikat\n3. Kitab\n4. Rasul\n5. Hari Akhir\n6. Qada dan Qadar"
  };
  return starters[name] || `${name}\n\n[Masukkan isi poster di sini]\n[Tambahkan data, daftar, langkah, atau informasi yang wajib ditampilkan]`;
}
async function initV3(){
  savedReady=loadSavedV3();
  await savedReady;
  populateTemplateSelectV34();
  bindSavedActionsV3();
  // Add theme library navigation/view.
  const nav=document.querySelector("nav");
  if(nav && !document.querySelector('[data-view="themes"]')){
    const b=document.createElement("button"); b.className="nav-item"; b.dataset.view="themes"; b.textContent="🎨 50+ Tema";
    nav.insertBefore(b,nav.children[1]);
  }
  const main=document.querySelector(".main");
  if(main && !document.getElementById("themesView")){
    const sec=document.createElement("section"); sec.id="themesView"; sec.className="view";
    sec.innerHTML=`<div class="page-head"><div><span class="eyebrow">THEME LIBRARY</span><h1>50+ Tema <span>Poster</span></h1><p>Pilih tema visual dan gunakan langsung di Prompt Builder.</p></div></div>
    <div class="template-toolbar"><input id="themeSearchV3" placeholder="🔎 Cari tema: laut, taman, hewan, islami, sains..."></div>
    <div id="themeLibraryV3" class="template-grid"></div>`;
    main.appendChild(sec);
  }
  // Inject advanced controls into the existing builder.
  const generate=$("generateBtn"), form=generate?.parentElement;
  if(form && !document.getElementById("v3Advanced")){
    const box=document.createElement("div"); box.id="v3Advanced"; box.className="v3-advanced simple-controls";
    box.innerHTML=`<div class="card-title second"><div><span>05</span><h2>Pengaturan Desain</h2></div></div>
    <p class="simple-help">Cukup atur 4 pilihan utama. Pengaturan teknis lainnya dibuat otomatis.</p>
    <div class="grid2">
      <div><label>Orientasi</label><select id="v3Orientation"><option>Portrait</option><option>Landscape</option></select></div>
      <div><label>Fokus Visual</label><select id="v3Focus"><option>Seimbang: teks + ilustrasi</option><option>Teks & keterbacaan</option><option>Ilustrasi lebih dominan</option><option>Tabel/informasi</option></select></div>
    </div>
    <div class="grid2">
      <div><label>Detail Desain</label><select id="v3Detail"><option>Premium & sangat detail</option><option>Clean & sederhana</option><option>High detail</option></select></div>
      <div><label>Hasil</label><select id="v3Output"><option>Siap cetak profesional</option><option>Digital HD</option><option>Print + Digital</option></select></div>
    </div>
    <input type="hidden" id="v3Space" value="Cukup untuk bernapas">
    <input type="hidden" id="v3Safe" value="Margin aman 5%">
    <input type="hidden" id="v3Decor" value="">
    <div class="simple-guard">
      <label><input type="checkbox" id="v3TextLock" checked> Pertahankan teks persis</label>
      <label><input type="checkbox" id="v3NoWatermark" checked> Tanpa watermark</label>
      <label><input type="checkbox" id="v3NoCrop" checked> Jangan crop</label>
    </div>`;
    form.insertBefore(box,generate);
  }
  // Expand theme picker with popular themes only to keep builder compact.
  populateTemplateSelectV34();
  renderThemePicker();
  renderThemeLibrary();
  renderTemplateLibraryV3();
  bindNav();
  bindEvents();
  updatePreviewV3();
  renderSavedV3();
  if(localStorage.getItem("ss_v3_dark")==="1")document.body.classList.add("dark");
}
function renderThemePicker(){
  const g=$("themeGrid"); if(!g)return;
  g.innerHTML=THEMES.slice(0,12).map((t,i)=>`<button class="theme-card ${i===0?"active":""}" data-v3theme="${i}" type="button"><span>${t[1]}</span><b>${t[0]}</b><small>${t[2]}</small></button>`).join("");
  g.insertAdjacentHTML("afterend",`<button class="more-themes" id="moreThemesBtn">🎨 Lihat 50+ Tema</button>`);
  g.querySelectorAll(".theme-card").forEach(b=>b.onclick=()=>selectTheme(+b.dataset.v3theme));
  $("moreThemesBtn").onclick=()=>showView("themes");
}
function selectTheme(i){selectedTheme=THEMES[i];document.querySelectorAll("[data-v3theme]").forEach(x=>x.classList.remove("active"));const b=document.querySelector(`[data-v3theme="${i}"]`);if(b)b.classList.add("active");updatePreviewV3();toast("Tema: "+selectedTheme[0]);}
function renderThemeLibrary(){
  const wrap=$("themeLibraryV3"); if(!wrap)return;
  const q=($("themeSearchV3")?.value||"").toLowerCase();
  wrap.innerHTML=THEMES.filter(t=>(t[0]+" "+t[2]).toLowerCase().includes(q)).map((t,i)=>`<article class="template-item"><div class="template-icon">${t[1]}</div><h3>${t[0]}</h3><p>Kategori: ${t[2]}. Tema visual lengkap dan ramah anak untuk poster SD.</p><div class="template-meta"><span class="category">${t[2]}</span><button class="use-template" onclick="useThemeV3(${i})">Gunakan →</button></div></article>`).join("");
}
function useThemeV3(i){selectTheme(i);showView("builder");}


function applySpecialTemplateSettings(name){
  if(name==="Cover Portofolio Siswa" || name==="Selamat Datang di Kelas"){
    const oceanIndex=THEMES.findIndex(t=>t[0]==="Laut & Bawah Laut");
    if(oceanIndex>=0) selectTheme(oceanIndex);
    const set=(id,val)=>{const el=$(id); if(el) el.value=val;};
    set("style","3D Cartoon Premium");
    set("character", name==="Cover Portofolio Siswa" ? "Hewan maskot lucu" : "Anak SD laki-laki dan perempuan");
    set("fontStyle","Bold, bulat, ramah anak");
    set("color","Cerah, ceria, dan penuh warna");
    set("layout","Ilustrasi penuh dengan panel informasi");
    set("border","Dekoratif sesuai tema");
    set("size","A4 Portrait — 21 × 29,7 cm");
    set("resolution","300 DPI — siap cetak");
    set("v3Orientation","Portrait");
    set("v3Focus","Seimbang: teks + ilustrasi");
    set("v3Detail","Premium & sangat detail");
    set("v3Output","Siap cetak profesional");
    // Permintaan Tambahan sengaja dikosongkan untuk kedua template referensi.

  }
}

function populateTemplateSelectV34(){
  const sel=document.getElementById("templateSelect");
  if(!sel) return;
  const current=sel.value;
  sel.innerHTML='<option value="" disabled>Pilih template poster...</option>'+
    TEMPLATES.map((t,i)=>`<option value="${i}">${t[1]} ${t[0]} — ${t[2]}</option>`).join("");
  if(current!=="" && TEMPLATES[+current]) sel.value=current;
  else sel.value="0";
  // Make the selected template actually drive the form.
  sel.onchange=()=>{
    const i=+sel.value;
    const t=TEMPLATES[i];
    if(!t) return;
    const title=document.getElementById("title");
    const content=document.getElementById("content");
    if(title){
      title.value=t[0].toUpperCase();
      title.dataset.v35Auto="1";
    }
    if(content){
      content.value=templateStarter(t[0]);
      content.dataset.v35Auto="1";
    }
    applySpecialTemplateSettings(t[0]);
    if(typeof updatePreviewV3==="function") updatePreviewV3();
    if(typeof toast==="function") toast("Template dipilih: "+t[0]);
  };
  const titleField=document.getElementById("title");
  const contentField=document.getElementById("content");
  if(titleField && !titleField.dataset.v35Bound){
    titleField.addEventListener("input",()=>{ titleField.dataset.v35UserEdited="1"; });
    titleField.dataset.v35Bound="1";
  }
  if(contentField && !contentField.dataset.v35Bound){
    contentField.addEventListener("input",()=>{ contentField.dataset.v35UserEdited="1"; });
    contentField.dataset.v35Bound="1";
  }
}

function renderTemplateLibraryV3(){
  const s=$("templateGrid"); if(!s)return;
  const q=($("templateSearch")?.value||"").toLowerCase();
  const cat=$("templateCategory")?.value||"Semua Kategori";
  const items=TEMPLATES.map((t,i)=>({t,i})).filter(({t})=>(!q||(t[0]+" "+t[2]).toLowerCase().includes(q))&&(cat==="Semua Kategori"||t[2]===cat||cat==="Karakter & Budaya"&&t[2]==="Budaya & Karakter"));
  s.innerHTML=items.length?items.map(({t,i})=>`<article class="template-item"><div class="template-icon">${t[1]}</div><h3>${t[0]}</h3><p>Preset ${t[2]} untuk kebutuhan kelas SD.</p><div class="template-meta"><span class="category">${t[2]}</span><button class="use-template" onclick="useTemplateV3(${i})">Gunakan →</button></div></article>`).join(""):`<div class="empty">Template tidak ditemukan.</div>`;
}
function useTemplateV3(i){const t=TEMPLATES[i];if(!t)return;populateTemplateSelect();$("templateSelect").value=String(i);$("title").value=t[0].toUpperCase();$("title").dataset.v35Auto="1";$("content").value=templateStarter(t[0]);$("content").dataset.v35Auto="1";applySpecialTemplateSettings(t[0]);showView("builder");updatePreviewV3();toast("Template dipilih: "+t[0]);}
function bindNav(){
  document.querySelectorAll(".nav-item, .nav").forEach(b=>{
    b.onclick=()=>{
      const view=b.dataset.view;
      if(!view) return;
      showView(view);
    };
  });
}
function showView(v){
  document.querySelectorAll(".view").forEach(x=>x.classList.remove("active-view"));
  const map={builder:"builderView",themes:"themesView",templates:"templatesView",favorites:"favoritesView",history:"historyView",admin:"adminView"};
  const el=$(map[v]||v+"View");
  if(el) el.classList.add("active-view");

  // Persist the active section so a browser refresh keeps the exact same
  // screen. This is deliberately separate from login behavior.
  if(map[v]){
    try{ localStorage.setItem("shortstories:last-view", v); }catch(_){}
    window.__ssCurrentView = v;
  }

  document.querySelectorAll("[data-view]").forEach(x=>x.classList.toggle("active",x.dataset.view===v));
  if(v==="themes" && typeof renderThemeLibrary==="function") renderThemeLibrary();
  if(v==="templates" && typeof renderTemplateLibraryV3==="function") renderTemplateLibraryV3();
  if((v==="favorites"||v==="history") && typeof renderSavedV3==="function") renderSavedV3();
  $("sidebar")?.classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
function bindEvents(){
  $("clearHistory")?.addEventListener("click",()=>{void clearHistoryV3()});
  $("generateBtn").onclick=generateV3;$("copyBtn").onclick=copyV3;$("favoriteBtn").onclick=favV3;$("downloadBtn").onclick=downloadV3;$("resetBtn").onclick=()=>location.reload();
  $("darkModeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("ss_v3_dark",document.body.classList.contains("dark")?"1":"0");};
  $("menuBtn").onclick=(e)=>{e.stopPropagation();$("sidebar").classList.toggle("open");};
  document.addEventListener("click",(e)=>{
    const sidebar=$("sidebar"), menuBtn=$("menuBtn");
    if(!sidebar?.classList.contains("open")) return;
    if(sidebar.contains(e.target) || menuBtn?.contains(e.target)) return;
    sidebar.classList.remove("open");
  });
  document.addEventListener("keydown",(e)=>{
    if(e.key==="Escape") $("sidebar")?.classList.remove("open");
  });
  ["title","content","classLevel","style"].forEach(id=>$(id)?.addEventListener("input",updatePreviewV3));
  ["classLevel","style"].forEach(id=>$(id)?.addEventListener("change",updatePreviewV3));
  $("themeSearchV3")?.addEventListener("input",renderThemeLibrary);
  $("templateSearch")?.addEventListener("input",renderTemplateLibraryV3);
  $("templateCategory")?.addEventListener("change",renderTemplateLibraryV3);
  setupReferenceUploadV36();
}


let referenceImageData = "";
let referenceImageName = "";

function setupReferenceUploadV36(){
  const input=$("referenceImage"), preview=$("referencePreview"), thumb=$("referenceThumb");
  const nameEl=$("referenceName"), sizeEl=$("referenceSize"), remove=$("removeReference");
  if(!input) return;
  input.addEventListener("change",()=>{
    const file=input.files?.[0];
    if(!file) return;
    if(file.size>10*1024*1024){
      input.value="";
      toast("⚠️ Foto terlalu besar. Maksimal 10 MB.");
      return;
    }
    if(!/^image\/(png|jpeg|webp)$/.test(file.type)){
      input.value="";
      toast("⚠️ Gunakan JPG, PNG, atau WEBP.");
      return;
    }
    const reader=new FileReader();
    reader.onload=()=>{
      referenceImageData=reader.result;
      referenceImageName=file.name;
      if(thumb) thumb.src=referenceImageData;
      if(nameEl) nameEl.textContent=file.name;
      if(sizeEl) sizeEl.textContent=formatFileSize(file.size);
      if(preview) preview.hidden=false;
      toast("✓ Foto referensi ditambahkan");
    };
    reader.readAsDataURL(file);
  });
  remove?.addEventListener("click",()=>{
    referenceImageData="";
    referenceImageName="";
    input.value="";
    if(preview) preview.hidden=true;
    if(thumb) thumb.removeAttribute("src");
    toast("Referensi dihapus");
  });
}
function formatFileSize(bytes){
  if(bytes<1024*1024) return Math.round(bytes/1024)+" KB";
  return (bytes/(1024*1024)).toFixed(1)+" MB";
}

function selectedDecor(){return [...document.querySelectorAll("#v3Decor input:checked")].map(x=>x.value).join(", ")||"minimal sesuai tema";}
function generateV3(){
  const ti=Math.min(+$("templateSelect").value,TEMPLATES.length-1),t=TEMPLATES[ti];
  const title=$("title").value.trim()||t[0].toUpperCase(),content=$("content").value.trim()||"[ISI POSTER]";
  const checks=[];
  if($("v3TextLock")?.checked)checks.push("pertahankan semua teks persis seperti input");
  if($("v3NoWatermark")?.checked)checks.push("tanpa watermark atau logo yang tidak diminta");
  if($("v3NoCrop")?.checked)checks.push("jangan crop, stretch, atau memotong elemen");
  if($("v3PrintSafe")?.checked)checks.push("siap cetak");
  if($("v3Balanced")?.checked)checks.push("komposisi seimbang");
  if($("v3Child")?.checked)checks.push("ramah anak");
  lastPrompt=`Buat desain poster pendidikan Sekolah Dasar (SD) berjudul "${title}".

JENIS POSTER:
${t[0]} — kategori ${t[2]}.

TARGET:
${$("classLevel").value}, ${$("semester").value}.

KONSEP VISUAL:
Gunakan tema "${selectedTheme[0]}" dengan nuansa ${selectedTheme[2]}.
Ilustrasikan elemen yang relevan dengan tema secara lucu, premium, harmonis, dan tidak mengganggu teks.
Gaya: ${$("style").value}.
Karakter: ${$("character").value}.
Tipografi: ${$("fontStyle").value}.
Warna: ${$("color").value}.
Elemen dekoratif: ${selectedDecor()}.

KOMPOSISI:
- Layout: ${$("layout").value}
- Fokus: ${$("v3Focus").value}
- Ruang kosong: ${$("v3Space").value}
- Orientasi: ${$("v3Orientation").value}
- Border: ${$("border").value}
- Safe area: ${$("v3Safe").value}

SPESIFIKASI:
- Ukuran: ${$("size").value}
- Resolusi: ${$("resolution").value}
- Detail: ${$("v3Detail").value}
- Output: ${$("v3Output").value}
- High quality, sharp, clean, professional, print-ready.

REFERENSI FOTO DESAIN:
${referenceImageData
?`Gunakan foto referensi yang dilampirkan bersama prompt ini sebagai acuan visual utama. Pertahankan karakteristik komposisi, pembagian area, hierarki visual, gaya dekorasi, proporsi elemen, dan nuansa keseluruhan dari referensi, tetapi buat desain baru yang orisinal. Jangan menyalin teks, logo, watermark, nama, atau identitas dari foto referensi kecuali diminta secara eksplisit. Sesuaikan referensi dengan tema, ukuran, kelas, dan isi poster yang saya berikan.`
:"Tidak ada foto referensi yang dilampirkan."}

TEKS / ISI WAJIB DITAMPILKAN:
${content}

${$("extra").value.trim()?`INSTRUKSI TAMBAHAN:\n${$("extra").value.trim()}\n`:""}
TEXT GUARD:
- ${checks.join("\n- ")}
- Jangan mengubah nama, angka, jadwal, ejaan, tanda baca, atau urutan.
- Jangan membuat teks acak/gibberish.
- Jangan menutup teks dengan dekorasi.
- Pastikan semua teks terbaca jelas.
- Pastikan semua elemen berada di dalam kanvas.

NEGATIVE PROMPT:
teks acak, gibberish, typo, huruf tidak terbaca, teks terpotong, informasi hilang, nama berubah, angka berubah, layout berantakan, objek keluar kanvas, crop, stretch, blur, noise, watermark, logo tidak diminta, border terlalu tebal, warna kusam, karakter cacat, proporsi aneh, tangan atau jari tidak proporsional, elemen terlalu padat, low resolution, artefak.

HASIL AKHIR:
Poster SD yang ceria, profesional, premium, sangat detail, mudah dibaca dari jarak jauh, konsisten dengan tema, seimbang antara ilustrasi dan informasi, dan siap digunakan sebagai dekorasi kelas.`;
  $("promptOutput").textContent=lastPrompt;$("status").textContent="Berhasil dibuat";updatePreviewV3();addHistoryV3(title);toast("✓ Prompt V3 berhasil dibuat");
}
function resetGeneratedProjectV3(){
  // Clear only the current working project. Saved history/favorites are
  // intentionally untouched because they belong to the authenticated user.
  lastPrompt="";
  selectedTheme=THEMES[0];
  referenceImageData="";
  referenceImageName="";

  const defaults={
    templateSelect:"0",
    classLevel:"Kelas 1 SD",
    semester:"Semester 1",
    title:"JADWAL PELAJARAN",
    content:"",
    extra:"",
    style:"3D Cartoon Premium",
    layout:"Poster vertikal terstruktur",
    character:"Anak SD ceria",
    fontStyle:"Bold, bulat, ramah anak",
    size:"A4 Portrait — 21 × 29,7 cm",
    resolution:"300 DPI — siap cetak",
    color:"Cerah, ceria, dan penuh warna",
    border:"Tipis dan elegan",
    v3Orientation:"Portrait",
    v3Focus:"Seimbang: teks + ilustrasi",
    v3Detail:"Premium & sangat detail",
    v3Output:"Siap cetak profesional"
  };

  Object.entries(defaults).forEach(([id,value])=>{
    const el=$(id);
    if(!el) return;
    el.value=value;
    el.dispatchEvent(new Event(el.tagName==="SELECT"?"change":"input",{bubbles:true}));
  });

  ["v3TextLock","v3NoWatermark","v3NoCrop"].forEach(id=>{
    const el=$(id);
    if(el) el.checked=true;
  });

  ["title","content"].forEach(id=>{
    const el=$(id);
    if(el){
      delete el.dataset.v35UserEdited;
      delete el.dataset.v35Auto;
    }
  });

  const refInput=$("referenceImage");
  if(refInput) refInput.value="";
  const refPreview=$("referencePreview");
  if(refPreview) refPreview.hidden=true;
  const refThumb=$("referenceThumb");
  if(refThumb) refThumb.removeAttribute("src");
  const refName=$("referenceName");
  if(refName) refName.textContent="Referensi desain";
  const refSize=$("referenceSize");
  if(refSize) refSize.textContent="";

  const output=$("promptOutput");
  if(output) output.textContent="Pilih template dan isi data, lalu klik Generate Prompt.";
  const status=$("status");
  if(status) status.textContent="Belum ada prompt";

  document.querySelectorAll("[data-v3theme]").forEach(x=>x.classList.remove("active"));
  const firstTheme=document.querySelector('[data-v3theme="0"]');
  if(firstTheme) firstTheme.classList.add("active");
  updatePreviewV3();
}

function updatePreviewV3(){
  $("previewTheme").textContent=selectedTheme[1];$("previewClass").textContent=$("classLevel").value.toUpperCase();$("previewTitle").textContent=$("title").value.trim()||"JUDUL POSTER";$("previewContent").textContent=$("content").value.trim()||"Isi poster akan tampil di sini.";$("previewStyle").textContent=$("style").value;
}
async function getSavedContextV3(){
  const getClient=window.getShortStoriesSupabase;
  if(typeof getClient!=="function") throw new Error("Koneksi akun belum siap.");
  const client=getClient();
  if(!client) throw new Error("Koneksi Supabase belum siap.");
  const {data:{user},error}=await client.auth.getUser();
  if(error) throw error;
  if(!user?.id) throw new Error("Sesi pengguna tidak ditemukan.");
  return {client,user};
}

async function loadSavedV3(){
  try{
    const {client,user}=await getSavedContextV3();
    savedUserId=user.id;
    const {data,error}=await client
      .from(SAVED_TABLE)
      .select("id,kind,title,prompt,created_at")
      .eq("user_id",user.id)
      .order("created_at",{ascending:false});
    if(error) throw error;
    const rows=Array.isArray(data)?data:[];
    history=rows.filter(x=>x.kind==="history").slice(0,20);
    favorites=rows.filter(x=>x.kind==="favorite").slice(0,30);
    // Remove legacy global browser storage so an older browser cache cannot
    // leak another account's saved prompts into the new account-scoped UI.
    try{ localStorage.removeItem("ss_v3_hist"); localStorage.removeItem("ss_v3_fav"); }catch(_){ }
    renderSavedV3();
  }catch(error){
    savedUserId=null;
    history=[];
    favorites=[];
    renderSavedV3();
    console.error("Gagal memuat riwayat/favorit:",error);
    toast("Riwayat & favorit belum dapat dimuat");
  }
}

async function addHistoryV3(title){
  try{
    await savedReady;
    const {client,user}=await getSavedContextV3();
    if(savedUserId!==user.id){
      await loadSavedV3();
      if(savedUserId!==user.id) throw new Error("Sesi pengguna berubah.");
    }
    const {data,error}=await client
      .from(SAVED_TABLE)
      .insert({user_id:user.id,kind:"history",title:title||"Prompt Poster",prompt:lastPrompt})
      .select("id,kind,title,prompt,created_at")
      .single();
    if(error) throw error;
    history.unshift(data);
    const overflow=history.slice(20);
    history=history.slice(0,20);
    if(overflow.length){
      const ids=overflow.map(x=>x.id);
      await client.from(SAVED_TABLE).delete().in("id",ids).eq("user_id",user.id).eq("kind","history");
      history=history.slice(0,20);
    }
    renderSavedV3();
  }catch(error){
    console.error("Gagal menyimpan riwayat:",error);
    toast("Riwayat gagal disimpan");
  }
}

async function copyV3(){if(!lastPrompt)generateV3();try{await navigator.clipboard.writeText($("promptOutput").textContent);toast("✓ Prompt disalin")}catch(e){toast("Salin manual dari kotak prompt")}}

async function favV3(){
  if(!lastPrompt)generateV3();
  try{
    await savedReady;
    const {client,user}=await getSavedContextV3();
    if(savedUserId!==user.id){
      await loadSavedV3();
      if(savedUserId!==user.id) throw new Error("Sesi pengguna berubah.");
    }
    if(favorites.some(x=>x.prompt===lastPrompt)){
      toast("Sudah ada di favorit");
      return;
    }
    const {data,error}=await client
      .from(SAVED_TABLE)
      .insert({user_id:user.id,kind:"favorite",title:$("title").value||"Prompt Poster",prompt:lastPrompt})
      .select("id,kind,title,prompt,created_at")
      .single();
    if(error) throw error;
    favorites.unshift(data);
    if(favorites.length>30){
      const overflow=favorites.slice(30);
      const ids=overflow.map(x=>x.id);
      await client.from(SAVED_TABLE).delete().in("id",ids).eq("user_id",user.id).eq("kind","favorite");
      favorites=favorites.slice(0,30);
    }
    renderSavedV3();
    toast("⭐ Ditambahkan ke favorit");
  }catch(error){
    console.error("Gagal menyimpan favorit:",error);
    toast("Favorit gagal disimpan");
  }
}

function downloadV3(){if(!lastPrompt)generateV3();const b=new Blob([lastPrompt],{type:"text/plain;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="ShortStories-Prompt-V3.txt";a.click();URL.revokeObjectURL(a.href);toast("⬇ TXT dibuat")}

function renderSavedV3(){
  const fav=$("favoritesList"), hist=$("historyList");
  const card=(x,type)=>`<article class="saved-item" data-saved-id="${esc(x.id)}" data-saved-kind="${type}"><b>${esc(type==="favorite"?"⭐ Favorit":"🕘 Riwayat")} — ${esc(x.title)}</b><p>${esc(x.prompt)}</p><div class="saved-actions"><button type="button" data-saved-action="load">Buka</button><button type="button" data-saved-action="delete">Hapus</button></div></article>`;
  if(fav)fav.innerHTML=favorites.length?favorites.map(x=>card(x,"favorite")).join(""):`<div class="empty">⭐ Belum ada prompt favorit.</div>`;
  if(hist)hist.innerHTML=history.length?history.map(x=>card(x,"history")).join(""):`<div class="empty">🕘 Belum ada riwayat prompt.</div>`;
}

async function loadV3(id,kind){
  const list=kind==="favorite"?favorites:history;
  const x=list.find(a=>String(a.id)===String(id));
  if(!x)return;
  lastPrompt=x.prompt;
  $("promptOutput").textContent=x.prompt;
  $("status").textContent="Dimuat";
  showView("builder");
  toast("Prompt dimuat");
}

async function delV3(id,t){
  try{
    await savedReady;
    const {client,user}=await getSavedContextV3();
    if(savedUserId!==user.id) throw new Error("Sesi pengguna berubah.");
    const kind=t==="fav"?"favorite":"history";
    const {error}=await client.from(SAVED_TABLE).delete().eq("id",id).eq("user_id",user.id).eq("kind",kind);
    if(error) throw error;
    if(kind==="favorite") favorites=favorites.filter(x=>String(x.id)!==String(id));
    else history=history.filter(x=>String(x.id)!==String(id));
    renderSavedV3();
  }catch(error){
    console.error("Gagal menghapus simpanan:",error);
    toast("Data gagal dihapus");
  }
}

async function clearHistoryV3(){
  try{
    await savedReady;
    const {client,user}=await getSavedContextV3();
    if(savedUserId!==user.id) throw new Error("Sesi pengguna berubah.");
    const {error}=await client.from(SAVED_TABLE).delete().eq("user_id",user.id).eq("kind","history");
    if(error) throw error;
    history=[];
    renderSavedV3();
    toast("Riwayat dihapus");
  }catch(error){
    console.error("Gagal menghapus riwayat:",error);
    toast("Riwayat gagal dihapus");
  }
}

function bindSavedActionsV3(){
  [$("favoritesList"),$("historyList")].forEach(list=>{
    if(!list || list.dataset.savedBound==="1")return;
    list.dataset.savedBound="1";
    list.addEventListener("click",e=>{
      const btn=e.target.closest("button[data-saved-action]");
      const card=btn?.closest("[data-saved-id]");
      if(!btn || !card)return;
      const id=card.dataset.savedId;
      const kind=card.dataset.savedKind;
      if(btn.dataset.savedAction==="load") void loadV3(id,kind);
      else void delV3(id,kind==="favorite"?"fav":"hist");
    });
  });
}

function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),2200)}
window.ssShowView = showView;
window.getShortStoriesView = function(){
  if(window.__ssCurrentView) return window.__ssCurrentView;
  try{ return localStorage.getItem("shortstories:last-view") || "builder"; }catch(_){ return "builder"; }
};
window.restoreShortStoriesView = function(){
  const v = window.getShortStoriesView();
  if(v && typeof showView === "function") showView(v);
};
window.startShortStoriesApp = initV3;
window.refreshShortStoriesSaved = function(){ savedReady=loadSavedV3(); return savedReady; };
window.resetShortStoriesProject = resetGeneratedProjectV3;
