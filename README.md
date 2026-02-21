# E-ArchiPlans

Monorepo de la plateforme E-ArchiPlans.

## Structure
- `frontend/` : application React (Vite)
- `backend/` : API Laravel
- `docs/` : architecture et schema de base de donnees
- `TODO/` : backlog produit/technique

## Prerequis
- Node.js 22+
- npm 11+
- PHP 8.4+
- Composer 2+
- Docker (optionnel pour MySQL local)

## Demarrage rapide
1. Frontend
```bash
cd frontend
npm install
npm run dev
```

2. Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

3. MySQL via Docker (optionnel)
```bash
docker compose up -d mysql
```

## CI
Le workflow `.github/workflows/ci.yml` execute:
- Frontend: lint + build + tests
- Backend: tests Laravel
