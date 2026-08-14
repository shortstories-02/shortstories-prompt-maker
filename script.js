
const THEMES=[["Laut & Bawah Laut","🌊","Laut"],["Sunflower Garden","🌻","Taman"],["Hewan Safari","🦁","Hewan"],["Hewan Hutan","🐯","Hewan"],["Hewan Laut","🐳","Hewan"],["Hewan Peternakan","🐮","Hewan"],["Dinosaurus","🦖","Fantasi"],["Luar Angkasa","🚀","Fantasi"],["Galaksi Pastel","🪐","Fantasi"],["Pelangi","🌈","Fantasi"],["Unicorn","🦄","Fantasi"],["Putri & Kerajaan","👑","Fantasi"],["Taman Bunga","🌷","Alam"],["Hutan Tropis","🌴","Alam"],["Pegunungan","🏔️","Alam"],["Air Terjun","💦","Alam"],["Kebun Buah","🍎","Alam"],["Kebun Sayur","🥕","Alam"],["Taman Sekolah","🏫","Sekolah"],["Kelas Ceria","🎒","Sekolah"],["Perpustakaan","📚","Sekolah"],["Laboratorium Sains","🔬","Sekolah"],["Matematika","🔢","Edukasi"],["Bahasa Indonesia","✏️","Edukasi"],["IPAS","🌱","Edukasi"],["Seni Rupa","🎨","Edukasi"],["PJOK","⚽","Edukasi"],["Musik","🎵","Edukasi"],["Membaca","📖","Literasi"],["Menulis","🖊️","Literasi"],["Islami Ceria","☪️","Religi"],["Masjid & Ramadhan","🌙","Religi"],["Hewan Nusantara","🦧","Indonesia"],["Budaya Indonesia","🇮🇩","Indonesia"],["Gorontalo","🏠","Indonesia"],["Pahlawan Indonesia","🇮🇩","Indonesia"],["Kemerdekaan","🎈","Indonesia"],["Lingkungan Hijau","🌿","Lingkungan"],["Kebersihan","🧹","Lingkungan"],["Hemat Energi","💡","Lingkungan"],["Air Bersih","💧","Lingkungan"],["Keselamatan","🦺","Kehidupan"],["Kesehatan","❤️","Kehidupan"],["Emosi Positif","😊","Kehidupan"],["Persahabatan","🤝","Kehidupan"],["Robot & Teknologi","🤖","Teknologi"],["Coding Anak","💻","Teknologi"],["Transportasi","🚌","Kehidupan"],["Kota Mini","🏙️","Kehidupan"],["Kampung Ceria","🏡","Kehidupan"]];
const TEMPLATES=[["Jadwal Pelajaran","📚","Manajemen Kelas"],["Jadwal Piket Kelas","🧹","Manajemen Kelas"],["Struktur Organisasi Kelas","👥","Manajemen Kelas"],["Kesepakatan Kelas","🤝","Budaya & Karakter"],["Tata Tertib Kelas","📌","Budaya & Karakter"],["5 Kata Ajaib","💬","Budaya & Karakter"],["Budaya 7S","😊","Budaya & Karakter"],["Poster Kebersihan","🧼","Budaya & Karakter"],["Poster Disiplin","⏰","Budaya & Karakter"],["Poster Sopan Santun","🙇","Budaya & Karakter"],["Absensi Bulanan","🗓️","Administrasi"],["Daftar Piket","📋","Administrasi"],["Data Siswa","👧","Administrasi"],["Kalender Kelas","📅","Administrasi"],["Tata Surya","🪐","Edukasi"],["Bagian Tumbuhan","🌱","Edukasi"],["Siklus Air","💧","Edukasi"],["Perubahan Wujud Benda","🧊","Edukasi"],["Sistem Pernapasan","🫁","Edukasi"],["Panca Indera","👀","Edukasi"],["Energi dan Perubahannya","⚡","Edukasi"],["Gaya dan Gerak","🏃","Edukasi"],["Daur Hidup Hewan","🦋","Edukasi"],["Siklus Hidup Tumbuhan","🌻","Edukasi"],["Angka 1–20","🔢","Edukasi"],["Huruf A–Z","🔤","Edukasi"],["Kata Benda","📝","Edukasi"],["Kata Kerja","🏃","Edukasi"],["Motivasi Belajar","⭐","Motivasi"],["Aku Suka Membaca","📖","Motivasi"],["Berani Bertanya","🙋","Motivasi"],["Rajin Menabung","🐷","Motivasi"],["Aku Anak Hebat","🌟","Motivasi"],["Rukun Islam","☪️","Edukasi"],["Rukun Iman","📖","Edukasi"],["Doa Sehari-hari","🤲","Edukasi"],["Pakaian Adat Indonesia","👘","Edukasi"],["Rumah Adat Indonesia","🏠","Edukasi"],["Peta Indonesia","🇮🇩","Edukasi"],["Hewan dan Habitat","🐾","Edukasi"],["Makanan Sehat","🍎","Edukasi"],["5 Indera + Kesehatan","❤️","Edukasi"],["Poster Anti Bullying","🛡️","Budaya & Karakter"],["Kata Motivasi Harian","💡","Motivasi"],["Sudut Baca","📚","Literasi"]];
let selectedTheme=THEMES[0], lastPrompt="", favorites=JSON.parse(localStorage.getItem("ss_v3_fav")||"[]"), history=JSON.parse(localStorage.getItem("ss_v3_hist")||"[]");
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
    updatePreviewV3();
    toast("Template: "+t[0]);
  };
}
function templateStarter(name){
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
function initV3(){
  populateTemplateSelectV34();
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
function useTemplateV3(i){const t=TEMPLATES[i];if(!t)return;populateTemplateSelect();$("templateSelect").value=String(i);$("title").value=t[0].toUpperCase();$("title").dataset.v35Auto="1";$("content").value=templateStarter(t[0]);$("content").dataset.v35Auto="1";showView("builder");updatePreviewV3();toast("Template dipilih: "+t[0]);}
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
  const map={builder:"builderView",themes:"themesView",templates:"templatesView",favorites:"favoritesView",history:"historyView"};
  const el=$(map[v]||v+"View");
  if(el) el.classList.add("active-view");
  document.querySelectorAll("[data-view]").forEach(x=>x.classList.toggle("active",x.dataset.view===v));
  if(v==="themes" && typeof renderThemeLibrary==="function") renderThemeLibrary();
  if(v==="templates" && typeof renderTemplateLibraryV3==="function") renderTemplateLibraryV3();
  if((v==="favorites"||v==="history") && typeof renderSavedV3==="function") renderSavedV3();
  $("sidebar")?.classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
function bindEvents(){
  $("clearHistory")?.addEventListener("click",()=>{history=[];localStorage.removeItem("ss_v3_hist");renderSavedV3();toast("Riwayat dihapus")});
  $("generateBtn").onclick=generateV3;$("copyBtn").onclick=copyV3;$("favoriteBtn").onclick=favV3;$("downloadBtn").onclick=downloadV3;$("resetBtn").onclick=()=>location.reload();
  $("darkModeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("ss_v3_dark",document.body.classList.contains("dark")?"1":"0");};
  $("menuBtn").onclick=()=>$("sidebar").classList.toggle("open");
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
function updatePreviewV3(){
  $("previewTheme").textContent=selectedTheme[1];$("previewClass").textContent=$("classLevel").value.toUpperCase();$("previewTitle").textContent=$("title").value.trim()||"JUDUL POSTER";$("previewContent").textContent=$("content").value.trim()||"Isi poster akan tampil di sini.";$("previewStyle").textContent=$("style").value;
}
function addHistoryV3(title){history.unshift({id:Date.now(),title,prompt:lastPrompt});history=history.slice(0,20);localStorage.setItem("ss_v3_hist",JSON.stringify(history));renderSavedV3();}
async function copyV3(){if(!lastPrompt)generateV3();try{await navigator.clipboard.writeText($("promptOutput").textContent);toast("✓ Prompt disalin")}catch(e){toast("Salin manual dari kotak prompt")}}
function favV3(){if(!lastPrompt)generateV3();if(!favorites.some(x=>x.prompt===lastPrompt)){favorites.unshift({id:Date.now(),title:$("title").value||"Prompt Poster",prompt:lastPrompt});favorites=favorites.slice(0,30);localStorage.setItem("ss_v3_fav",JSON.stringify(favorites));toast("⭐ Ditambahkan ke favorit")}else toast("Sudah ada di favorit")}
function downloadV3(){if(!lastPrompt)generateV3();const b=new Blob([lastPrompt],{type:"text/plain;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="ShortStories-Prompt-V3.txt";a.click();URL.revokeObjectURL(a.href);toast("⬇ TXT dibuat")}
function renderSavedV3(){
  const fav=$("favoritesList"), hist=$("historyList");
  const card=(x,type)=>`<article class="saved-item"><b>${esc(type)} — ${esc(x.title)}</b><p>${esc(x.prompt)}</p><div class="saved-actions"><button onclick="loadV3(${x.id})">Buka</button><button onclick="delV3(${x.id},'${type.includes("Favorit")?"fav":"hist"}')">Hapus</button></div></article>`;
  if(fav)fav.innerHTML=favorites.length?favorites.map(x=>card(x,"⭐ Favorit")).join(""):`<div class="empty">⭐ Belum ada prompt favorit.</div>`;
  if(hist)hist.innerHTML=history.length?history.map(x=>card(x,"🕘 Riwayat")).join(""):`<div class="empty">🕘 Belum ada riwayat prompt.</div>`;
}
function loadV3(id){const x=[...favorites,...history].find(a=>a.id===id);if(!x)return;lastPrompt=x.prompt;$("promptOutput").textContent=x.prompt;$("status").textContent="Dimuat";showView("builder");toast("Prompt dimuat")}
function delV3(id,t){if(t==="fav"){favorites=favorites.filter(x=>x.id!==id);localStorage.setItem("ss_v3_fav",JSON.stringify(favorites))}else{history=history.filter(x=>x.id!==id);localStorage.setItem("ss_v3_hist",JSON.stringify(history))}renderSavedV3()}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),2200)}
initV3();
