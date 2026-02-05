# API_USAGE

Last-Updated: 2026-02-05 13:30  
Purpose: Guide rapide des endpoints MVP.

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

## Restaurants
- `GET /restaurants/me`

## Menu
- `POST /menu/menus`
- `GET /menu/menus`
- `POST /menu/categories`
- `GET /menu/categories`
- `POST /menu/items`
- `GET /menu/items`
- `PATCH /menu/items/:id/availability`

## Orders
- `POST /orders`
- `POST /orders/quote`
- `GET /orders`
- `PATCH /orders/:id/status`

## Delivery
- `POST /delivery`
- `GET /delivery/:orderId`

## Pricing
- `POST /pricing`
- `GET /pricing`

## Payments
- `POST /payments`
- `PATCH /payments/:id/status`
- `GET /payments/by-order/:orderId`

### Currency
- Default currency is `TND` unless explicitly provided in `POST /payments`.
- Multi-currency hooks exist but are disabled by default (see `.env.example`).

## KDS / Reports / SLA
- `GET /kds/queue`
- `GET /reports/sales?start=...&end=...`
- `GET /sla/prep-time`
