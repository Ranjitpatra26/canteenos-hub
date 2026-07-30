> Deploying on Lovable? None of this is required — press **Publish** in the
> editor. The steps below are for deploying CanteenOS outside Lovable.

# Deploying CanteenOS

CanteenOS is a **server-rendered TanStack Start app** (React 19 + Vite 8),
built through Nitro. It is *not* a static SPA: HTML is rendered per request,
so the host must be able to run a JavaScript server/edge function. There is no
`_redirects` / SPA fallback file to add — routing is handled by the server.

---

## 1. Prerequisites

- Node.js 20+ (or Bun 1.1+)
- A Supabase project (Lovable Cloud provisions one automatically)
- An account on your target host (Lovable, Vercel, Netlify, or Cloudflare)

## 2. Environment variables

Copy `.env.example` to `.env` and fill in the values. No secret is hardcoded
anywhere in the source — everything is read from the environment.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | client | Backend URL used by the browser client |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | client | Publishable (anon) key — safe to expose |
| `VITE_SUPABASE_PROJECT_ID` | client | Project reference |
| `SUPABASE_URL` | server | Same URL, used during SSR and in server functions |
| `SUPABASE_PUBLISHABLE_KEY` | server | Publishable key for SSR / auth middleware |
| `SUPABASE_SERVICE_ROLE_KEY` | server | **Secret.** Bypasses row level security — server only |
| `NITRO_PRESET` | build | Build target: `cloudflare` (default), `vercel`, `netlify`, `node-server` |

Rules:

- `VITE_*` variables are inlined into the browser bundle at build time. Only
  publishable values may use that prefix.
- `SUPABASE_SERVICE_ROLE_KEY` is read only inside server code
  (`src/integrations/supabase/client.server.ts`). Never add a `VITE_` copy of it.
- Store server secrets in the host's encrypted environment variable UI, not in
  a committed file. `.env` is git-ignored; `.env.example` holds placeholders only.

## 3. Local build and verification

```bash
npm install          # or: bun install
npm run build        # production build (Nitro + Vite, prerender + SSR bundle)
npm run preview      # serve the production build locally
```

`npm run build:dev` produces a development-mode build for debugging.
The build must finish with `✓ built` and no errors before you deploy.

## 4. Deploy to Lovable (recommended)

1. Press **Publish** in the Lovable editor.
2. Backend changes (database, storage, server functions) deploy immediately;
   frontend changes go live when you press Update in the publish dialog.
3. Optionally connect a custom domain in **Project settings → Domains**.

Environment variables are managed for you — nothing to configure.

## 5. Deploy to Vercel

1. Import the repository at <https://vercel.com/new>.
2. Vercel picks up `vercel.json`, which sets:
   - build command `NITRO_PRESET=vercel npm run build`
   - output directory `.vercel/output` (Nitro's Build Output API v3)
   - long-lived caching for hashed assets and no-cache for `/sw.js`
   - baseline security headers at the edge
3. Add every variable from section 2 under **Settings → Environment Variables**
   (Production *and* Preview). Mark `SUPABASE_SERVICE_ROLE_KEY` as sensitive.
4. Deploy. Verify `/`, a deep link such as `/login`, `/robots.txt`,
   `/sitemap.xml` and `/manifest.webmanifest` all respond.

CLI alternative:

```bash
npm i -g vercel
vercel link
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel --prod
```

## 6. Deploy to Netlify

1. Create a new site from Git at <https://app.netlify.com/start>.
2. Netlify reads `netlify.toml`, which sets:
   - build command `NITRO_PRESET=netlify npm run build`
   - publish directory `dist/client` and functions directory `.netlify/functions-internal`
   - asset caching plus the same security headers
3. Add the environment variables from section 2 under
   **Site configuration → Environment variables**.
4. Deploy and run the same URL checks as above.

CLI alternative:

```bash
npm i -g netlify-cli
netlify link
netlify env:set SUPABASE_SERVICE_ROLE_KEY "<value>"
netlify deploy --build --prod
```

## 7. Deploy to Cloudflare Workers (default preset)

```bash
npm run build                      # NITRO_PRESET defaults to cloudflare
npx wrangler deploy                # uses the generated dist/server/wrangler.json
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

## 8. Supabase configuration after deploy

In the backend auth settings, add the deployed origin to:

- **Site URL** — e.g. `https://canteenos.example.com`
- **Redirect URLs** — the same origin (and `/*`) so email confirmation,
  password reset and OAuth callbacks return to the live site.

Missing these is the usual cause of "invalid redirect URL" after sign-in.

## 9. What is already configured

| Area | Where |
| --- | --- |
| Production build + code splitting | `vite.config.ts`, automatic route splitting |
| Dev vs prod config | `npm run dev` / `build` / `build:dev`, `import.meta.env.PROD` guards |
| Security headers | `src/server.ts` (all hosts) + `vercel.json` / `netlify.toml` (edge) |
| Production error handling | `src/server.ts` SSR fallback, root `errorComponent`, per-page error boundaries |
| Loading fallbacks | Route pending components, skeletons, `IntroLoader` |
| SEO + Open Graph + dynamic titles | Per-route `head()` in `src/routes/*` |
| Favicon and app icons | `public/favicon.png`, `apple-touch-icon.png`, `icon-*.png` |
| robots.txt | `public/robots.txt` |
| sitemap.xml | `src/routes/sitemap[.]xml.ts` (server route, always in sync) |
| Web app manifest | `public/manifest.webmanifest` |
| Service worker / offline | `vite-plugin-pwa` (`generateSW`), registered in `src/lib/pwa.ts` |

Set `BASE_URL` in `src/routes/sitemap[.]xml.ts` to your final domain once it is
known; relative paths work until then.

## 10. Post-deploy checklist

- [ ] `/` renders and the hero animation runs
- [ ] Sign up, sign in, sign out all work against the live backend
- [ ] Student, kitchen and admin dashboards load for their roles
- [ ] Realtime order updates arrive between two browser windows
- [ ] `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` return 200
- [ ] The app is installable and offline mode serves the last visited page
- [ ] No console errors and no secrets visible in the browser bundle
