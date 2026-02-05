# MVP Scope RestOrg

Last-Updated: 2026-02-04 11:07  
Purpose: Définir clairement ce qui est inclus/exclu pour la première version.

## Objectif MVP
Lancer un produit utilisable sur un restaurant pilote pour gérer menu, commandes, préparation et paiement, avec prise en charge sur place, à emporter et livraison.

## Inclus (MVP)
- Menu & articles (CRUD)
- Catégories + options (taille, toppings)
- Tarification de base + taxes
- Panier + création de commande
- Workflow de commande (créée → en préparation → prête → finalisée)
- Modes de service: sur place, à emporter, livraison
- Notifications basiques (statut prêt)
- Paiement: sur place (cash/carte), en ligne basique, tickets restaurant (si acceptés)
- Modèle extensible de modes de paiement (enum configurable)
- Auth + rôles (admin, staff, caisse)
- Journal d’événements (audit paiement/commande)
- Routage cuisine **simple** par station/role (optionnel, configurable)

## Hors scope (Phase 2+)
- Programme de fidélité
- Coupons avancés / promotions complexes
- Marketplace multi-restaurants
- Optimisation avancée de livraison
- IA / recommandations
- Support multi-langues côté contenu
- Stock & fournisseurs (achats, inventaire, réceptions)

## Jalons (alignés aux phases)
### Phase 1: Foundation
- Base API + Auth
- Isolation par restaurant
- Health checks

### Phase 2: Menu & Ordering
- Menu complet
- Panier + commande
- Statuts

### Phase 3: Fulfillment
- Sur place / à emporter / livraison
- Notifications

### Phase 4: Payments
- Paiement sur place
- Paiement en ligne
- Tickets restaurant (si acceptés)

### Phase 5: Ops & Analytics
- KDS simple
- Rapports de ventes basiques

## Critères de réussite
- 1 restaurant pilote peut gérer un service complet
- Les commandes se terminent sans intervention manuelle
- Les statuts sont visibles en temps réel par le staff
