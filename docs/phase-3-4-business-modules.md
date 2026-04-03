# Phase 3 + Phase 4: Core Business Modules + POS UI

## Objective

Make the platform operationally usable by implementing core domain APIs and cashier/admin/report interfaces.

## Backend Deliverables

1. Shops module
- `POST /api/shops`
- `GET /api/shops`
- `GET /api/shops/:id`
- `PATCH /api/shops/:id`
- `DELETE /api/shops/:id`
- Access: `super_admin`, `shop_admin`

2. Menu module
- Categories:
  - `POST /api/menu/categories`
  - `GET /api/menu/categories`
  - `PATCH /api/menu/categories/:id`
  - `DELETE /api/menu/categories/:id`
- Items:
  - `POST /api/menu/items`
  - `GET /api/menu/items`
  - `GET /api/menu/items/:id`
  - `PATCH /api/menu/items/:id`
  - `DELETE /api/menu/items/:id`

3. Modifiers module
- `POST /api/modifiers`
- `GET /api/modifiers`
- `PATCH /api/modifiers/:id`
- `DELETE /api/modifiers/:id`

4. Orders module
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id`
- `GET /api/orders/daily-summary`
- Order number format: `ORD-1001` sequence by tenant/shop count.

5. Reports module
- `GET /api/reports/daily`
- Returns totals:
  - `totalOrders`
  - `totalSales`
  - `cashTotal`
  - `cardTotal`
  - `pendingTotal`

## Frontend Deliverables

1. Cashier POS screen
- Category filters and menu grid.
- Modifier selection modal.
- Live cart and payment mode selector (`cash`, `card`, `pending`).
- Save & print action wired to orders API.

2. Admin menu management
- Category CRUD controls.
- Item CRUD controls including availability toggle.
- Modifier CRUD controls.

3. Daily report UI
- KPI cards for total orders, total sales, cash, card, pending.

4. Foundation UX capabilities
- Session setup card for access token and tenant/shop context.
- Error boundary.
- Skeleton loaders.

## Architecture Notes

1. Backend uses repository -> service -> controller for all implemented modules.
2. All protected routes depend on `req.context` tenant scope.
3. API responses follow global envelope:
- success:
  - `{ success: true, message, data }`
- error:
  - `{ success: false, message, error }`

## Test Status

Validated by:
1. Backend and frontend TypeScript checks (`typecheck`) passed.
2. Authenticated smoke tests passed for:
- `GET /api/menu/categories`
- `GET /api/reports/daily`

## Next Suggested Phase

1. Add KOT printer dispatch workflow and queueing.
2. Add inventory deduction hooks from order placement.
3. Add end-to-end integration tests for POS checkout and report totals.
