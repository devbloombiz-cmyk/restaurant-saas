# Phase 5 + Phase 6: Operations, SaaS Control, and Hardening

## Objective

Complete operational readiness with KOT printing workflows, printer/shop settings management, audit visibility, cashier management, SaaS-level controls, CSV export backup, and resilient frontend behavior.

## Backend Status

Implemented and validated:

1. Print module (`/api/print`)
- `POST /api/print/kot/:orderId`
- `POST /api/print/reprint-last`
- `GET /api/print/settings`
- `PATCH /api/print/settings`

2. Settings module (`/api/settings`)
- `GET /api/settings/shop`
- `PATCH /api/settings/shop`

3. Users cashier management (`/api/users/cashier`)
- `POST /api/users/cashier`
- `GET /api/users/cashier`
- `PATCH /api/users/cashier/:id`
- `DELETE /api/users/cashier/:id`

4. Logs module (`/api/logs`)
- `GET /api/logs`
- `GET /api/logs/:id`

5. SaaS module (`/api/saas`)
- `GET /api/saas/platform-summary`
- `GET /api/saas/tenants`
- `GET /api/saas/shops`
- `PATCH /api/saas/tenant-status/:id`
- `PATCH /api/saas/shop-status/:id`

6. Export module (`/api/export`)
- `GET /api/export/orders`
- `GET /api/export/reports`
- `GET /api/export/menu`

7. Audit logging integration
- Added logging hooks for menu, orders, auth, printer updates, shop settings, and cashier lifecycle operations.

## Frontend Status

Implemented:

1. POS Operations screen
- KOT print by order id selection.
- Reprint last order action.
- Printer settings form (paper width, connection, auto print, copies, active state).

2. Shop Admin Settings screen
- Tabbed workspace:
  - Shop profile/settings.
  - Cashier management (create, activate/deactivate, delete).
  - Activity logs list with client-side filters.
  - Export/backup CSV actions.

3. Super Admin SaaS dashboard
- Platform KPI cards.
- Tenant status controls.
- Shop status controls.

4. UX hardening
- Global toast notifications.
- Offline banner.
- Session-expiry handling on 401 responses.
- Role-protected routes for shop admin and super admin pages.
- Query retry behavior hardened to skip retries on unauthorized responses.

## Validation

1. Backend typecheck passed.
2. Frontend typecheck passed.

## Notes

1. Frontend role control is session-driven via Session Setup card (`cashier`, `shop_admin`, `super_admin`) for fast phase testing.
2. CSV exports are downloaded as browser blobs from API responses.
3. KOT print uses browser print window with API-generated HTML payload.
