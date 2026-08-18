/* ShortStories Admin Panel */
(function(){
  const SUPABASE_URL = 'https://ppxckqbpuetulzmvusvg.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_SwFAWF-QDsohAaB3jkjWqw_xgNnT_Km';
  const $ = id => document.getElementById(id);

  function msg(text,error=false){
    const el=$('adminMessage'); if(!el)return;
    el.textContent=text; el.className='admin-message show'+(error?' error':'');
  }

  async function getClient(){
    if(!window.supabase?.createClient) throw new Error('Library Supabase belum termuat.');
    return window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });
  }

  async function invoke(action, extra={}){
    const c=await getClient();
    const {data:{session}}=await c.auth.getSession();
    if(!session) throw new Error('Sesi admin tidak ditemukan. Silakan login kembali.');
    const {data,error}=await c.functions.invoke('admin-customers',{body:{action,...extra}});
    if(error) throw error;
    if(data?.error) throw new Error(data.error);
    return data;
  }

  function esc(s){
    return (s||'').toString().replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }

  function formatDate(v){
    if(!v) return 'Selamanya';
    const d=new Date(v);
    return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'});
  }

  function durationLabel(v){
    if(!v) return 'Selamanya';
    const d=new Date(v);
    if(Number.isNaN(d.getTime())) return '-';
    const diff=d.getTime()-Date.now();
    if(diff<=0) return 'Expired';
    const days=Math.ceil(diff/86400000);
    return `${days} hari lagi`;
  }

  function renderCustomers(customers){
    const box=$('customerList');
    if(!box)return;
    if(!customers.length){
      box.innerHTML='<div class="empty">Belum ada pelanggan.</div>';
      return;
    }
    box.innerHTML=customers.map(c=>{
      const inactive=c.status!=='active';
      return `<article class="customer-item">
        <div class="customer-main">
          <div><b>${esc(c.nama||'Tanpa nama')}</b><small>${esc(c.email)}</small></div>
          <span class="customer-status ${inactive?'inactive':''}">${inactive?'INACTIVE':(c.expires_at&&new Date(c.expires_at)<=new Date()?'EXPIRED':'ACTIVE')}</span>
        </div>
        <div class="customer-meta"><span>Masa aktif: <b>${durationLabel(c.expires_at)}</b></span><span>Berakhir: <b>${formatDate(c.expires_at)}</b></span></div>
        <div class="customer-actions">
          <button data-action="extend" data-id="${c.id}" data-days="7">+7 Hari</button>
          <button data-action="extend" data-id="${c.id}" data-days="30">+30 Hari</button>
          <button data-action="extend" data-id="${c.id}" data-days="90">+90 Hari</button>
          <button data-action="extend" data-id="${c.id}" data-days="365">+1 Tahun</button>
          <button data-action="forever" data-id="${c.id}">Selamanya</button>
          <button data-action="toggle" data-id="${c.id}" data-status="${inactive?'active':'inactive'}">${inactive?'Aktifkan':'Nonaktifkan'}</button>
          <button data-action="password" data-id="${c.id}">Reset Password</button>
          <button class="danger" data-action="delete" data-id="${c.id}">Hapus</button>
        </div>
      </article>`;
    }).join('');
  }

  async function loadCustomers(){
    const box=$('customerList');
    if(box) box.innerHTML='<div class="empty">Memuat pelanggan...</div>';
    try{
      const data=await invoke('list');
      renderCustomers(data.customers||[]);
    }catch(e){
      if(box) box.innerHTML=`<div class="empty">Gagal memuat: ${esc(e?.message||'Terjadi kesalahan.')}</div>`;
    }
  }

  async function createCustomer(e){
    e.preventDefault();
    const btn=$('createCustomerBtn');
    const name=$('customerName').value.trim();
    const email=$('customerEmail').value.trim();
    const password=$('customerPassword').value;
    const duration=$('customerDuration').value;
    if(!name||!email||password.length<6){msg('Nama, email, dan password minimal 6 karakter wajib diisi.',true);return;}
    btn.disabled=true; msg('Membuat akun pelanggan...');
    try{
      const c=await getClient();
      const {data:{session}}=await c.auth.getSession();
      if(!session) throw new Error('Sesi admin tidak ditemukan. Silakan login kembali.');
      const {data,error}=await c.functions.invoke('create-customer',{body:{nama:name,email,password,duration}});
      if(error) throw error;
      if(data?.error) throw new Error(data.error);
      const account=data?.customer;
      if(!account) throw new Error('Backend tidak mengembalikan data akun.');
      $('createdAccount').className='created-account';
      $('createdAccount').innerHTML=
        `<div class="account-row"><span>Nama</span><b>${esc(name)}</b></div>`+
        `<div class="account-row"><span>Email</span><b>${esc(email)}</b></div>`+
        `<div class="account-row"><span>Password</span><b>${esc(password)}</b></div>`+
        `<div class="account-row"><span>Role</span><b>customer</b></div>`+
        `<div class="account-row"><span>Masa aktif</span><b>${esc(duration==='forever'?'Selamanya':duration+' hari')}</b></div>`+
        `<div class="account-row"><span>Berakhir</span><b>${formatDate(account.expires_at)}</b></div>`+
        `<button class="copy-account" id="copyCreatedAccount">📋 COPY DATA AKUN</button>`;
      $('copyCreatedAccount').onclick=async()=>{
        const text=`AKUN SHORTSTORIES\nNama: ${name}\nEmail: ${email}\nPassword: ${password}\nMasa aktif: ${duration==='forever'?'Selamanya':duration+' hari'}\nWebsite: ShortStories Prompt Maker`;
        try{await navigator.clipboard.writeText(text);msg('Data akun berhasil disalin.');}catch(_){msg('Salin manual data akun di panel.',false);}
      };
      msg('✓ Akun pelanggan berhasil dibuat.');
      $('customerForm').reset();
      loadCustomers();
    }catch(err){console.error(err);msg('Gagal membuat akun: '+(err?.message||'Terjadi kesalahan.'),true);}
    finally{btn.disabled=false;}
  }

  async function customerAction(action,id,extra={}){
    try{
      if(action==='delete' && !confirm('Hapus akun pelanggan ini? Tindakan ini tidak dapat dibatalkan.')) return;
      if(action==='password'){
        const p=prompt('Masukkan password baru (minimal 6 karakter):');
        if(p===null)return;
        if(p.length<6){alert('Password minimal 6 karakter.');return;}
        extra.password=p;
      }
      const data=await invoke(action,{id,...extra});
      msg('✓ Perubahan berhasil.');
      if(action==='password') alert('Password pelanggan berhasil diubah.');
      if(action==='delete') alert('Akun pelanggan berhasil dihapus.');
      loadCustomers();
      return data;
    }catch(e){msg('Gagal: '+(e?.message||'Terjadi kesalahan.'),true);}
  }

  window.addEventListener('DOMContentLoaded',()=>{
    $('customerForm')?.addEventListener('submit',createCustomer);
    $('refreshCustomers')?.addEventListener('click',loadCustomers);
    $('customerList')?.addEventListener('click',e=>{
      const b=e.target.closest('button[data-action]');
      if(!b)return;
      const a=b.dataset.action,id=b.dataset.id;
      if(a==='extend') customerAction('extend',id,{days:b.dataset.days});
      else if(a==='forever') customerAction('set_forever',id);
      else if(a==='toggle') customerAction('set_status',id,{status:b.dataset.status});
      else customerAction(a,id);
    });
    $('adminView')?.addEventListener('click',e=>{
      if(e.target.closest('#refreshCustomers')) loadCustomers();
    });
    setTimeout(loadCustomers,500);
  });
})();
