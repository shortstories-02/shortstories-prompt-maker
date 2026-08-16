/* ShortStories Prompt Maker — Supabase Authentication */
(function(){
  'use strict';
  const CONFIG_KEY='shortstories_supabase_config_v1';
  const $=id=>document.getElementById(id);
  let mode='login';
  let client=null;
  let configured=false;

  function getConfig(){
    try{
      const saved=JSON.parse(localStorage.getItem(CONFIG_KEY)||'null');
      if(saved?.url && saved?.key) return saved;
    }catch(e){}
    return null;
  }
  function setMessage(msg,type='info'){
    const el=$('authMessage'); if(!el)return;
    el.textContent=msg; el.className='auth-message '+type;
  }
  function setMode(next){
    mode=next;
    $('authTitle').textContent=mode==='login'?'Masuk ke ShortStories':'Buat Akun ShortStories';
    $('authSubtitle').textContent=mode==='login'?'Gunakan akun Anda untuk membuka Prompt Maker.':'Buat akun dengan email dan password untuk mulai menggunakan Prompt Maker.';
    $('authSubmit').textContent=mode==='login'?'MASUK':'DAFTAR';
    $('authPassword').autocomplete=mode==='login'?'current-password':'new-password';
    const sw=$('authSwitch'); if(sw) sw.hidden=true; const swt=$('authSwitchText'); if(swt) swt.textContent='';
    $('forgotPassword').hidden=mode!=='login';
    setMessage('');
  }
  function clearAuthFields(){
    const email=$('authEmail');
    const password=$('authPassword');
    if(email) email.value='';
    if(password) password.value='';
    const resetEmail=$('resetEmail');
    const newPassword=$('newPassword');
    const confirmPassword=$('confirmPassword');
    if(resetEmail) resetEmail.value='';
    if(newPassword) newPassword.value='';
    if(confirmPassword) confirmPassword.value='';
  }

  function showAuth(message='', type='success'){
    const auth=$('authScreen'), app=$('appShell');
    if(auth) auth.hidden=false;
    if(app) app.hidden=true;
    setMode('login');
    clearAuthFields();
    if(message) setMessage(message,type);
  }
 async function showApp(user){
  const auth=$('authScreen'), app=$('appShell');

  if(!user){
    showAuth();
    return;
  }

  const c=client||getClient();

  // Cek status akun SEBELUM menampilkan beranda
  const access = c ? await getProfileAccess(c,user) : {
    allowed:false,
    reason:'check_failed'
  };

  // Akun tidak boleh masuk
  if(!access.allowed){

    // Hapus session agar akun expired/inactive tidak tetap login
    if(c){
      try{
        suppressSignedOutHandler=true;
        await c.auth.signOut({scope:'local'});
      }catch(e){
        console.warn('Auto sign-out failed:',e);
      }finally{
        suppressSignedOutHandler=false;
      }
    }

    if(access.reason === 'expired'){
      showAuth(
        'Masa aktif akun Anda telah berakhir. Silakan hubungi administrator ShortStories.',
        'error'
      );
      return;
    }

    if(access.reason === 'inactive'){
      showAuth(
        'Akun Anda sedang dinonaktifkan. Silakan hubungi administrator ShortStories.',
        'error'
      );
      return;
    }

    showAuth(
      'Akun tidak dapat digunakan saat ini. Silakan hubungi administrator ShortStories.',
      'error'
    );
    return;
  }

  // ==================================================
  // HANYA AKUN YANG SUDAH LOLOS PEMERIKSAAN
  // YANG BOLEH MELIHAT BERANDA
  // ==================================================

  if(auth) auth.hidden=true;
  if(app) app.hidden=false;

  const email=user?.email||'Pengguna';

  if($('accountEmail')){
    $('accountEmail').textContent=email;
  }

  if($('accountAvatar')){
    $('accountAvatar').textContent=(email[0]||'S').toUpperCase();
  }

  if($('accountStatus')){
    $('accountStatus').textContent='Akun aktif';
  }

  const role=access.role||'customer';

  const adminNav=$('adminNav')||document.querySelector('.admin-nav');

  if(adminNav){
    adminNav.hidden=role!=='admin';
  }

  document.body.dataset.role=role;

  if(
    role!=='admin' &&
    document.getElementById('adminView')?.classList.contains('active-view')
  ){
    if(typeof window.showShortStoriesView==='function'){
      window.showShortStoriesView('builder');
    }
  }

  if(
    typeof window.startShortStoriesApp==='function' &&
    !window.__ssAppStarted
  ){
    window.__ssAppStarted=true;
    window.startShortStoriesApp();
  }
}
  function humanError(error){
    const m=(error?.message||'').toLowerCase();
    if(m.includes('invalid login credentials')) return 'Email atau password salah.';
    if(m.includes('email not confirmed')) return 'Email belum dikonfirmasi. Silakan buka email verifikasi dari Supabase terlebih dahulu.';
    if(m.includes('password should be at least')) return 'Password harus minimal 6 karakter.';
    if(m.includes('rate limit')) return 'Terlalu banyak percobaan. Tunggu beberapa saat lalu coba lagi.';
    if(m.includes('user already registered')) return 'Email tersebut sudah terdaftar. Silakan masuk.';
    return error?.message||'Terjadi kesalahan. Coba lagi.';
  }
  function getClient(){
    const cfg=getConfig();
    if(!cfg){
      setMessage('Konfigurasi Supabase belum dipasang. Buka bagian “Pengaturan Supabase” di bawah.', 'error');
      $('setupBox').hidden=false;
      return null;
    }
    if(!window.supabase?.createClient){
      setMessage('Library Supabase belum termuat. Pastikan internet aktif saat membuka website.', 'error');
      return null;
    }
    if(!client) client=window.supabase.createClient(cfg.url,cfg.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    configured=true;
    return client;
  }
  async function getProfileRole(c,user){
    try{
      const {data,error}=await c.from('profiles').select('role').eq('id',user.id).maybeSingle();
      if(error) throw error;
      return data?.role||'customer';
    }catch(e){
      console.warn('Profile role check failed:',e);
      return 'customer';
    }
  }
  
  async function getProfileAccess(c,user){
  try{
    const {data,error}=await c
      .from('profiles')
      .select('role,status,expires_at')
      .eq('id',user.id)
      .maybeSingle();

    if(error) throw error;

    // Admin selalu boleh masuk
    if(data?.role === 'admin'){
      return {
        allowed:true,
        role:'admin',
        reason:'admin'
      };
    }

    // Customer harus aktif
    if(data?.status !== 'active'){
      return {
        allowed:false,
        reason:'inactive'
      };
    }

    // Customer tanpa tanggal kadaluarsa = selamanya
    if(!data?.expires_at){
      return {
        allowed:true,
        role:'customer',
        reason:'forever'
      };
    }

    // Cek tanggal kadaluarsa
    const expiresAt = new Date(data.expires_at);

    if(expiresAt <= new Date()){
      return {
        allowed:false,
        reason:'expired',
        expiresAt:data.expires_at
      };
    }

    return {
      allowed:true,
      role:'customer',
      reason:'active',
      expiresAt:data.expires_at
    };

  }catch(e){
    console.error('License check failed:',e);

    return {
      allowed:false,
      reason:'check_failed'
    };
  }
}
  
  let suppressSignedOutHandler=false;
  let authTransitionInProgress=false;

  async function init(){
    buildSetupBox();
    setMode('login');
    const c=getClient();
    if(!c){showAuth();return;}

    // Link recovery Supabase biasanya membawa #type=recovery.
    // Tandai sebelum getSession agar halaman utama tidak sempat tampil.
    let recoveryMode = /(?:^|[&#])type=recovery(?:&|$)/.test(window.location.hash);

    c.auth.onAuthStateChange(async (event,session)=>{
      if(event==='PASSWORD_RECOVERY'){
        recoveryMode=true;
        showResetPasswordPanel();
        return;
      }

      if(event==='SIGNED_OUT'){
        clearAuthFields();

        if(suppressSignedOutHandler) return;

        if(recoveryMode){
          return;
        }

        showAuth();
        return;
      }

      if(event==='SIGNED_IN' && session?.user){
        if(recoveryMode){
          showResetPasswordPanel();
          return;
        }

        if(authTransitionInProgress) return;
        authTransitionInProgress=true;
        try{
          await showApp(session.user);
        }finally{
          authTransitionInProgress=false;
        }
      }
    });

    const {data}=await c.auth.getSession();

    if(recoveryMode){
      showResetPasswordPanel();
    }else if(data?.session?.user){
      await showApp(data.session.user);
    }else{
      showAuth();
    }
  }
  function buildSetupBox(){
    if($('setupBox'))return;
    const box=document.createElement('div'); box.id='setupBox'; box.className='setup-box'; box.hidden=true;
    box.innerHTML=`<details><summary>⚙️ Pengaturan Supabase</summary><p>Masukkan <b>Project URL</b> dan <b>Publishable key</b>. Jangan masukkan Secret key/service_role.</p><label>Project URL</label><input id="supabaseUrlInput" placeholder="https://xxxxxxxx.supabase.co"><label>Publishable key</label><input id="supabaseKeyInput" placeholder="sb_publishable_..."><button id="saveSupabaseConfig" type="button">SIMPAN & HUBUNGKAN</button></details>`;
    $('authScreen').querySelector('.auth-card').appendChild(box);
    $('saveSupabaseConfig').onclick=async()=>{
      const url=$('supabaseUrlInput').value.trim().replace(/\/$/,'');
      const key=$('supabaseKeyInput').value.trim();
      if(!/^https:\/\/[^\s]+\.supabase\.co$/.test(url)){setMessage('Project URL tidak valid. Gunakan URL seperti https://xxxxx.supabase.co','error');return;}
      if(!key.startsWith('sb_publishable_')){setMessage('Gunakan Publishable key yang dimulai dengan sb_publishable_.','error');return;}
      localStorage.setItem(CONFIG_KEY,JSON.stringify({url,key}));
      client=null; configured=false;
      setMessage('Konfigurasi tersimpan. Menghubungkan...','success');
      setTimeout(init,250);
    };
    const cfg=getConfig();
    if(cfg){
      box.querySelector('#supabaseUrlInput').value=cfg.url;
      box.querySelector('#supabaseKeyInput').value=cfg.key;
    }
  }
  async function submit(e){
    e.preventDefault();
    const c=getClient(); if(!c)return;
    const email=$('authEmail').value.trim(), password=$('authPassword').value;
    $('authSubmit').disabled=true; setMessage(mode==='login'?'Memeriksa akun...':'Membuat akun...','info');
    try{
    if(mode==='login'){
      // Prevent the SIGNED_IN auth listener from running the same
      // transition a second time while this form submission is active.
      authTransitionInProgress=true;

      try{
        const {data,error}=await c.auth.signInWithPassword({
          email,
          password
        });

        if(error) throw error;

        if(data?.user){
          // Verify access before showing the application.
          await showApp(data.user);
        }
      }finally{
        authTransitionInProgress=false;
      }
    }else{
        setMode('login');
        throw new Error('Pendaftaran mandiri dinonaktifkan. Akun diberikan oleh administrator ShortStories.');
      }
    }catch(err){setMessage(humanError(err),'error');}
    finally{$('authSubmit').disabled=false;}
  }
  function showLoginPanel(){
    const form=$('authForm');
    const request=$('resetRequestPanel');
    const reset=$('resetPasswordPanel');
    const forgotBtn=$('forgotPassword');
    if(form) form.hidden=false;
    if(request) request.hidden=true;
    if(reset) reset.hidden=true;
    if(forgotBtn) forgotBtn.hidden=false;
    setMode('login');
  }

  function showResetRequestPanel(){
    const form=$('authForm');
    const request=$('resetRequestPanel');
    const reset=$('resetPasswordPanel');
    const forgotBtn=$('forgotPassword');
    if(form) form.hidden=true;
    if(request) request.hidden=false;
    if(reset) reset.hidden=true;
    if(forgotBtn) forgotBtn.hidden=true;
    const currentEmail=$('authEmail')?.value.trim()||'';
    if($('resetEmail')) $('resetEmail').value=currentEmail;
    setMessage('');
  }

  function showResetPasswordPanel(){
    const auth=$('authScreen'), app=$('appShell');
    if(auth) auth.hidden=false;
    if(app) app.hidden=true;

    const form=$('authForm');
    const request=$('resetRequestPanel');
    const reset=$('resetPasswordPanel');
    const forgotBtn=$('forgotPassword');

    if(form) form.hidden=true;
    if(request) request.hidden=true;
    if(reset) reset.hidden=false;
    if(forgotBtn) forgotBtn.hidden=true;

    if($('authTitle')) $('authTitle').textContent='Buat Password Baru';
    if($('authSubtitle')) $('authSubtitle').textContent='Atur password baru untuk akun ShortStories Anda.';
    setMessage('');
  }

  async function forgot(){
    const c=getClient(); if(!c)return;
    const email=($('resetEmail')?.value || $('authEmail')?.value || '').trim();

    if(!email){
      setMessage('Masukkan email terlebih dahulu.','error');
      return;
    }

    const btn=$('sendResetBtn');
    if(btn) btn.disabled=true;
    setMessage('Mengirim email reset password...','info');

    try{
      const redirectTo = window.location.origin + window.location.pathname;

      const {error}=await c.auth.resetPasswordForEmail(email,{
        redirectTo
      });

      if(error) throw error;

      // Sengaja gunakan pesan generik agar email akun tidak dapat ditebak.
      setMessage(
        'Jika email tersebut terdaftar, link reset password telah dikirim. Silakan periksa inbox atau folder spam.',
        'success'
      );
    }catch(err){
      console.error('Password reset request failed:',err);
      setMessage('Tidak dapat mengirim link reset password. Silakan coba lagi.','error');
    }finally{
      if(btn) btn.disabled=false;
    }
  }

  async function saveNewPassword(){
    const c=getClient(); if(!c)return;

    const password=$('newPassword')?.value || '';
    const confirm=$('confirmPassword')?.value || '';

    if(password.length < 6){
      setMessage('Password baru harus minimal 6 karakter.','error');
      return;
    }

    if(password !== confirm){
      setMessage('Konfirmasi password tidak sama.','error');
      return;
    }

    const btn=$('saveNewPasswordBtn');
    if(btn) btn.disabled=true;
    setMessage('Menyimpan password baru...','info');

    try{
      const {error}=await c.auth.updateUser({password});

      if(error) throw error;

      // Password berhasil diubah. Keluar dari recovery session
      // agar pengguna kembali melalui halaman login normal.
      try{
        await c.auth.signOut({scope:'local'});
      }catch(e){
        console.warn('Recovery sign-out warning:',e);
      }

      if($('newPassword')) $('newPassword').value='';
      if($('confirmPassword')) $('confirmPassword').value='';

      // Bersihkan token recovery dari address bar.
      try{
        window.history.replaceState({},document.title,window.location.pathname);
      }catch(e){}

      showLoginPanel();
      clearAuthFields();
      setMessage('Password berhasil diubah. Silakan login menggunakan password baru.','success');
    }catch(err){
      console.error('Password update failed:',err);
      setMessage(humanError(err),'error');
    }finally{
      if(btn) btn.disabled=false;
    }
  }

  async function logout(e){
    if(e){ e.preventDefault(); e.stopPropagation(); }
    const btn=$('logoutBtn');
    if(btn) btn.disabled=true;
    try{
      const c=getClient();
      if(!c){ showAuth(); return; }
      const {error}=await c.auth.signOut({scope:'local'});
      if(error) throw error;

      clearAuthFields();
      showAuth('Anda sudah keluar dari ShortStories.');
    }catch(err){
      console.error('ShortStories logout error:',err);
      setMessage('Logout gagal: '+humanError(err),'error');
    }finally{
      if(btn) btn.disabled=false;
    }
  }
  function bind(){
    $('authForm').addEventListener('submit',submit);
    $('authSwitch')?.addEventListener('click',()=>setMode('login'));
    $('forgotPassword').onclick=showResetRequestPanel;
    $('sendResetBtn')?.addEventListener('click',forgot);
    $('backToLogin')?.addEventListener('click',showLoginPanel);
    $('saveNewPasswordBtn')?.addEventListener('click',saveNewPassword);

    $('togglePassword').onclick=()=>{const p=$('authPassword');p.type=p.type==='password'?'text':'password';};
    $('toggleNewPassword')?.addEventListener('click',()=>{
      const p=$('newPassword'); if(p) p.type=p.type==='password'?'text':'password';
    });
    $('toggleConfirmPassword')?.addEventListener('click',()=>{
      const p=$('confirmPassword'); if(p) p.type=p.type==='password'?'text':'password';
    });

    const logoutBtn=$('logoutBtn');
    if(logoutBtn){
      logoutBtn.type='button';
      logoutBtn.addEventListener('click',logout);
    }
  }
  window.showShortStoriesView=function(view){
    if(typeof window.ssShowView==='function') window.ssShowView(view);
    else if(typeof window.showView==='function') window.showView(view);
  };
  window.addEventListener('DOMContentLoaded',()=>{bind();init();});
})();
