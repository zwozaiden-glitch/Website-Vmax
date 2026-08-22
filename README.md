# Website-Vmax

Landing page + dashboard for **Protect-Vmax** — a Lua script whitelist & protection service (HWID locking, key drops, validation API).

## Pages

- `index.html` — marketing landing page
- `dashboard.html` — post-login dashboard (Discord account)
- `auth.js` — Discord OAuth 2.0 login (PKCE, client-side, no client secret)
- `dashboard.js` / `dashboard.css` — dashboard UI + rendering
- `script.js` / `styles.css` — landing page interactivity + theme
- `auth-proxy/server.mjs` — optional CORS-safe token proxy (see below)

## Discord login (real)

The site uses the **Authorization Code + PKCE** flow so it works without a server-side client secret.

1. Create an app at <https://discord.com/developers/applications>.
2. In `auth.js`, set `CONFIG.CLIENT_ID` to your app's **Client ID**.
3. In the Discord app's **OAuth2** settings, add a Redirect:
   `<your-site>/dashboard` (must match exactly, including the preview URL if testing there).
4. In **OAuth2 → Scopes**, `identify` (and `email` if you want it) are requested by the code.

That's it — clicking **Log in** starts the flow and Discord redirects back to `/dashboard`, which serves `dashboard.html` and fetches the user.

### CORS note

The recommended `railway-server/server.mjs` exposes a same-origin `POST /token` proxy for the PKCE exchange, which is the default configured in `auth.js`. If the static site is deployed separately, run the included proxy and point `TOKEN_PROXY` at its public URL:

```bash
node auth-proxy/server.mjs          # listens on http://localhost:3000/token
```

```js
// in auth.js
const CONFIG = { /* ... */ TOKEN_PROXY: "https://your-auth-proxy.example/token" };
```

## Connect the dashboard to your backend (Netlify + Railway)

The site is static; your Railway service is the API. They are **different origins**, so:

1. **Discord OAuth redirect** — in the Discord app, add the origin where **this site** is served + `/dashboard`. If you serve the static files from your Railway service, that's:
   `https://vmax-host.up.railway.app/dashboard`
   (auth.js derives the redirect URI automatically from the live origin, so just register whatever domain the site actually runs on.)
2. **`auth.js`** — set `CONFIG.CLIENT_ID` to your Discord app's Client ID. The redirect URI is the live site's `/dashboard` path.
3. **`dashboard.js` → `CONFIG.API_BASE`** — set it to your Railway public URL, e.g.
   `"https://discord-project-production-a058.up.railway.app"`. Leave `""` to keep the local empty/zero state. `HOST_BASE` is where hosted `.lua` files live (use your short custom domain in prod, e.g. `https://vmax.dev/s`).
4. **Railway CORS** — only needed if the static site lives on a **different origin** than the API. Allow the site's origin, e.g.
   `Access-Control-Allow-Origin: <your-static-site-domain>` (and handle `OPTIONS` preflight).
   *(Skip CORS entirely if you serve the static files from the same Railway service/origin as the API.)*

### API contract the dashboard expects
- `GET /api/user/:discordId` (Authorization: `Bearer <access_token>`) →
  ```json
  {
    "apiKey": "VMAX-...",
    "plan": "Vmax",
    "scripts": [
      { "name": "luasnapper", "status": "online", "hwid": 31, "executions": 412, "created": "2026-07-15" }
    ]
  }
  ```
  The dashboard computes each script's hosted URL as `HOST_BASE + "/" + sha256(apiKey + "::" + name) + ".lua"`, so host the file at that path.
- `GET /s/:hash` (or `/scripts/hosted/:hash.lua`) → the raw `.lua` source the loader fetches.
- (already referenced by `script.js`) `GET /api/v1/load`, `GET /api/v1/validate`.

**Security:** don't ship a global token in the client. Make the hosted hash a capability (the URL is the secret) or require `?key=<script_key>` on the loader endpoint.

## Notes

- Dashboard account data comes from the API; failed requests show an empty state rather than fabricated user data.
- The static site has no backend; the API host / token used by the loader live in `script.js`.

## Deploy to `vmax-host` (same-origin, recommended)

`railway-server/server.mjs` is a **zero-dependency Node server** that runs your whole site + API on the same origin (no CORS). It:

- serves the static files (`index.html`, `dashboard.html`, `*.js/css/svg`),
- `GET /dashboard` — serves `dashboard.html` at the public OAuth callback route,
- `GET /api/user/:discordId` — verifies the Discord `Bearer` token (calls Discord `/users/@me`), then returns `{ apiKey, plan, scripts }`,
- `GET /scripts/hosted/<hash>.lua` — returns the raw `.lua` the loader fetches,
- `POST /token` — same-origin Discord OAuth token proxy used by `auth.js`,
- `GET /healthz` — health check.

Steps:

1. Copy the `railway-server/` folder into your `vmax-host` Railway service, next to `index.html` / `dashboard.html`.
2. Set the service **start command** to `node railway-server/server.mjs` (Railway provides `PORT`).
3. Register the Discord redirect URI: `https://vmax-host.up.railway.app/dashboard`.
4. In `server.mjs`, start your Discord bot in the same process and call
   `registerScript(discordId, name, luaSource, opts)` from your `/setup` (or equivalent) command so generated scripts appear in the dashboard.

`HOST_BASE` / `PORT` / `STATIC_DIR` can be overridden with environment variables (see the file header). For the browser→Discord token exchange, if you hit CORS, run `auth-proxy/server.mjs` and set `CONFIG.TOKEN_PROXY` in `auth.js`.
