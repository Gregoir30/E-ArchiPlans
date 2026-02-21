# Architecture cible (P0)

## Vue d'ensemble
Le projet est structure en monorepo avec deux applications:
- Frontend SPA React (Vite)
- Backend API Laravel

## Modules principaux
- Public: landing, a-propos, contacter, catalogue
- Authentification: comptes acheteur/vendeur/admin
- Vendeur: depot et gestion des plans
- Acheteur: achat, paiement, telechargement
- Admin: moderation, categories, utilisateurs, transactions

## Flux principaux
1. Consultation libre des plans
2. Auth obligatoire pour l'achat
3. Paiement valide -> generation droit de telechargement
4. Journalisation des actions critiques

## Stockage
- Base de donnees principale: MySQL
- Fichiers plans: stockage backend (local en dev, objet en prod)
- Liens de telechargement: controles et temporises

## Environnements
- `dev`: local (frontend + backend + mysql docker)
- `staging`: preproduction pour validation
- `prod`: deploiement final avec sauvegardes et monitoring
