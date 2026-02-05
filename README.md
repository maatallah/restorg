# RestOrg

Last-Updated: 2026-02-05 14:45  
Purpose: Vue d'ensemble du projet, prérequis, et commandes de base.

## Résumé
RestOrg est une plateforme de restauration omnicanale (web, mobile, desktop, bornes) qui gère tout le cycle : menu → commande → préparation → paiement → livraison.

## Objectifs
- Centraliser le menu, les prix et la disponibilité.
- Supporter sur place, à emporter et livraison.
- Offrir une expérience fluide sur tous les appareils.
- Permettre l'opérationnel en cuisine (KDS) et le suivi des commandes.

## Stack Technique (MVP)
- Backend: Node.js + TypeScript + Fastify
- DB: PostgreSQL
- ORM: Prisma
- Validation: Zod
- Auth: JWT

## Prérequis
- Node.js (v24+)
- npm (v11+)
- PostgreSQL (v18+)

## Installation
```powershell
npm install
```

## Variables d'environnement (exemple)
Créer un fichier `.env` à la racine:
```
DATABASE_URL=postgresql://user:password@localhost:5432/restorg
JWT_SECRET=change-me
PORT=3000
```
Notes monnaie:
- Par défaut, la devise est `TND`.
- Les hooks multi-devise existent mais sont désactivés par défaut (voir `.env.example`).

## Scripts (à compléter)
Les scripts seront alignés avec le stack choisi. Exemples prévus:
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run test`

## Structure (prévisionnelle)
- `src/` : API Fastify, modules métier
- `prisma/` : schéma et migrations
- `docs/` : architecture, scope, décisions

## Vérification du stack
```powershell
git --version
node --version
npm --version
npx tsc --version
node -e "console.log(require('fastify/package.json').version)"
psql --version
```

## Notes
- Les décisions majeures sont consignées dans `AGENTS.md`.
- La création des documents verrouillés nécessite validation explicite.
