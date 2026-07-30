# Contributing to CanteenOS

Thanks for taking the time to contribute. This document explains how to set up
the project, the standards we hold code to, and how to get a change merged.

By participating you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Table of Contents

- [Ways to contribute](#ways-to-contribute)
- [Development setup](#development-setup)
- [Project conventions](#project-conventions)
- [Branching and commits](#branching-and-commits)
- [Pull request process](#pull-request-process)
- [Reporting bugs](#reporting-bugs)
- [Requesting features](#requesting-features)
- [Reporting security issues](#reporting-security-issues)

---

## Ways to contribute

- Fix a bug or pick up an issue labelled `good first issue`
- Improve accessibility, responsiveness or performance
- Add tests
- Improve documentation
- Propose a feature from the [Future Improvements](README.md#future-improvements) list

For anything larger than a small fix, open an issue first so we can agree on
the approach before you write code.

---

## Development setup

```bash
# Fork, then clone your fork
git clone https://github.com/<your-username>/canteenos.git
cd canteenos

npm install
cp .env.example .env      # fill in your own Supabase project values
npm run dev               # http://localhost:8080
```

You need your own Supabase project. Apply the schema with:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

See [Supabase Setup](README.md#supabase-setup) for role assignment and storage
details.

### Before you push

```bash
npm run lint      # ESLint must pass
npm run format    # Prettier
npm run build     # must complete with no errors
```

A change that does not build will not be reviewed.

---

## Project conventions

### Language and types
- **TypeScript everywhere.** No `any` unless you leave a comment justifying it.
- Domain types live in `src/types/`; database row types come from the generated
  Supabase types — do not hand-write them.

### Routing
- Routes are file-based under `src/routes/`. Add the file, then link to it.
- **Never edit `src/routeTree.gen.ts`** — it is generated.
- Every route needs a `head()` export with a unique title, description and
  Open Graph tags. Private workspaces must set `noindex`.

### Data
- All Supabase access goes through `src/lib/api.ts`. Components must not query
  the database directly.
- Load initial data in a route loader with `queryClient.ensureQueryData(...)`
  and read it with `useSuspenseQuery`. Do not fetch in `useEffect`.

### Styling
- **Use design tokens.** Colours, gradients and shadows are semantic tokens in
  `src/styles.css`. Never hardcode `text-white`, `bg-black` or `bg-[#hex]` —
  they break theming.
- Reuse `surface-card` / `surface-raised` utilities and the existing shadcn
  variants rather than inventing new one-off styles.
- Dark mode is the default; every change must look correct in both themes.

### Components
- Keep components small and focused; put anything reusable in
  `src/components/shared/`.
- Icon-only buttons need an `aria-label` or `sr-only` text.
- Tap targets on mobile must be at least 48×48px.

### Security
- Roles are stored in `user_roles` and checked via `has_role()`. **Never** put a
  role on a profile row or trust client-side storage for authorisation.
- Every new public table needs RLS enabled, explicit `GRANT`s and policies in
  the same migration.
- Validate all user input with Zod in `src/lib/validation.ts`.
- Never commit secrets. `SUPABASE_SERVICE_ROLE_KEY` is server-only and must
  never gain a `VITE_` prefix.

### Performance
- Lazy-load heavy dependencies (Three.js, Recharts, the AI widget).
- Memoise components rendered inside long lists.
- Pause animation loops when the tab is hidden and respect
  `prefers-reduced-motion`.

### Database migrations
- Add a new timestamped file in `supabase/migrations/`. Never edit an applied
  migration.
- Order within a migration: `CREATE TABLE` → `GRANT` → `ENABLE ROW LEVEL
  SECURITY` → `CREATE POLICY`.

---

## Branching and commits

Branch from `main`:

```text
feat/coupon-stacking
fix/order-status-race
docs/readme-screenshots
chore/bump-tanstack
```

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat(kitchen): add station filter to the preparation queue
fix(checkout): prevent double submit while the order request is in flight
docs(readme): document the offline order queue
perf(admin): memoise the revenue chart series
refactor(api): extract order mappers
chore(deps): update tanstack router
```

Types in use: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
`build`, `ci`, `chore`.

---

## Pull request process

1. Rebase onto the latest `main`.
2. Confirm `npm run lint` and `npm run build` both pass.
3. Manually verify your change at **390px, 834px and 1440px** widths, in both
   light and dark themes, with no console errors.
4. Open the PR with:
   - A clear description of the problem and the solution
   - Before/after screenshots or a recording for any UI change
   - `Closes #123` linking the issue
   - A note on any migration, environment variable or breaking change
5. Keep PRs focused — one concern per pull request.
6. Address review comments with follow-up commits; do not force-push mid-review.

Maintainers squash-merge, using the PR title as the commit subject.

---

## Reporting bugs

Open an issue with:

- What you expected versus what happened
- Exact steps to reproduce
- Role (student / kitchen / admin), browser, OS and viewport size
- Console errors, network failures and screenshots
- Whether it reproduces on a fresh build

---

## Requesting features

Describe the problem before the solution: who is blocked, what they are trying
to do today, and why the current flow fails. Include mockups or references if
you have them, and note which role the feature serves.

---

## Reporting security issues

**Do not open a public issue for a security vulnerability.** Use GitHub's
private security advisory feature, or contact the maintainer directly. Include
reproduction steps and the potential impact. You will get an acknowledgement
within a few days.
