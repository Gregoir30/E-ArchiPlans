import { useEffect, useState } from 'react'
import EmptyState from '../components/ui/EmptyState'
import StatusBadge from '../components/ui/StatusBadge'
import { fetchAdminDashboard } from '../api/dashboard'
import { formatPrice } from '../utils/format'

const ORDER_STATUS_LABELS = {
  pending: 'En attente',
  paid: 'Payee',
  failed: 'Echouee',
  refunded: 'Remboursee',
}

export default function AdminDashboardPage() {
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [data, setData] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      setStatus('loading')
      setMessage('')
      const result = await fetchAdminDashboard()
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
        <p className="eyebrow">Dashboard admin</p>
        <h1>Pilotage global de la plateforme</h1>
        <p>Suivez les utilisateurs, les plans, les commandes et les messages.</p>
      </section>

      <section className="plans-section">
        {status === 'loading' ? <p>Chargement du dashboard...</p> : null}
        {status === 'error' ? <p className="error">{message}</p> : null}

        {status === 'success' ? (
          <>
            <div className="detail-grid">
              <article className="detail-item"><p className="detail-label">Utilisateurs</p><p className="detail-value">{summary.users_total ?? 0}</p></article>
              <article className="detail-item"><p className="detail-label">Vendeurs</p><p className="detail-value">{summary.sellers_total ?? 0}</p></article>
              <article className="detail-item"><p className="detail-label">Acheteurs</p><p className="detail-value">{summary.buyers_total ?? 0}</p></article>
              <article className="detail-item"><p className="detail-label">Messages contact</p><p className="detail-value">{summary.contact_messages_total ?? 0}</p></article>
            </div>

            <div className="detail-grid">
              <article className="detail-item"><p className="detail-label">Plans total</p><p className="detail-value">{summary.plans_total ?? 0}</p></article>
              <article className="detail-item"><p className="detail-label">Plans en attente</p><p className="detail-value">{summary.plans_pending ?? 0}</p></article>
              <article className="detail-item"><p className="detail-label">Commandes total</p><p className="detail-value">{summary.orders_total ?? 0}</p></article>
              <article className="detail-item"><p className="detail-label">Commandes payees</p><p className="detail-value">{summary.orders_paid ?? 0}</p></article>
            </div>

            <article className="detail-item">
              <p className="detail-label">Chiffre d'affaires estime</p>
              <p className="detail-value">{formatPrice(summary.revenue_cents ?? 0, summary.currency ?? 'USD')}</p>
            </article>

            <h2>Commandes recentes</h2>
            {Array.isArray(data?.recent_orders) && data.recent_orders.length > 0 ? (
              <div className="table-wrap">
                <table className="model-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Acheteur</th>
                      <th>Statut</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_orders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.buyer?.name ?? '-'}</td>
                        <td><StatusBadge value={order.payment_status} labelMap={ORDER_STATUS_LABELS} className="inline-badge" /></td>
                        <td>{formatPrice(order.total_cents ?? 0, order.currency ?? 'USD')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="Aucune commande recente." />
            )}

            <h2>Plans en attente</h2>
            {Array.isArray(data?.pending_plans) && data.pending_plans.length > 0 ? (
              <div className="table-wrap">
                <table className="model-table">
                  <thead>
                    <tr>
                      <th>Plan</th>
                      <th>Vendeur</th>
                      <th>Categorie</th>
                      <th>Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pending_plans.map((plan) => (
                      <tr key={plan.id}>
                        <td>{plan.title}</td>
                        <td>{plan.seller?.name ?? '-'}</td>
                        <td>{plan.category?.name ?? '-'}</td>
                        <td>{formatPrice(plan.price_cents ?? 0, plan.currency ?? 'USD')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="Aucun plan en attente." />
            )}

            <h2>Utilisateurs recents</h2>
            {Array.isArray(data?.recent_users) && data.recent_users.length > 0 ? (
              <div className="table-wrap">
                <table className="model-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="Aucun utilisateur recent." />
            )}
          </>
        ) : null}
      </section>
    </main>
  )
}
