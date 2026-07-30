# Changelog

All notable changes to **CanteenOS** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Enterprise suite: multi-campus / multi-canteen management, branch switching, organisation settings and group analytics
- Workforce module: weekly rota, shift templates and attendance register
- Multi-step approval workflows with policy chains and SLA tracking

### Changed
- Coupon visibility is now restricted to active, unexpired coupons for non-admin accounts
- Footer and marketing anchors now navigate through the router instead of full page reloads

### Removed
- Unused shadcn primitives and their dependencies (day-picker, embla, vaul, input-otp, resizable panels, react-hook-form and related Radix packages)
- Stale `package-lock.json` (the project uses Bun)

### Planned
- Stripe / UPI payment integration to replace the simulated checkout step
- Server-side Web Push delivery for order status changes
- Automated Vitest and Playwright suites running in CI
- Multi-canteen (multi-tenant) support

---

## [1.0.0] — 2026-07-30

First production-ready release: a complete, deployable smart canteen ordering
platform with student, kitchen and admin workspaces.

### Added

**Documentation**
- `README.md` with overview, features, stack, folder structure, installation,
  environment variables, Supabase setup, deployment and roadmap
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md` and MIT `LICENSE`

**Deployment**
- `vercel.json` and `netlify.toml` with Nitro presets, asset caching and edge security headers
- `build:vercel` and `build:netlify` scripts
- `.env.example` documenting client and server environment variables
- `DEPLOYMENT.md` covering Lovable, Vercel, Netlify and Cloudflare Workers
- Generated `sitemap.xml` server route listing public, indexable pages only
- Baseline security headers in `src/server.ts` (nosniff, referrer policy,
  permissions policy, HSTS over https)

**Progressive Web App**
- Web app manifest, maskable app icons and splash screen
- Workbox service worker with network-first HTML and cache-first hashed assets
- Offline order queue with automatic sync on reconnect, plus an offline banner
- Push-notification permission and topic UI in settings
- Mobile bottom navigation, edge-swipe drawer, swipe and pull-to-refresh gestures
- Responsive tables that collapse into stacked cards on phones

**Platform features**
- Canteen AI: smart search, food recommendations and a floating chat assistant
- Global `⌘K` command palette
- Illustrated 401 / 403 / 404 / 500 / offline / maintenance screens
- Notification centre, multi-tab settings hub and profile hub

**Security and hardening**
- Supabase Auth with registration, password reset and session management
- Roles stored in a dedicated `user_roles` table with a `SECURITY DEFINER`
  `has_role()` check
- Row level security, explicit grants and policies on every public table
- RBAC permission matrix with route guards and component permission gates
- Zod validation with HTML sanitisation across all forms
- Client-side rate limiting — sign-in locks after five failed attempts
- 30-minute idle session timeout and cache-clearing sign-out
- Error boundaries around every workspace page

**Backend**
- Postgres schema for profiles, roles, categories, menu items, orders, order
  items, coupons, favourites, addresses, inventory and notifications
- Triggers for new-user provisioning, order-status notifications and timestamps
- Realtime order and notification streaming
- Private `menu-images` and `avatars` storage buckets

**Admin workspace**
- Dashboard with live order tracking and revenue charts
- Analytics for revenue, sales, orders, customers, inventory and staff performance
- Management suites for menu, categories, coupons, inventory (stock, movements,
  suppliers, purchase orders), staff, customers, users and roles
- Reports library, audit trail, activity log, announcement broadcaster and settings
- Bulk actions, multi-row selection and export across data tables

**Kitchen workspace**
- Kanban preparation board with station queues and priority orders
- Live order stream and performance metrics

**Student workspace**
- Menu browser with search, filters, sorting and dish detail pages
- Persistent cart, coupon redemption and checkout with an animated QR pickup code
- Real-time order timeline, order history, favourites and saved addresses

**Experience layer**
- Interactive React Three Fiber 3D hero scene with post-processing
- Aurora backgrounds, magnetic buttons, 3D tilt cards and GSAP scroll effects
- Lenis smooth scrolling and a fast, non-blocking intro loader
- Landing page and full authentication flow

**Design system**
- Dark-mode-first OKLCH token palette with lime and cyan accents
- Glassmorphism surfaces, an elevation scale and tabular numerals for metrics
- Reusable `StatCard`, `PageHeader`, `DataTable`, chart wrappers, empty, error
  and success states

### Changed
- Replaced all mock data with live Supabase queries through a centralised data layer
- Unified surfaces, spacing, typography and interaction states across every screen
- Consolidated route metadata so each page has a unique title, description and
  Open Graph tags, with private areas marked `noindex`

### Fixed
- Horizontal overflow on the 404 page and on mobile and tablet viewports
- Broken navigation targets in the admin dashboard and student sidebar
- Scroll listener leak in the 3D hero scene
- Layout shift from `min-h-screen` on mobile, replaced with `min-h-dvh`
- Search-parameter typing errors on the menu route

### Performance
- Code-split Three.js, Recharts and the AI widget into lazy chunks
- Paused the 3D scene and particle canvas when the tab is hidden
- Scoped the magnetic-button effect per element with cached rects and rAF batching
- Memoised hot list components and tuned React Query caching with 401/403-aware retries
- Device capability tiering to scale visual effects down on weaker hardware

### Accessibility
- 48px minimum tap targets in the mobile navigation
- Labels on all icon-only buttons, a single `h1` per page and
  `prefers-reduced-motion` support throughout

---

[Unreleased]: https://github.com/<your-username>/canteenos/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/<your-username>/canteenos/releases/tag/v1.0.0
