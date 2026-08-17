/* ShortStories Prompt Maker — Supabase Authentication */
(function(){
  'use strict';

  // Public frontend configuration.
  // NEVER put the Supabase service_role/secret key here.
  const SUPABASE_URL = 'https://ppxckqbpuetulzmvusvg.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_SwFAWF-QDsohAaB3jkjWqw_xgNnT_Km';
  const PASSWORD_RESET_REDIRECT = 'https://shortstories-02.github.io/shortstories-prompt-maker/';

  const $ = id => document.getElementById(id);
  let mode = 'login';
  let client = null;
  let recoveryShown = false;
  let recoveryFlow = false;

  function getConfig(){
    return { url: SUPABASE_URL, key: SUPABASE_PUBLISHABLE_KEY };
  }

  function setMessage(msg, type='info'){
    const el = $('authMessage');
    if(!el) return;
    el.textContent = msg;
    el.className = 'auth-message ' + type;
  }

  function clearAuthFields(){
    if($('authEmail')) $('authEmail').value = '';
    if($('authPassword')) $('authPassword').value = '';
  }

  function setMode(next){
    mode = next;
    if(!$('authTitle')) return;

    $('authTitle').textContent =
      mode === 'login' ? 'Masuk ke ShortStories' : 'Buat Akun ShortStories';
    $('authSubtitle').textContent =
      mode === 'login'
        ? 'Gunakan akun Anda untuk membuka Prompt Maker.'
        : 'Buat akun dengan email dan password untuk mulai menggunakan Prompt Maker.';
    if($('authSubmit')) $('authSubmit').textContent = mode === 'login' ? 'MASUK' : 'DAFTAR';
    if($('authPassword')) $('authPassword').autocomplete =
      mode === 'login' ? 'current-password' : 'new-password';

    if($('forgotPassword')) $('forgotPassword').hidden = mode !== 'login';
    setMessage('');
  }

  function restoreLoginForm(){
    const form = $('authForm');
    if(!form) return;
    form.innerHTML = `
      <label>Email</label>
      <div class="auth-input-wrap">
        <span>✉</span>
        <input id="authEmail" type="email" autocomplete="email"
               placeholder="nama@email.com" required>
      </div>
      <label>Password</label>
      <div class="password-wrap auth-input-wrap">
        <span>●</span>
        <input id="authPassword" type="password" autocomplete="current-password"
               placeholder="Minimal 6 karakter" required>
        <button type="button" id="togglePassword" aria-label="Tampilkan password">👁</button>
      </div>
      <button class="auth-primary" id="authSubmit" type="submit">
        <span>MASUK</span><b>→</b>
      </button>`;
    $('togglePassword')?.addEventListener('click', () => {
      const p = $('authPassword');
      if(p) p.type = p.type === 'password' ? 'text' : 'password';
    });
  }

  function showAuth(message=''){
    const auth = $('authScreen'), app = $('appShell');
    if(auth) auth.hidden = false;
    if(app) app.hidden = true;
    if(recoveryShown || !$('authEmail')){
      restoreLoginForm();
    }
    recoveryShown = false;
    recoveryFlow = false;
    setMode('login');
    clearAuthFields();
    if($('authEmail')) $('authEmail').autocomplete = 'email';
    if($('authPassword')) $('authPassword').type = 'password';
    if($('togglePassword')) $('togglePassword').hidden = false;
    if(message) setMessage(message, 'success');
  }

  function showRecovery(){
    const auth = $('authScreen'), app = $('appShell');
    if(auth) auth.hidden = false;
    if(app) app.hidden = true;

    mode = 'recovery';
    recoveryShown = true;
    recoveryFlow = true;

    $('authTitle').textContent = 'Buat Password Baru';
    $('authSubtitle').textContent = 'Masukkan password baru untuk akun ShortStories Anda.';

    const form = $('authForm');
    if(form){
      form.innerHTML = `
        <label>Password Baru</label>
        <div class="password-wrap auth-input-wrap">
          <span>●</span>
          <input id="recoveryPassword" type="password" autocomplete="new-password"
                 placeholder="Minimal 6 karakter" minlength="6" required>
          <button type="button" id="toggleRecoveryPassword" aria-label="Tampilkan password">👁</button>
        </div>
        <label>Konfirmasi Password</label>
        <div class="password-wrap auth-input-wrap">
          <span>●</span>
          <input id="recoveryPasswordConfirm" type="password" autocomplete="new-password"
                 placeholder="Ulangi password baru" minlength="6" required>
        </div>
        <button class="auth-primary" id="authSubmit" type="submit">
          <span>SIMPAN PASSWORD</span><b>→</b>
        </button>`;
    }

    if($('forgotPassword')) $('forgotPassword').hidden = true;
    if($('togglePassword')) $('togglePassword').hidden = true;
    setMessage('');
    $('toggleRecoveryPassword')?.addEventListener('click', () => {
      const p = $('recoveryPassword');
      if(p) p.type = p.type === 'password' ? 'text' : 'password';
    });
  }

  async function showApp(user){
    const auth = $('authScreen'), app = $('appShell');
    const c = client || getClient();
    if(!c || !user){
      showAuth();
      return;
    }

    // IMPORTANT: check license before revealing the app.
    // This also protects refresh/session-restoration after expiry.
    const access = await getProfileAccess(c, user);
    if(!access.allowed){
      await c.auth.signOut({scope:'local'}).catch(()=>{});
      client = null;

      if(access.reason === 'expired'){
        showAuth('Masa aktif akun Anda telah berakhir. Silakan hubungi administrator ShortStories.');
      } else if(access.reason === 'inactive'){
        showAuth('Akun Anda sedang dinonaktifkan. Silakan hubungi administrator ShortStories.');
      } else {
        showAuth('Akun tidak dapat digunakan saat ini. Silakan hubungi administrator.');
      }
      return;
    }

    if(auth) auth.hidden = true;
    if(app) app.hidden = false;

    const email = user?.email || 'Pengguna';
    $('accountEmail').textContent = email;
    $('accountAvatar').textContent = (email[0] || 'S').toUpperCase();
    $('accountStatus').textContent = 'Akun aktif';

    const role = access.role || 'customer';
    const adminNav = $('adminNav') || document.querySelector('.admin-nav');
    if(adminNav) adminNav.hidden = role !== 'admin';
    document.body.dataset.role = role;

    if(role !== 'admin' && document.getElementById('adminView')?.classList.contains('active-view')){
      if(typeof window.showShortStoriesView === 'function') window.showShortStoriesView('builder');
    }

    if(typeof window.startShortStoriesApp === 'function' && !window.__ssAppStarted){
      window.__ssAppStarted = true;
      window.startShortStoriesApp();
    }
  }

  function humanError(error){
    const m = (error?.message || '').toLowerCase();
    if(m.includes('invalid login credentials')) return 'Email atau password salah.';
    if(m.includes('email not confirmed')) return 'Email belum dikonfirmasi. Silakan buka email verifikasi dari Supabase terlebih dahulu.';
    if(m.includes('password should be at least')) return 'Password harus minimal 6 karakter.';
    if(m.includes('rate limit')) return 'Terlalu banyak percobaan. Tunggu beberapa saat lalu coba lagi.';
    if(m.includes('user already registered')) return 'Email tersebut sudah terdaftar. Silakan masuk.';
    if(m.includes('same password')) return 'Password baru harus berbeda dari password lama.';
    return error?.message || 'Terjadi kesalahan. Coba lagi.';
  }

  function getClient(){
    const cfg = getConfig();
    if(!window.supabase?.createClient){
      setMessage('Library Supabase belum termuat. Pastikan internet aktif saat membuka website.', 'error');
      return null;
    }
    if(!client){
      client = window.supabase.createClient(cfg.url, cfg.key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    }
    return client;
  }

  async function getProfileAccess(c, user){
    try{
      const {data, error} = await c
        .from('profiles')
        .select('role,status,expires_at')
        .eq('id', user.id)
        .maybeSingle();

      if(error) throw error;

      if(data?.role === 'admin'){
        return {allowed:true, role:'admin', reason:'admin'};
      }

      if(data?.status !== 'active'){
        return {allowed:false, reason:'inactive'};
      }

      if(!data?.expires_at){
        return {allowed:true, role:'customer', reason:'forever'};
      }

      const expiresAt = new Date(data.expires_at);
      if(Number.isNaN(expiresAt.getTime())){
        return {allowed:false, reason:'check_failed'};
      }

      if(expiresAt <= new Date()){
        return {allowed:false, reason:'expired', expiresAt:data.expires_at};
      }

      return {
        allowed:true,
        role:'customer',
        reason:'active',
        expiresAt:data.expires_at
      };
    }catch(e){
      console.error('License check failed:', e);
      return {allowed:false, reason:'check_failed'};
    }
  }

  async function submit(e){
    e.preventDefault();

    if(mode === 'recovery'){
      await updatePassword();
      return;
    }

    const c = getClient();
    if(!c) return;

    const email = $('authEmail').value.trim();
    const password = $('authPassword').value;

    $('authSubmit').disabled = true;
    setMessage('Memeriksa akun...', 'info');

    try{
      const {data, error} = await c.auth.signInWithPassword({email, password});
      if(error) throw error;

      if(data?.user){
        await showApp(data.user);
        if(!recoveryShown && !$('authScreen').hidden){
          // showApp will display the exact expiry/inactive message when needed.
          return;
        }
      }
    }catch(err){
      setMessage(humanError(err), 'error');
    }finally{
      if($('authSubmit')) $('authSubmit').disabled = false;
    }
  }

  async function checkPasswordReset(email){
    const c = getClient();
    if(!c) throw new Error('Supabase belum siap.');

    const {data, error} = await c.functions.invoke('check-password-reset', {
      body: { email }
    });

    if(error) throw error;
    return data || {};
  }

  async function forgot(){
    const c = getClient();
    if(!c) return;

    const email = $('authEmail').value.trim();
    if(!email){
      setMessage('Masukkan email terlebih dahulu, lalu klik Lupa password.', 'error');
      $('authEmail')?.focus();
      return;
    }

    const btn = $('forgotPassword');
    if(btn) btn.disabled = true;
    setMessage('Memeriksa status akun...', 'info');

    try{
      const check = await checkPasswordReset(email);

      if(check.allowed === false){
        if(check.status === 'expired'){
          setMessage(
            'Masa aktif akun Anda telah berakhir. Silakan hubungi administrator ShortStories.',
            'error'
          );
        }else if(check.status === 'inactive'){
          setMessage(
            'Akun Anda sedang dinonaktifkan. Silakan hubungi administrator ShortStories.',
            'error'
          );
        }else{
          setMessage(
            check.message || 'Akun tidak dapat melakukan reset password saat ini.',
            'error'
          );
        }
        return;
      }

      const {error} = await c.auth.resetPasswordForEmail(email, {
        redirectTo: PASSWORD_RESET_REDIRECT
      });
      if(error) throw error;

      setMessage(
        'Link reset password telah dikirim. Periksa inbox dan folder spam Anda.',
        'success'
      );
    }catch(error){
      console.error('Password reset check error:', error);
      setMessage(humanError(error), 'error');
    }finally{
      if(btn) btn.disabled = false;
    }
  }

  async function updatePassword(){
    const c = getClient();
    if(!c) return;

    const password = $('recoveryPassword')?.value || '';
    const confirm = $('recoveryPasswordConfirm')?.value || '';

    if(password.length < 6){
      setMessage('Password minimal 6 karakter.', 'error');
      return;
    }
    if(password !== confirm){
      setMessage('Konfirmasi password tidak sama.', 'error');
      return;
    }

    const btn = $('authSubmit');
    if(btn) btn.disabled = true;
    setMessage('Menyimpan password baru...', 'info');

    try{
      const {error} = await c.auth.updateUser({password});
      if(error) throw error;

      // Recovery session is no longer needed after changing the password.
      await c.auth.signOut({scope:'local'}).catch(()=>{});
      client = null;

      // Remove recovery tokens from the address bar.
      try{
        window.history.replaceState({}, document.title, PASSWORD_RESET_REDIRECT);
      }catch(_){
        window.location.hash = '';
      }

      showAuth('Password berhasil diubah. Silakan masuk menggunakan password baru.');
    }catch(error){
      setMessage(humanError(error), 'error');
    }finally{
      if($('authSubmit')) $('authSubmit').disabled = false;
    }
  }

  async function logout(e){
    if(e){ e.preventDefault(); e.stopPropagation(); }

    const btn = $('logoutBtn');
    if(btn) btn.disabled = true;

    try{
      const c = getClient();
      if(!c){ showAuth(); return; }

      const {error} = await c.auth.signOut({scope:'local'});
      if(error) throw error;

      client = null;
      showAuth('Anda sudah keluar dari ShortStories.');
    }catch(err){
      console.error('ShortStories logout error:', err);
      setMessage('Logout gagal: ' + humanError(err), 'error');
    }finally{
      if(btn) btn.disabled = false;
    }
  }

  function isRecoveryUrl(){
    const hash = window.location.hash || '';
    const search = window.location.search || '';

    // Supabase may return password-reset sessions as either:
    //   #...&type=recovery
    // or a PKCE callback such as ?code=...
    // Treat an auth callback as recovery while this page is handling
    // the password-reset flow, so SIGNED_IN cannot open the app first.
    if(/type=recovery/i.test(hash) || /type=recovery/i.test(search)) return true;
    if(/(^|[?#&])code=[^&#]+/i.test(search)) return true;
    return false;
  }

  async function init(){
    const c = getClient();
    if(!c){ showAuth(); return; }

    let resolveFirstAuthEvent;
    const firstAuthEvent = new Promise(resolve => {
      resolveFirstAuthEvent = resolve;
    });

    c.auth.onAuthStateChange((event, session) => {
      // Once recovery mode is active, ALL auth events (including
      // SIGNED_IN) must stay on the password-reset form.
      if(recoveryFlow || recoveryShown || event === 'PASSWORD_RECOVERY' || isRecoveryUrl()){
        showRecovery();
        resolveFirstAuthEvent();
        return;
      }

      if(session?.user) showApp(session.user);
      else showAuth();

      resolveFirstAuthEvent();
    });

    if(isRecoveryUrl()){
      showRecovery();
      return;
    }

    // Wait for Supabase's initial auth event before deciding whether to
    // restore the app session. This prevents a recovery session from
    // briefly opening the app before PASSWORD_RECOVERY is delivered.
    await Promise.race([
      firstAuthEvent,
      new Promise(resolve => setTimeout(resolve, 500))
    ]);

    if(recoveryFlow || recoveryShown) return;

    const {data} = await c.auth.getSession();

    if(recoveryFlow || recoveryShown) return;

    if(data?.session?.user) await showApp(data.session.user);
    else showAuth();
  }

  function bind(){
    $('authForm')?.addEventListener('submit', submit);

    $('forgotPassword')?.addEventListener('click', forgot);

    $('togglePassword')?.addEventListener('click', () => {
      const p = $('authPassword');
      if(p) p.type = p.type === 'password' ? 'text' : 'password';
    });

    const logoutBtn = $('logoutBtn');
    if(logoutBtn){
      logoutBtn.type = 'button';
      logoutBtn.addEventListener('click', logout);
    }
  }

  window.showShortStoriesView = function(view){
    if(typeof window.ssShowView === 'function') window.ssShowView(view);
    else if(typeof window.showView === 'function') window.showView(view);
  };

  window.addEventListener('DOMContentLoaded', () => {
    bind();
    init();
  });
})();
