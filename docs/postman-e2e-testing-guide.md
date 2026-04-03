# Postman E2E Testing Guide (Super Admin to Full Flow)

This guide gives a complete, Postman-friendly test flow for the current Restaurant SaaS API.

Base URL used below:
- `http://localhost:5000/api`

## 1. Local Run and Test Setup

1. Open terminal in project root:
- `C:\Users\User\Desktop\Bloombiz\Applications\Restaurant-SaaS\restaurant-saas`

2. Install dependencies:
- `npm install`

3. Confirm env files exist:
- `apps/backend/.env`
- `apps/frontend/.env`

4. Start backend:
- `npm run dev -w apps/backend`

5. Start frontend (optional for API-only testing):
- `npm run dev -w apps/frontend`

6. Confirm backend health:
- `GET http://localhost:5000/api/health`

Expected:
- `success: true`
- `data.serverRunning: true`
- `data.dbConnected: true`

## 2. Seeded Super Admin (Important)

Super admin is auto-created on backend startup (`ensureSuperAdminSeed`).

Default seed context:
- `tenantId = platform`
- `shopId = platform`

Default credentials from backend env:
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`

## 3. Postman Environment Variables

Create a Postman environment named `Restaurant SaaS Local` with:

- `baseUrl = http://localhost:5000/api`
- `accessToken =`
- `refreshToken =`
- `tenantId = platform`
- `shopId = platform`
- `superAdminEmail = superadmin@restaurant-saas.local`
- `superAdminPassword = SuperAdmin@123`
- `shopAdminEmail = admin@tenantone.com`
- `shopAdminPassword = Admin@1234`
- `cashierEmail = cashier1@tenantone.com`
- `cashierPassword = Cashier@1234`
- `shopMongoId =`
- `categoryId =`
- `itemId =`
- `modifierId =`
- `orderId =`
- `orderNumber =`
- `cashierUserId =`
- `tenantMongoId =`
- `backupFileName =`
- `logId =`

## 4. Common Headers for Protected APIs

For all protected APIs, set:
- `Authorization: Bearer {{accessToken}}`
- `x-tenant-id: {{tenantId}}`
- `x-shop-id: {{shopId}}`
- `Content-Type: application/json`

## 5. Authentication and Role Bootstrap (End-to-End Start)

### Step A: Login as seeded super admin

Request:
- `POST {{baseUrl}}/auth/login`

Body:
```json
{
  "email": "{{superAdminEmail}}",
  "password": "{{superAdminPassword}}",
  "tenantId": "platform",
  "shopId": "platform"
}
```

Postman Tests:
```javascript
pm.test("login success", () => pm.response.code === 200);
const data = pm.response.json().data;
pm.environment.set("accessToken", data.accessToken);
pm.environment.set("refreshToken", data.refreshToken);
pm.environment.set("tenantId", data.user.tenantId);
pm.environment.set("shopId", data.user.shopId);
```

### Step B: Register tenant + shop + shop admin

Request:
- `POST {{baseUrl}}/auth/register-shop-admin`

Body:
```json
{
  "tenantName": "Tenant One",
  "tenantSlug": "tenant-one",
  "shopName": "Tenant One Main",
  "shopLocation": "Downtown",
  "adminName": "Tenant Admin",
  "adminEmail": "{{shopAdminEmail}}",
  "adminPassword": "{{shopAdminPassword}}"
}
```

Postman Tests:
```javascript
pm.test("register shop admin", () => pm.response.code === 201);
const data = pm.response.json().data;
pm.environment.set("tenantId", data.tenantId);
pm.environment.set("shopId", data.shopId);
```

### Step C: Login as shop admin

Request:
- `POST {{baseUrl}}/auth/login`

Body:
```json
{
  "email": "{{shopAdminEmail}}",
  "password": "{{shopAdminPassword}}",
  "tenantId": "{{tenantId}}",
  "shopId": "{{shopId}}"
}
```

Postman Tests:
```javascript
const data = pm.response.json().data;
pm.environment.set("accessToken", data.accessToken);
pm.environment.set("refreshToken", data.refreshToken);
```

### Step D: Create cashier (auth endpoint)

Request:
- `POST {{baseUrl}}/auth/register-cashier`

Body:
```json
{
  "name": "Cashier One",
  "email": "{{cashierEmail}}",
  "password": "{{cashierPassword}}"
}
```

### Step E: Login as cashier

Request:
- `POST {{baseUrl}}/auth/login`

Body:
```json
{
  "email": "{{cashierEmail}}",
  "password": "{{cashierPassword}}",
  "tenantId": "{{tenantId}}",
  "shopId": "{{shopId}}"
}
```

Save returned cashier tokens if needed for cashier-role testing.

## 6. Full API Coverage Checklist (All Modules)

## 6.1 Auth

1. `POST /auth/login`
- body: `email, password, tenantId, shopId?`

2. `POST /auth/refresh-token`
- body:
```json
{ "refreshToken": "{{refreshToken}}" }
```

3. `POST /auth/logout`
- body:
```json
{
  "accessToken": "{{accessToken}}",
  "refreshToken": "{{refreshToken}}"
}
```

4. `POST /auth/register-shop-admin` (super_admin)

5. `POST /auth/register-cashier` (shop_admin)

6. `GET /auth/profile`

## 6.2 Shops (super_admin, shop_admin)

1. `POST /shops`
```json
{
  "name": "Branch 2",
  "location": "Airport Road",
  "printerConfig": {},
  "isActive": true
}
```

2. `GET /shops`
3. `GET /shops/:id`
4. `PATCH /shops/:id`
```json
{ "name": "Branch 2 Updated", "isActive": true }
```
5. `DELETE /shops/:id`

## 6.3 Menu (super_admin, shop_admin)

1. `POST /menu/categories`
```json
{ "name": "Burgers", "sortOrder": 1, "isActive": true }
```

2. `GET /menu/categories`
- Save first `_id` as `categoryId`.

3. `PATCH /menu/categories/:id`
```json
{ "name": "Burgers Premium" }
```

4. `DELETE /menu/categories/:id`

5. `POST /menu/items`
```json
{
  "categoryId": "{{categoryId}}",
  "name": "Classic Burger",
  "price": 149,
  "description": "Core test item",
  "modifierEnabled": true,
  "isAvailable": true,
  "sortOrder": 1
}
```

6. `GET /menu/items`
- Save first `_id` as `itemId`.

7. `GET /menu/items/:id`
8. `PATCH /menu/items/:id`
```json
{ "price": 159, "isAvailable": true }
```

9. `DELETE /menu/items/:id`

## 6.4 Modifiers (super_admin, shop_admin)

1. `POST /modifiers`
```json
{
  "itemId": "{{itemId}}",
  "name": "Extra Cheese",
  "priceAdjustment": 20,
  "type": "add"
}
```

2. `GET /modifiers`
- Save first `_id` as `modifierId`.

3. `PATCH /modifiers/:id`
```json
{ "priceAdjustment": 25 }
```

4. `DELETE /modifiers/:id`

## 6.5 Orders (super_admin, shop_admin, cashier)

1. `POST /orders`
```json
{
  "orderType": "eat_in",
  "paymentMode": "cash",
  "items": [
    {
      "itemId": "{{itemId}}",
      "name": "Classic Burger",
      "qty": 2,
      "unitPrice": 159,
      "modifiers": [
        {
          "modifierId": "{{modifierId}}",
          "name": "Extra Cheese",
          "priceAdjustment": 25
        }
      ]
    }
  ]
}
```

2. `GET /orders?page=1&limit=20`
- Save first `_id` as `orderId`, `orderNumber` if returned.

3. `GET /orders/:id`
4. `PATCH /orders/:id`
```json
{ "status": "completed", "paymentMode": "card" }
```

5. `GET /orders/daily-summary`

## 6.6 Reports (super_admin, shop_admin)

1. `GET /reports/daily`

Expected fields:
- `totalOrders`
- `totalSales`
- `cashTotal`
- `cardTotal`
- `pendingTotal`

## 6.7 Print (super_admin, shop_admin, cashier)

1. `POST /print/kot/:orderId`
```json
{ "copies": 1 }
```

2. `POST /print/reprint-last`
3. `GET /print/settings`
4. `PATCH /print/settings`
```json
{
  "printerName": "Main Thermal Printer",
  "printerType": "thermal",
  "connectionType": "lan",
  "ipAddress": "192.168.1.50",
  "port": 9100,
  "paperWidth": 80,
  "autoPrint": true,
  "copies": 1,
  "isActive": true
}
```

## 6.8 Settings (super_admin, shop_admin)

1. `GET /settings/shop`
2. `PATCH /settings/shop`
```json
{
  "shopName": "Tenant One Main",
  "currency": "INR",
  "timezone": "Asia/Kolkata",
  "taxRate": 5,
  "receiptFooter": "Thank you",
  "supportNumber": "+91-9000000000"
}
```

## 6.9 Users cashiers (super_admin, shop_admin)

1. `POST /users/cashier`
```json
{
  "name": "Cashier Two",
  "email": "cashier2@tenantone.com",
  "password": "Cashier@1234"
}
```

2. `GET /users/cashier`
- Save first cashier `_id` as `cashierUserId`.

3. `PATCH /users/cashier/:id`
```json
{ "isActive": true }
```

4. `DELETE /users/cashier/:id`

## 6.10 Logs (super_admin, shop_admin)

1. `GET /logs`
- Save first `_id` as `logId`.

2. `GET /logs/:id`

## 6.11 SaaS (super_admin only)

1. `GET /saas/platform-summary`
2. `GET /saas/tenants`
- Save first `_id` as `tenantMongoId`.

3. `GET /saas/shops`
- Save first `_id` as `shopMongoId`.

4. `PATCH /saas/tenant-status/:id`
```json
{ "isActive": true }
```

5. `PATCH /saas/shop-status/:id`
```json
{ "isActive": true }
```

## 6.12 Export (super_admin, shop_admin)

1. `GET /export/orders`
2. `GET /export/reports`
3. `GET /export/menu`

All return downloadable CSV.

## 6.13 System diagnostics and recovery

Public:
1. `GET /system/health`
2. `GET /system/metrics`
3. `GET /system/diagnostics`

Protected (super_admin, shop_admin):
4. `POST /system/backup`
5. `GET /system/backups`
- Save `filename` as `backupFileName`.

6. `GET /system/backups/:fileName`
7. `POST /system/restore`
```json
{ "fileName": "{{backupFileName}}" }
```

## 6.14 Future scaffold module APIs

1. `GET /future/inventory`
2. `GET /future/table-management`
3. `GET /future/kitchen-display`
4. `GET /future/delivery`
5. `GET /future/loyalty`
6. `GET /future/analytics`
7. `GET /future/subscription-billing`

## 7. End-to-End Local Test Flow (Recommended Order)

1. Start backend and confirm `/health`.
2. Login seeded super admin.
3. Register tenant/shop/shop_admin.
4. Login shop_admin.
5. Create menu category, item, modifier.
6. Create cashier and login cashier.
7. Create order as cashier.
8. Print KOT and verify print payload.
9. Verify reports and daily summary.
10. Update settings and verify fetch.
11. Verify logs exist for actions.
12. Test CSV exports.
13. Test diagnostics endpoints.
14. Create backup, list backups, download backup, restore backup.
15. Validate SaaS endpoints with super_admin token.
16. Logout and verify token is rejected on next protected call.

## 8. Fast Negative Tests (Must Run)

1. Missing auth header on protected routes => `401`.
2. Wrong role for route (cashier hitting `/saas/*`) => `403`.
3. Invalid body shape (extra fields on strict schemas) => `400`.
4. Burst login attempts to test throttle => `429`.
5. Restore with invalid file name => failure response.

## 9. Useful Postman Test Snippets

Set auth tokens after login:
```javascript
const data = pm.response.json().data;
pm.environment.set("accessToken", data.accessToken);
pm.environment.set("refreshToken", data.refreshToken);
```

Capture first item id from list:
```javascript
const data = pm.response.json().data;
if (Array.isArray(data) && data.length > 0) {
  pm.environment.set("itemId", data[0]._id);
}
```

Basic success assertion:
```javascript
pm.test("status is success", () => {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
});
```
