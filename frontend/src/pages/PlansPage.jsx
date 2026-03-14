import { useCallback, useMemo, useState } from 'react'
import { formatPrice } from '../utils/format'

const PLAN_STATUS_LABELS = {
  draft: 'Brouillon',
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
}

const PLAN_STATUS_COLORS = {
  draft: { bg: '#f0ede8', color: '#7a6a5a' },
  pending: { bg: '#fff4e0', color: '#b07a10' },
  approved: { bg: '#e6f4ec', color: '#2d7a4f' },
  rejected: { bg: '#fdecea', color: '#c0392b' },
}

const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'title_asc', label: 'Titre A–Z' },
  { value: 'popular', label: 'Popularité' },
]

const PAGE_SIZE = 9

function parseDate(v) {
  if (!v) return 0
  const t = new Date(v).getTime()
  return Number.isNaN(t) ? 0 : t
}

function popularityScore(plan) {
  return Number(plan.orders_count ?? plan.download_count ?? plan.popularity ?? 0)
}

function sortPlans(list, sortBy) {
  return [...list].sort((a, b) => {
    if (sortBy === 'price_asc') return (a.price_cents ?? 0) - (b.price_cents ?? 0)
    if (sortBy === 'price_desc') return (b.price_cents ?? 0) - (a.price_cents ?? 0)
    if (sortBy === 'title_asc') return String(a.title ?? '').localeCompare(String(b.title ?? ''))
    if (sortBy === 'popular') {
      const d = popularityScore(b) - popularityScore(a)
      return d !== 0 ? d : (b.id ?? 0) - (a.id ?? 0)
    }
    const d = parseDate(b.created_at) - parseDate(a.created_at)
    return d !== 0 ? d : (b.id ?? 0) - (a.id ?? 0)
  })
}

// ── Placeholder image when no thumbnail ──
function PlanThumbnail({ plan }) {
  const initials = (plan.title ?? '?').slice(0, 2).toUpperCase()
  return (
    <div className="plan-thumb">
      <div className="plan-thumb-placeholder">{initials}</div>
    </div>
  )
}

export default function PlansPage({
  plans = [],
  plansStatus = 'success',
  plansError,
  categories = [],
  selectedCategoryId,
  onCategoryChange,
  onBuyPlan,
  onViewPlan,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [page, setPage] = useState(1)

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }, [])

  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value)
    setPage(1)
  }, [])

  const handleCategoryChange = useCallback((e) => {
    onCategoryChange(e.target.value)
    setPage(1)
  }, [onCategoryChange])

  const filteredPlans = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    const base = plans.filter((plan) => {
      const inCat = selectedCategoryId ? String(plan.category_id) === String(selectedCategoryId) : true
      if (!inCat) return false
      if (!query) return true
      return [plan.title, plan.description, plan.category?.name]
        .filter(Boolean).join(' ').toLowerCase().includes(query)
    })
    return sortPlans(base, sortBy)
  }, [plans, searchTerm, selectedCategoryId, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / PAGE_SIZE))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const paginatedPlans = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredPlans.slice(start, start + PAGE_SIZE)
  }, [filteredPlans, safePage])

  const hasFilters = Boolean(selectedCategoryId) || searchTerm.trim().length > 0

  function clearFilters() {
    setSearchTerm('')
    onCategoryChange('')
    setPage(1)
  }

  const categoryOptions = [
    { value: '', label: 'Toutes les catégories' },
    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
  ]

  // Build page numbers with ellipsis
  function getPageNumbers() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = new Set([1, totalPages, safePage, safePage - 1, safePage + 1])
    return [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Playfair+Display:wght@500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --sand: #f5efe6;
          --sand-mid: #ede4d6;
          --sand-dark: #e0d4c2;
          --ink: #1a1614;
          --ink-soft: #4a3f38;
          --ink-muted: #9a8f87;
          --accent: #c97d4e;
          --accent-light: #f0dcc8;
          --accent-dark: #a8623a;
          --white: #ffffff;
          --border: rgba(26,22,20,0.09);
          --border-strong: rgba(26,22,20,0.16);
          --shadow-sm: 0 1px 3px rgba(26,22,20,0.05), 0 4px 12px rgba(26,22,20,0.05);
          --shadow-card: 0 2px 8px rgba(26,22,20,0.06), 0 16px 40px rgba(26,22,20,0.07);
          --shadow-hover: 0 4px 16px rgba(26,22,20,0.10), 0 24px 56px rgba(26,22,20,0.12);
          --radius: 16px;
          --radius-sm: 10px;
          --radius-pill: 999px;
          --transition: 200ms cubic-bezier(.4,0,.2,1);
          --font-display: 'Playfair Display', Georgia, serif;
          --font-body: 'DM Sans', system-ui, sans-serif;
        }

        body { background: var(--sand); font-family: var(--font-body); color: var(--ink); }

        /* ── PAGE LAYOUT ── */
        .plans-page { min-height: 100vh; }

        /* ── HERO ── */
        .plans-hero {
          background: linear-gradient(135deg, #1a1614 0%, #2e231e 50%, #3d2e26 100%);
          padding: 72px 40px 64px;
          position: relative;
          overflow: hidden;
        }
        .plans-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 80% at 80% 50%, rgba(201,125,78,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 20% 80%, rgba(201,125,78,0.10) 0%, transparent 70%);
          pointer-events: none;
        }
        .plans-hero::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
        }
        .plans-hero-inner {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .plans-hero .eyebrow {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--accent);
        }
        .plans-hero h1 {
          font-family: var(--font-display);
          font-size: clamp(2rem, 4vw, 3.25rem);
          font-weight: 500;
          color: var(--white);
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        .plans-hero h1 em { font-style: italic; color: var(--accent); }
        .plans-hero .hero-sub {
          font-size: 1rem;
          font-weight: 300;
          color: rgba(255,255,255,0.6);
          max-width: 480px;
          line-height: 1.6;
          margin-top: 4px;
        }
        .hero-stats {
          display: flex;
          gap: 32px;
          margin-top: 24px;
        }
        .hero-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .hero-stat strong {
          font-family: var(--font-display);
          font-size: 1.75rem;
          color: var(--white);
          line-height: 1;
        }
        .hero-stat span {
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          font-weight: 500;
        }

        /* ── FILTERS BAR ── */
        .plans-filters-bar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(245,239,230,0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          padding: 16px 40px;
        }
        .plans-filters-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .filter-count {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--ink-muted);
          white-space: nowrap;
          margin-right: 4px;
        }
        .filter-count strong { color: var(--ink); }

        .search-field {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-pill);
          padding: 0 14px;
          height: 42px;
          flex: 1;
          min-width: 200px;
          max-width: 360px;
          transition: border-color var(--transition), box-shadow var(--transition);
        }
        .search-field:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-light);
        }
        .search-field i { color: var(--ink-muted); font-size: 0.85rem; flex-shrink: 0; }
        .search-field input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-family: var(--font-body);
          font-size: 0.875rem;
          color: var(--ink);
          min-width: 0;
        }
        .search-field input::placeholder { color: #b0a49a; }

        .filter-select {
          height: 42px;
          padding: 0 36px 0 14px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-pill);
          background: var(--white) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%234a3f38'/%3E%3C/svg%3E") no-repeat right 14px center;
          appearance: none;
          font-family: var(--font-body);
          font-size: 0.825rem;
          color: var(--ink);
          cursor: pointer;
          transition: border-color var(--transition);
          flex-shrink: 0;
        }
        .filter-select:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-light);
        }
        .filter-select:hover { border-color: var(--border-strong); }

        .clear-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 42px;
          padding: 0 14px;
          border-radius: var(--radius-pill);
          border: 1.5px dashed var(--border-strong);
          background: transparent;
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--ink-soft);
          cursor: pointer;
          transition: all var(--transition);
          white-space: nowrap;
        }
        .clear-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--accent-light);
        }

        /* ── MAIN CONTENT ── */
        .plans-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 40px 80px;
        }

        /* ── GRID ── */
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          margin-top: 8px;
        }

        /* ── PLAN CARD ── */
        .plan-card {
          background: var(--white);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-card);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform var(--transition), box-shadow var(--transition);
          animation: fadeUp 0.35s ease both;
        }
        .plan-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-hover);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .plan-thumb {
          height: 160px;
          background: linear-gradient(135deg, var(--sand-mid), var(--sand-dark));
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          flex-shrink: 0;
        }
        .plan-thumb::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(26,22,20,0.06));
        }
        .plan-thumb-placeholder {
          font-family: var(--font-display);
          font-size: 3rem;
          font-weight: 600;
          color: var(--sand-dark);
          letter-spacing: -0.03em;
          filter: blur(0.5px);
        }
        .plan-thumb img {
          width: 100%; height: 100%;
          object-fit: cover;
        }

        .plan-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 20px;
        }

        .plan-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .plan-category {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 9px;
          border-radius: var(--radius-pill);
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        .plan-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 500;
          color: var(--ink);
          line-height: 1.3;
          letter-spacing: -0.01em;
          margin-bottom: 8px;
        }
        .plan-description {
          font-size: 0.825rem;
          font-weight: 300;
          color: var(--ink-soft);
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 16px;
          flex: 1;
        }

        .plan-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid var(--border);
          gap: 8px;
          margin-top: auto;
        }
        .plan-price {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 500;
          color: var(--ink);
          letter-spacing: -0.02em;
        }
        .plan-actions {
          display: flex;
          gap: 8px;
        }
        .btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px; height: 36px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border);
          background: transparent;
          color: var(--ink-soft);
          cursor: pointer;
          transition: all var(--transition);
        }
        .btn-icon:hover { border-color: var(--ink); color: var(--ink); background: var(--sand); }
        .btn-buy {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 36px;
          padding: 0 16px;
          border-radius: var(--radius-sm);
          border: none;
          background: var(--ink);
          color: var(--white);
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
        }
        .btn-buy:hover { background: var(--accent); }

        /* ── EMPTY STATE ── */
        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          gap: 16px;
          text-align: center;
        }
        .empty-icon {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: var(--sand-mid);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.75rem;
          color: var(--ink-muted);
        }
        .empty-state h3 {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 500;
          color: var(--ink);
        }
        .empty-state p { font-size: 0.875rem; color: var(--ink-muted); max-width: 340px; }
        .empty-action {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          padding: 0 20px;
          border-radius: var(--radius-pill);
          border: none;
          background: var(--ink);
          color: var(--white);
          font-family: var(--font-body);
          font-size: 0.825rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
          margin-top: 4px;
        }
        .empty-action:hover { background: var(--accent); }

        /* ── STATUS / LOADING ── */
        .status-message {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 24px;
          color: var(--ink-muted);
          font-size: 0.875rem;
        }
        .loading-dots {
          display: inline-flex;
          gap: 6px;
          margin-left: 8px;
        }
        .loading-dots span {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
          animation: bounce 1.2s ease infinite;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%,80%,100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* ── PAGINATION ── */
        .pagination-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 48px;
          flex-wrap: wrap;
        }
        .page-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 40px;
          padding: 0 16px;
          border-radius: var(--radius-pill);
          border: 1.5px solid var(--border);
          background: var(--white);
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--ink);
          cursor: pointer;
          transition: all var(--transition);
        }
        .page-btn:hover:not(:disabled) { border-color: var(--ink); background: var(--sand-mid); }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .page-numbers { display: flex; gap: 4px; }
        .page-pill {
          width: 40px; height: 40px;
          border-radius: var(--radius-pill);
          border: 1.5px solid var(--border);
          background: var(--white);
          font-family: var(--font-body);
          font-size: 0.825rem;
          font-weight: 500;
          color: var(--ink-soft);
          cursor: pointer;
          transition: all var(--transition);
          display: flex; align-items: center; justify-content: center;
        }
        .page-pill:hover { border-color: var(--ink); color: var(--ink); }
        .page-pill.is-active {
          background: var(--ink);
          border-color: var(--ink);
          color: var(--white);
          font-weight: 600;
        }
        .page-ellipsis {
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          color: var(--ink-muted);
          font-size: 0.8rem;
          user-select: none;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .plans-hero { padding: 48px 20px 40px; }
          .hero-stats { gap: 20px; }
          .hero-stat strong { font-size: 1.35rem; }
          .plans-filters-bar { padding: 12px 20px; }
          .plans-content { padding: 24px 20px 60px; }
          .plans-grid { grid-template-columns: 1fr; gap: 16px; }
          .plans-filters-inner { gap: 8px; }
          .search-field { max-width: 100%; }
        }
      `}</style>

      <main className="plans-page">
        {/* ── HERO ── */}
        <section className="plans-hero" aria-label="En-tête catalogue">
          <div className="plans-hero-inner">
            <p className="eyebrow">Catalogue</p>
            <h1>Tous les <em>plans</em></h1>
            <p className="hero-sub">
              Filtrez par catégorie, recherchez un style et passez commande directement en ligne.
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>{(plans ?? []).length}</strong>
                <span>Plans disponibles</span>
              </div>
              <div className="hero-stat">
                <strong>{(categories ?? []).length}</strong>
                <span>Catégories</span>
              </div>
              <div className="hero-stat">
                <strong>24h</strong>
                <span>Livraison</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FILTERS BAR ── */}
        <div className="plans-filters-bar" role="search" aria-label="Filtres et tri">
          <div className="plans-filters-inner">
            {plansStatus === 'success' && (
              <span className="filter-count">
                <strong>{filteredPlans.length}</strong> résultat{filteredPlans.length !== 1 ? 's' : ''}
              </span>
            )}

            <div className="search-field">
              <i className="bi bi-search" aria-hidden="true" />
              <input
                id="plans-search"
                type="search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Villa, duplex, 100m²..."
                aria-label="Rechercher un plan"
              />
            </div>

            <select
              id="plans-category"
              className="filter-select"
              value={selectedCategoryId ?? ''}
              onChange={handleCategoryChange}
              aria-label="Filtrer par catégorie"
            >
              {[{ value: '', label: 'Toutes les catégories' },
                ...categories.map((c) => ({ value: String(c.id), label: c.name }))
              ].map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              id="plans-sort"
              className="filter-select"
              value={sortBy}
              onChange={handleSortChange}
              aria-label="Trier par"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {hasFilters && (
              <button type="button" className="clear-btn" onClick={clearFilters}>
                <i className="bi bi-x" aria-hidden="true" />
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="plans-content">
          <div className="plans-grid" aria-label="Liste des plans">

            {plansStatus === 'loading' && (
              <div className="status-message">
                Chargement des plans
                <span className="loading-dots" aria-hidden="true">
                  <span /><span /><span />
                </span>
              </div>
            )}

            {plansStatus === 'error' && (
              <div className="status-message" role="alert" style={{ color: '#c0392b' }}>
                <i className="bi bi-exclamation-circle" /> {plansError ?? 'Une erreur est survenue.'}
              </div>
            )}

            {plansStatus === 'success' && filteredPlans.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="bi bi-search" aria-hidden="true" />
                </div>
                <h3>Aucun plan trouvé</h3>
                <p>Aucun résultat ne correspond à vos filtres. Essayez d'élargir votre recherche.</p>
                {hasFilters && (
                  <button type="button" className="empty-action" onClick={clearFilters}>
                    <i className="bi bi-arrow-counterclockwise" aria-hidden="true" />
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}

            {plansStatus === 'success' && paginatedPlans.map((plan, index) => {
              const status = PLAN_STATUS_COLORS[plan.status] ?? { bg: '#f0ede8', color: '#7a6a5a' }
              return (
                <article
                  key={plan.id}
                  className="plan-card"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <PlanThumbnail plan={plan} />

                  <div className="plan-body">
                    <div className="plan-meta">
                      <span className="plan-category">
                        {plan.category?.name ?? 'Sans catégorie'}
                      </span>
                      {plan.status && (
                        <span
                          className="status-badge"
                          style={{ background: status.bg, color: status.color }}
                        >
                          {PLAN_STATUS_LABELS[plan.status] ?? plan.status}
                        </span>
                      )}
                    </div>

                    <h3 className="plan-title">{plan.title}</h3>

                    {plan.description && (
                      <p className="plan-description">{plan.description}</p>
                    )}

                    <div className="plan-footer">
                      <span className="plan-price">
                        {formatPrice(plan.price_cents, plan.currency)}
                      </span>
                      <div className="plan-actions">
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => onViewPlan(plan.id)}
                          aria-label={`Voir le détail de ${plan.title}`}
                          title="Voir le détail"
                        >
                          <i className="bi bi-eye" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="btn-buy"
                          onClick={() => onBuyPlan(plan.id)}
                          aria-label={`Commander ${plan.title}`}
                        >
                          <i className="bi bi-bag-plus" aria-hidden="true" />
                          Commander
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {/* ── PAGINATION ── */}
          {plansStatus === 'success' && totalPages > 1 && (
            <nav className="pagination-bar" aria-label="Pagination des plans">
              <button
                type="button"
                className="page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label="Page précédente"
              >
                <i className="bi bi-chevron-left" aria-hidden="true" />
                Précédent
              </button>

              <div className="page-numbers">
                {getPageNumbers().map((n, i, arr) => {
                  const prev = arr[i - 1]
                  const showEllipsis = prev && n - prev > 1
                  return (
                    <>
                      {showEllipsis && <span key={`ellipsis-${n}`} className="page-ellipsis">…</span>}
                      <button
                        key={n}
                        type="button"
                        className={`page-pill ${n === safePage ? 'is-active' : ''}`}
                        onClick={() => setPage(n)}
                        aria-label={`Page ${n}`}
                        aria-current={n === safePage ? 'page' : undefined}
                      >
                        {n}
                      </button>
                    </>
                  )
                })}
              </div>

              <button
                type="button"
                className="page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                aria-label="Page suivante"
              >
                Suivant
                <i className="bi bi-chevron-right" aria-hidden="true" />
              </button>
            </nav>
          )}
        </div>
      </main>
    </>
  )
}
