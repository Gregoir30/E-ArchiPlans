# Plan de Perfectionnement — E-ArchiPlans

## 1. UX & Architecture de l'information

**Problèmes identifiés**

La page actuelle fusionne Hero + Intro + Featured + Catalogue + Galerie + Contact dans un seul scroll vertical sans hiérarchie claire. L'utilisateur ne sait pas où regarder en premier.

**Actions**

* Séparer visuellement les grandes zones avec des ruptures de fond (blanc / beige / sombre) pour créer un rythme de lecture
* Revoir la hiérarchie : Hero → Preuve sociale → Plans vedettes → Catalogue → Galerie → CTA final
* Ajouter un fil d'Ariane ou indicateur de progression pour les pages profondes (détail plan)
* Transformer la section Intro (actuellement flottante en haut à droite) en bandeau de confiance horizontal centré sous le Hero, avec 3 icônes + chiffres clés (ex: "200+ plans", "Livraison 48h", "Architectes certifiés")

---

## 2. Hero Section

**Problèmes identifiés**

Le Hero est petit, le texte est peu lisible sur l'image de fond, et le filtre catégories est noyé dedans. Il n'y a pas de CTA principal.

**Actions**

* Agrandir la hauteur (min `100vh`) avec un overlay gradient sombre en bas pour lisibilité
* Ajouter un sous-titre accrocheur et **un CTA primaire** ("Explorer les plans") + CTA secondaire ("Nous contacter")
* Déplacer les filtres catégories **sous** le Hero dans une barre dédiée sticky, séparée visuellement
* Ajouter une animation d'entrée subtile (fade-in + slide-up) sur le titre

---

## 3. Navigation & Header

**Problèmes identifiés**

Le header actuel est quasiment invisible (juste "E-ArchiPla…" tronqué). Pas de menu, pas de panier, pas de recherche.

**Actions**

* Créer un header fixe complet : Logo + Nav (Accueil / Plans / À propos / Contact) + icône Panier + bouton "Connexion"
* Ajouter une **barre de recherche** globale (recherche par titre, catégorie, surface, prix)
* Sur mobile : hamburger menu avec drawer latéral
* Indicateur de panier avec badge de comptage

---

## 4. Section "Plans Recommandés"

**Problèmes identifiés**

Les cartes sont correctes mais manquent d'informations utiles à la décision d'achat. Le layout 2 colonnes + sidebar catalogue sur la même ligne crée une confusion visuelle.

**Actions**

* Séparer physiquement "Plans vedettes" et "Catalogue" en deux sections distinctes avec espacements généreux
* Enrichir les cartes avec : surface (m²), nombre de pièces, étages, icônes rapides
* Ajouter un badge "Nouveau" ou "Populaire" sur certaines cartes
* Ajouter une action secondaire "Voir le détail" en plus de "Commander"
* Hover sur la carte : zoom image + apparition d'un bouton "Aperçu rapide" (modal)

---

## 5. Section Catalogue & Filtres

**Problèmes identifiés**

Le filtre est un simple `<select>` unique. Le scroll horizontal du catalogue est peu intuitif. La sidebar est trop lourde visuellement.

**Actions**

* Remplacer le select par des **pills/tags cliquables** horizontaux (Duplex / Villa / Bungalow / Maison moderne…)
* Ajouter des filtres secondaires : fourchette de prix (slider), surface min/max, nombre de pièces
* Remplacer le scroll horizontal par une **grille responsive** (3 colonnes desktop, 2 tablet, 1 mobile)
* Ajouter un compteur de résultats : "14 plans trouvés"
* Ajouter tri : Prix croissant / décroissant / Plus récent / Plus populaire
* Skeleton loaders pendant le chargement au lieu du texte "Chargement..."

---

## 6. Galerie "Inspiration de projets"

**Problèmes identifiés**

La galerie Masonry est visuellement intéressante mais les métadonnées (titre + catégorie) sont peu lisibles. Le bouton "Enregistrer" apparaît sans explication de sa fonction (pas de système de favoris visible).

**Actions**

* Améliorer l'overlay au hover : fond dégradé + titre + catégorie + bouton "Voir ce plan"
* Implémenter réellement un **système de favoris** (cœur) avec persistance localStorage ou compte utilisateur
* Ajouter un filtre au-dessus de la galerie (même pills que le catalogue)
* Lazy loading avec skeleton placeholder animé (shimmer effect) au lieu des placeholders statiques
* Lightbox au clic pour prévisualisation plein écran avant de visiter la page détail

---

## 7. Section Contact / CTA Final

**Problèmes identifiés**

La section est petite et placée en colonne à côté de la galerie, ce qui l'affaiblit considérablement. Les deux boutons CTA ont des styles similaires et peu de contraste.

**Actions**

* Transformer en **full-width section** avec fond sombre ou image de fond architecturale
* Différencier clairement les deux CTA : primaire plein ("Nous contacter") vs secondaire outline ("En savoir plus")
* Ajouter un formulaire de capture email minimal : "Recevez nos nouveaux plans en avant-première"
* Ajouter des liens vers réseaux sociaux (Instagram, Pinterest — pertinents pour l'architecture)

---

## 8. Footer

**Problèmes identifiés**

Le footer actuel est une simple ligne de texte avec 3 liens. Il n'inspire pas confiance et offre zéro valeur ajoutée.

**Actions**

* Footer 4 colonnes : Logo + description courte / Navigation / Légal (CGV, Mentions légales, Politique de confidentialité) / Contact + réseaux sociaux
* Ajouter une section "Paiement sécurisé" avec logos (Visa, Mastercard, etc.)
* Mention RGPD et bannière cookies

---

## 9. Performance & Code

**Problèmes identifiés**

Les images tombent en fallback sur picsum.photos (service externe non contrôlé). Le composant `PlanImage` re-render inutilement. Aucune gestion d'erreur visible côté UI.

**Actions**

* Remplacer picsum par un placeholder **local SVG** généré dynamiquement (couleur de tone + initiales du titre) — zéro dépendance externe
* Ajouter `React.memo` sur `FeaturedCard`, `CatalogCard`, `GalleryCard` pour éviter les re-renders
* Extraire `useInfiniteScroll` dans `/hooks/useInfiniteScroll.js` (déjà fait dans le refactor, à valider)
* Ajouter un `ErrorBoundary` autour de chaque section pour éviter un crash total de la page
* Implémenter du **préchargement** (`<link rel="preload">`) pour les images hero

---

## 10. Accessibilité (a11y)

**Problèmes identifiés**

Pas de `skip to content`, contraste insuffisant sur certains badges, boutons sans `aria-label` explicite sur les icônes.

**Actions**

* Ajouter `<a href="#main-content" className="skip-link">Aller au contenu</a>` en début de page
* Vérifier les ratios de contraste WCAG AA (minimum 4.5:1) sur tous les textes
* Ajouter `aria-label` sur tous les boutons icône
* S'assurer que le filtre catégories est navigable au clavier avec focus visible
* Ajouter `role="status"` + `aria-live="polite"` sur le compteur de résultats lors des filtres

---

## Priorités suggérées

| Priorité | Action                            | Impact        | Effort  |
| --------- | --------------------------------- | ------------- | ------- |
| 🔴 P0     | Header complet + nav              | Très élevé | Faible  |
| 🔴 P0     | Hero agrandi + CTA                | Très élevé | Faible  |
| 🔴 P0     | Séparer catalogue / vedettes     | Élevé       | Faible  |
| 🟠 P1     | Filtres pills + tri + compteur    | Élevé       | Moyen   |
| 🟠 P1     | Cartes enrichies + aperçu rapide | Élevé       | Moyen   |
| 🟠 P1     | Placeholder SVG local             | Moyen         | Faible  |
| 🟡 P2     | Système de favoris               | Moyen         | Élevé |
| 🟡 P2     | Footer complet + RGPD             | Moyen         | Faible  |
| 🟡 P2     | Skeleton loaders                  | Moyen         | Moyen   |
| 🟢 P3     | Lightbox galerie                  | Faible        | Élevé |
| 🟢 P3     | Accessibilité complète          | Moyen         | Moyen   |
