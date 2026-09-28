# Dropfolio Frontend

Web client for **Dropfolio**, a portfolio tracker for Counter-Strike 2 drops. Log the cases, skins and graffiti you pick up, see what they are worth on the Steam Community Market, and get notified when an item reaches a target price.

This repository contains the frontend only. It consumes the Dropfolio REST API (Spring Boot) as specified in the API contract and does not add or change any backend behavior.

<!--
Add screenshots here once captured, for example:

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="Dashboard" width="49%" />
  <img src="docs/screenshots/portfolio.png" alt="Portfolio" width="49%" />
</p>
-->

## Features

**Tracking**

- Log drops with quantity, acquisition date and an optional acquisition value. Edit and delete with confirmation.
- Portfolio overview with total value, per-item holdings, a top-holdings chart and CSV export.
- Item catalog with search, type filter, sorting and current market price.

**Alerts and notifications**

- Price alerts per item, delivered in-app, by email, or both. Pause, resume, edit and delete.
- Notification center with unread filter, mark as read and mark all as read.
- Account-wide notification preferences.

**Account**

- Register, log in, log out, log out of all devices, change password, delete account.
- Sessions survive a page reload through an httpOnly refresh cookie.

**Administration** (ADMIN role only)

- Platform overview, user list with activate and deactivate, audit log, sync job history.
- Manual price sync that polls the job until it finishes.
- Item catalog management.

**Interface**

- Skeleton loading, empty and error states on every data view.
- Toast feedback for every mutation, and a progress indicator on every submitting button.
- Responsive layout. The sidebar becomes a drawer on small screens.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4, lucide-react |
| Language | TypeScript, strict mode with `noUncheckedIndexedAccess` |
| Server state | TanStack Query v5 |
| Client state | Zustand (auth session only) |
| HTTP | Axios |
| Forms and validation | React Hook Form, Zod |
| Linting | ESLint with `eslint-config-next`, `no-explicit-any` enforced as an error |

## Design decisions

**The access token never touches storage.** It lives in a module-scoped variable. The refresh token is an httpOnly cookie that JavaScript cannot read. On reload the app calls `POST /auth/refresh` to restore the session, so nothing sensitive sits in `localStorage`.

**Token refresh is single-flight.** The backend rotates refresh tokens. If several requests hit a 401 at once and each tried to refresh, the later ones would present an already-rotated token and trigger reuse detection, which revokes the whole session. All concurrent requests share one refresh call instead.

**A strict data layer.** Components call feature hooks, hooks call feature API functions, and those go through one shared client. No component imports Axios. The `{ success, data, meta }` response envelope is unwrapped in exactly one place, and errors are normalized into a single `ApiError` type keyed by the contract's error codes.

**A missing price is never shown as $0.** When `priceAvailable` is false the UI shows a dash, and the item is excluded from totals with a note saying so.

**Item icons cannot crash a page.** `iconUrl` is free text entered by an admin, so its host cannot be known at build time. Steam CDN hosts go through `next/image`, other valid URLs render as a plain `<img>`, and invalid or failed images fall back to a lettered tile.

**Private by default for search engines.** Only `/login` and `/register` are indexable. Every other route is `noindex`, disallowed in `robots.txt`, and absent from the sitemap. Favicon and Open Graph images are generated at build time with `next/og`.

**Route guards are UX, not security.** `AuthGuard` and `AdminGuard` decide what to render. Authorization is enforced by the backend on every request.

## Routes

| Access | Routes |
| --- | --- |
| Public | `/login`, `/register` |
| Signed in | `/dashboard`, `/portfolio`, `/drops`, `/alerts`, `/notifications`, `/settings`, `/items`, `/items/[id]` |
| Admin | `/admin`, `/admin/users`, `/admin/users/[id]`, `/admin/items`, `/admin/sync-jobs`, `/admin/audit-logs` |

`/` redirects to `/dashboard`.

## Getting started

### Prerequisites

- Node.js 20.9 or later (22 LTS recommended)
- npm 10 or later
- A running Dropfolio backend

### Install and run

```bash
git clone https://github.com/<username>/dropfolio-frontend.git
cd dropfolio-frontend
npm install
cp .env.example .env.local
npm run dev
```

The app is served at `http://localhost:3000`.

### Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL, including the `/api/v1` prefix | `http://localhost:8080/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | Public origin of this frontend, used for canonical URLs, Open Graph tags and the sitemap. Set it to the real domain in production. | `http://localhost:3000` |

### Backend configuration for local development

The backend needs two settings, otherwise login appears to work and then the session is lost on every reload:

```env
CORS_ALLOWED_ORIGIN=http://localhost:3000
COOKIE_SECURE=false
```

`CORS_ALLOWED_ORIGIN` must match the frontend origin exactly, with no wildcard and no trailing slash, because the API allows credentials. `COOKIE_SECURE=false` is needed because browsers drop `Secure` cookies on plain HTTP.

The backend itself requires Spring Boot 3.3+, Java 21, SQL Server and Redis.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler without emitting |

Run lint, typecheck and build before every push. There is no automated test suite yet.

GitHub Actions runs install, lint, typecheck and build on every push and pull request to `main`.

## Project structure

```text
src/
├── app/                  Routes. (auth) is signed-out, (app) is signed-in
├── components/
│   ├── ui/               Button, Field, Table, Modal, Toast, loading and empty states
│   └── layout/           AppShell, Sidebar, UserMenu, route guards
├── features/             One folder per domain: api.ts, hooks.ts, components/
│   ├── auth/  users/  items/  drops/
│   └── portfolio/  alerts/  notifications/  admin/
├── hooks/                Cross-feature hooks
├── lib/                  API client, error mapping, token store, query keys, env
├── stores/               Zustand auth store
├── types/                API envelope and domain types
└── utils/                Formatting and query-string helpers
```

## Deployment

Planned setup:

| Layer | Target |
| --- | --- |
| Frontend | Vercel |
| Backend | Docker on Azure App Service |
| Database | Azure SQL |
| Cache | Azure Cache for Redis |

The refresh cookie is `SameSite=Strict`, so the frontend and the API must share a registrable domain, for example `app.example.com` and `api.example.com`. Hosting them on unrelated domains such as `*.vercel.app` and `*.azurewebsites.net` means the browser will not send the cookie and sessions will not persist.

## Related repositories

- `dropfolio-backend`: Spring Boot API
- `dropfolio-frontend`: this repository

## License

Private project. All rights reserved.
