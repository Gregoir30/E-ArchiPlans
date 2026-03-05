# E-ArchiPlans Documentation

## 1. Project overview

E-ArchiPlans is a single-page React/Vite frontend paired with a Laravel backend API. The experience showcases architectural plans (landing, catalog, gallery, plan detail) while allowing authenticated users to manage plans, orders, favorites, and downloads. The architecture favors custom hooks, memoized components, and a clean header/landing experience with a focus on personalization (search, filters, favorites, notifications).

## 2. Frontend structure (`frontend/`)

- **Entry points**: `src/main.jsx` bootstraps the React tree; `src/App.jsx` is the shell handling navigation, authentication state, global plans fetch (`usePlans`), and shared UI (header/footer).
- **Pages**:
  - `LandingPage.jsx`: Hero/trust strip/filter bar/favorites/featured/catalog/gallery/contact sections. Uses `useFavorites`, memoized cards, skeleton loaders, shared `PlanImage`. Filters keep catalog pagination in sync (`priceCap`, `surfaceMin`, `sortMode`), and gallery/infinite scroll.
  - `PlansPage.jsx`: Dedicated catalog with sticky filters, pagination, improved hooks handling to avoid `setState` in effects.
  - Plus admin/seller/model pages for backend operations.
- **Components**: `Header.jsx` now includes consistent navigation (brand, search, nav pills, auth actions, cart badge). `Footer.jsx`, smaller UI controls under `components/ui/`.
- **Styles**: Global tokens in `styles/layout.css`, landing-specific animations in `styles/landing.css`, forms in `styles/forms.css`, plus UI utilities. Layout uses CSS grid to keep header on a single row and uses radial gradients for the background.
- **Hooks**: `usePlans` fetches plans from `/api/plans`; `useFavorites` persists favorites to `localStorage`.
- **Assets**: Minimal (logo, fonts). Placeholder images are local SVG data URIs.
- **API clients**: `src/api/plans.js` (fetch/create/update/delete), `orders.js` (create/fetch/cancel/simulate), `catalog`, `http`, etc.
- **Runtime behavior**: Header listens to popstate/auth, landing performs fetch on mount. Favorites and filters are memoized/controlled to prevent cascading effects.

## 3. Backend structure (`backend/`)

- **Core**: Laravel 11 API with default user, order, plan models. `AppServiceProvider` sets string length for MySQL compatibility.
- **Routes** (`routes/api.php`): public registration/login, landing data (`/landing`), plan cover fetch, plan index/show; authenticated routes for profile, orders, downloads; admin/seller protected routes for management.
- **Controllers**:
  - `LandingController`: returns hero, featured, gallery plans plus stats/filters.
  - `PlanController`/`OrderController`: handle CRUD, order creation, simulation, cancellation, and download signing.
  - Model-view controllers expose `users`, `categories`, `orders`, etc. for internal dashboards.
- **Resources/Models**: `PlanResource` packages cover URLs, backend models use relationships (seller/category/order items).
- **Database**: migrations include `users`, `password_reset_tokens`, `sessions`; `Plan` model includes scopes for approval/search.
- **Services**: `AuditLogService` used by orders for event logging.

## 4. Data flow / UX improvements

- **Favorites**: Stored in `localStorage`, surfaced with `FavoriteSummary` strip on landing, reused across featured/catalog/gallery cards.
- **Header**: Sticky grid layout with brand/search/nav/actions ensures single-line presentation; dynamic auth actions include login/register or profile/logout. Cart badge now reflects dynamic `cartCount` (hook placeholder).
- **Gallery/catalog**: cards have fallback images, spec badges, hover actions, skeleton loaders; filter bar includes pills, sliders, and results counter with `aria-live`.
- **Animations**: Hero/sections use `@keyframes` for fade+slide, pop scaling, shimmer for skeletons.
- **Accessibility**: Skip link, aria attributes, button labels.

## 5. Running locally

1. **Backend**:
   - Copy `.env.example` → `.env`, configure DB credentials (MySQL `E-ArchiPlans`). `Schema::defaultStringLength(191)` ensures compatibility with older MySQL indexes.
   - Run `composer install`.
   - `php artisan migrate` (the DB will be created automatically if missing).
   - Optional seeding or `php artisan serve`.
2. **Frontend**:
   - `npm install` inside `frontend/`.
   - `npm run dev` or `npm run build`.

## 6. Available APIs

- `POST /api/register`, `/api/login`, `/api/logout`.
- `GET /api/plans`, `/api/plans/{id}` (with `PlanResource` payload). `cover-image` endpoint streams plan covers.
- `GET /api/landing`: hero plan, featured plans, gallery plans, stats, price range, category filters.
- Authenticated routes protect `/api/orders`, `/api/my-orders`, `/api/downloads/{token}`.
- Admin/seller groups add management endpoints (`/admin/categories`, `/admin/users`, etc.).

## 7. Outstanding tasks

- Improve backend orders/cart pipeline to expose item counts for header cart badge (server already tracks `OrderItem`s per order).
- Harden favorites persistence for logged-in users and optionally sync to backend.
- Flesh out gallery lightbox/preview (currently simulated).
- Add more UX details per the TODO plan: sticky filter improvements, hero CTA, section separators, and full footer.

## 8. Notes

- Frontend relies on `window.history` for SPA navigation; no router.
- `usePlans` refreshes via `useEffect` once; manual refresh can be triggered via `refreshPlans`.
- Backend uses `AuditLogService` for analytics/logging.
- Plan images default to inline SVG placeholder to avoid external dependencies.
