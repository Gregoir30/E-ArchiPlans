import { useEffect, useMemo, useState } from 'react'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import InputField from '../components/ui/InputField'
import StatusBadge from '../components/ui/StatusBadge'
import { formatPrice } from '../utils/format'

const PLAN_STATUS_LABELS = {
  draft: 'Brouillon',
  pending: 'En attente',
  approved: 'Approuve',
  rejected: 'Rejete',
}

const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus recents' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix decroissant' },
  { value: 'title_asc', label: 'Titre A-Z' },
  { value: 'popular', label: 'Popularite' },
]

const PAGE_SIZE = 9

function parseDate(value) {
  if (!value) return 0
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function popularityScore(plan) {
  return Number(plan.orders_count ?? plan.download_count ?? plan.popularity ?? 0)
}

function sortPlans(list, sortBy) {
  const copied = [...list]

  copied.sort((a, b) => {
    if (sortBy === 'price_asc') return (a.price_cents ?? 0) - (b.price_cents ?? 0)
    if (sortBy === 'price_desc') return (b.price_cents ?? 0) - (a.price_cents ?? 0)
    if (sortBy === 'title_asc') return String(a.title ?? '').localeCompare(String(b.title ?? ''))
    if (sortBy === 'popular') {
      const byPopularity = popularityScore(b) - popularityScore(a)
      if (byPopularity !== 0) return byPopularity
      return (b.id ?? 0) - (a.id ?? 0)
    }

    const byCreatedAt = parseDate(b.created_at) - parseDate(a.created_at)
    if (byCreatedAt !== 0) return byCreatedAt
    return (b.id ?? 0) - (a.id ?? 0)
  })

  return copied
}

export default function PlansPage({
  plans,
  plansStatus,
  plansError,
  categories,
  selectedCategoryId,
  onCategoryChange,
  onBuyPlan,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [page, setPage] = useState(1)

  const filteredPlans = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    const base = (plans ?? []).filter((plan) => {
      const inCategory = selectedCategoryId
        ? String(plan.category_id) === String(selectedCategoryId)
        : true

      if (!inCategory) return false
      if (!query) return true

      const text = [plan.title, plan.description, plan.category?.name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return text.includes(query)
    })

    return sortPlans(base, sortBy)
  }, [plans, searchTerm, selectedCategoryId, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / PAGE_SIZE))

  const paginatedPlans = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredPlans.slice(start, start + PAGE_SIZE)
  }, [filteredPlans, page])

  useEffect(() => {
    setPage(1)
  }, [searchTerm, selectedCategoryId, sortBy])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const hasFilters = Boolean(selectedCategoryId) || searchTerm.trim().length > 0

  function clearFilters() {
    setSearchTerm('')
    onCategoryChange('')
  }

  const categoryOptions = [
    { value: '', label: 'Toutes' },
    ...categories.map((category) => ({
      value: String(category.id),
      label: category.name,
    })),
  ]

  return (
    <main className="page">
      <section className="section-intro">
        <p className="eyebrow">Catalogue</p>
        <h1>Tous les plans</h1>
        <p>Filtrez par categorie, recherchez un plan et passez commande.</p>
      </section>

      <section className="plans-section" aria-label="Liste des plans">
        <div className="plans-header">
          <h2>Plans disponibles</h2>
        </div>

        <div className="plans-filters plans-filters-sticky">
          <InputField
            id="plans-search"
            label="Recherche"
            className="filter-label"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Titre, description, categorie..."
          />

          <InputField
            id="plans-category-filter"
            label="Categorie"
            as="select"
            className="filter-label"
            value={selectedCategoryId}
            onChange={(event) => onCategoryChange(event.target.value)}
            options={categoryOptions}
          />

          <InputField
            id="plans-sort"
            label="Tri"
            as="select"
            className="filter-label"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            options={SORT_OPTIONS}
          />
        </div>

        {hasFilters ? (
          <div className="card-actions">
            <Button type="button" variant="secondary" icon="bi bi-funnel" onClick={clearFilters}>
              Effacer les filtres
            </Button>
          </div>
        ) : null}

        {plansStatus === 'loading' ? <p>Chargement des plans...</p> : null}
        {plansStatus === 'error' ? <p className="error">{plansError}</p> : null}

        {plansStatus === 'success' && filteredPlans.length === 0 ? (
          <EmptyState
            title="Aucun plan ne correspond a vos filtres actuels."
            actionLabel={hasFilters ? 'Reinitialiser' : undefined}
            onAction={hasFilters ? clearFilters : undefined}
            actionIcon={hasFilters ? 'bi bi-arrow-counterclockwise' : undefined}
          />
        ) : null}

        {plansStatus === 'success' && filteredPlans.length > 0 ? (
          <>
            <p>
              {filteredPlans.length} plan(s) trouves - page {page}/{totalPages}
            </p>

            <div className="plans-grid">
              {paginatedPlans.map((plan) => (
                <article key={plan.id} className="plan-card">
                  <StatusBadge value={plan.status} labelMap={PLAN_STATUS_LABELS} />
                  <h3>{plan.title}</h3>
                  <p>{plan.category?.name ?? 'Sans categorie'}</p>
                  {plan.description ? <p className="plan-description">{plan.description}</p> : null}
                  <p className="plan-price">{formatPrice(plan.price_cents, plan.currency)}</p>
                  <Button type="button" variant="secondary" icon="bi bi-bag-plus" onClick={() => onBuyPlan(plan.id)}>
                    Commander ce plan
                  </Button>
                </article>
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="pagination-bar" aria-label="Pagination des plans">
                <Button
                  type="button"
                  variant="secondary"
                  icon="bi bi-chevron-left"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  Precedent
                </Button>

                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      className={`page-pill ${pageNumber === page ? 'is-active' : ''}`}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  icon="bi bi-chevron-right"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                >
                  Suivant
                </Button>
              </div>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  )
}
