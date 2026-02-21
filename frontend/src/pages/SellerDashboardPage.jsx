import { useEffect, useState } from 'react'
import EmptyState from '../components/ui/EmptyState'
import StatusBadge from '../components/ui/StatusBadge'
import { fetchSellerDashboard } from '../api/dashboard'
import { formatPrice } from '../utils/format'

const PLAN_STATUS_LABELS = {
  draft: 'Brouillon',
  pending: 'En attente',
  approved: 'Approuve',
  rejected: 'Rejete',
}

export default function SellerDashboardPage() {
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [data, setData] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      setStatus('loading')
      setMessage('')
      const result = await fetchSellerDashboard()
      if (!isMounted) return

      if (!result.ok) {
        setStatus('error')
        setMessage(result.message)
        return
      }

      setData(result.data)
      setStatus('success')
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const summary = data?.summary ?? {}

  return (
    <main className="page">
      <section className="section-intro">
        <p className="eyebrow">Dashboard vendeur</p>
        <h1>Vue d'ensemble de votre activite</h1>
        <p>Suivez vos plans, ventes et revenus recents.</p>
      </section>

      <section className="plans-section">
        {status === 'loading' ? <p>Chargement du dashboard...</p> : null}
        {status === 'error' ? <p className="error">{message}</p> : null}

        {status === 'success' ? (
          <>
            <div className="detail-grid">
              <article className="detail-item"><p className="detail-label">Plans total</p><p className="detail-value">{summary.plans_total ?? 0}</p></article>
              <article className="detail-item"><p className="detail-label">Commandes payees</p><p className="detail-value">{summary.orders_count ?? 0}</p></article>
              <article className="detail-item"><p className="detail-label">Ventes (articles)</p><p className="detail-value">{summary.sold_items_count ?? 0}</p></article>
              <article className="detail-item"><p className="detail-label">Revenu estime</p><p className="detail-value">{formatPrice(summary.revenue_cents ?? 0, summary.currency ?? 'USD')}</p></article>
            </div>

            <div className="detail-grid">
              <article className="detail-item"><p className="detail-label">Brouillons</p><p className="detail-value">{summary.plans_by_status?.draft ?? 0}</p></article>
              <article className="detail-item"><p className="detail-label">En attente</p><p className="detail-value">{summary.plans_by_status?.pending ?? 0}</p></article>
              <article className="detail-item"><p className="detail-label">Approuves</p><p className="detail-value">{summary.plans_by_status?.approved ?? 0}</p></article>
              <article className="detail-item"><p className="detail-label">Rejetes</p><p className="detail-value">{summary.plans_by_status?.rejected ?? 0}</p></article>
            </div>

            <h2>Plans recents</h2>
            {Array.isArray(data?.recent_plans) && data.recent_plans.length > 0 ? (
              <div className="table-wrap">
                <table className="model-table">
                  <thead>
                    <tr>
                      <th>Titre</th>
                      <th>Statut</th>
                      <th>Categorie</th>
                      <th>Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_plans.map((plan) => (
                      <tr key={plan.id}>
                        <td>{plan.title}</td>
                        <td>
                          <StatusBadge value={plan.status} labelMap={PLAN_STATUS_LABELS} className="inline-badge" />
                        </td>
                        <td>{plan.category?.name ?? '-'}</td>
                        <td>{formatPrice(plan.price_cents ?? 0, plan.currency ?? 'USD')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="Aucun plan recent." />
            )}

            <h2>Ventes recentes</h2>
            {Array.isArray(data?.recent_sales) && data.recent_sales.length > 0 ? (
              <div className="table-wrap">
                <table className="model-table">
                  <thead>
                    <tr>
                      <th>Commande</th>
                      <th>Acheteur</th>
                      <th>Plan</th>
                      <th>Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_sales.map((sale, index) => (
                      <tr key={`${sale.order_id}-${index}`}>
                        <td>#{sale.order_id}</td>
                        <td>{sale.buyer_name ?? '-'}</td>
                        <td>{sale.plan_title ?? '-'}</td>
                        <td>{formatPrice(sale.unit_price_cents ?? 0, summary.currency ?? 'USD')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="Aucune vente recente." />
            )}
          </>
        ) : null}
      </section>
    </main>
  )
}
