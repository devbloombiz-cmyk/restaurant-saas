# Phase 1: Foundation Setup

## Goal

Create a production-ready, scalable, multi-tenant SaaS foundation for a Restaurant POS and Order Management platform without implementing business features.

## What Was Created

1. Monorepo workspace with apps, shared layer, docs, and infra scripts.
2. Frontend shell with modular feature folders, routing foundation, global state, API service layer, and query client.
3. Backend shell with module-first structure, app bootstrap, environment loader, DB connection setup, middleware, and route registration pattern.
4. Shared package for reusable types, enums, constants, and helper utilities.
5. Deployment baseline with PM2 ecosystem config and Nginx reverse proxy sample.

## Why This Structure

1. Multi-tenant SaaS systems need strict separation of concerns to scale teams and features.
2. Module-first boundaries reduce coupling and keep domain ownership clear.
3. Shared contracts reduce frontend-backend drift and integration bugs.
4. Infra-ready scripts reduce time to production hardening.

## How It Works

1. Root workspace orchestrates all packages with npm workspaces.
2. Frontend consumes backend APIs through a dedicated Axios service and TanStack Query.
3. Backend exposes versioned APIs under `/api/v1` with centralized middleware and error handling.
4. Every persistence model includes tenancy fields (`tenantId`, `shopId`) and timestamps for auditing and partitioning.
5. PM2 runs backend in cluster mode; Nginx handles static frontend and reverse proxy for API traffic.

## Purpose For Next Phases

1. Plug in authentication and onboarding without restructuring base folders.
2. Add POS, KOT, menu, billing, and reports as independent modules.
3. Add queueing, caching, and observability with minimal architectural disruption.
4. Support multi-shop growth and role-based isolation with tenant-safe patterns.

## Setup Summary

1. Copy root `.env.example` to `.env` and app-level examples as needed.
2. Install dependencies from `scripts/install-commands.md`.
3. Run development with root `npm run dev`.
4. Build with `npm run build`.
