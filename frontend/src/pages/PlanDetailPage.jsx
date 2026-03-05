import Button from '../components/ui/Button'
import StatusBadge from '../components/ui/StatusBadge'
import { formatPrice } from '../utils/format'

const PLAN_STATUS_LABELS = {
  draft: 'Brouillon',
  pending: 'En attente',
  approved: 'Approuve',
  rejected: 'Rejete',
}

export default function PlanDetailPage({ plan, onBuyPlan, onNavigate }) {
  if (!plan) {
    return (
      <main className="page">
        <section className="section-intro">
          <p className="eyebrow">Plan</p>
          <h1>Plan introuvable</h1>
          <p>Ce plan n'existe pas ou n'est plus disponible.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="page">
      <section className="section-intro">
        <p className="eyebrow">Detail du plan</p>
        <h1>{plan.title}</h1>
        <p>{plan.description || 'Aucune description fournie.'}</p>
      </section>

      <section className="plans-section">
        <article className="plan-card">
          <StatusBadge value={plan.status} labelMap={PLAN_STATUS_LABELS} />
          <p><strong>Categorie:</strong> {plan.category?.name ?? 'Sans categorie'}</p>
          <p><strong>Vendeur:</strong> {plan.seller?.name ?? 'Non renseigne'}</p>
          <p className="plan-price">{formatPrice(plan.price_cents, plan.currency)}</p>
          <div className="card-actions">
            <Button type="button" variant="secondary" icon="bi bi-bag-plus" onClick={() => onBuyPlan(plan.id)}>
              Commander ce plan
            </Button>
            <Button type="button" variant="ghost" icon="bi bi-arrow-left" onClick={(event) => onNavigate(event, '/plans')}>
              Retour au catalogue
            </Button>
          </div>
        </article>
      </section>
    </main>
  )
}

