# Local Login and Role-Based Flow (Real System)

This project now uses real login-based session flow.
The old manual token injector UI is removed from app layout.

## Why you were seeing everything before

The previous UI exposed a developer helper card called `Session Setup` that manually wrote token/role/tenant into local storage.
That is why views appeared mixed and not truly role-driven.

Now:
- login is mandatory
- routes are protected by auth + role
- nav tabs are filtered per role
- logout calls backend + clears local session

## 1. Run locally properly

1. Open terminal in project root:
- `C:\Users\User\Desktop\Bloombiz\Applications\Restaurant-SaaS\restaurant-saas`

2. Install packages:
- `npm install`

3. Start backend:
- `npm run dev -w apps/backend`

4. Start frontend:
- `npm run dev -w apps/frontend`

5. Open app:
- `http://localhost:5173/login`

## 2. Login as super admin

Seeded from backend env (`apps/backend/.env`):
- email: `SUPER_ADMIN_EMAIL`
- password: `SUPER_ADMIN_PASSWORD`

Default values commonly used:
- `superadmin@restaurant-saas.local`
- `SuperAdmin@123`

After login, super admin lands on:
- `/super-admin/onboard`

## 3. Create shop admin from super admin

Use page:
- `Super Admin Tenant Onboarding`

Fill:
- tenant name/slug
- shop name/location
- admin name/email/password

Submit creates:
- tenant
- shop
- first shop admin

Use the returned `tenantId` and `shopId` for shop admin login.
The system now resolves tenant/shop automatically from the authenticated account.

## 4. Login as shop admin

At `/login`, use:
- shop admin email
- shop admin password

Shop admin can access:
- Admin Menu
- Shop Settings
- Reports
- Diagnostics
- Backup
- POS and Operations

## 5. Create cashier from shop admin

Go to:
- `Shop Settings` tab
- `Cashiers`

Create cashier credentials (email/password).

## 6. Login as cashier and view

At `/login`, use:
- cashier email
- cashier password

Cashier view is restricted to:
- POS
- Operations (KOT workflows)
- Health

Cashier cannot open admin/super-admin URLs directly (route guard blocks it).

## 7. Token expiry and stuck workflow handling

Implemented flow:
- API interceptor auto-attempts refresh using refresh token on 401
- if refresh succeeds: request retries automatically
- if refresh fails: session is cleared and user is redirected to login
- session timeout modal warns before expiry and supports stay-signed-in flow

This prevents cashier workflows from getting permanently stuck on token expiry.

## 8. Why health API exists

Health APIs are needed for operations and support:
- `GET /api/health` basic app+db availability
- `GET /api/system/health` runtime trust signal
- `GET /api/system/metrics` performance telemetry
- `GET /api/system/diagnostics` debugging payload

Use cases:
- monitor uptime
- detect DB latency spikes
- verify deployment after restart
- integrate with alerting scripts

## 9. Quick local verification checklist

1. Login as super admin and create shop admin.
2. Login as shop admin and create cashier.
3. Login as cashier and place order in POS.
4. Force token expiry and confirm auto refresh/logout behavior.
5. Try opening admin URL as cashier and verify redirect.
6. Validate diagnostics and backup pages as shop/super admin.
