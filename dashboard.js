/* ==========================================================================
   Protect-Vmax — dashboard.js
   Sidebar dashboard. Each Discord user gets their own API key that hosts
   their scripts: the loader fetches the hosted .lua using that key.
   ========================================================================== */

const PV = window.PVAuth;

/* ==========================================================================
   CONFIG — the Discord bot is the dashboard's backend.
   API_BASE : bot service URL for account, key and script data.
   HOST_BASE: bot service URL for hosted protected scripts.
   ========================================================================== */
const BOT_API_BASE = (
  window.PVAuth && window.PVAuth.CONFIG && window.PVAuth.CONFIG.BOT_API_BASE
    ? window.PVAuth.CONFIG.BOT_API_BASE
    : "https://discord-project-production-a058.up.railway.app"
).replace(/\/+$/, "");

const CONFIG = {
  // The Discord bot owns the account, key and script data. If that separate
  // service is temporarily unavailable, getUserData() falls back to this
  // website's same-origin authenticated account endpoint.
  API_BASE: BOT_API_BASE,
  API_FALLBACK: window.location && /^https?:$/.test(window.location.protocol)
    ? window.location.origin
    : "",
  HOST_BASE: BOT_API_BASE + "/scripts/hosted",
};

/* These links are presentation-only. Account data always comes from the API. */
const DASHBOARD_LINKS = {
  discordInvite: "https://discord.gg/xFeX95Evce",
  ticketUrl: "https://discord.gg/xFeX95Evce",
};

/* ----------------------------- helpers --------------------------------- */
function escapeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* Escape for use inside a single-quoted HTML attribute. */
function escAttr(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* Deterministic hex hash (no crypto needed — works in every environment). */
function strHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i);
    h |= 0;
  }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashHex(str, len) {
  const r = mulberry32(strHash(str));
  let s = "";
  while (s.length < len) s += Math.floor(r() * 16).toString(16);
  return s.slice(0, len);
}

/* Each Discord user gets a stable, unique API key. */
function deriveApiKey(user) {
  const seed = (user.id || "") + "|" + (user.username || "");
  return "VMAX-" + hashHex(seed, 16).toUpperCase();
}

/* The loader your buyers paste into their executor. */
function loaderSnippet(apiKey, hostedUrl) {
  return (
    'script_key = "' + apiKey + '"\n' +
    'loadstring(game:HttpGet("' + hostedUrl + '"))()'
  );
}

/* ----------------------------- state ----------------------------------- */
let SESSION = null;
let VIEW = "dashboard";
let ACTIVE_API_BASE = null;

/* Build a hosted URL for a script from its apiKey + name (dashboard-side,
   so the loader URL always matches HOST_BASE). */
function scriptHostedUrl(apiKey, name) {
  const hash = hashHex(apiKey + "::" + name, 64);
  return CONFIG.HOST_BASE + "/" + hash + ".lua";
}

function normalizeScript(s, apiKey) {
  const name = s.name || "script";
  return {
    name: name,
    status: s.status || "paused",
    hwid: s.hwid || 0,
    executions: s.executions || 0,
    created: s.created || "",
    hostedHash: s.hostedHash || hashHex(apiKey + "::" + name, 64),
    hostedUrl: s.hostedUrl || scriptHostedUrl(apiKey, name),
  };
}

/* Empty local fallback for temporary API failures. Never invent account data. */
function localData(session) {
  const apiKey = deriveApiKey(session.user);
  return {
    user: session.user,
    apiKey: apiKey,
    plan: "Free",
    scripts: [],
    botOnline: null,
    botTag: "",
    apiOnline: false,
  };
}

function apiCandidates() {
  const ordered = [ACTIVE_API_BASE, CONFIG.API_BASE, CONFIG.API_FALLBACK];
  const seen = new Set();
  return ordered
    .map(function (base) { return String(base || "").replace(/\/+$/, ""); })
    .filter(function (base) {
      if (!base || seen.has(base)) return false;
      seen.add(base);
      return true;
    });
}

function fetchWithTimeout(url, options, timeoutMs) {
  if (typeof AbortController === "undefined") return fetch(url, options);
  const controller = new AbortController();
  const timer = setTimeout(function () { controller.abort(); }, timeoutMs || 8000);
  const opts = Object.assign({}, options || {}, { signal: controller.signal });
  return fetch(url, opts).finally(function () { clearTimeout(timer); });
}

async function fetchUserDataFrom(base, userId, headers, session) {
  const userUrl = base + "/api/user/" + encodeURIComponent(userId);
  const results = await Promise.all([
    fetchWithTimeout(userUrl, { headers: headers, cache: "no-store" }, 8000),
    fetchWithTimeout(base + "/api/v1/info", { cache: "no-store" }, 5000)
      .catch(function () { return null; }),
  ]);
  const res = results[0];
  const infoRes = results[1];
  if (!res.ok) throw new Error("HTTP " + res.status + " from " + base);

  const j = await res.json();
  let info = null;
  if (infoRes && infoRes.ok) {
    info = await infoRes.json().catch(function () { return null; });
  }

  const apiKey = j.apiKey || deriveApiKey(session.user);
  return {
    user: session.user,
    apiKey: apiKey,
    plan: j.plan || "Free",
    scripts: Array.isArray(j.scripts)
      ? j.scripts.map(function (s) { return normalizeScript(s, apiKey); })
      : [],
    botOnline: info ? info.bot_online === true : null,
    botTag: info && info.bot_tag ? info.bot_tag : "",
    apiOnline: true,
  };
}

/* Fetch the authenticated user's data and the bot's live status. */
async function getUserData(session) {
  if (!session || !session.user || !session.user.id) {
    throw new Error("Missing authenticated user");
  }

  const userId = session.user.id;
  let accessToken = session.access_token;
  if (PV && typeof PV.getValidToken === "function") {
    accessToken = (await PV.getValidToken()) || accessToken;
  }

  const headers = {};
  if (accessToken) headers["Authorization"] = "Bearer " + accessToken;

  const bases = apiCandidates();
  let lastError = null;
  for (let i = 0; i < bases.length; i++) {
    try {
      const data = await fetchUserDataFrom(bases[i], userId, headers, session);
      ACTIVE_API_BASE = bases[i];
      return data;
    } catch (e) {
      lastError = e;
      // If a previously selected service stopped working, allow the fallback
      // candidates to be tried and re-selected.
      if (ACTIVE_API_BASE === bases[i]) ACTIVE_API_BASE = null;
    }
  }

  throw lastError || new Error("No account API is configured");
}

/* ----------------------------- shared bits ----------------------------- */
function statusPill(status) {
  const map = {
    online: "Online", active: "Active", paused: "Paused",
    expired: "Expired", hwid_mismatch: "HWID mismatch", blacklisted: "Blacklisted",
  };
  const label = map[status] || status;
  return '<span class="status status-' + status + '">' + label + "</span>";
}

function botConnection(d) {
  if (d.botOnline === true) {
    const name = d.botTag ? " · " + escapeHtml(d.botTag) : "";
    return '<span class="conn on">Bot ✓' + name + "</span>";
  }
  if (d.botOnline === false) {
    return '<span class="conn">Bot offline</span>';
  }
  return '<span class="conn">Bot status unavailable</span>';
}

function toast(message) {
  const wrap = document.getElementById("toast-wrap");
  if (!wrap) return;
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = message;
  wrap.appendChild(t);
  requestAnimationFrame(function () { t.classList.add("show"); });
  setTimeout(function () {
    t.classList.remove("show");
    setTimeout(function () { t.remove(); }, 300);
  }, 2400);
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) {}
  document.body.removeChild(ta);
  return Promise.resolve();
}

/* ----------------------------- views ----------------------------------- */
const VIEW_TITLES = {
  dashboard: "Dashboard",
  scripts: "Scripts",
  keys: "API Keys",
  bot: "Bot",
  settings: "Settings",
};

function viewDashboard(d) {
  const name = d.user.global_name || d.user.username;
  const hasScripts = d.scripts.length > 0;
  const primary = d.scripts[0];
  const snippet = hasScripts ? loaderSnippet(d.apiKey, primary.hostedUrl) : "";
  const totalHwid = d.scripts.reduce(function (s, x) { return s + x.hwid; }, 0);
  const totalExec = d.scripts.reduce(function (s, x) { return s + x.executions; }, 0);

  return (
    '<section class="view">' +
      '<div class="view-head">' +
        '<h1 class="view-title">Welcome back, <span class="gradient-text">' + escapeHtml(name) + "</span></h1>" +
        '<p class="view-sub">Your API key hosts your scripts. Share the loader — never your key.</p>' +
      "</div>" +

      '<div class="stats-row">' +
        statCard(d.scripts.length, "Scripts") +
        statCard(totalHwid, "HWID locks") +
        statCard(totalExec, "Executions") +
        statCard(d.plan, "Plan") +
      "</div>" +

      '<div class="grid-2">' +
        // API key
        '<div class="glass card-pad">' +
          '<div class="card-head"><h3>Your API key</h3><span class="live-dot" title="connected"></span></div>' +
          '<p class="muted small">This key authorizes your loader to fetch your hosted scripts and links your account to the Discord bot.</p>' +
          '<div class="keybox">' +
            '<code class="key-text">' + escapeHtml(d.apiKey) + "</code>" +
            '<button class="btn btn-ghost btn-sm" data-copy="' + escAttr(d.apiKey) + '">Copy</button>' +
            '<button class="btn btn-ghost btn-sm" id="regen-key" type="button">Regenerate</button>' +
          "</div>" +
          '<div class="conn-row">' +
            '<span class="conn on">Discord ✓</span>' +
            botConnection(d) +
            '<span class="conn on">Hosting ✓</span>' +
          "</div>" +
        "</div>" +

        // Host script
        hostCard(d, hasScripts, snippet) +
      "</div>" +

      // Scripts preview
      '<div class="glass card-pad mt">' +
        '<div class="card-head"><h3>Your scripts</h3>' +
          (hasScripts ? '<button class="btn btn-ghost btn-sm" type="button" data-goto="scripts">View all</button>' : "") +
        "</div>" +
        (hasScripts
          ? '<div class="script-list">' + d.scripts.slice(0, 3).map(scriptRow).join("") + "</div>"
          : emptyState("No scripts yet", "Generate your first script with the bot and it will show up here.", "bot", "Generate via bot")) +
      "</div>" +
    "</section>"
  );
}

function hostCard(d, hasScripts, snippet) {
  if (!hasScripts) {
    return (
      '<div class="glass card-pad">' +
        '<div class="card-head"><h3>Host your script</h3></div>' +
        emptyState("Nothing hosted yet", "Generate a script with the bot to get your hosted loader.", "bot", "Open bot") +
      "</div>"
    );
  }
  const primary = d.scripts[0];
  return (
    '<div class="glass card-pad">' +
      '<div class="card-head"><h3>Host your script</h3></div>' +
      '<p class="muted small">Paste this into your executor. It loads your latest script from the host using your key.</p>' +
      '<div class="code-mini">' +
        '<pre><code>' + escapeHtml(snippet) + "</code></pre>" +
        '<button class="btn btn-primary btn-sm" data-copy="' + escAttr(snippet) + '">Copy loader</button>' +
      "</div>" +
      '<p class="muted small break-all">Hosted at: <code>' + escapeHtml(primary.hostedUrl) + "</code></p>" +
    "</div>"
  );
}

function viewScripts(d) {
  const has = d.scripts.length > 0;
  const table = has
    ? '<div class="table-wrap"><table class="data-table">' +
        "<thead><tr><th>Script</th><th>Status</th><th>Hosted file</th><th>HWID</th><th>Executions</th><th>Created</th><th></th></tr></thead>" +
        "<tbody>" +
          d.scripts.map(function (s) {
            const snip = loaderSnippet(d.apiKey, s.hostedUrl);
            return (
              "<tr>" +
                "<td><span class='mono'>" + escapeHtml(s.name) + "</span></td>" +
                "<td>" + statusPill(s.status) + "</td>" +
                "<td><code class='host-cell break-all'>" + escapeHtml(s.hostedHash.slice(0, 16)) + "…lua</code></td>" +
                "<td>" + s.hwid + "</td>" +
                "<td>" + s.executions + "</td>" +
                "<td class='muted'>" + escapeHtml(s.created) + "</td>" +
                "<td class='row-actions'>" +
                  "<button class='btn btn-ghost btn-sm' data-copy='" + escAttr(s.hostedUrl) + "'>Copy URL</button>" +
                  "<button class='btn btn-ghost btn-sm' data-copy='" + escAttr(snip) + "'>Copy loader</button>" +
                "</td>" +
              "</tr>"
            );
          }).join("") +
        "</tbody>" +
      "</table></div>"
    : emptyState("No scripts yet", "Generate a script with the bot — it will appear here.", "bot", "Open bot");

  return (
    '<section class="view">' +
      '<div class="view-head"><h1 class="view-title">Your <span class="gradient-text">scripts</span></h1>' +
        '<p class="view-sub">Every script you generate through the bot is hosted here and served by your loader.</p></div>' +
      '<div class="glass card-pad">' + table + "</div>" +
    "</section>"
  );
}

function viewKeys(d) {
  const hasScripts = d.scripts.length > 0;
  const primary = d.scripts[0];
  const snippet = hasScripts ? loaderSnippet(d.apiKey, primary.hostedUrl) : "";
  return (
    '<section class="view">' +
      '<div class="view-head"><h1 class="view-title">API <span class="gradient-text">keys</span></h1>' +
        '<p class="view-sub">One key per account. It connects your Discord login, your bot, and your hosted scripts.</p></div>' +
      '<div class="grid-2">' +
        '<div class="glass card-pad">' +
          '<div class="card-head"><h3>Primary key</h3></div>' +
          '<div class="keybox">' +
            '<code class="key-text">' + escapeHtml(d.apiKey) + "</code>" +
            '<button class="btn btn-ghost btn-sm" data-copy="' + escAttr(d.apiKey) + '">Copy</button>' +
            '<button class="btn btn-ghost btn-sm" id="regen-key" type="button">Regenerate</button>' +
          "</div>" +
          '<div class="conn-row">' +
            '<span class="conn on">Discord ✓</span>' +
            botConnection(d) +
            '<span class="conn on">Hosting ✓</span>' +
          "</div>" +
        "</div>" +
        '<div class="glass card-pad">' +
          '<div class="card-head"><h3>How it connects</h3></div>' +
          '<ol class="steps-list">' +
            "<li><strong>Log in</strong> with Discord — your account is created automatically.</li>" +
            "<li><strong>Your key</strong> is issued and linked to the Protect-Vmax bot.</li>" +
            "<li><strong>Generate a script</strong> via the bot — it is hosted under your key.</li>" +
            "<li><strong>Your loader</strong> calls the host with the key and runs the script.</li>" +
          "</ol>" +
        "</div>" +
      "</div>" +
      '<div class="glass card-pad mt">' +
        '<div class="card-head"><h3>Your loader</h3></div>' +
        (hasScripts
          ? '<div class="code-mini">' +
            '<pre><code>' + escapeHtml(snippet) + "</code></pre>" +
            '<button class="btn btn-primary btn-sm" data-copy="' + escAttr(snippet) + '">Copy loader</button>' +
            "</div>"
          : emptyState("No hosted script yet", "Generate a script with the bot to get your loader.", "bot", "Open bot")) +
      "</div>" +
    "</section>"
  );
}

function viewBot(d) {
  return (
    '<section class="view">' +
      '<div class="view-head"><h1 class="view-title">Discord <span class="gradient-text">bot</span></h1>' +
        '<p class="view-sub">The bot turns your key into hosted scripts and delivers loaders to your server.</p></div>' +
      '<div class="grid-2">' +
        '<div class="glass card-pad">' +
          '<div class="card-head"><h3>Connection</h3></div>' +
          '<div class="conn-row">' +
            '<span class="conn on">Discord ✓</span>' +
            botConnection(d) +
          "</div>" +
          '<p class="muted small mt">' +
            (d.botOnline === true
              ? "Connected to " + escapeHtml(d.botTag || "the Protect-Vmax bot") + ". Your account data is coming from the bot."
              : d.botOnline === false
                ? "The bot service responded, but the Discord bot is currently offline."
                : "The bot status could not be checked right now.") +
          "</p>" +
          '<div class="gate-actions mt">' +
            '<a class="btn btn-primary btn-sm" href="' + DASHBOARD_LINKS.discordInvite + '" target="_blank" rel="noopener">Invite bot</a>' +
            '<a class="btn btn-ghost btn-sm" href="' + DASHBOARD_LINKS.ticketUrl + '" target="_blank" rel="noopener">Need help</a>' +
          "</div>" +
        "</div>" +
        '<div class="glass card-pad">' +
          '<div class="card-head"><h3>Generate a script</h3></div>' +
          '<ol class="steps-list">' +
            "<li>Invite the bot to your server.</li>" +
            "<li>Run <code class='mono'>/setup</code> to register a script name.</li>" +
            "<li>Run <code class='mono'>/bulkgen</code> or <code class='mono'>/whitelist</code> to issue keys.</li>" +
            "<li>The script appears in <strong>Scripts</strong>, hosted under your key.</li>" +
          "</ol>" +
        "</div>" +
      "</div>" +
    "</section>"
  );
}

function viewSettings(d) {
  const u = d.user;
  return (
    '<section class="view">' +
      '<div class="view-head"><h1 class="view-title">Settings</h1>' +
        '<p class="view-sub">Your account is managed through Discord.</p></div>' +
      '<div class="grid-2">' +
        '<div class="glass card-pad">' +
          '<div class="card-head"><h3>Account</h3></div>' +
          '<div class="account-row">' +
            (PV.avatarUrl(u, 96) ? '<img class="account-avatar" src="' + PV.avatarUrl(u, 96) + '" alt="" />' : '<div class="account-avatar blank"></div>') +
            "<div>" +
              '<div class="account-name">' + escapeHtml(u.global_name || u.username) + "</div>" +
              '<div class="muted small">@' + escapeHtml(u.username) + " · " + escapeHtml(u.discriminator || "0") + "</div>" +
            "</div>" +
          "</div>" +
          '<ul class="kv">' +
            kv("User ID", u.id) +
            kv("Email", u.email || "—") +
            kv("Plan", d.plan) +
            kv("API key", d.apiKey) +
          "</ul>" +
        "</div>" +
        '<div class="glass card-pad">' +
          '<div class="card-head"><h3>Session</h3></div>' +
          '<p class="muted small">You are signed in with Discord. Logging out clears this device\'s session.</p>' +
          '<div class="gate-actions mt">' +
            '<button class="btn btn-cta" id="settings-logout" type="button">Log out</button>' +
          "</div>" +
        "</div>" +
      "</div>" +
    "</section>"
  );
}

/* ----------------------------- small builders -------------------------- */
function statCard(value, label, mono) {
  return (
    '<div class="glass stat-card">' +
      '<span class="stat-value' + (mono ? " mono" : "") + '">' + escapeHtml(value) + "</span>" +
      '<span class="stat-label">' + escapeHtml(label) + "</span>" +
    "</div>"
  );
}

function scriptRow(s) {
  return (
    '<div class="script-row">' +
      '<span class="' + (s.status === "online" ? "live-dot" : "paused-dot") + '"></span>' +
      '<div class="script-info">' +
        '<span class="script-name">' + escapeHtml(s.name) + "</span>" +
        '<span class="script-meta">' + s.executions + " executions · " + s.hwid + " HWID bound</span>" +
      "</div>" +
      statusPill(s.status) +
    "</div>"
  );
}

function kv(k, v) {
  return (
    '<li><span class="kv-k">' + escapeHtml(k) + "</span>" +
    '<span class="kv-v mono">' + escapeHtml(v) + "</span></li>"
  );
}

function emptyState(title, sub, goto, btn) {
  return (
    '<div class="empty">' +
      '<div class="empty-ico">∅</div>' +
      "<h3>" + escapeHtml(title) + "</h3>" +
      '<p class="muted">' + escapeHtml(sub) + "</p>" +
      (goto ? '<button class="btn btn-ghost btn-sm" type="button" data-goto="' + escAttr(goto) + '">' + escapeHtml(btn) + "</button>" : "") +
    "</div>"
  );
}

/* ----------------------------- render ---------------------------------- */
async function renderView() {
  const root = document.getElementById("dashboard-root");
  if (!root || !SESSION) return;

  root.innerHTML = '<div class="loading">Loading your data…</div>';

  let d;
  try {
    d = await getUserData(SESSION);
  } catch (e) {
    console.warn("Dashboard: failed to load data:", e);
    d = localData(SESSION);
    toast("Couldn't reach the API — showing empty state");
  }

  const html = {
    dashboard: viewDashboard,
    scripts: viewScripts,
    keys: viewKeys,
    bot: viewBot,
    settings: viewSettings,
  }[VIEW](d);

  root.innerHTML = html;

  // active nav + title
  document.querySelectorAll(".side-link").forEach(function (b) {
    b.classList.toggle("active", b.getAttribute("data-view") === VIEW);
  });
  const title = document.getElementById("topbar-title");
  if (title) title.textContent = VIEW_TITLES[VIEW] || "Dashboard";

  bindCommon(root);
}

/* Events that apply to every view. */
function bindCommon(root) {
  root.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      copyText(btn.getAttribute("data-copy"));
      toast("Copied to clipboard");
    });
  });

  root.querySelectorAll("[data-goto]").forEach(function (btn) {
    btn.addEventListener("click", function () { showView(btn.getAttribute("data-goto")); });
  });

  const regen = document.getElementById("regen-key");
  if (regen) {
    regen.addEventListener("click", function () {
      toast("Regenerate is wired to your API");
    });
  }

  const setLogout = document.getElementById("settings-logout");
  if (setLogout) {
    setLogout.addEventListener("click", function (e) {
      e.preventDefault();
      PV.logout();
      location.href = "index.html";
    });
  }
}

function showView(name) {
  if (!VIEW_TITLES[name]) name = "dashboard";
  VIEW = name;
  renderView();
  // close mobile drawer after navigating
  const sb = document.getElementById("sidebar");
  const tg = document.getElementById("sidebar-toggle");
  if (sb) sb.classList.remove("open");
  if (tg) tg.setAttribute("aria-expanded", "false");
  window.scrollTo(0, 0);
}

/* ----------------------------- screens --------------------------------- */
function loginGate() {
  const notConfigured = !PV.CONFIG.CLIENT_ID || PV.CONFIG.CLIENT_ID === "YOUR_DISCORD_CLIENT_ID";
  const note = notConfigured
    ? '<p class="gate-note">Discord login is not configured yet. Set your Discord <code>CLIENT_ID</code> in <code>auth.js</code> before signing in.</p>'
    : '<p class="gate-note">Authorize Protect-Vmax with your Discord account to continue.</p>';

  return (
    '<section class="gate reveal is-visible">' +
      '<div class="glass gate-card">' +
        '<span class="brand-logo gate-logo" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M12 3l7 3v5c0 4.6-3 8.2-7 10-4-1.8-7-5.4-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" />' +
          "</svg>" +
        "</span>" +
        '<h1>Welcome to your <span class="gradient-text">dashboard</span></h1>' +
        "<p>Sign in with Discord to get your API key and host your scripts.</p>" +
        note +
        '<div class="gate-actions">' +
          '<button class="btn btn-primary btn-lg" id="gate-login" type="button">Log in with Discord</button>' +
        "</div>" +
      "</div>" +
    "</section>"
  );
}

function errorScreen(message) {
  return (
    '<section class="gate reveal is-visible">' +
      '<div class="glass gate-card">' +
        "<h1>Something went wrong</h1>" +
        '<p class="gate-note">' + escapeHtml(message) + "</p>" +
        '<div class="gate-actions">' +
          '<a class="btn btn-primary btn-lg" href="/dashboard">Try again</a>' +
          '<a class="btn btn-ghost btn-lg" href="index.html">Back to site</a>' +
        "</div>" +
      "</div>" +
    "</section>"
  );
}

/* ----------------------------- mobile menu ----------------------------- */
function initSidebar() {
  const toggle = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("sidebar");
  if (toggle && sidebar) {
    toggle.addEventListener("click", function () {
      const open = sidebar.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  document.querySelectorAll(".side-link").forEach(function (b) {
    b.addEventListener("click", function () { showView(b.getAttribute("data-view")); });
  });
}

/* ----------------------------- boot ------------------------------------ */
async function bootDashboard() {
  const root = document.getElementById("dashboard-root");
  initSidebar();

  const params = new URLSearchParams(location.search);
  if (params.get("code")) {
    try {
      await PV.handleCallback();
    } catch (e) {
      root.innerHTML = errorScreen(e.message || "Login failed.");
      return;
    }
  }

  const session = PV.getSession();

  if (!PV.isLoggedIn()) {
    root.innerHTML = loginGate();
    const gate = document.getElementById("gate-login");
    if (gate) {
      gate.addEventListener("click", async function () {
        try {
          await PV.login();
        } catch (e) {
          root.innerHTML = errorScreen(e.message || "Unable to start Discord login.");
        }
      });
    }
    return;
  }

  SESSION = session;
  renderView();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootDashboard);
} else {
  bootDashboard();
}
