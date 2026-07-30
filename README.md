<div align="center">

# CanteenOS

**A production-grade smart canteen ordering platform — order ahead, skip the queue, pick up with a QR code.**

Built with React 19, TypeScript, TanStack Start, Supabase, Three.js and Framer Motion.

[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack%20Start-1.x-FF4154?logo=reactquery&logoColor=white)](https://tanstack.com/start)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)](#progressive-web-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-lime.svg)](LICENSE)

[Live Demo](#) · [Deployment Guide](DEPLOYMENT.md) · [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md)

</div>

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Screenshots](#screenshots)
4. [Technology Stack](#technology-stack)
5. [Folder Structure](#folder-structure)
6. [Installation Guide](#installation-guide)
7. [Environment Variables](#environment-variables)
8. [Running Locally](#running-locally)
9. [Supabase Setup](#supabase-setup)
10. [Deployment Guide](#deployment-guide)
11. [Architecture Notes](#architecture-notes)
12. [Security](#security)
13. [Progressive Web App](#progressive-web-app)
14. [Future Improvements](#future-improvements)
15. [Credits](#credits)
16. [License](#license)

---

## Project Overview

Campus canteens fail at exactly one moment: the lunch rush. Students queue for
twenty minutes for a ten-minute meal, the kitchen cooks blind with no view of
incoming demand, and administrators have no reliable numbers on revenue,
wastage or peak load.

**CanteenOS** solves that with a single real-time platform serving three
distinct roles:

| Role | What they get |
| --- | --- |
| **Student** | Browse a live menu, build a cart, apply coupons, pay, and receive a QR pickup code with real-time order tracking |
| **Kitchen** | A Kanban preparation board with station queues, priority orders and live order streaming |
| **Admin** | Analytics on revenue, sales, customers and inventory, plus full management of menu, categories, coupons, stock, staff, users, roles, reports and audit logs |

Orders move through the system in real time over Supabase Realtime — a status
change in the kitchen updates the student's tracker instantly, with no polling
and no refresh. The app is an installable PWA with an offline order queue, so a
dropped campus Wi-Fi connection never loses an order.

This is a **portfolio-grade, production-hardened application**: role-based
access control, row level security, Zod input validation, rate-limited auth,
error boundaries, code splitting, SSR metadata and full responsive design are
all implemented — not stubbed.

---

## Features

### Student Experience
- Animated landing page with an interactive **React Three Fiber** 3D hero scene
- Email/password auth with registration, password reset and session management
- Live menu with search, category filters, sorting, dietary tags and dish detail pages
- Persistent cart, coupon redemption and a checkout flow with an animated **QR pickup code**
- Real-time order timeline (placed → preparing → ready → completed)
- Favourites, saved addresses, recommendations, notification centre and a rich profile hub

### Kitchen Workspace
- Kanban board for incoming, preparing and ready orders with drag-friendly controls
- Station-based preparation queues and priority-order highlighting
- Live order stream via Supabase Realtime subscriptions
- Performance metrics: throughput, average preparation time, load per station

### Admin Workspace
- Dashboard with live order tracking and revenue charts
- Deep-dive analytics: revenue, sales, orders, customers, inventory, staff performance
- **Recharts** visualisations for revenue trends, order volume, peak hours and inventory movement
- Management suites: menu, categories, coupons, inventory (stock, movements, suppliers, purchase orders), staff, customers, users, roles and permissions
- Reports library, audit trail, activity log, announcement broadcaster and workspace settings
- Production monitoring: health, API and database status, error log, Web Vitals, activity heatmaps and live KPIs
- Enterprise suite: multi-campus and multi-canteen management, branch switching, organisation settings and group analytics
- Workforce: rota scheduling, shift templates and attendance tracking, plus multi-step approval workflows with SLA tracking
- Bulk actions, multi-row selection and CSV export across data tables

### Platform
- **Canteen AI** — smart search, food recommendations and a floating chat assistant
- Global `⌘K` command palette
- Installable PWA: service worker, offline support, splash screen, app icons, push-notification UI
- Mobile bottom navigation, swipe gestures, pull-to-refresh, responsive card-stack tables
- Illustrated 401/403/404/500/offline/maintenance screens
- Premium design system: dark-mode-first, glassmorphism, lime/cyan accents, GSAP + Framer Motion, magnetic buttons and 3D tilt cards

---

## Screenshots

> Replace these placeholders with real captures before sharing the repository.
> Suggested size: 1600×1000, saved under `docs/screenshots/`.

| Landing Page | Student Menu |
| --- | --- |
| ![Landing page](docs/screenshots/landing.png) | ![Student menu](docs/screenshots/menu.png) |

| Checkout & QR Pickup | Order Tracking |
| --- | --- |
| ![Checkout](docs/screenshots/checkout.png) | ![Order tracking](docs/screenshots/order-tracking.png) |

| Kitchen Kanban Board | Admin Analytics |
| --- | --- |
| ![Kitchen board](docs/screenshots/kitchen.png) | ![Admin analytics](docs/screenshots/admin-analytics.png) |

| Mobile PWA | Command Palette |
| --- | --- |
| ![Mobile](docs/screenshots/mobile.png) | ![Command palette](docs/screenshots/command-palette.png) |

---

## Technology Stack

### Frontend
| Technology | Purpose |
| --- | --- |
| **React 19** | UI runtime |
| **TypeScript 5** | End-to-end type safety |
| **TanStack Start** | Full-stack React framework with SSR and server functions |
| **TanStack Router** | Type-safe file-based routing |
| **TanStack Query** | Server-state caching, invalidation and retries |
| **Vite** | Build tool and dev server |
| **Tailwind CSS v4** | Utility styling via CSS-native theme tokens |
| **shadcn/ui + Radix UI** | Accessible headless component primitives |
| **Framer Motion** | Component and page transitions |
| **GSAP + Lenis** | Scroll-driven animation and smooth scrolling |
| **React Three Fiber / drei** | WebGL 3D hero scene and post-processing |
| **Recharts** | Analytics charts |
| **Zod + React Hook Form** | Schema validation and form state |
| **Lucide React** | Icon set |

### Backend & Infrastructure
| Technology | Purpose |
| --- | --- |
| **Supabase Postgres** | Relational database with row level security |
| **Supabase Auth** | Email/password authentication and sessions |
| **Supabase Realtime** | Live order and notification streaming |
| **Supabase Storage** | `menu-images` and `avatars` buckets |
| **Nitro** | Server bundling for Cloudflare / Vercel / Netlify / Node |
| **vite-plugin-pwa (Workbox)** | Service worker and offline caching |

### Tooling
ESLint · Prettier · TypeScript strict mode · Playwright (audit sweeps)

---

## Folder Structure

```text
canteenos/
├── public/                     # Static assets served at the site root
│   ├── manifest.webmanifest    # PWA manifest
│   ├── robots.txt              # Crawler rules
│   └── icon-*.png              # App and maskable icons
├── src/
│   ├── components/
│   │   ├── ai/                 # Canteen AI chat widget
│   │   ├── auth/               # Role guards and permission gates
│   │   ├── fx/                 # Aurora background, tilt cards, intro loader
│   │   ├── landing/            # Marketing page sections
│   │   ├── layout/             # Dashboard shell, sidebar, mobile bottom nav
│   │   ├── pwa/                # Offline banner and order-queue panel
│   │   ├── search/             # Global ⌘K command palette
│   │   ├── shared/             # StatCard, DataTable, charts, empty/error states
│   │   ├── three/              # React Three Fiber hero scene
│   │   └── ui/                 # shadcn/ui primitives
│   ├── contexts/               # Cart provider
│   ├── data/                   # Seed and demo datasets
│   ├── hooks/                  # use-auth, use-pwa, use-gestures, use-perf-tier…
│   ├── integrations/supabase/  # Generated clients, types, auth middleware
│   ├── lib/                    # api, validation, permissions, errors, rate-limit
│   ├── routes/                 # File-based routes (see below)
│   ├── types/                  # Shared domain types
│   ├── router.tsx              # Router + query client wiring
│   ├── server.ts               # SSR entry, security headers, error fallback
│   └── styles.css              # Tailwind v4 theme tokens and design system
├── supabase/migrations/        # Versioned SQL schema, RLS policies and grants
├── DEPLOYMENT.md               # Step-by-step deployment guide
├── vercel.json / netlify.toml  # Host build + header configuration
└── vite.config.ts              # Vite, PWA and Nitro configuration
```

### Route map

```text
/                       Landing page
/login /register /forgot-password /reset-password
/app                    Student workspace shell
  ├── /                 Dashboard
  ├── /menu             Menu browser + /menu/$itemId detail
  ├── /cart /checkout   Cart and QR-code checkout
  ├── /orders           History + /orders/$orderId live tracking
  └── /favorites /ai /notifications /profile /settings
/kitchen                Kitchen Kanban workspace
/admin                  Admin workspace shell
  ├── /                 Overview dashboard
  ├── /analytics        revenue · sales · orders · customers · inventory · staff
  ├── /menu /categories /coupons /inventory
  ├── /staff /customers /users /roles
  ├── /monitoring       health · api · database · errors · performance · activity · live · integrations
  ├── /organization     overview · campuses · canteens · analytics · settings
  ├── /workforce        schedule · shifts · attendance
  ├── /approvals        multi-step approval queue
  └── /reports /audit /activity /notifications /settings
/sitemap.xml            Generated sitemap (server route)
```

---

## Installation Guide

### Prerequisites
- **Node.js 20+** (or **Bun 1.1+**)
- **npm 10+** — or `bun`, `pnpm`, `yarn`
- A **Supabase** project (free tier is enough)
- Git

### Steps

```bash
# 1. Clone
git clone https://github.com/<your-username>/canteenos.git
cd canteenos

# 2. Install dependencies
npm install        # or: bun install

# 3. Configure environment
cp .env.example .env
#    …then fill in your Supabase values (see next section)

# 4. Start the dev server
npm run dev
```

The app runs at **http://localhost:8080**.

---

## Environment Variables

Copy `.env.example` to `.env`. Nothing is hardcoded — every credential is read
from the environment.

| Variable | Scope | Required | Description |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | client | ✅ | Project API URL used by the browser client |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | client | ✅ | Publishable (anon) key — safe to expose |
| `VITE_SUPABASE_PROJECT_ID` | client | ✅ | Project reference id |
| `SUPABASE_URL` | server | ✅ | Same URL, used during SSR and in server functions |
| `SUPABASE_PUBLISHABLE_KEY` | server | ✅ | Publishable key for SSR and auth middleware |
| `SUPABASE_SERVICE_ROLE_KEY` | server | optional | **Secret.** Bypasses RLS — privileged server operations only |
| `NITRO_PRESET` | build | optional | `cloudflare` (default), `vercel`, `netlify`, `node-server` |

**Rules**

- Only publishable values may carry the `VITE_` prefix — anything with that
  prefix is inlined into the browser bundle at build time.
- `SUPABASE_SERVICE_ROLE_KEY` is read exclusively in server-side code. Never
  create a `VITE_` copy of it, never log it, never send it to the client.
- `.env` is git-ignored. Store production secrets in your host's encrypted
  environment-variable UI.

---

## Running Locally

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server with HMR on port 8080 |
| `npm run build` | Production build (Vite client + Nitro SSR bundle) |
| `npm run build:dev` | Development-mode build for debugging |
| `npm run build:vercel` | Production build with the Vercel Nitro preset |
| `npm run build:netlify` | Production build with the Netlify Nitro preset |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |
| `npm run format` | Format the codebase with Prettier |

### Test accounts

Register three accounts and assign roles as described in the next section — one
student, one kitchen, one admin — to explore all three workspaces.

> **Note on offline mode:** the service worker is intentionally disabled in dev
> and in iframe previews. Offline behaviour is only active on a built,
> deployed app.

---

## Supabase Setup

### 1. Create the project
Create a project at [supabase.com](https://supabase.com) and copy the project
URL, publishable (anon) key and project reference into `.env`.

### 2. Apply the schema
All schema, row level security policies and grants are versioned under
`supabase/migrations/`.

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Or paste each migration file, in filename order, into the SQL editor.

### 3. What the migrations create

**Tables**

| Table | Purpose |
| --- | --- |
| `profiles` | User profile: name, email, student id, department, year |
| `user_roles` | Role assignments — kept in a **separate table** to prevent privilege escalation |
| `categories` / `menu_items` | Catalogue with pricing, availability and images |
| `orders` / `order_items` | Orders with status, pickup code and line items |
| `coupons` | Discount codes with validity windows and usage limits |
| `favorites` / `addresses` | Student personalisation |
| `inventory_items` | Stock levels and thresholds |
| `notifications` | Per-user notification feed |

**Functions and triggers**

- `has_role(uuid, app_role)` — `SECURITY DEFINER` role check used inside RLS policies to avoid recursion
- `is_staff(uuid)` — true for `kitchen` and `admin`
- `handle_new_user()` — creates a profile and grants a default role on sign-up
- `notify_order_status()` — writes a notification and stamps `ready_at` / `completed_at` on every status change
- `set_updated_at()` — maintains `updated_at` timestamps

**Security model**

- Row level security is enabled on every public table
- Explicit `GRANT`s are issued for `authenticated`, `anon` (read-only where appropriate) and `service_role`
- Students can only read and write their own orders, favourites, addresses and notifications
- Kitchen and admin access is gated through `is_staff()` / `has_role()`

### 4. Storage buckets
Two private buckets are created: **`menu-images`** (dish photography) and
**`avatars`** (profile pictures), each with policies restricting writes to the
owning user or staff.

### 5. Auth configuration
In the backend auth settings:

- Set **Site URL** to your deployed origin (`http://localhost:8080` for local work)
- Add the same origin and `/*` to **Redirect URLs** so email confirmation,
  password reset and OAuth callbacks return correctly
- Anonymous sign-ups are disabled by design

### 6. Assign roles
The first account that registers with the `admin` role request becomes the
admin. To promote further accounts:

```sql
insert into public.user_roles (user_id, role)
values ('<auth-user-uuid>', 'kitchen');   -- or 'admin'
```

---

## Deployment Guide

Full, step-by-step instructions live in **[DEPLOYMENT.md](DEPLOYMENT.md)**. Summary:

CanteenOS is **server-rendered**, not a static SPA — the host must be able to
run a JavaScript server or edge function. No `_redirects` SPA fallback is
needed; routing is handled server-side.

| Host | How |
| --- | --- |
| **Lovable** | Press **Publish**. Environment variables are managed automatically. |
| **Vercel** | Import the repo — `vercel.json` sets `NITRO_PRESET=vercel`, output `.vercel/output`, caching and security headers. Add env vars under Settings → Environment Variables. |
| **Netlify** | Create a site from Git — `netlify.toml` sets `NITRO_PRESET=netlify`, publish `dist/client`, functions and headers. Add env vars under Site configuration. |
| **Cloudflare Workers** | `npm run build` then `npx wrangler deploy` (the default preset). |

After deploying, add the live origin to the Supabase **Site URL** and
**Redirect URLs**, then run the post-deploy checklist in `DEPLOYMENT.md`.

---

## Architecture Notes

- **File-based routing.** Every file in `src/routes/` is a route; `src/routeTree.gen.ts` is generated — never edit it by hand.
- **Data loading.** Route loaders call `queryClient.ensureQueryData(...)`; components read the same query with `useSuspenseQuery`. No `useEffect` fetching.
- **Data layer.** `src/lib/api.ts` centralises Supabase queries, row→domain mappers and typed TanStack Query hooks, so no component talks to the database directly.
- **Realtime.** Order and notification tables publish changes over Supabase Realtime; subscriptions invalidate the matching query keys.
- **Performance.** Three.js, Recharts and the AI widget are code-split into lazy chunks; the 3D scene and particle canvas pause when the tab is hidden; `use-perf-tier` scales effects down on low-capability devices; hot list components are memoised.
- **SEO.** Each route exports `head()` with a unique title, description and Open Graph tags; private workspaces are marked `noindex`. `sitemap.xml` is generated from a server route so it never drifts from the route tree.

---

## Security

- **Row level security** on every public table, with explicit grants per role
- **Roles in a dedicated `user_roles` table**, checked through a `SECURITY DEFINER` function — never stored on the profile row
- **RBAC permission matrix** (`src/lib/permissions.ts`) with route guards and component-level permission gates
- **Zod validation** with HTML sanitisation on every user input (`src/lib/validation.ts`)
- **Client-side rate limiting** — sign-in locks after five failed attempts
- **30-minute idle session timeout** and cache-clearing sign-out
- **Error boundaries** around every workspace page, plus a production SSR error fallback
- **Security headers** (`nosniff`, referrer policy, permissions policy, HSTS) applied in `src/server.ts` and at the edge
- **No hardcoded secrets** — service-role credentials are server-only

Found a vulnerability? Please open a private security advisory rather than a
public issue.

---

## Progressive Web App

CanteenOS installs to the home screen and behaves like a native app:

- Web app manifest with maskable icons, theme colours and standalone display
- Workbox service worker: network-first HTML, cache-first hashed assets
- Offline order queue in local storage that auto-syncs when the connection returns
- Offline banner, install prompt and push-notification permission UI
- Native-style bottom tab bar, edge-swipe drawer, swipe and pull-to-refresh gestures
- Tables collapse into stacked cards on phones

---

## Future Improvements

- [ ] **Payments** — Stripe / UPI integration replacing the simulated checkout step
- [ ] **Server-side push notifications** — Web Push delivery for order status, not just the permission UI
- [ ] **Multi-canteen / multi-tenant** support with per-outlet menus and staff
- [ ] **Table reservations and scheduled pickup slots** to smooth peak load
- [ ] **Demand forecasting** — ML-driven prep suggestions from historical order data
- [ ] **Loyalty programme** — points, streaks and tier rewards
- [ ] **Kitchen display hardware mode** — always-on fullscreen board with audio alerts
- [ ] **Automated testing** — Vitest unit coverage and Playwright end-to-end suites in CI
- [ ] **i18n** — multi-language support with locale-aware currency and dates
- [ ] **Accessibility certification** — full WCAG 2.2 AA audit and screen-reader pass
- [ ] **Native shells** via Capacitor for App Store and Play Store distribution
- [ ] **Admin API keys and webhooks** for POS and ERP integration

---

## Credits

**Built and maintained by** — *[Your Name](https://github.com/<your-username>)*

Standing on the shoulders of excellent open source:

- [React](https://react.dev/) · [TanStack](https://tanstack.com/) · [Vite](https://vite.dev/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/) · [shadcn/ui](https://ui.shadcn.com/) · [Radix UI](https://www.radix-ui.com/)
- [Framer Motion](https://motion.dev/) · [GSAP](https://gsap.com/) · [Lenis](https://lenis.darkroom.engineering/)
- [Three.js](https://threejs.org/) · [React Three Fiber](https://r3f.docs.pmnd.rs/) · [drei](https://drei.docs.pmnd.rs/)
- [Recharts](https://recharts.org/) · [Zod](https://zod.dev/) · [Lucide](https://lucide.dev/)

Scaffolded and iterated with [Lovable](https://lovable.dev).

---

## License

Released under the [MIT License](LICENSE).

<div align="center">
<sub>If CanteenOS helped you, consider starring the repository.</sub>
</div>
