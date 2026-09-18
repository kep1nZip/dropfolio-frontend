# Dropfolio Frontend — Setup

The official frontend for Dropfolio, built against the existing `v1.0.0-mvp` backend. It
consumes the API exactly as locked in `API_CONTRACT.md`; no endpoint, payload or security
assumption was changed.

---

## 1. Requirements

| Tool | Version |
|---|---|
| Node.js | 20.9+ (22 LTS recommended) |
| npm | 10+ |
| Dropfolio backend | running and reachable |

The backend needs SQL Server and Redis up, and its `/actuator/health` should report `UP`
before you start here — most screens are useless against a dead API.

---

## 2. Install

```bash
cd frontend
npm install
```

> The build fetches the Chivo webfont from Google Fonts once, at build time, and self-hosts it
> afterwards. A fully offline machine will fail on `next build` with a `next/font` error — if
> that is your situation, set `HTTPS_PROXY`, or swap `next/font/google` for `next/font/local`
> in `src/app/layout.tsx`.

## 3. Configure

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

The `/api/v1` prefix is part of the value — it matches `API_CONTRACT.md` §0.1, and every path
in `src/features/*/api.ts` is written relative to it.

## 4. Point the backend back at the frontend

Two backend settings decide whether authentication works at all in local development. Both are
plain environment variables; neither changes backend behaviour or design.

```bash
CORS_ALLOWED_ORIGIN=http://localhost:3000   # must match exactly — no wildcard, no trailing slash
COOKIE_SECURE=false                         # local dev is plain http://
```

**Why these matter.** The refresh token is an httpOnly cookie, so the browser has to be willing
to send it cross-origin. `SecurityConfig.corsConfigurationSource()` sets
`allowCredentials(true)`, and the CORS spec forbids pairing that with a wildcard origin — so
the origin must be the literal `http://localhost:3000`. And with `COOKIE_SECURE=true` over
plain HTTP, most browsers silently drop the `Set-Cookie` entirely: login appears to succeed,
then every reload logs you out. In production both flip back (`Secure=true`, real HTTPS
origin).

## 5. Run

```bash
npm run dev       # http://localhost:3000
npm run build     # production build
npm run start     # serve the production build
npm run lint      # ESLint, must be clean
npm run typecheck # tsc --noEmit, must be clean
```

---

## 6. How authentication works here

This is the part most likely to be changed by accident, so it is worth reading before touching
`src/lib/`.

**The access token never touches storage.** It lives in a module-scoped variable
(`src/lib/auth-token.ts`) and dies with the tab. `SYSTEM_ARCHITECTURE.md` §3.3 puts the refresh
token in an httpOnly, `Secure`, `SameSite=Strict` cookie precisely so JavaScript cannot reach
it; persisting the access token to `localStorage` would hand an XSS payload a live bearer
credential and undo that. Losing it on reload costs nothing — the cookie survives and
bootstrap mints a new one.

**Bootstrap.** On mount, `Providers` calls `authStore.bootstrap()`, which POSTs `/auth/refresh`.
Until that resolves the store's status is `unknown` and route guards render a loading state
rather than redirecting. Skipping that state would log every returning user out on every reload.

**Refresh is single-flight.** The backend *rotates* refresh tokens. If ten queries 401 at once
and each fires its own `/auth/refresh`, requests 2–10 present an already-rotated token, which
the backend correctly reads as token reuse and punishes by revoking the whole session. So
`src/lib/api-client.ts` keeps one in-flight refresh promise and makes everyone else await it.

**Route protection is UX, not security.** `AuthGuard` is client-side on purpose. The refresh
cookie is scoped to path `/api/v1/auth` on the *API* origin, so Next.js middleware can never
see a credential to check. The real boundary is the backend filter chain, which rejects every
unauthenticated call regardless of what the browser renders.

---

## 7. Project structure

```
src/
├── app/                 # App Router. (auth) = signed out, (app) = signed in
├── components/
│   ├── ui/              # Button, Field, Table, Modal, Toast, States…
│   └── layout/          # AppShell, Sidebar, UserMenu, AuthGuard
├── features/            # one folder per domain: api.ts + hooks.ts + components/
│   ├── auth/ users/ items/ drops/ portfolio/ alerts/ notifications/ admin/
├── hooks/               # cross-feature hooks (useListControls, useDebouncedValue)
├── lib/                 # api-client, api-error, auth-token, query-client, query-keys
├── stores/              # Zustand auth store
├── types/               # api.ts (envelope) + domain.ts (resources)
└── utils/               # formatting, query-string helpers
```

Rules the code holds to:

- **No component calls axios.** UI → `features/*/hooks.ts` → `features/*/api.ts` → `lib/api-client`.
- **No `any`.** ESLint fails the build on it. Every response shape is in `src/types`.
- **The envelope is unwrapped once**, in `lib/api-client`. Nothing else writes `response.data.data`.
- **Errors are normalised once**, into `ApiError` with `category` + `code` per §0.6.
- **A missing price is never `$0`.** `priceAvailable: false` renders an em dash (PRD §45).
- **Item icons can never crash a page.** `items.icon_url` is free text an admin types in, so
  its hostname is unknowable at build time. `next/image` throws *during render* for any host
  missing from `next.config.ts`, which kills the whole React tree rather than just the
  thumbnail. `ItemThumb` therefore classifies the URL first: Steam CDN hosts go through
  `next/image`, any other `http(s)` URL renders as a plain `<img>`, and a bad URL or a failed
  load falls back to the grade-tinted initial tile. Adding hostnames to `next.config.ts` is
  **not** the fix — no allowlist can ever cover a free-text field.

---

## 8. Testing it manually

Milestone by milestone, against a running backend:

**F1 — Foundation.** Register at `/register`; you should be told to log in rather than being
signed in automatically (§1 issues no token on register). Log in. Open DevTools → Application →
Cookies: `dropfolio_rt` should be present and marked HttpOnly. Check `localStorage` — it must
be empty. Hard-refresh `/dashboard`: you stay signed in. Delete the cookie and refresh: you land
on `/login`.

**F2 — Shell.** Resize below 1024px: the sidebar becomes a drawer. The admin link only appears
for an account with the `ADMIN` role.

**F3 — Catalog.** `/items`: type in the search box and watch it fire one request, not one per
keystroke. Change the type filter while on page 3 — you should be sent back to page 1. Open an
item; if the price provider has no data the page says so instead of showing `$0.00`.

**F4 — Portfolio.** Add a drop at `/drops`, then check `/dashboard` and `/portfolio` — the
totals update without a manual reload (both caches are invalidated together). Export CSV; with
an empty portfolio the backend answers `204` and you get a message, not an empty file.

**F5 — Alerts & notifications.** Create an alert with both channels off — the form stops you
before the request, matching the backend's own rule. Pause and resume an alert. The bell badge
polls once a minute; "Mark all as read" clears it.

**F6 — Admin.** As an admin, `/admin` → "Run price sync". The button gets a `202` and a job id,
then polls `GET /admin/sync-jobs/{id}` until the job leaves `RUNNING`. Press it twice quickly
and the second attempt should report `SYNC_ALREADY_RUNNING`. As a non-admin, visiting `/admin`
shows an access message, and the API would reject the calls anyway.

---

## 9. Discrepancies found between the docs and the backend

Per the brief's final rule, these are reported rather than silently resolved. **None of them
block the frontend**; each has a chosen interim behaviour that needs a PM decision to settle.

**1. `error.details` is documented but never sent.**
`API_CONTRACT.md` §0.6 shows a `details: [{ field, reason }]` array on `422`. The actual
`GlobalExceptionHandler` has no such field — it concatenates Bean Validation failures into
`error.message` (`"targetPriceUsd: must be greater than 0"`). *Interim:* `details` is typed
optional and the frontend does its own field-level validation before submitting, so users still
get per-field feedback. *Needs:* either the backend adds `details`, or §0.6 drops it.

**2. `Retry-After` and `Content-Disposition` are set but unreadable by the browser.**
`RateLimitFilter` sets `Retry-After` on a `429`, and `/portfolio/export` sets a
`Content-Disposition` filename. Neither header is in `SecurityConfig`'s CORS configuration,
which has no `exposedHeaders`, so cross-origin JavaScript cannot read either. *Interim:* the
rate-limit message falls back to a generic "wait a moment", and the CSV filename is hardcoded
in `features/portfolio/api.ts` to match what the backend sends. *Proposed fix (needs approval,
one line in `SecurityConfig`):*
`configuration.setExposedHeaders(List.of("Retry-After", "Content-Disposition"));`

**3. No `sort` on `GET /admin/users`.**
§11 lists `search`, `status`, `page`, `size` — and `AdminUserController` matches. Other admin
lists do take `sort`. *Interim:* the admin user list ships without sort controls rather than
sending a parameter that would be ignored.

**4. The refresh cookie path is `/api/v1/auth`.**
Consistent between `AuthController` and `UserController`, and narrower than the contract spells
out — which is good security. Noting it because it is the reason route protection cannot be
done in Next.js middleware (§6 above).

---

## 10. Known limitations

- **No automated tests.** The brief did not ask for a test stack, so none was chosen. If you
  want one, Vitest + Testing Library + MSW fits this structure: mock at the `features/*/api.ts`
  boundary.
- **No price history chart.** `GET /prices/{itemId}/history` is explicitly Post-MVP (§14), so
  there is nothing to chart.
- **No IDR conversion.** PRD §18 sketches `≈ Rp2.0M` under the total. No endpoint supplies an
  exchange rate and inventing a hardcoded one would be worse than omitting it. Flagged as a
  product gap.
- **CSV export is synchronous**, matching §7. Fine for MVP-sized portfolios; large ones are the
  contract's own Open Decision #4.
- **Alerts do not re-arm.** A `TRIGGERED` alert stays triggered until moved back to `ACTIVE`
  by hand, matching ERD Open Decision #2. The UI offers that action plainly rather than hiding it.
- **`unreadCount` polls every 60 seconds.** There is no WebSocket in the MVP (§14), so the badge
  can lag by up to a minute.
- **Item icons from non-Steam hosts are not optimized.** They render through a plain `<img>`,
  so no resizing or WebP conversion. At 36px this costs essentially nothing, and it is what
  makes an unknown hostname safe. If the catalog ever standardises on a fixed set of CDNs, add
  them to `OPTIMIZED_IMAGE_HOSTS` in `src/lib/image-hosts.ts` and they are optimized
  automatically — `next.config.ts` reads the same list.
- **Steam linking is absent by design** (§15: Steam is a price source only, never an identity
  provider). `steamIntegration` is displayed where the API returns it, but nothing links an account.
