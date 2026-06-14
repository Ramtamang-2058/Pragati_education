# Auth + Roles — Design Spec

Date: 2026-06-14
Status: Approved

## Goal

Add authentication and role-based access to Pragati Education (Django backend, Next.js
frontend). Three roles: **student**, **teacher**, **consultancy**. A student can have a
teacher and a consultancy attached. Structure the data model for future eSewa/Khalti
subscriptions without building the gateway integration yet.

## Decisions (confirmed)

- **Token transport:** JWT in httpOnly + Secure + SameSite cookies set by Django. The
  frontend never touches tokens in JS.
- **Registration:** Public signup creates **students only**. Teacher/consultancy accounts
  are created via Django admin (or by a consultancy/admin later).
- **Payments:** Structure the data model now (`Subscription`, `is_subscribed`); no gateway
  code in this phase.
- **Assignment:** A consultancy/teacher/admin links student ↔ teacher ↔ consultancy. Not
  student self-selection.
- **User model:** Custom `AbstractUser` with email login + role (Approach A). Requires
  resetting the dev SQLite DB (no real data yet).
- **Settings:** Consolidate the duplicate `config/settings.py` / `config/settings/`
  package into one location; delete the dead module. Lock down `CORS_ALLOW_ALL_ORIGINS`
  to specific origins (required for cookie credentials).

## Backend — `apps.accounts` (new app)

### Models

- `User(AbstractUser)`
  - `email` — unique, `USERNAME_FIELD = "email"`.
  - `username` — kept but not the login field (or set blank/optional).
  - `role` — choices: `student` | `teacher` | `consultancy`.
  - `is_subscribed` — property derived from the active `Subscription`.
- `StudentProfile(OneToOne → User)`
  - `teacher` — FK → User, null, `limit_choices_to={"role": "teacher"}`.
  - `consultancy` — FK → User, null, `limit_choices_to={"role": "consultancy"}`.
  - Room for future study metadata.
- `Subscription(FK → User)`
  - `plan`, `status` (active/expired/none), `started_at`, `expires_at`,
    `gateway` (esewa/khalti, nullable). No gateway code now.

### Auth API (cookie JWT)

- `POST /api/auth/register/` — public; creates a **student** only.
- `POST /api/auth/login/` — sets `access` + `refresh` httpOnly cookies; returns user info.
- `POST /api/auth/refresh/` — rotates access cookie from the refresh cookie.
- `POST /api/auth/logout/` — clears cookies, blacklists refresh.
- `GET /api/auth/me/` — current user (id, email, role, is_subscribed).
- Custom DRF authentication class reads the JWT from the cookie, not the
  `Authorization` header.

### Authorization

- DRF permission classes: `IsStudent`, `IsTeacher`, `IsConsultancy`.
- Existing reading API → `IsAuthenticated`.
- `POST /api/students/{id}/assign/` — consultancy/teacher/admin links a student to a
  teacher & consultancy. Also editable in Django admin.

### Settings cleanup

- One settings location; delete dead `settings.py`.
- INSTALLED_APPS += `apps.accounts`, `rest_framework_simplejwt`,
  `rest_framework_simplejwt.token_blacklist`.
- `AUTH_USER_MODEL = "accounts.User"`, JWT lifetimes + cookie config.
- CORS with credentials; specific allowed origins (not allow-all).
- `requirements.txt` updated (djangorestframework, simplejwt, django-cors-headers).

## Frontend — Next.js

- `lib/auth` — axios client (`withCredentials: true`) for register/login/logout/me.
- `AuthContext` provider in root layout; holds current user + role; calls `/me` on mount.
- `middleware.ts` — gates the `(protected)` route group; redirects unauthenticated users
  to `/login` (cookie checked server-side).
- Pages: `/login`, `/register` (student signup). Role-aware UI.
- Replace hardcoded `http://localhost:8000` with `NEXT_PUBLIC_API_URL`.

## Testing

- Backend: register (student-only enforced), login sets cookies, `/me`, role permissions,
  assignment endpoint.
- Frontend: middleware redirect + auth context smoke test.

## Out of scope (future phase)

eSewa/Khalti gateway calls, payment verification/webhooks, subscription purchase UI. The
data model is ready for them.
