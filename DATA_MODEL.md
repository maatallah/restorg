# DATA_MODEL RestOrg

Last-Updated: 2026-02-04 16:30  
Purpose: Modèle de données MVP pour RestOrg (auth, menu, commande, paiement).

## Conventions
- Tous les IDs sont des UUID.
- Les dates sont en `timestamp` (UTC).
- Toute entité métier est rattachée à `restaurant_id`.

---

## 1. Restaurant
**Table**: `restaurants`
- `id` UUID (PK)
- `name` TEXT
- `status` TEXT (ACTIVE | INACTIVE)
- `created_at` TIMESTAMP

---

## 2. User
**Table**: `users`
- `id` UUID (PK)
- `restaurant_id` UUID (FK -> restaurants.id)
- `email` TEXT (unique)
- `password_hash` TEXT
- `full_name` TEXT
- `role` TEXT (ADMIN | STAFF | CASHIER)
- `created_at` TIMESTAMP

---

## 3. Menu
**Table**: `menus`
- `id` UUID (PK)
- `restaurant_id` UUID (FK)
- `name` TEXT
- `is_active` BOOLEAN
- `created_at` TIMESTAMP

**Table**: `menu_categories`
- `id` UUID (PK)
- `restaurant_id` UUID (FK)
- `menu_id` UUID (FK -> menus.id)
- `name` TEXT
- `position` INT

**Table**: `menu_items`
- `id` UUID (PK)
- `restaurant_id` UUID (FK)
- `category_id` UUID (FK -> menu_categories.id)
- `name` TEXT
- `description` TEXT
- `price_cents` INT
- `is_available` BOOLEAN
- `created_at` TIMESTAMP

---

## 4. Options (toppings, tailles)
**Table**: `option_groups`
- `id` UUID (PK)
- `restaurant_id` UUID (FK)
- `item_id` UUID (FK -> menu_items.id)
- `name` TEXT
- `min_select` INT
- `max_select` INT

**Table**: `option_items`
- `id` UUID (PK)
- `restaurant_id` UUID (FK)
- `group_id` UUID (FK -> option_groups.id)
- `name` TEXT
- `price_cents` INT
- `is_available` BOOLEAN

---

## 5. Order
**Table**: `orders`
- `id` UUID (PK)
- `restaurant_id` UUID (FK)
- `order_number` TEXT (unique per restaurant)
- `channel` TEXT (ON_SITE | TAKEAWAY | DELIVERY)
- `status` TEXT (CREATED | IN_PREP | READY | COMPLETED | CANCELED)
- `table_number` TEXT (nullable)
- `customer_name` TEXT (nullable)
- `total_cents` INT
- `created_at` TIMESTAMP

**Table**: `order_items`
- `id` UUID (PK)
- `restaurant_id` UUID (FK)
- `order_id` UUID (FK -> orders.id)
- `item_id` UUID (FK -> menu_items.id)
- `quantity` INT
- `unit_price_cents` INT
- `notes` TEXT (nullable)

**Table**: `order_item_options`
- `id` UUID (PK)
- `restaurant_id` UUID (FK)
- `order_item_id` UUID (FK -> order_items.id)
- `option_item_id` UUID (FK -> option_items.id)
- `price_cents` INT

---

## 6. Kitchen Routing (simple)
**Table**: `kitchen_stations`
- `id` UUID (PK)
- `restaurant_id` UUID (FK)
- `name` TEXT (ex: PIZZA, GRILL)
- `role` TEXT (ex: PIZZAIOL0, SANDWICHER)

**Table**: `item_station_rules`
- `id` UUID (PK)
- `restaurant_id` UUID (FK)
- `item_id` UUID (FK -> menu_items.id)
- `station_id` UUID (FK -> kitchen_stations.id)

---

## 7. Payment
**Table**: `payments`
- `id` UUID (PK)
- `restaurant_id` UUID (FK)
- `order_id` UUID (FK -> orders.id)
- `method` TEXT (CASH | CARD | ONLINE | TICKET_RESTAURANT | OTHER)
- `status` TEXT (PENDING | PAID | FAILED | REFUNDED)
- `amount_cents` INT
- `currency` TEXT (default: TND)
- `provider_ref` TEXT (nullable)
- `created_at` TIMESTAMP

---

## 8. Pricing
**Table**: `pricing_rules`
- `id` UUID (PK)
- `restaurant_id` UUID (FK -> restaurants.id, unique)
- `tax_rate` DECIMAL (0..1)
- `discount_rate` DECIMAL (0..1)
- `created_at` TIMESTAMP

---

## 9. Fulfillment Details
**Table**: `delivery_details`
- `id` UUID (PK)
- `order_id` UUID (FK -> orders.id, unique)
- `restaurant_id` UUID (FK -> restaurants.id)
- `customer_phone` TEXT
- `address_line1` TEXT
- `address_line2` TEXT (nullable)
- `city` TEXT
- `notes` TEXT (nullable)
- `delivery_window` TEXT (nullable)
- `created_at` TIMESTAMP

---

## 10. Audit Log
**Table**: `audit_logs`
- `id` UUID (PK)
- `restaurant_id` UUID (FK)
- `actor_user_id` UUID (FK -> users.id)
- `action` TEXT
- `entity_type` TEXT
- `entity_id` UUID
- `created_at` TIMESTAMP

---

## MVP Notes
- Ce modèle couvre l'auth, le menu, la commande, les paiements et le routage simple cuisine.
- Stock et fournisseurs sont explicitement hors scope (Phase 2+).
