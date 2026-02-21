# TODO - E-ArchiPlans
Date de référence : 20 février 2026

## Objectif
Transformer le cahier des charges en plan d'exécution concret, priorisé et actionnable.

## Priorité P0 - Fondations (bloquant MVP)
- [x] Initialiser les dépôts et conventions (frontend React, backend Laravel, DB MySQL).
- [x] Définir l'architecture globale (modules, routes, rôles, flux de paiement, stockage fichiers).
- [x] Mettre en place les environnements (`dev`, `staging`) + variables d'environnement.
- [x] Configurer CI minimale (lint + tests + build).
- [x] Concevoir le schéma de base de données initial.

## Priorité P1 - MVP fonctionnel (mise en ligne minimale)

### 1. Landing page et pages publiques
- [x] Créer la landing page responsive (desktop/tablette/mobile).
- [x] Ajouter les sections : proposition de valeur, avantages, CTA.
- [x] Créer la page « À propos / Nos services ».
- [x] Implémenter la page « Contacter » (formulaire + envoi).

### 2. Catalogue des plans (consultation libre)
- [ ] Créer la grille style Pinterest.
- [ ] Implémenter les catégories (Maison moderne, Duplex, Villa, etc.).
- [ ] Ajouter recherche textuelle + filtres.
- [ ] Créer la page détail d'un plan (aperçu, prix, vendeur, caractéristiques).

### 3. Authentification et rôles
- [ ] Mettre en place l'authentification sécurisée.
- [ ] Créer les rôles : `acheteur`, `vendeur`, `admin`.
- [ ] Bloquer l'achat aux utilisateurs non connectés.
- [ ] Mettre en place la gestion des permissions par rôle.

### 4. Espace vendeur
- [ ] Créer le tableau de bord vendeur.
- [ ] Permettre dépôt de plan (métadonnées + fichiers).
- [ ] Implémenter CRUD des plans (ajout, modification, suppression).
- [ ] Ajouter suivi des ventes vendeur.

### 5. Espace acheteur
- [ ] Créer le parcours d'achat sécurisé.
- [ ] Intégrer paiement en ligne (mode test d'abord).
- [ ] Débloquer téléchargement après paiement validé.
- [ ] Ajouter historique des commandes.

### 6. Espace administrateur
- [ ] Créer le dashboard admin.
- [ ] Implémenter validation/rejet des plans déposés.
- [ ] Ajouter gestion utilisateurs.
- [ ] Ajouter gestion catégories.
- [ ] Ajouter supervision des transactions.

## Priorité P2 - Sécurité et conformité (obligatoire avant prod)
- [ ] Chiffrer les données sensibles.
- [ ] Protéger contre SQL injection / XSS / CSRF.
- [ ] Protéger les fichiers téléchargeables (URLs signées, contrôle d'accès).
- [ ] Journaliser actions sensibles (audit logs).
- [ ] Mettre en place sauvegardes régulières (DB + fichiers).

## Priorité P3 - Qualité, reporting, optimisation
- [ ] Ajouter statistiques et reporting admin.
- [ ] Écrire tests unitaires/integration/end-to-end sur flux critiques.
- [ ] Optimiser performances catalogue (pagination, index DB, cache).
- [ ] Améliorer SEO des pages publiques.
- [ ] Préparer monitoring et alerting (erreurs, paiement, disponibilité).

## Priorité P4 - Livrables finaux
- [ ] Finaliser code source documenté.
- [ ] Livrer schéma DB + scripts de migration.
- [ ] Rédiger documentation technique.
- [ ] Rédiger guide d'utilisation administrateur.
- [ ] Exécuter la mise en production.

## Jalons (planning conseillé)
- [ ] Semaine 1-2 : cadrage, architecture, DB, setup.
- [ ] Semaine 3-5 : développement MVP (public + vendeur + acheteur + admin).
- [ ] Semaine 6-7 : tests, sécurité, corrections.
- [ ] Semaine 8 : déploiement et stabilisation.

## Stack retenue
- [ ] Frontend : React + Tailwind CSS.
- [ ] Backend : Laravel.
- [ ] Base de données : MySQL.

