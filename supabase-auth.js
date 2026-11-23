/* YXNGJU Supabase Auth — public browser client only.
   Never put service_role/secret keys in this file. */
(() => {
  "use strict";
  const SUPABASE_URL = "https://iakawdizgxnjbfkxpqtr.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ycOtmZz5s_yCmr20A5b06w_Ly_VpFSP";
  const ADMIN_URL = new URL("admin.html", window.location.href).href;
  const ACCOUNT_URL = new URL("account.html", window.location.href).href;
  let currentUser = null;

  if (!window.supabase?.createClient) {
    console.error("Supabase JS library did not load.");
    return;
  }
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  window.yxngjuSupabase = client;

  const $ = (id) => document.getElementById(id);
  const status = $("status");
  const show = (message, isError = false) => {
    if (!status) return;
    status.style.display = "block";
    status.style.borderColor = isError ? "rgba(255,100,130,.5)" : "rgba(150,220,190,.3)";
    status.style.color = isError ? "#ffd4df" : "#d6f7e5";
    status.textContent = message;
  };
  const busy = (on) => {
    ["googleBtn", "submitBtn", "modeBtn", "resetBtn", "logoutBtn", "profileSaveBtn", "passwordSaveBtn"].forEach(id => {
      const el = $(id); if (el) el.disabled = on;
    });
  };
  let mode = "login";
  function setMode(next) {
    mode = next;
    $("heading").innerHTML = next === "signup" ? "CREATE <em>ACCOUNT.</em>" : "WELCOME <em>BACK.</em>";
    $("subtitle").textContent = next === "signup" ? "Create your YXNGJU identity." : "Sign in to your YXNGJU account.";
    $("submitBtn").textContent = next === "signup" ? "CREATE ACCOUNT / ثبت‌نام" : "LOGIN / ورود";
    $("modeLabel").textContent = next === "signup" ? "Already registered?" : "New to YXNGJU?";
    $("modeBtn").textContent = next === "signup" ? "Sign in / ورود" : "Create account / ثبت‌نام";
    $("password").autocomplete = next === "signup" ? "new-password" : "current-password";
    show("");
    status.style.display = "none";
  }
  async function identifyUser(user) {
    currentUser = user;
    $("authPanel").hidden = true;
    $("signedPanel").hidden = false;
    $("signedEmail").textContent = user.email || "Signed in";
    $("signedRole").textContent = "در حال بررسی سطح دسترسی…";
    $("adminLink").hidden = true;
    let role = null;
    const { data, error } = await client.from("admin_users").select("role").eq("user_id", user.id).maybeSingle();
    if (!error && data?.role) role = data.role;
    if (role === "owner") {
      $("signedRole").textContent = "دسترسی مالک تأیید شد.";
      $("adminLink").hidden = false;
    } else {
      $("signedRole").textContent = "حساب کاربری عادی · دسترسی مدیریتی فعال نیست.";
    }
    const metadata = user.user_metadata || {};
    const displayName = metadata.display_name || (role === "owner" ? "yxngj-admin" : (user.email || "").split("@")[0]);
    $("signedName").textContent = "نام نمایشی: " + displayName;
    $("displayName").value = displayName;
    // Record a single login event per browser tab/session. The database policy validates uid and JWT email.
    const marker = "yxngju-login-event-" + user.id;
    if (!sessionStorage.getItem(marker)) {
      const { error: logError } = await client.from("login_events").insert({
        user_id: user.id,
        email: user.email || null,
        event_type: "login",
        provider: user.app_metadata?.provider || "email",
        user_agent: navigator.userAgent.slice(0, 500)
      });
      if (!logError) sessionStorage.setItem(marker, "1");
    }
  }
  async function refreshSession() {
    const { data, error } = await client.auth.getSession();
    if (error) { show("خطا در خواندن نشست: " + error.message, true); return; }
    if (data.session?.user) await identifyUser(data.session.user);
  }

  $("googleBtn").addEventListener("click", async () => {
    busy(true);
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: ACCOUNT_URL, queryParams: { prompt: "select_account" } }
    });
    if (error) { show("ورود با گوگل انجام نشد: " + error.message, true); busy(false); }
  });

  $("authForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = $("email").value.trim().toLowerCase();
    const password = $("password").value;
    busy(true);
    let result;
    if (mode === "signup") {
      result = await client.auth.signUp({
        email, password,
        options: { emailRedirectTo: ACCOUNT_URL }
      });
      if (!result.error && !result.data.session) {
        show("حساب ساخته شد. ایمیلت را باز کن و لینک تأیید Supabase را بزن؛ سپس وارد شو.");
        busy(false); return;
      }
    } else {
      result = await client.auth.signInWithPassword({ email, password });
    }
    if (result.error) {
      show("خطا: " + result.error.message, true);
      busy(false); return;
    }
    if (result.data.user) await identifyUser(result.data.user);
    busy(false);
  });

  $("modeBtn").addEventListener("click", () => setMode(mode === "login" ? "signup" : "login"));
  $("resetBtn").addEventListener("click", async () => {
    const email = $("email").value.trim().toLowerCase();
    if (!email) { show("ابتدا ایمیلت را وارد کن.", true); return; }
    busy(true);
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: ACCOUNT_URL });
    show(error ? "ارسال لینک بازیابی ناموفق بود: " + error.message : "اگر این ایمیل ثبت شده باشد، لینک بازیابی برایش ارسال می‌شود.", !!error);
    busy(false);
  });
  $("profileForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const displayName = $("displayName").value.trim();
    if (!currentUser) { show("ابتدا وارد حساب شو.", true); return; }
    if (!displayName) { show("نام نمایشی را وارد کن.", true); return; }
    busy(true);
    const { data, error } = await client.auth.updateUser({
      data: { ...(currentUser.user_metadata || {}), display_name: displayName }
    });
    if (error) {
      show("ذخیره نام نمایشی ناموفق بود: " + error.message, true);
      busy(false); return;
    }
    currentUser = data.user;
    $("signedName").textContent = "نام نمایشی: " + displayName;
    show("نام نمایشی ذخیره شد. برای ورود همچنان از ایمیل استفاده می‌شود.");
    busy(false);
  });
  $("passwordForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = $("newPassword").value;
    if (!currentUser) { show("ابتدا وارد حساب شو.", true); return; }
    if (password !== $("confirmPassword").value) { show("تکرار گذرواژه با گذرواژه جدید یکسان نیست.", true); return; }
    busy(true);
    const { error } = await client.auth.updateUser({ password });
    if (error) {
      show("تغییر گذرواژه ناموفق بود: " + error.message, true);
      busy(false); return;
    }
    $("passwordForm").reset();
    show("گذرواژه با موفقیت تغییر کرد.");
    busy(false);
  });
  $("logoutBtn").addEventListener("click", async () => {
    busy(true);
    const { error } = await client.auth.signOut();
    if (error) { show("خروج ناموفق بود: " + error.message, true); busy(false); return; }
    sessionStorage.clear();
    currentUser = null;
    $("signedPanel").hidden = true;
    $("authPanel").hidden = false;
    show("از حساب خارج شدی.");
    busy(false);
  });

  client.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session?.user) {
      // getSession handles the full state after the initial callback.
      setTimeout(() => identifyUser(session.user), 0);
    }
    if (event === "SIGNED_OUT") {
      currentUser = null;
      $("signedPanel").hidden = true;
      $("authPanel").hidden = false;
    }
  });
  refreshSession();
})();
