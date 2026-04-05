# Restaurant SaaS

Production-ready phase-1 foundation for a multi-tenant restaurant POS, KOT, and order management SaaS platform.

## Workspace Structure

```text
restaurant-saas/
├── apps/
│   ├── frontend/
│   └── backend/
├── shared/
│   ├── types/
│   ├── constants/
│   └── utils/
├── docs/
├── scripts/
├── .env.example
├── package.json
└── README.md
```

## Architecture Highlights

1. Monorepo with npm workspaces for frontend, backend, and shared contracts.
2. Frontend uses React + Vite + TypeScript with feature-first modular folders.
3. Backend uses Express + TypeScript with repository-service-controller flow.
4. Multi-tenant readiness with mandatory `tenantId` and `shopId` fields in models.
5. Role-aware baseline for `SUPER_ADMIN`, `SHOP_ADMIN`, and `CASHIER`.
6. Production deployment scaffolding with PM2 and Nginx sample configs.

## Quick Start

1. Install dependencies:
   - `npm install`
2. Create env files:
   - Copy `.env.example` to `.env`
   - Copy `apps/backend/.env.example` to `apps/backend/.env`
   - Copy `apps/frontend/.env.example` to `apps/frontend/.env`
3. Run development:
   - `npm run dev`
4. Build all packages:
   - `npm run build`

## Scripts

- `npm run dev` - runs frontend and backend in parallel
- `npm run build` - builds shared, backend, and frontend
- `npm run lint` - lints app packages
- `npm run typecheck` - runs TypeScript checks across all packages

## Documentation

- Phase 1 implementation details: `docs/phase-1-foundation.md`
- Phase 2 backend foundation: `docs/phase-2-backend-foundation.md`
- Phase 3 and 4 business modules: `docs/phase-3-4-business-modules.md`
- Phase 5 and 6 operations and hardening: `docs/phase-5-6-operations-saas-hardening.md`
- Phase 7 and 8 enterprise stability: `docs/phase-7-8-enterprise-stability.md`
- Complete Postman E2E testing guide: `docs/postman-e2e-testing-guide.md`
- Postman environment template: `docs/postman-environment-template.json`
- Local login and role-based user flow: `docs/local-login-role-flow.md`
- Installation command reference: `scripts/install-commands.md`
- PM2 config: `scripts/pm2/ecosystem.config.cjs`
- Nginx sample config: `scripts/nginx/restaurant-saas.conf`

## Scope of Phase 1

This phase creates only enterprise-grade project setup and architecture skeleton. Business features (auth flows, POS flows, menu operations, reporting logic) are intentionally deferred to next phases.
