# Dropfolio Frontend

Frontend aplikasi **Dropfolio** — platform portfolio dan monitoring item CS2.

Dibangun menggunakan:

* Next.js 16
* React 19
* TypeScript (strict mode)
* Tailwind CSS
* ESLint
* App Router

---

## Status

### Frontend Milestones

| Milestone                          | Status     |
| ---------------------------------- | ---------- |
| F1 — Project Setup & Design System | ✅ Complete |
| F2 — Authentication UI             | ✅ Complete |
| F3 — Dashboard & Portfolio UI      | ✅ Complete |
| F4 — Items, Drops, Alerts UI       | ✅ Complete |
| F5 — Notifications & Settings UI   | ✅ Complete |
| F6 — Admin UI                      | ✅ Complete |

### Verification

Successfully verified:

```bash
npm run lint
npm run typecheck
npm run build
```

Build result:

```text
✓ ESLint passed
✓ TypeScript passed
✓ Next.js production build passed
```

---

# Project Structure

```text
src/
├── app/
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   ├── portfolio/
│   ├── drops/
│   ├── alerts/
│   ├── notifications/
│   ├── settings/
│   └── admin/
│
├── components/
├── lib/
├── hooks/
├── services/
├── types/
└── styles/
```

---

# Requirements

* Node.js 22+
* npm 10+

Check installation:

```bash
node -v
npm -v
```

---

# Installation

Clone repository:

```bash
git clone https://github.com/<username>/dropfolio-frontend.git
cd dropfolio-frontend
```

Install dependencies:

```bash
npm install
```

---

# Environment Variables

Create:

```bash
.env.local
```

Example:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

Backend default:

```text
http://localhost:8080
```

---

# Running Locally

Development mode:

```bash
npm run dev
```

Application:

```text
http://localhost:3000
```

---

# Build

Production build:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

---

# Quality Checks

Lint:

```bash
npm run lint
```

Type checking:

```bash
npm run typecheck
```

Build verification:

```bash
npm run build
```

Recommended workflow before every push:

```bash
npm run lint
npm run typecheck
npm run build
```

---

# Backend Integration

Frontend is designed to work with the Dropfolio Spring Boot backend.

Backend requirements:

```text
Spring Boot 3.3+
Java 21
SQL Server
Redis
```

Local backend URL:

```text
http://localhost:8080
```

Required backend configuration for local development:

```env
COOKIE_SECURE=false
CORS_ALLOWED_ORIGIN=http://localhost:3000
```

Without `COOKIE_SECURE=false`, browsers will reject authentication cookies when using plain HTTP during local development.

---

# CI

GitHub Actions pipeline runs:

```text
npm install
↓
npm run lint
↓
npm run typecheck
↓
npm run build
```

Every push and pull request to:

```text
main
```

must pass all checks.

---

# Deployment

Planned deployment architecture:

```text
Frontend
↓
Vercel

Backend
↓
Docker
↓
Azure App Service

Database
↓
Azure SQL

Cache
↓
Azure Redis
```

---

# Related Repositories

Backend:

```text
dropfolio-backend
```

Frontend:

```text
dropfolio-frontend
```

---

# License

Private project.

All rights reserved.
