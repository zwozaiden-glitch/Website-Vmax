/* ==========================================================================
   Protect-Vmax — auth-proxy/server.mjs
   Optional, zero-dependency Node proxy for the Discord OAuth token exchange.

   WHY: The browser can't always call Discord's /api/oauth2/token endpoint
   directly because of CORS. If you hit a CORS error during login, run this
   proxy and point auth.js at it:

       PVAuth.CONFIG.TOKEN_PROXY = "http://localhost:3000/token";

   Run it:
       node auth-proxy/server.mjs
   (Node 18+ — uses the built-in global fetch)

   It simply forwards the form-encoded body to Discord and returns the JSON.
   It does NOT store secrets — your CLIENT_ID lives in auth.js on the client.
   ========================================================================== */

import http from "node:http";

const PORT = process.env.PORT || 3000;
const DISCORD_TOKEN = "https://discord.com/api/oauth2/token";

const server = http.createServer(async (req, res) => {
  // CORS (allow the site origin; * is fine for a local dev proxy).
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/token") {
    let body = "";
    for await (const chunk of req) body += chunk;

    try {
      const upstream = await fetch(DISCORD_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const text = await upstream.text();
      res.writeHead(upstream.status, {
        "Content-Type": "application/json",
      });
      res.end(text);
    } catch (err) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "proxy_failed", detail: String(err) }));
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not_found" }));
});

server.listen(PORT, () => {
  console.log("Protect-Vmax token proxy listening on http://localhost:" + PORT + "/token");
});
