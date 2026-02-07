# Stabilization Summary (Phase 1)

Last-Updated: 2026-02-07 09:01
Purpose: Summary of stabilization changes and verification status.

## What Changed
- Hardened order creation with server-side price validation and transaction safety.
- Enforced order and payment status transition rules.
- Added pricing rule application (discount then tax) to order totals.
- Added cart quote endpoint for price simulation without order creation.
- Enforced option group min/max constraints and option availability validation.
- Introduced UUID-based order numbers to avoid collisions.
- Expanded test coverage with happy-path and invalid-transition cases.
- Added multi-currency configuration hooks (feature-flagged, disabled by default).

## New/Updated Endpoints
- `POST /orders/quote` (compute totals without creating an order)

## Validation
- `npm run lint` (tsc --noEmit)
- `npm test` (vitest)

## Open Items
- Confirm default currency for payments (currently `TND`).
- Branch protection deferred (to be configured in GitHub later).

## Currency & Compliance (Deferred)
- Current mode is **TND-only** until regulatory validation is complete.
- Multi-currency is **feature-flagged** and **disabled by default**.
- Activation requires:
  - Legal validation per restaurant type.
  - Verified FX rate source + update frequency.
  - Audit trail for currency conversions.
