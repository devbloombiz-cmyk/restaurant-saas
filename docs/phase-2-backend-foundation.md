# Phase 2: Backend Foundation Layer

## Objective

Implement a secure, modular, multi-tenant ready backend foundation for future POS modules.

## Delivered Scope

1. Environment bootstrap with strict validation.
2. Express app bootstrap with security, logging, JSON parsing, and centralized error handling.
3. MongoDB connection setup with health-state reporting.
4. Auth module with repository -> service -> controller pattern.
5. JWT access + refresh token lifecycle.
6. Role-based authorization middleware (`authorize(["shop_admin"])` style).
7. Tenant context injection middleware (`req.context`).
8. Zod validation for login, registration, and token refresh payloads.
9. Standardized API success/error response contracts.
10. `/api/health` endpoint with DB and timestamp diagnostics.

## Core APIs

- `POST /api/auth/login`
- `POST /api/auth/register-shop-admin`
- `POST /api/auth/register-cashier`
- `GET /api/auth/profile`
- `POST /api/auth/refresh-token`
- `GET /api/health`

## Request Context Contract

After `requireAuth`, every request includes:

```ts
req.context = {
  tenantId,
  shopId,
  role,
  userId
}
```

## Testable Example Flow

1. Login as seeded super admin:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@restaurant-saas.local",
    "password": "SuperAdmin@123",
    "tenantId": "platform",
    "shopId": "platform"
  }'
```

2. Register a tenant + shop admin (use super admin access token):

```bash
curl -X POST http://localhost:5000/api/auth/register-shop-admin \
  -H "Authorization: Bearer <SUPER_ADMIN_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Bloom Foods",
    "tenantSlug": "bloom-foods",
    "shopName": "Bloom Main Branch",
    "shopLocation": "Downtown",
    "adminName": "Main Admin",
    "adminEmail": "admin@bloomfoods.com",
    "adminPassword": "Admin@12345"
  }'
```

3. Login as shop admin using tenant and shop context.
4. Register cashier with shop admin token.
5. Fetch profile via `GET /api/auth/profile`.
6. Refresh token via `POST /api/auth/refresh-token`.

## Response Standard

Success:

```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "string",
  "error": {}
}
```
