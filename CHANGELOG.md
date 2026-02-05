# Changelog

## 2026-02-05 - Stabilization
- Fixed route param typing using Zod param schemas to satisfy TypeScript.
- Updated route header timestamps after stabilization edits.
- Lint and tests verified (tsc --noEmit, vitest).
- Enforced order/payment status transition rules with server-side validation.
- Recalculated option prices server-side and wrapped order creation in a transaction.
- Added happy path tests for order creation and payment transitions.
- Added negative tests for invalid order/payment status transitions.
- Switched order numbers to UUID-based generation to prevent collisions.
- Applied pricing rules (discount/tax) when computing order totals, with tests.
- Added /orders/quote endpoint and enforced option group min/max constraints.
- Added multi-currency configuration hooks (disabled by default).
- Documented currency policy and multi-currency hooks in README.
