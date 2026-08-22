/* ==========================================================================
   Protect-Vmax — vmax-host server  (drop-in for your Railway service)
   --------------------------------------------------------------------------
   ONE process that:
     1. Serves the static site (index.html, dashboard.html, *.js/css/svg)
     2. GET /api/user/:discordId  -> JSON the dashboard expects
        (verifies the Discord access token, then returns apiKey + scripts)
     3. GET /scripts/hosted/<hash>.lua -> the raw .lua the loader fetches
     4. POST /token -> same-origin Discord OAuth token proxy
     5. GET /healthz -> "ok" (Railway health check)

   Zero dependencies (Node built-ins only). Needs Node 18+.

   HOW TO DEPLOY (Railway, "railway same" = static + API on vmax-host):
     - Copy this whole railway-server/ folder into your vmax-host service,
       next to your static files (index.html, dashboard.html, ...).
     - Set the service start command to:  node railway-server/server.mjs
     - The server serves static files from the PARENT of this folder.
       If you put server.mjs at the service root instead, set
       STATIC_DIR=. (env) — see below.
     - Register the Discord redirect URI:
       https://vmax-host.up.railway.app/dashboard
   ========================================================================== */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIC_DIR = process.env.STATIC_DIR
  ? path.resolve(process.env.STATIC_DIR)
  : path.resolve(__dirname, ".."); // server lives in a subfolder
const PORT = process.env.PORT || 3000;
const HOST_BASE = process.env.HOST_BASE || "https://vmax-host.up.railway.app/scripts/hosted";
const DISCORD_API = "https://discord.com/api";
const DISCORD_TOKEN = "https://discord.com/api/oauth2/token";
const DISCORD_CLIENT_ID = (
  process.env.DISCORD_CLIENT_ID ||
  process.env.CLIENT_ID ||
  "1540626944557850624"
).trim();
const DISCORD_CLIENT_SECRET = (process.env.DISCORD_CLIENT_SECRET || "").trim();

/* ---------------------- data stores (REPLACE WITH REAL DB) -------------- *
 * In-memory for now. Wire these to your real database / Discord bot:
 *   - `users`  : discordId -> { apiKey, plan, scripts: [] }
 *   - `hosted` : hostHash  -> raw lua source string
 * Call registerScript() from your bot's /setup or /setup command.
 * ------------------------------------------------------------------------ */
const users = new Map();
const hosted = new Map();

function registerScript(discordId, name, luaSource, opts = {}) {
  let rec = users.get(discordId);
  if (!rec) {
    rec = { apiKey: deriveApiKey({ id: discordId }), plan: opts.plan || "Free", scripts: [] };
    users.set(discordId, rec);
  }
  const hash = hostHash(rec.apiKey, name);
  hosted.set(hash, luaSource);
  rec.scripts.push({
    name,
    status: opts.status || "online",
    hwid: opts.hwid || 0,
    executions: opts.executions || 0,
    created: opts.created || new Date().toISOString().slice(0, 10),
  });
  return hash;
}

/* ---------------------- deterministic hashing (mirrors dashboard.js) ---- */
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
function deriveApiKey(user) {
  const seed = (user.id || "") + "|" + (user.username || "");
  return "VMAX-" + hashHex(seed, 16).toUpperCase();
}
function hostHash(apiKey, name) {
  return hashHex(apiKey + "::" + name, 64);
}

/* ---------------------- HTTP helpers ------------------------------------ */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".lua": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".map": "application/json; charset=utf-8",
};

function setCommon(res, status, type) {
  res.writeHead(status, {
    "Content-Type": type || "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
}
function sendJSON(res, status, obj) {
  setCommon(res, status, "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}
function sendText(res, status, text, type) {
  setCommon(res, status, type || "text/plain; charset=utf-8");
  res.end(text);
}

/* The browser uses this same-origin route for the PKCE token exchange.
   If this Discord application is a confidential OAuth client, Railway can
   provide DISCORD_CLIENT_SECRET and this server adds it without ever exposing
   the secret to browser JavaScript. Public OAuth clients continue to work
   with PKCE when that variable is not set. */
async function handleTokenProxy(req, res) {
  let body = "";
  try {
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 64 * 1024) {
        return sendJSON(res, 413, { error: "request_too_large" });
      }
    }

    const params = new URLSearchParams(body);
    const requestedClientId = params.get("client_id") || DISCORD_CLIENT_ID;
    if (!requestedClientId || requestedClientId !== DISCORD_CLIENT_ID) {
      return sendJSON(res, 400, {
        error: "invalid_client",
        error_description: "OAuth client ID does not match this website.",
      });
    }
    params.set("client_id", DISCORD_CLIENT_ID);
    if (DISCORD_CLIENT_SECRET) {
      params.set("client_secret", DISCORD_CLIENT_SECRET);
    } else {
      // Never forward a client secret supplied by an untrusted browser.
      params.delete("client_secret");
    }

    const upstream = await fetch(DISCORD_TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const text = await upstream.text();
    setCommon(
      res,
      upstream.status,
      upstream.headers.get("content-type") || "application/json; charset=utf-8"
    );
    res.end(text);
  } catch (err) {
    sendJSON(res, 502, {
      error: "token_proxy_failed",
      error_description: "Could not reach Discord's login service.",
    });
  }
}

/* ---------------------- routes ------------------------------------------ */
async function handleUser(req, res, id) {
  const auth = req.headers["authorization"] || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return sendJSON(res, 401, { error: "missing token" });

  let me;
  try {
    const r = await fetch(DISCORD_API + "/users/@me", {
      headers: { Authorization: "Bearer " + m[1] },
    });
    if (!r.ok) return sendJSON(res, 401, { error: "invalid discord token" });
    me = await r.json();
  } catch (e) {
    return sendJSON(res, 502, { error: "discord unreachable" });
  }

  if (me.id !== id) return sendJSON(res, 403, { error: "token / user mismatch" });

  let rec = users.get(me.id);
  if (!rec) {
    rec = { apiKey: deriveApiKey(me), plan: "Free", scripts: [] };
    users.set(me.id, rec);
  }

  sendJSON(res, 200, {
    apiKey: rec.apiKey,
    plan: rec.plan,
    scripts: rec.scripts.map(function (s) {
      return {
        name: s.name,
        status: s.status || "paused",
        hwid: s.hwid || 0,
        executions: s.executions || 0,
        created: s.created || "",
        hostedUrl: HOST_BASE + "/" + hostHash(rec.apiKey, s.name) + ".lua",
      };
    }),
  });
}

function handleHosted(res, hash) {
  const lua = hosted.get(hash);
  if (!lua) return sendText(res, 404, "-- script not found", "text/plain; charset=utf-8");
  sendText(res, 200, lua, "text/plain; charset=utf-8");
}

function serveStatic(res, pathname) {
  const rel = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.resolve(STATIC_DIR, "." + rel));
  if (filePath !== STATIC_DIR && !filePath.startsWith(STATIC_DIR + path.sep)) {
    return sendText(res, 403, "forbidden", "text/plain");
  }
  fs.readFile(filePath, function (err, data) {
    if (err) return sendText(res, 404, "not found", "text/plain");
    const ext = path.extname(filePath).toLowerCase();
    setCommon(res, 200, MIME[ext] || "application/octet-stream");
    res.end(data);
  });
}

const server = http.createServer(function (req, res) {
  if (req.method === "OPTIONS") {
    setCommon(res, 204);
    return res.end();
  }
  const url = new URL(req.url, "http://localhost");
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === "/healthz") return sendText(res, 200, "ok");
  if (pathname === "/token") {
    if (req.method !== "POST") return sendJSON(res, 405, { error: "method_not_allowed" });
    return handleTokenProxy(req, res);
  }
  // Keep the public /dashboard URL in sync with the Discord redirect URI;
  // the actual static file remains dashboard.html.
  if (pathname === "/dashboard") return serveStatic(res, "/dashboard.html");
  if (pathname.startsWith("/api/user/")) {
    const id = pathname.slice("/api/user/".length).split("/")[0];
    return handleUser(req, res, id);
  }
  if (pathname.startsWith("/scripts/hosted/")) {
    const hash = pathname.slice("/scripts/hosted/".length).replace(/\.lua$/i, "");
    return handleHosted(res, hash);
  }
  return serveStatic(res, pathname);
});

/* ==========================================================================
   START
   --------------------------------------------------------------------------
   TODO: start your Discord bot in the same process here, e.g.
     import("./your-bot.mjs");   // or require('./bot')
   The bot should call registerScript(discordId, name, lua, {...}) whenever
   a user generates a script, so it appears in the dashboard.
   ========================================================================== */
server.listen(PORT, function () {
  console.log("Protect-Vmax vmax-host server listening on :" + PORT);
  console.log("Serving static files from: " + STATIC_DIR);
});
