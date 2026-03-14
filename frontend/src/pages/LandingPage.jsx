import { Component, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import EmptyState from '../components/ui/EmptyState'
import StatusBadge from '../components/ui/StatusBadge'
import { formatPrice } from '../utils/format'
import useFavorites from '../hooks/useFavorites'
import useLandingData from '../hooks/useLandingData'
import PlanCover, { getPlanCoverUrl } from '../components/PlanCover'

const PLAN_STATUS_LABELS = {
  draft: 'Brouillon',
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
}

const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récent' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'popular', label: 'Plus populaire' },
]

const GALLERY_BATCH_SIZE = 6
const INITIAL_GALLERY_COUNT = 8
const MAX_FEATURED = 2
const CATALOG_PAGE_SIZE = 9

function toneClass(index, mod = 4) {
  return `tone-${(index % mod) + 1}`
}

function getPlanSpecs(plan) {
  const hasSpecs =
    plan &&
    (Number.isFinite(Number(plan.surface)) ||
      Number.isFinite(Number(plan.rooms)) ||
      Number.isFinite(Number(plan.levels)))

  if (hasSpecs) {
    return {
      surface: Number(plan.surface) || 0,
      rooms: Number(plan.rooms) || 0,
      levels: Number(plan.levels) || 0,
    }
  }

  const seed = Number(plan?.id ?? 1)
  return {
    surface: 60 + (seed % 6) * 15,
    rooms: 2 + (seed % 4),
    levels: 1 + (seed % 3),
  }
}

function formatStatValue(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('fr-FR').format(Number(value))
}

function buildLandingMetrics({ stats, plansCount, categoriesCount }) {
  const planValue = stats?.total_plans ?? plansCount
  const categoryValue = stats?.total_categories ?? categoriesCount
  const sellerValue = stats?.total_sellers ?? 0

  return [
    { icon: 'bi bi-building', value: formatStatValue(planValue), label: 'Plans disponibles' },
    { icon: 'bi bi-list', value: formatStatValue(categoryValue), label: 'Catégories actives' },
    { icon: 'bi bi-person-badge', value: formatStatValue(sellerValue), label: 'Architectes partenaires' },
  ]
}

const FeaturedCard = memo(function FeaturedCard({
  plan,
  index,
  onBuyPlan,
  onViewPlan,
  isFavorite,
  onToggleFavorite,
}) {
  const specs = useMemo(() => getPlanSpecs(plan), [plan])
  const badge = index === 0 ? 'Nouveau' : index === 1 ? 'Populaire' : null

  return (
    <article className="showcase-featured-card">
      <PlanCover
        plan={plan}
        className="showcase-card-image"
        toneClass={toneClass(index)}
        alt={`Couverture du plan ${plan.title}`}
      />
      <button
        type="button"
        className={`card-favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        onClick={(event) => {
          event.stopPropagation()
          onToggleFavorite(plan.id)
        }}
      >
        <i className="bi bi-heart-fill" />
      </button>
      {badge ? <span className="badge-pill">{badge}</span> : null}
      <div className="card-overlay-actions">
        <button type="button" className="btn-quick-view" onClick={() => onViewPlan(plan.id)}>
          Aperçu rapide
        </button>
      </div>
      <div className="showcase-card-body">
        <StatusBadge value={plan.status} labelMap={PLAN_STATUS_LABELS} />
        <div className="card-header">
          <h3>{plan.title}</h3>
          <span className="plan-price">{formatPrice(plan.price_cents, plan.currency)}</span>
        </div>
        <p>{plan.description ?? 'Plan architecture modulable avec livrables techniques prêts à imprimer.'}</p>
        <div className="plan-specs">
          <span>
            <i className="bi bi-aspect-ratio" />
            {specs.surface} m²
          </span>
          <span>
            <i className="bi bi-grid-1x2" />
            {specs.rooms} pièces
          </span>
          <span>
            <i className="bi bi-building" />
            {specs.levels} niveaux
          </span>
        </div>
        <div className="card-footer">
          <button type="button" className="secondary-btn" onClick={() => onBuyPlan(plan.id)}>
            Commander
          </button>
          <button type="button" className="btn-details" onClick={() => onViewPlan(plan.id)}>
            Voir le détail
          </button>
        </div>
      </div>
    </article>
  )
})

const CatalogCard = memo(function CatalogCard({
  plan,
  index,
  onBuyPlan,
  onViewPlan,
  isFavorite,
  onToggleFavorite,
}) {
  const specs = useMemo(() => getPlanSpecs(plan), [plan])

  return (
    <article className="plan-card">
      <PlanCover
        plan={plan}
        className="showcase-catalog-thumb"
        toneClass={toneClass(index, 6)}
        alt={`Miniature du plan ${plan.title}`}
      />
      <StatusBadge value={plan.status} labelMap={PLAN_STATUS_LABELS} />
      <div className="card-header">
        <h3 className="clickable-title" onClick={() => onViewPlan(plan.id)}>
          {plan.title}
        </h3>
        <span className="plan-price">{formatPrice(plan.price_cents, plan.currency)}</span>
      </div>
      <button
        type="button"
        className={`card-favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        onClick={() => onToggleFavorite(plan.id)}
      >
        <i className="bi bi-heart" />
      </button>
      <p className="plan-category">{plan.category?.name ?? 'Sans catégorie'}</p>
      <div className="plan-specs">
        <span>
          <i className="bi bi-aspect-ratio" />
          {specs.surface} m²
        </span>
        <span>
          <i className="bi bi-grid-1x2" />
          {specs.rooms} pièces
        </span>
      </div>
      <div className="card-footer">
        <button type="button" className="secondary-btn" onClick={() => onBuyPlan(plan.id)}>
          Commander ce plan
        </button>
        <button type="button" className="btn-details" onClick={() => onViewPlan(plan.id)}>
          Voir le détail
        </button>
      </div>
    </article>
  )
})

const GalleryCard = memo(function GalleryCard({ plan, index, onNavigate, isFavorite, onToggleFavorite, onOpenLightbox }) {
  return (
    <article
      className="showcase-gallery-item"
      onClick={(event) => onNavigate(event, `/plans/${plan.id}`)}
      tabIndex={0}
    >
      <PlanCover
        plan={plan}
        className="showcase-gallery-thumb"
        toneClass={`${toneClass(index, 6)} gallery-size-${(index % 5) + 1}`}
        alt={`Projet ${plan.title}`}
      />
      <button
        type="button"
        className={`btn-favorite ${isFavorite ? 'is-favorite' : ''}`}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        onClick={(event) => {
          event.stopPropagation()
          onToggleFavorite(plan.id)
        }}
      >
        <i className="bi bi-heart-fill" />
      </button>
      <div className="gallery-item-overlay">
        <div className="gallery-item-meta">
          <strong>{plan.title}</strong>
          <span>{plan.category?.name ?? 'Habitat'}</span>
        </div>
        <div className="gallery-item-actions">
          <button type="button" className="btn" onClick={(event) => onNavigate(event, `/plans/${plan.id}`)}>
            Voir ce plan
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={(event) => {
              event.stopPropagation()
              onOpenLightbox(plan)
            }}
          >
            Aperçu
          </button>
        </div>
      </div>
    </article>
  )
})

function GalleryPlaceholders() {
  return (
    <>
      {Array.from({ length: INITIAL_GALLERY_COUNT }, (_, index) => (
        <div key={index} className="showcase-gallery-item is-skeleton">
          <div className="shimmer-wrapper" />
        </div>
      ))}
    </>
  )
}

function useInfiniteScroll({ totalItems, initialCount, batchSize }) {
  const [visibleCount, setVisibleCount] = useState(initialCount)
  const sentinelRef = useRef(null)
  const hasMore = visibleCount < totalItems

  const loadMore = useCallback(() => {
    setVisibleCount((value) => Math.min(value + batchSize, totalItems))
  }, [batchSize, totalItems])

  useEffect(() => {
    if (!hasMore || typeof IntersectionObserver === 'undefined') return undefined
    const sentinel = sentinelRef.current
    if (!sentinel) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '320px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  return { visibleCount, hasMore, loadMore, sentinelRef }
}

class SectionErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('Section failed to render', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error" role="alert">
          La section ne peut pas être affichée pour le moment.
        </div>
      )
    }

    return this.props.children
  }
}

const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80'

function HeroSection({ heroPlan, metrics = [], onNavigate }) {
  const bgImage = heroPlan ? getPlanCoverUrl(heroPlan) : DEFAULT_HERO_IMAGE
  return (
    <section
      className="showcase-hero"
      aria-label="Hero"
      style={bgImage ? { backgroundImage: `linear-gradient(180deg, rgba(12,12,12,0.85), rgba(12,12,12,0.45)), url('${bgImage}')` } : undefined}
    >
      <div className="showcase-hero-content">
        <p className="showcase-kicker">Nouvelle collection 2026</p>
        <h1>Architecture prête à l'emploi et validée par nos architectes</h1>
        <p className="hero-subtitle">
          Des plans livrés en 48h avec dossiers techniques, options BIM-ready et coaching sur mesure.
        </p>
        <div className="hero-actions">
          <button type="button" className="primary-btn" onClick={(event) => onNavigate(event, '/plans')}>
            Explorer les plans
          </button>
          <button type="button" className="secondary-btn" onClick={(event) => onNavigate(event, '/contact')}>
            Nous contacter
          </button>
        </div>
        <p className="hero-subhead">Plans prêts à livrer | Experts certifiés</p>
        <div className="hero-stats">
          {metrics.map((metric) => (
            <div key={metric.label} className="hero-stat">
              <i className={metric.icon} aria-hidden="true" />
              <div>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustStrip({ metrics = [] }) {
  if (metrics.length === 0) return null
  return (
    <section className="trust-strip" aria-label="Chiffres clés">
      {metrics.map((metric) => (
        <article key={metric.label}>
          <i className={metric.icon} aria-hidden="true" />
          <p className="trust-value">{metric.value}</p>
          <p>{metric.label}</p>
        </article>
      ))}
    </section>
  )
}

function FavoriteSummary({ count, hasFavorites, onView }) {
  const label = count === 1 ? 'plan enregistré' : 'plans enregistrés'
  return (
    <section className="favorite-summary" aria-label="Plans favoris">
      <div className="favorite-summary-content">
        <p className="eyebrow">Collection personnelle</p>
        <h3>
          <span>{count}</span> {label}
        </h3>
        <p>
          {hasFavorites
            ? 'Continuez vos comparaisons depuis vos plans suivis.'
            : "Enregistrez un plan pour le retrouver plus tard."}
        </p>
      </div>
      <button type="button" className="primary-btn" onClick={onView}>
        Voir les plans favoris
      </button>
    </section>
  )
}

function CatalogPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <div className="catalog-pagination">
      <button
        type="button"
        className="secondary-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Précédent
      </button>
      <div className="catalog-page-list" aria-label="Pagination du catalogue">
        {pageNumbers.map((page) => (
          <button
            key={page}
            type="button"
            className={`catalog-page-pill ${currentPage === page ? 'is-active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="secondary-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Suivant
      </button>
    </div>
  )
}

function FilterBar({
  categories,
  selectedCategoryId,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  sortMode,
  onSortChange,
  priceCap: priceCapValue,
  onPriceCapChange,
  priceBounds,
  surfaceMin: surfaceMinValue,
  onSurfaceMinChange,
  surfaceBounds,
  resultsCount,
}) {
  const pillCategories = useMemo(() => categories.slice(0, 6), [categories])
  const priceMin = Number.isFinite(priceBounds.min) ? priceBounds.min : 0
  const priceMax = Number.isFinite(priceBounds.max) && priceBounds.max > priceMin ? priceBounds.max : priceMin + 500
  const surfaceMax = Number.isFinite(surfaceBounds.max) && surfaceBounds.max > surfaceBounds.min ? surfaceBounds.max : surfaceBounds.min + 100

  return (
    <section className="showcase-filter-bar" aria-label="Filtres du catalogue">
      <div className="filter-pills" role="tablist">
        <button
          type="button"
          className={`pill ${selectedCategoryId === '' ? 'is-active' : ''}`}
          onClick={() => onCategoryChange('')}
          aria-pressed={selectedCategoryId === ''}
        >
          Tous
        </button>
        {pillCategories.map((category) => {
          const value = String(category.id)
          return (
            <button
              type="button"
              key={value}
              className={`pill ${selectedCategoryId === value ? 'is-active' : ''}`}
              onClick={() => onCategoryChange(value)}
              aria-pressed={selectedCategoryId === value}
            >
              {category.name}
            </button>
          )
        })}
      </div>
      <div className="filter-controls">
        <input
          type="search"
          placeholder="Rechercher un mot-clé"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Rechercher un plan"
        />
    <label className="filter-range">
      <span>Budget jusqu'à</span>
        <input
          type="range"
          min={priceMin}
          max={priceMax}
          value={priceCapValue}
          onChange={(event) => onPriceCapChange(Number(event.target.value))}
        />
        <strong>{formatPrice(Math.round(priceCapValue * 100), 'EUR')}</strong>
    </label>
    <label className="filter-range">
      <span>Surface min.</span>
        <input
          type="range"
          min={surfaceBounds.min}
          max={surfaceMax}
          value={surfaceMinValue}
          onChange={(event) => onSurfaceMinChange(Number(event.target.value))}
        />
        <strong>{surfaceMinValue} m²</strong>
        </label>
        <select value={sortMode} onChange={(event) => onSortChange(event.target.value)} aria-label="Trier">
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="results-count" role="status" aria-live="polite">
          {resultsCount} plans trouvés
        </p>
      </div>
    </section>
  )
}

function FeaturedSection({
  plansStatus,
  plansError,
  featuredPlans,
  onBuyPlan,
  onViewPlan,
  favoriteIds,
  onToggleFavorite,
}) {
  return (
    <section className="showcase-featured" aria-label="Plans en vedette">
      <div className="plans-header">
        <p className="eyebrow">En vedette</p>
        <h2>Plans recommandés</h2>
      </div>

      {plansStatus === 'loading' && <p>Chargement des plans...</p>}
      {plansStatus === 'error' && <p className="error">{plansError}</p>}
      {plansStatus === 'success' && featuredPlans.length === 0 && (
        <EmptyState title="Pas de plans vedettes pour le moment." />
      )}
      {plansStatus === 'success' && featuredPlans.length > 0 && (
        <div className="showcase-featured-grid">
          {featuredPlans.map((plan, index) => (
            <FeaturedCard
              key={plan.id}
              plan={plan}
              index={index}
              onBuyPlan={onBuyPlan}
              onViewPlan={onViewPlan}
              isFavorite={favoriteIds.has(plan.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function CatalogSection({
  plansStatus,
  plansError,
  plans,
  onBuyPlan,
  onViewPlan,
  currentPage,
  totalPages,
  onPageChange,
  favoriteIds,
  onToggleFavorite,
}) {
  return (
    <section className="showcase-catalog" aria-label="Catalogue">
      <div className="plans-header">
        <p className="eyebrow">Catalogue</p>
        <h2>Plans prêts à commander</h2>
      </div>

      {plansStatus === 'loading' && (
        <div className="plans-grid showcase-compact-grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="plan-card skeleton-card">
              <div className="skeleton-image" />
              <div className="shimmer-wrapper">
                <div className="skeleton-line" />
                <div className="skeleton-line" />
                <div className="skeleton-line short" />
              </div>
            </div>
          ))}
        </div>
      )}

      {plansStatus === 'error' && <p className="error">{plansError}</p>}

      {plansStatus === 'success' && plans.length === 0 && (
        <EmptyState title="Aucun plan ne correspond à ces filtres." />
      )}

      {plansStatus === 'success' && plans.length > 0 && (
        <>
          <div className="plans-grid showcase-compact-grid">
            {plans.map((plan, index) => (
              <CatalogCard
                key={plan.id}
                plan={plan}
                index={index}
                onBuyPlan={onBuyPlan}
                onViewPlan={onViewPlan}
                isFavorite={favoriteIds.has(plan.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
          <CatalogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </>
      )}
    </section>
  )
}

function GallerySection({ plansStatus, galleryPlans, favoriteIds, onToggleFavorite, onNavigate, onOpenLightbox }) {
  const { visibleCount, hasMore, loadMore, sentinelRef } = useInfiniteScroll({
    totalItems: galleryPlans.length,
    initialCount: INITIAL_GALLERY_COUNT,
    batchSize: GALLERY_BATCH_SIZE,
  })
  const visiblePlans = galleryPlans.slice(0, visibleCount)
  const showReal = plansStatus === 'success' && galleryPlans.length > 0

  return (
    <section className="showcase-gallery" aria-label="Galerie de projets">
      <div className="plans-header">
        <p className="eyebrow">Galerie</p>
        <h2>Inspiration de projets</h2>
      </div>

      <div className="showcase-gallery-grid">
        {showReal
          ? visiblePlans.map((plan, index) => (
              <GalleryCard
                key={plan.id}
                plan={plan}
                index={index}
                onNavigate={onNavigate}
                isFavorite={favoriteIds.has(plan.id)}
                onToggleFavorite={onToggleFavorite}
                onOpenLightbox={onOpenLightbox}
              />
            ))
          : <GalleryPlaceholders />}
      </div>

      {showReal && hasMore && (
        <div className="showcase-feed-loader" ref={sentinelRef} aria-live="polite">
          <button type="button" onClick={loadMore} className="secondary-btn">
            Voir plus de projets
          </button>
        </div>
      )}
    </section>
  )
}

function ContactSection({ onNavigate, newsletterEmail, onNewsletterChange, onNewsletterSubmit, newsletterStatus }) {
  const socialLinks = [
    { href: 'https://instagram.com', icon: 'bi bi-instagram', label: 'Instagram' },
    { href: 'https://pinterest.com', icon: 'bi bi-pinterest', label: 'Pinterest' },
    { href: 'https://linkedin.com', icon: 'bi bi-linkedin', label: 'LinkedIn' },
  ]

  return (
    <section className="showcase-contact" aria-label="Contact">
      <div className="contact-content">
        <p className="showcase-kicker">Vous avez un projet ?</p>
        <h2>Parlons architecture et livrables haut de gamme</h2>
        <p>
          Bénéficiez d'une équipe d'architectes certifiés, d'un accompagnement personnalisé et d'une
          livraison express des dossiers d'exécution.
        </p>
        <div className="hero-actions">
          <button type="button" className="primary-btn" onClick={(event) => onNavigate(event, '/contact')}>
            Nous contacter
          </button>
          <button type="button" className="secondary-btn" onClick={(event) => onNavigate(event, '/a-propos')}>
            En savoir plus
          </button>
        </div>
        <form className="newsletter-signup" onSubmit={onNewsletterSubmit}>
          <h3>Recevez nos plans en avant-première</h3>
          <div className="newsletter-fields">
            <input
              id="newsletter-email"
              type="email"
              placeholder="Votre email"
              value={newsletterEmail}
              onChange={(event) => onNewsletterChange(event.target.value)}
              required
            />
            <button type="submit" className="primary-btn">
              Recevoir les plans
            </button>
          </div>
          {newsletterStatus && <p className="success">{newsletterStatus}</p>}
        </form>
        <div className="social-links">
          {socialLinks.map((social) => (
            <a key={social.label} href={social.href} aria-label={social.label} target="_blank" rel="noreferrer">
              <i className={social.icon} />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function GalleryLightbox({ plan, onClose, onNavigate }) {
  if (!plan) return null
  return (
    <div className="lightbox-overlay" role="dialog" aria-modal="true">
      <div className="lightbox-content">
        <button type="button" className="lightbox-close" onClick={onClose} aria-label="Fermer">
          <i className="bi bi-x-lg" />
        </button>
        <img
          className="lightbox-image"
          src={getPlanCoverUrl(plan)}
          alt={`Aperçu complet du plan ${plan.title}`}
          loading="lazy"
        />
        <div className="lightbox-caption">
          <strong>{plan.title}</strong>
          <p>{plan.description}</p>
          <div className="hero-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={(event) => {
                onNavigate(event, `/plans/${plan.id}`)
                onClose()
              }}
            >
              Voir la fiche complète
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage({
  onNavigate,
  plans,
  plansStatus,
  plansError,
  categories,
  selectedCategoryId,
  onCategoryChange,
  onBuyPlan,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortMode, setSortMode] = useState('recent')
  const [priceCap, setPriceCap] = useState(0)
  const [surfaceMin, setSurfaceMin] = useState(0)
  const { favoriteIds, toggleFavorite, hasFavorites } = useFavorites()
  const [lightboxPlan, setLightboxPlan] = useState(null)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState('')
  const [catalogPage, setCatalogPage] = useState(1)
  const { landingData } = useLandingData()
  const {
    heroPlan: landingHeroPlan,
    featuredPlans: landingFeaturedList,
    galleryPlans: landingGalleryList,
    stats: landingStats,
    priceRange: landingPriceRange,
  } = landingData

  const priceBounds = useMemo(() => {
    if (plans.length === 0) return { min: 0, max: 0 }
    const values = plans.map((plan) => Number(plan.price_cents ?? 0))
    const min = Math.min(...values) / 100
    const max = Math.max(...values) / 100
    return { min, max }
  }, [plans])

  const surfaceBounds = useMemo(() => {
    if (plans.length === 0) return { min: 0, max: 0 }
    const values = plans.map((plan) => getPlanSpecs(plan).surface)
    return { min: Math.min(...values), max: Math.max(...values) }
  }, [plans])

  const normalizedLandingPriceMin =
    landingPriceRange?.min > 0 ? landingPriceRange.min / 100 : priceBounds.min
  const normalizedLandingPriceMax =
    landingPriceRange?.max > 0 ? landingPriceRange.max / 100 : priceBounds.max
  const effectivePriceBounds = {
    min: normalizedLandingPriceMin,
    max: Math.max(normalizedLandingPriceMax, normalizedLandingPriceMin),
  }

  const priceSliderMax = effectivePriceBounds.max > 0 ? effectivePriceBounds.max : effectivePriceBounds.min + 500
  const priceCapValue = priceCap === 0 ? priceSliderMax : Math.min(priceCap, priceSliderMax)

  const surfaceSliderMax =
    Number.isFinite(surfaceBounds.max) && surfaceBounds.max > surfaceBounds.min
      ? surfaceBounds.max
      : surfaceBounds.min + 100
  const surfaceMinValue = surfaceMin === 0 ? surfaceBounds.min : Math.max(surfaceMin, surfaceBounds.min)

  const sliderPriceBounds = { ...effectivePriceBounds, max: priceSliderMax }
  const sliderSurfaceBounds = { ...surfaceBounds, max: surfaceSliderMax }

  const landingMetrics = useMemo(
    () =>
      buildLandingMetrics({
        stats: landingStats,
        plansCount: plans.length,
        categoriesCount: categories.length,
      }),
    [landingStats, plans.length, categories.length],
  )

  const handleSearchTermChange = useCallback((value) => {
    setSearchTerm(value)
    setCatalogPage(1)
  }, [])

  const handleSortModeChange = useCallback((value) => {
    setSortMode(value)
    setCatalogPage(1)
  }, [])

  const handlePriceCapChange = useCallback((value) => {
    setPriceCap(value)
    setCatalogPage(1)
  }, [])

  const handleSurfaceMinChange = useCallback((value) => {
    setSurfaceMin(value)
    setCatalogPage(1)
  }, [])

  const handleCategoryChange = useCallback(
    (value) => {
      onCategoryChange(value)
      setCatalogPage(1)
    },
    [onCategoryChange],
  )

  const filteredPlans = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim()
    return plans
      .filter((plan) => {
        if (!selectedCategoryId) return true
        const categoryId = String(plan.category?.id ?? plan.category_id ?? '')
        return categoryId === String(selectedCategoryId)
      })
      .filter((plan) => {
        const price = Number(plan.price_cents ?? 0) / 100
        return price <= priceCapValue
      })
      .filter((plan) => {
        const specs = getPlanSpecs(plan)
        return specs.surface >= surfaceMinValue
      })
      .filter((plan) => {
        if (!normalizedSearch) return true
        const target = `${plan.title} ${plan.category?.name ?? ''} ${plan.description ?? ''}`.toLowerCase()
        return target.includes(normalizedSearch)
      })
      .sort((a, b) => {
        const priceA = Number(a.price_cents ?? 0)
        const priceB = Number(b.price_cents ?? 0)
        if (sortMode === 'price-asc') return priceA - priceB
        if (sortMode === 'price-desc') return priceB - priceA
        if (sortMode === 'popular') {
          const score = (plan) => (plan.status === 'approved' ? 2 : 1) + (plan.id % 5)
          return score(b) - score(a)
        }
      return b.id - a.id
    })
  }, [plans, selectedCategoryId, priceCapValue, surfaceMinValue, searchTerm, sortMode])

  const totalCatalogPages = Math.max(1, Math.ceil(filteredPlans.length / CATALOG_PAGE_SIZE))
  const safeCatalogPage = Math.min(catalogPage, totalCatalogPages)
  const paginatedPlans = useMemo(() => {
    const start = (safeCatalogPage - 1) * CATALOG_PAGE_SIZE
    return filteredPlans.slice(start, start + CATALOG_PAGE_SIZE)
  }, [filteredPlans, safeCatalogPage])

  const featuredPlans = filteredPlans.slice(0, MAX_FEATURED)
  const landingFeaturedPlans = (landingFeaturedList?.length ?? 0) > 0 ? landingFeaturedList : featuredPlans
  const heroPlan = landingHeroPlan ?? filteredPlans[0] ?? plans[0]
  const galleryPlansToShow = (landingGalleryList?.length ?? 0) > 0 ? landingGalleryList : filteredPlans

  const handleCatalogPageChange = useCallback(
    (page) => {
      setCatalogPage((_) => {
        const desired = Math.max(1, page)
        return Math.min(desired, totalCatalogPages)
      })
    },
    [totalCatalogPages],
  )

  const galleryResetKey = `${selectedCategoryId}:${searchTerm}:${priceCapValue}:${surfaceMinValue}:${sortMode}`
  const handleViewFavorites = useCallback(() => {
    const event = {
      preventDefault: () => {},
    }
    setCatalogPage(1)
    onNavigate(event, '/plans')
  }, [onNavigate])

  function handleNewsletterSubmit(event) {
    event.preventDefault()
    if (!newsletterEmail.trim()) return
    setNewsletterStatus(`Merci, ${newsletterEmail.trim()} ! Nous vous envoyons les nouveautés.`)
    setNewsletterEmail('')
  }

  return (
    <main className="page page-landing showcase-page" id="main-content">
      <HeroSection heroPlan={heroPlan} metrics={landingMetrics} onNavigate={onNavigate} />
      <TrustStrip metrics={landingMetrics} />
      <FavoriteSummary
        count={favoriteIds.size}
        hasFavorites={hasFavorites}
        onView={handleViewFavorites}
      />
      <FilterBar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={handleCategoryChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchTermChange}
        sortMode={sortMode}
        onSortChange={handleSortModeChange}
        priceCap={priceCapValue}
        onPriceCapChange={handlePriceCapChange}
        priceBounds={sliderPriceBounds}
        surfaceMin={surfaceMinValue}
        onSurfaceMinChange={handleSurfaceMinChange}
        surfaceBounds={sliderSurfaceBounds}
        resultsCount={filteredPlans.length}
      />
      <SectionErrorBoundary>
        <FeaturedSection
          plansStatus={plansStatus}
          plansError={plansError}
          featuredPlans={landingFeaturedPlans}
          onBuyPlan={onBuyPlan}
          onViewPlan={(planId) => {
            const event = {
              preventDefault: () => {},
            }
            onNavigate(event, `/plans/${planId}`)
          }}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
        />
      </SectionErrorBoundary>
      <SectionErrorBoundary>
        <CatalogSection
          plansStatus={plansStatus}
          plansError={plansError}
          plans={paginatedPlans}
          onBuyPlan={onBuyPlan}
          onViewPlan={(planId) => {
            const event = {
              preventDefault: () => {},
            }
            onNavigate(event, `/plans/${planId}`)
          }}
          currentPage={safeCatalogPage}
          totalPages={totalCatalogPages}
          onPageChange={handleCatalogPageChange}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
        />
      </SectionErrorBoundary>
      <SectionErrorBoundary>
        <GallerySection
          key={galleryResetKey}
          plansStatus={plansStatus}
          galleryPlans={galleryPlansToShow}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
          onNavigate={onNavigate}
          onOpenLightbox={setLightboxPlan}
        />
      </SectionErrorBoundary>
      <ContactSection
        onNavigate={onNavigate}
        newsletterEmail={newsletterEmail}
        onNewsletterChange={setNewsletterEmail}
        onNewsletterSubmit={handleNewsletterSubmit}
        newsletterStatus={newsletterStatus}
      />
      {lightboxPlan && (
        <GalleryLightbox plan={lightboxPlan} onClose={() => setLightboxPlan(null)} onNavigate={onNavigate} />
      )}
    </main>
  )
}
