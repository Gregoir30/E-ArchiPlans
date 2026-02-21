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
  const categoryOptions = [
    { value: '', label: 'Toutes' },
    ...categories.map((category) => ({
      value: String(category.id),
      label: category.name,
    })),
  ]

  return (
    <main className="page page-landing">
      <section className="hero">
        <p className="eyebrow">Plans architecturaux modulables</p>
        <h1>Achetez des plans prets a construire, adaptes a votre projet.</h1>
        <p className="hero-text">
          E-ArchiPlans relie vendeurs et acheteurs autour d'un catalogue de plans fiables,
          modernes et personnalisables.
        </p>
        <div className="hero-actions">
          <a href="/a-propos" onClick={(event) => onNavigate(event, '/a-propos')}>
            Nos services
          </a>
          <a href="/contact" onClick={(event) => onNavigate(event, '/contact')} className="ghost">
            Devenir vendeur
          </a>
        </div>
      </section>

      <section className="highlights" aria-label="Avantages">
        <article>
          <h2>Catalogue clair</h2>
          <p>Parcourez des plans classes par categorie avec des fiches detaillees et des apercus lisibles.</p>
        </article>
        <article>
          <h2>Achat securise</h2>
          <p>Paiement trace et telechargement controle pour proteger vendeurs et acheteurs.</p>
        </article>
        <article>
          <h2>Gestion centralisee</h2>
          <p>Tableaux de bord dedies pour vendeur et administrateur avec suivi des ventes et moderation.</p>
        </article>
      </section>

      <section className="plans-section" aria-label="Plans recents">
        <div className="plans-header">
          <p className="eyebrow">Catalogue</p>
          <h2>Derniers plans publies</h2>
        </div>

        <InputField
          id="category-filter"
          label="Categorie"
          as="select"
          className="filter-label"
          value={selectedCategoryId}
          onChange={(event) => onCategoryChange(event.target.value)}
          options={categoryOptions}
        />

        {plansStatus === 'loading' ? <p>Chargement des plans...</p> : null}
        {plansStatus === 'error' ? <p className="error">{plansError}</p> : null}

        {plansStatus === 'success' && plans.length === 0 ? (
          <EmptyState title="Aucun plan n'est disponible pour le moment." />
        ) : null}

        {plansStatus === 'success' && plans.length > 0 ? (
          <div className="plans-grid">
            {plans.slice(0, 6).map((plan) => (
              <article key={plan.id} className="plan-card">
                <StatusBadge value={plan.status} labelMap={PLAN_STATUS_LABELS} />
                <h3>{plan.title}</h3>
                <p>{plan.category?.name ?? 'Sans categorie'}</p>
                <p className="plan-price">{formatPrice(plan.price_cents, plan.currency)}</p>
                <Button type="button" variant="secondary" icon="bi bi-bag-plus" onClick={() => onBuyPlan(plan.id)}>
                  Commander ce plan
                </Button>
              </article>
            ))}
          </div>
        ) : null}

        <p>
          Voir plus de plans :{' '}
          <a href="/plans" onClick={(event) => onNavigate(event, '/plans')}>
            tous les plans
          </a>
        </p>
      </section>
    </main>
  )
}
