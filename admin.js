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

  let allCustomers = [];

  function getCustomerFilter(c){
    const filter = $('customerStatusFilter')?.value || 'all';
    const status = c.status || '';
    const isForever = !c.expires_at;
    const isExpired = !!c.expires_at && !Number.isNaN(new Date(c.expires_at).getTime()) &&
      new Date(c.expires_at) <= new Date();
    const isActive = status === 'active' && !isExpired;

    if(filter === 'active') return isActive;
    if(filter === 'inactive') return status !== 'active';
    if(filter === 'expired') return isExpired;
    if(filter === 'forever') return isForever && status === 'active';
    return true;
  }

  function getCustomerSortValue(c){
    if(!c.expires_at) return null;
    const d = new Date(c.expires_at);
    return Number.isNaN(d.getTime()) ? null : d.getTime();
  }

  function filterCustomers(){
    const input = $('customerSearch');
    const query = (input?.value || '').trim().toLowerCase();
    const filtered = allCustomers.filter(c =>
      (!query || (c.email || '').toLowerCase().includes(query)) &&
      getCustomerFilter(c)
    );

    const sort = $('customerSort')?.value || 'default';
    filtered.sort((a,b)=>{
      const av = getCustomerSortValue(a);
      const bv = getCustomerSortValue(b);

      // Selamanya selalu diletakkan paling belakang saat sorting masa aktif.
      if(sort === 'shortest' || sort === 'longest'){
        if(av === null && bv === null) return 0;
        if(av === null) return 1;
        if(bv === null) return -1;
        return sort === 'shortest' ? av - bv : bv - av;
      }
      return 0;
    });

    renderCustomers(filtered, query, filtered.length !== allCustomers.length);
  }

  function renderCustomers(customers, query='', isFiltered=false){
    const box=$('customerList');
    if(!box)return;
    if(!customers.length){
      box.innerHTML = query
        ? '<div class="empty">Pelanggan tidak ditemukan.</div>'
        : (isFiltered
          ? '<div class="empty">Tidak ada pelanggan yang sesuai dengan filter.</div>'
          : '<div class="empty">Belum ada pelanggan.</div>');
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
          <button class="danger" data-action="delete" data-id="${c.id}" data-email="${esc(c.email)}">Hapus</button>
        </div>
      </article>`;
    }).join('');
  }

  async function loadCustomers(){
    const box=$('customerList');
    if(box) box.innerHTML='<div class="empty">Memuat pelanggan...</div>';
    try{
      const data=await invoke('list');
      allCustomers = data.customers || [];
      filterCustomers();
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
      if(action==='delete'){
        const email = extra.email || 'pelanggan ini';
        const ok = confirm(
          'Hapus pelanggan?\n\n' +
          'Anda yakin ingin menghapus akun ' + email + '?\n\n' +
          'Tindakan ini tidak dapat dibatalkan.'
        );
        if(!ok){
          msg('Penghapusan dibatalkan.');
          return;
        }
      }
      if(action==='password'){
        const p=prompt('Masukkan password baru (minimal 6 karakter):');
        if(p===null)return;
        if(p.length<6){alert('Password minimal 6 karakter.');return;}
        extra.password=p;
      }
      const invokeAction = action === 'password' ? 'reset_password' : action;
      const data=await invoke(invokeAction,{id,...extra});
      msg('✓ Perubahan berhasil.');
      if(action==='password'){
        const newPassword = data?.password || extra.password;
        if(newPassword){
          alert('Password pelanggan berhasil diubah.\n\nPassword baru: ' + newPassword);
        }else{
          alert('Password pelanggan berhasil diubah.');
        }
      }
      if(action==='delete') alert('Akun pelanggan berhasil dihapus.');
      loadCustomers();
      return data;
    }catch(e){msg('Gagal: '+(e?.message||'Terjadi kesalahan.'),true);}
  }

  window.addEventListener('DOMContentLoaded',()=>{
    $('customerForm')?.addEventListener('submit',createCustomer);
    $('refreshCustomers')?.addEventListener('click',loadCustomers);
    $('customerSearch')?.addEventListener('input',filterCustomers);
    $('customerStatusFilter')?.addEventListener('change',filterCustomers);
    $('customerSort')?.addEventListener('change',filterCustomers);
    $('customerList')?.addEventListener('click',e=>{
      const b=e.target.closest('button[data-action]');
      if(!b)return;
      const a=b.dataset.action,id=b.dataset.id;
      if(a==='extend') customerAction('extend',id,{days:b.dataset.days});
      else if(a==='forever') customerAction('set_forever',id);
      else if(a==='toggle') customerAction('set_status',id,{status:b.dataset.status});
      else if(a==='delete') customerAction('delete',id,{email:b.dataset.email});
      else customerAction(a,id);
    });
    $('adminView')?.addEventListener('click',e=>{
      if(e.target.closest('#refreshCustomers')) loadCustomers();
    });
    setTimeout(loadCustomers,500);
  });
})();
