# Architecture RestOrg

Last-Updated: 2026-02-04 11:07  
Purpose: Définir la vision d’architecture omnicanale pour la plateforme RestOrg.

## Vision
Une plateforme unique gérant l’ensemble du cycle de restauration : menu → commande → préparation → paiement → livraison, accessible via web, mobile, desktop et bornes.

## Principes clés
- **Noyau métier commun** : pas de duplication de logique entre canaux.
- **Modular Monolith** au départ : simplicité et vitesse d’exécution.
- **Évolutivité** : extraction en microservices uniquement si nécessaire.
- **Communication événementielle** pour découpler cuisine, notifications, paiements.

## Canaux supportés
- Web (client & backoffice)
- Mobile (client & staff)
- Desktop (caisse / POS)
- Bornes (self-service)

## Domaines métier
- `Menu` : catégories, articles, options
- `Pricing` : règles de prix, taxes, promos
- `Order` : panier, commandes, statuts
- `Kitchen` : préparation, files d’attente, affectation par station/role
- `Fulfillment` : sur place, à emporter, livraison
- `Payment` : in-site, en ligne, remboursements, tickets restaurant
- `Customer` : profils, historique, préférences

## Paiements (Tunisie)
Le modèle doit permettre d’ajouter des modes de paiement sans refonte.
Modes MVP: cash, carte (TPE), paiement en ligne via PSP, tickets restaurant (si acceptés).

## Architecture logique (MVP)
- Clients (UI)
  - Web / Mobile / Desktop / Kiosk
- API Backend (Fastify + TS)
  - Modules métiers
  - Auth + RBAC
- DB (PostgreSQL)
- Stockage fichiers (preuves, tickets)
- Intégrations externes (paiement, SMS, livraison)

## Flux de commande (simplifié)
1. Client crée un panier
2. Commande validée + paiement (si online)
3. Cuisine prépare (routage simple par station si activé)
4. Commande prête → notification
5. Retrait / service / livraison

## Non-fonctionnel
- **Résilience** : tolérance aux coupures pour bornes et POS
- **Observabilité** : logs structurés + métriques
- **Sécurité** : JWT, RBAC, audit des paiements

## Évolution (Phase 2+)
- Extraction service `Payment` si charge élevée
- File de messages (BullMQ) pour notifications
- Cache Redis pour menus très consultés
- Stock & fournisseurs (approvisionnement, inventaire)
