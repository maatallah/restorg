# task.md

Last-Updated: 2026-02-04 17:35  
Purpose: Suivi des jalons et tâches RestOrg.

## Phase 1 - Foundation (DONE)
- [x] Database setup (Prisma schema + client generation)
- [x] API server running (Fastify bootstrap)
- [x] Auth (JWT) + roles
- [x] Tenant/restaurant isolation
- [x] Health checks
- [x] Tests de base (health + admin RBAC)

## Phase 2 - Menu & Ordering (DONE)
- [x] Menu & items management
- [x] Pricing & availability
- [x] Cart + order placement (order creation)
- [x] Order status workflow

## Phase 3 - Fulfillment (DONE)
- [x] Sur place / à emporter / livraison (delivery details)
- [x] Notifications (placeholder in plan)

## Phase 4 - Payments (DONE)
- [x] Endpoints paiement (enregistrement + statut)
- [x] Paiement sur place (cash/carte immédiat)
- [x] Paiement en ligne (PENDING + providerRef requis)
- [x] Tickets restaurant (support method)

## Phase 5 - Ops & Analytics (DONE)
- [x] Kitchen display / prep queue
- [x] Basic sales reports
- [x] SLA metrics (placeholder)
