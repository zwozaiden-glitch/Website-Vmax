/* ==========================================================================
   Protect-Vmax — auth.js
   Discord login via OAuth 2.0 Authorization Code flow + PKCE.
   Uses the website's same-origin /token endpoint for the code exchange and
   stores the session in localStorage. Also powers the nav login chip on
   every page.
   ========================================================================== */

const PVAuth = (function () {
  "use strict";

  /* ----------------------------------------------------------------------
     CONFIG — the ONLY things you need to change for real Discord login:
       1. CLIENT_ID  -> your Discord application's Client ID
                         (Discord Developer Portal -> Application -> OAuth2)
       2. In the Developer Portal, add this site's dashboard route as a
          Redirect:  <your-site>/dashboard   (must match exactly)
       3. BOT_API_BASE -> the public URL of the connected Discord bot API.
          OAuth itself uses this website's same-origin POST /token route.
     ---------------------------------------------------------------------- */
  const BOT_API_BASE = "https://discord-project-production-a058.up.railway.app";

  const CONFIG = {
    CLIENT_ID: "1540626944557850624", // <-- your Discord app's Client ID
    // /dashboard is the public route; the Railway server serves it with
    // dashboard.html behind the scenes.
    REDIRECT_PATH: "/dashboard",
    SCOPES: "identify email",
    BOT_API_BASE: BOT_API_BASE,
    // OAuth must not depend on the separate bot domain. That domain can be
    // asleep, renamed, or temporarily unprovisioned while this site is still
    // healthy. The Website-Vmax Railway server exposes this same-origin route
    // and safely performs the Discord token exchange.
    TOKEN_PROXY: "/token",
  };

  const DISCORD_AUTHORIZE = "https://discord.com/api/oauth2/authorize";
  const DISCORD_TOKEN = "https://discord.com/api/oauth2/token";
  const DISCORD_API = "https://discord.com/api";
  const DISCORD_CDN = "https://cdn.discordapp.com";

  const SS_VERIFIER = "pv_oauth_verifier";
  const SS_STATE = "pv_oauth_state";
  const LS_SESSION = "pv_session";

  /* ----------------------------- crypto helpers -------------------------- */
  function randomBytes(n) {
    const arr = new Uint8Array(n);
    crypto.getRandomValues(arr);
    return arr;
  }

  function b64url(bytes) {
    let str = "";
    for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  async function sha256B64url(str) {
    const data = new TextEncoder().encode(str);
    const dig = await crypto.subtle.digest("SHA-256", data);
    return b64url(new Uint8Array(dig));
  }

  function randToken(n) {
    return b64url(randomBytes(n));
  }

  /* ----------------------------- storage -------------------------------- */
  function removeStoredSession() {
    try {
      localStorage.removeItem(LS_SESSION);
    } catch (e) {
      // Storage can be unavailable in a privacy-restricted browser.
    }
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(LS_SESSION);
      const session = raw ? JSON.parse(raw) : null;
      if (!session || typeof session !== "object") return null;

      // Remove sessions written by the old demo mode. A demo account must
      // never be treated as an authenticated Discord user.
      if (session.demo === true || (session.user && session.user.demo === true)) {
        removeStoredSession();
        return null;
      }

      return session;
    } catch (e) {
      removeStoredSession();
      return null;
    }
  }

  function setSession(obj) {
    try {
      localStorage.setItem(LS_SESSION, JSON.stringify(obj));
    } catch (e) {
      throw new Error(
        "Your browser blocked local storage. Allow site storage, then try logging in again."
      );
    }
  }

  function clearSession() {
    removeStoredSession();
  }

  function isLoggedIn() {
    const s = getSession();
    return !!(s && s.access_token && s.user);
  }

  function getRedirectUri() {
    return new URL(CONFIG.REDIRECT_PATH, location.href).href;
  }

  /* ----------------------------- avatar --------------------------------- */
  function avatarUrl(user, size) {
    size = size || 128;
    if (!user) return null;
    if (user.avatar) {
      const fmt = user.avatar.startsWith("a_") ? "gif" : "png";
      return (
        DISCORD_CDN + "/avatars/" + user.id + "/" + user.avatar + "." + fmt +
        "?size=" + size
      );
    }
    // Default avatar (no custom upload).
    let idx;
    if (user.discriminator && user.discriminator !== "0") {
      idx = parseInt(user.discriminator, 10) % 5;
    } else {
      idx = Number((BigInt(user.id || "0") >> 22n) % 6n);
    }
    return DISCORD_CDN + "/embed/avatars/" + idx + ".png?size=" + size;
  }

  /* ----------------------------- login flow ----------------------------- */
  async function login() {
    if (!CONFIG.CLIENT_ID || CONFIG.CLIENT_ID === "YOUR_DISCORD_CLIENT_ID") {
      throw new Error("Discord login is not configured. Set CONFIG.CLIENT_ID in auth.js.");
    }

    const verifier = randToken(32);
    const state = randToken(16);
    const challenge = await sha256B64url(verifier);

    sessionStorage.setItem(SS_VERIFIER, verifier);
    sessionStorage.setItem(SS_STATE, state);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CONFIG.CLIENT_ID,
      scope: CONFIG.SCOPES,
      state: state,
      redirect_uri: getRedirectUri(),
      code_challenge: challenge,
      code_challenge_method: "S256",
    });

    location.href = DISCORD_AUTHORIZE + "?" + params.toString();
  }

  /* ----------------------------- token exchange ------------------------- */
  function oauthErrorMessage(status, text, action) {
    let detail = "";
    try {
      const parsed = JSON.parse(text);
      detail = parsed.error_description || parsed.message || parsed.error || "";
    } catch (e) {
      // Never put a proxy's full HTML error page into the dashboard.
      detail = "";
    }

    if (status === 404 || status === 405) {
      return "The website login service is not available yet. Please redeploy Website-Vmax and try again.";
    }
    if (/invalid_grant/i.test(detail)) {
      return "Discord rejected this expired or already-used login. Please start a new login.";
    }
    if (/invalid_client/i.test(detail)) {
      return "Discord OAuth is not configured on the server. Check the Discord client settings.";
    }
    return action + " failed (HTTP " + status + ")" + (detail ? ": " + detail : ".");
  }

  async function requestToken(body, action) {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller
      ? setTimeout(function () { controller.abort(); }, 15000)
      : null;

    let res;
    try {
      res = await fetch(CONFIG.TOKEN_PROXY || DISCORD_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        signal: controller ? controller.signal : undefined,
      });
    } catch (e) {
      if (e && e.name === "AbortError") {
        throw new Error("The website login service timed out. Please try again.");
      }
      throw new Error("The website login service could not be reached. Please try again.");
    } finally {
      if (timer) clearTimeout(timer);
    }

    const text = await res.text().catch(function () { return ""; });
    if (!res.ok) {
      throw new Error(oauthErrorMessage(res.status, text, action));
    }

    let token;
    try {
      token = JSON.parse(text);
    } catch (e) {
      throw new Error("The website login service returned an invalid response.");
    }
    if (!token || !token.access_token) {
      throw new Error("Discord did not return an access token. Please log in again.");
    }
    return token;
  }

  async function exchangeCode(code, verifier) {
    const body = new URLSearchParams({
      client_id: CONFIG.CLIENT_ID,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: getRedirectUri(),
      code_verifier: verifier,
    });
    return requestToken(body, "Discord login");
  }

  async function refreshToken(refresh_token) {
    const body = new URLSearchParams({
      client_id: CONFIG.CLIENT_ID,
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    });
    return requestToken(body, "Discord session refresh");
  }

  async function fetchUser(accessToken) {
    const res = await fetch(DISCORD_API + "/users/@me", {
      headers: { Authorization: "Bearer " + accessToken },
    });
    if (!res.ok) throw new Error("Failed to load user (" + res.status + ")");
    return res.json();
  }

  async function getValidToken() {
    const s = getSession();
    if (!s) return null;
    if (s.expires_at && Date.now() < s.expires_at - 5000) return s.access_token;
    if (s.refresh_token) {
      const t = await refreshToken(s.refresh_token);
      const updated = Object.assign({}, s, {
        access_token: t.access_token,
        refresh_token: t.refresh_token || s.refresh_token,
        expires_at: Date.now() + (t.expires_in || 604800) * 1000,
      });
      setSession(updated);
      return updated.access_token;
    }
    return s.access_token;
  }

  /* ----------------------------- callback ------------------------------- */
  async function handleCallback() {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const state = params.get("state");
    const err = params.get("error");

    if (err) throw new Error("Discord returned an error: " + err);
    if (!code) return false;

    const savedState = sessionStorage.getItem(SS_STATE);
    const verifier = sessionStorage.getItem(SS_VERIFIER);

    if (!verifier || !savedState || !state) {
      throw new Error("Login state expired — please start the login again.");
    }
    if (savedState !== state) {
      throw new Error("State mismatch (possible CSRF). Please try logging in again.");
    }

    const tok = await exchangeCode(code, verifier);
    const user = await fetchUser(tok.access_token);

    const session = {
      access_token: tok.access_token,
      refresh_token: tok.refresh_token,
      expires_at: Date.now() + (tok.expires_in || 604800) * 1000,
      user: user,
    };
    setSession(session);
    sessionStorage.removeItem(SS_VERIFIER);
    sessionStorage.removeItem(SS_STATE);
    history.replaceState(null, "", location.pathname);
    window.dispatchEvent(new Event("pv:auth-changed"));
    return true;
  }

  function logout() {
    clearSession();
    sessionStorage.removeItem(SS_VERIFIER);
    sessionStorage.removeItem(SS_STATE);
  }

  /* ----------------------------- nav UI --------------------------------- */
  function initNavAuth() {
    const loginBtn = document.getElementById("nav-login");
    const userBox = document.getElementById("nav-user");
    const sideUser = document.getElementById("side-user");
    const hasAny = loginBtn || userBox || sideUser;
    if (!hasAny) return;

    function render() {
      const s = getSession();
      const loggedIn = isLoggedIn();

      // Top-nav chip (index.html / dashboard topbar)
      if (loginBtn) loginBtn.hidden = loggedIn;
      if (userBox) userBox.hidden = !loggedIn;
      if (loggedIn) {
        const av = document.getElementById("nav-avatar");
        const nm = document.getElementById("nav-username");
        const link = document.getElementById("nav-user-link");
        if (av) av.src = avatarUrl(s.user) || av.src;
        if (nm) nm.textContent = s.user.global_name || s.user.username;
        if (link) link.href = CONFIG.REDIRECT_PATH;
      }

      // Sidebar user card (dashboard.html)
      if (sideUser) {
        const sav = document.getElementById("side-avatar");
        const snm = document.getElementById("side-username");
        const spl = document.getElementById("side-plan");
        if (loggedIn) {
          if (sav) sav.src = avatarUrl(s.user) || sav.src;
          if (snm) snm.textContent = s.user.global_name || s.user.username;
          if (spl) spl.textContent = "Free plan";
        } else {
          if (sav) sav.src = "";
          if (snm) snm.textContent = "";
          if (spl) spl.textContent = "";
        }
      }
    }

    if (loginBtn) {
      loginBtn.addEventListener("click", function (e) {
        e.preventDefault();
        login();
      });
    }

    function doLogout(e) {
      if (e) e.preventDefault();
      logout();
      render();
      if (
        location.pathname.endsWith(CONFIG.REDIRECT_PATH) ||
        location.pathname.endsWith("/dashboard.html")
      ) {
        location.href = "index.html";
      }
    }

    const lo = document.getElementById("nav-logout");
    if (lo) lo.addEventListener("click", doLogout);
    const slo = document.getElementById("side-logout");
    if (slo) slo.addEventListener("click", doLogout);

    // The OAuth callback is handled by dashboard.js after DOMContentLoaded.
    // Refresh the sidebar as soon as that callback stores the real user.
    window.addEventListener("pv:auth-changed", render);
    render();
  }

  return {
    CONFIG: CONFIG,
    login: login,
    logout: logout,
    getSession: getSession,
    isLoggedIn: isLoggedIn,
    getValidToken: getValidToken,
    handleCallback: handleCallback,
    avatarUrl: avatarUrl,
    initNavAuth: initNavAuth,
    getRedirectUri: getRedirectUri,
  };
})();

// Expose globally so dashboard.js (a separate <script>) can use it.
if (typeof window !== "undefined") window.PVAuth = PVAuth;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", PVAuth.initNavAuth);
} else {
  PVAuth.initNavAuth();
}
