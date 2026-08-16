/* ShortStories Admin Panel */
(function(){
  const $=id=>document.getElementById(id);
  function msg(text,error=false){
    const el=$('adminMessage'); if(!el)return;
    el.textContent=text; el.className='admin-message show'+(error?' error':'');
  }
  async function getClient(){
    const cfg=JSON.parse(localStorage.getItem('shortstories_supabase_config_v1')||'null');
    if(!cfg?.url||!cfg?.key||!window.supabase?.createClient) throw new Error('Konfigurasi Supabase belum tersedia.');
    return window.supabase.createClient(cfg.url,cfg.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  }
  async function createCustomer(e){
    e.preventDefault();
    const btn=$('createCustomerBtn');
    const name=$('customerName').value.trim();
    const email=$('customerEmail').value.trim();
    const password=$('customerPassword').value;
	const duration = $('customerDuration').value;
    if(!name||!email||password.length<6){msg('Nama, email, dan password minimal 6 karakter wajib diisi.',true);return;}
    btn.disabled=true; msg('Membuat akun pelanggan...');
    try{
      const c=await getClient();
      const {data:{session}}=await c.auth.getSession();
      if(!session) throw new Error('Sesi admin tidak ditemukan. Silakan login kembali.');
      const {data,error}=await c.functions.invoke('create-customer',{body:{nama:name,email,password,duration}});
      if(error) throw error;
      const account=data?.customer;
      if(!account) throw new Error('Backend tidak mengembalikan data akun.');
      $('createdAccount').className='created-account';
      $('createdAccount').innerHTML=`<div class="account-row"><span>Nama</span><b>${esc(name)}</b></div><div class="account-row"><span>Email</span><b>${esc(email)}</b></div><div class="account-row"><span>Password</span><b>${esc(password)}</b></div><div class="account-row"><span>Role</span><b>customer</b></div><button class="copy-account" id="copyCreatedAccount">📋 COPY DATA AKUN</button>`;
      $('copyCreatedAccount').onclick=async()=>{
        const text=`AKUN SHORTSTORIES\nNama: ${name}\nEmail: ${email}\nPassword: ${password}\nWebsite: ShortStories Prompt Maker`;
        try{await navigator.clipboard.writeText(text);msg('Data akun berhasil disalin.');}catch(_){msg('Salin manual data akun di panel.',false);}
      };
      msg('✓ Akun pelanggan berhasil dibuat.');
      $('customerForm').reset();
    }catch(err){
      console.error(err);
      msg('Gagal membuat akun: '+(err?.message||'Terjadi kesalahan.'),true);
    }finally{btn.disabled=false;}
  }
  function esc(s){return (s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
  window.addEventListener('DOMContentLoaded',()=>{
    $('customerForm')?.addEventListener('submit',createCustomer);
  });
})();