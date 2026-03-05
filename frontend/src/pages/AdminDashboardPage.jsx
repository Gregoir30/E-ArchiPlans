import { useEffect, useState } from 'react'
import EmptyState from '../components/ui/EmptyState'
import InputField from '../components/ui/InputField'
import StatusBadge from '../components/ui/StatusBadge'
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  fetchAdminUsers,
  moderatePlan,
  updateAdminUser,
} from '../api/admin'
import { fetchAdminDashboard } from '../api/dashboard'
import { formatPrice } from '../utils/format'

const ORDER_STATUS_LABELS = {
  pending: 'En attente',
  paid: 'Payee',
  failed: 'Echouee',
  refunded: 'Remboursee',
}

const ROLE_OPTIONS = [
  { value: 'buyer', label: 'Acheteur' },
  { value: 'seller', label: 'Vendeur' },
  { value: 'admin', label: 'Administrateur' },
]

export default function AdminDashboardPage() {
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [data, setData] = useState(null)
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [categoryName, setCategoryName] = useState('')
  const [busyKey, setBusyKey] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadAll() {
      setStatus('loading')
      setMessage('')
      const [dashboardResult, usersResult, categoriesResult] = await Promise.all([
        fetchAdminDashboard(),
        fetchAdminUsers(),
        fetchAdminCategories(),
      ])

      if (!isMounted) return

      if (!dashboardResult.ok) {
        setStatus('error')
        setMessage(dashboardResult.message)
        return
      }

      setData(dashboardResult.data)
      setUsers(usersResult.users ?? [])
      setCategories(categoriesResult.categories ?? [])
      setStatus('success')
    }

    loadAll()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleModeration(planId, nextStatus) {
    const key = `plan-${planId}-${nextStatus}`
    setBusyKey(key)
    const result = await moderatePlan(planId, nextStatus)
    setBusyKey('')
    setMessage(result.message ?? '')
    if (!result.ok) return

    setData((prev) => ({
      ...prev,
      pending_plans: (prev?.pending_plans ?? []).filter((plan) => plan.id !== planId),
    }))
  }

  async function handleUserRoleChange(userId, role) {
    const key = `user-role-${userId}`
    setBusyKey(key)
    const result = await updateAdminUser(userId, { role })
    setBusyKey('')
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)))
    setMessage('Role utilisateur mis a jour.')
  }

  async function handleUserActiveToggle(userId, isActive) {
    const key = `user-active-${userId}`
    setBusyKey(key)
    const result = await updateAdminUser(userId, { is_active: isActive })
    setBusyKey('')
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, is_active: isActive } : user)))
    setMessage(isActive ? 'Compte reactive.' : 'Compte gele.')
  }

  async function handleCategoryCreate(event) {
    event.preventDefault()
    const name = categoryName.trim()
    if (!name) return
    setBusyKey('category-create')
    const result = await createAdminCategory({ name })
    setBusyKey('')
    if (!result.ok) {
      setMessage(result.message)
      return
    }

    const reload = await fetchAdminCategories()
    if (reload.ok) setCategories(reload.categories)
    setCategoryName('')
    setMessage('Categorie creee.')
  }

  async function handleCategoryDelete(categoryId) {
    setBusyKey(`category-delete-${categoryId}`)
    const result = await deleteAdminCategory(categoryId)
    setBusyKey('')
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    setCategories((prev) => prev.filter((category) => category.id !== categoryId))
    setMessage('Categorie supprimee.')
  }

  const summary = data?.summary ?? {}

  return (
    <main className="page">
      <section className="section-intro">
        <p className="eyebrow">Dashboard admin</p>
        <h1>Pilotage global de la plateforme</h1>
        <p>Moderez les plans, gerez les utilisateurs et supervisez l'activite.</p>
      </section>

      <section className="plans-section">
        {status === 'loading' ? <p>Chargement du dashboard...</p> : null}
        {status === 'error' ? <p className="error">{message}</p> : null}
        {status === 'success' && message ? <p className="success">{message}</p> : null}

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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pending_plans.map((plan) => (
                      <tr key={plan.id}>
                        <td>{plan.title}</td>
                        <td>{plan.seller?.name ?? '-'}</td>
                        <td>{plan.category?.name ?? '-'}</td>
                        <td>{formatPrice(plan.price_cents ?? 0, plan.currency ?? 'USD')}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="secondary-btn"
                              disabled={busyKey === `plan-${plan.id}-approved`}
                              onClick={() => handleModeration(plan.id, 'approved')}
                            >
                              <i className="bi bi-check-circle" /> Approuver
                            </button>
                            <button
                              type="button"
                              className="danger-btn"
                              disabled={busyKey === `plan-${plan.id}-rejected`}
                              onClick={() => handleModeration(plan.id, 'rejected')}
                            >
                              <i className="bi bi-x-circle" /> Rejeter
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="Aucun plan en attente." />
            )}

            <h2>Gestion utilisateurs</h2>
            {users.length > 0 ? (
              <div className="table-wrap">
                <table className="model-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Etat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <select
                            value={user.role}
                            onChange={(event) => handleUserRoleChange(user.id, event.target.value)}
                            disabled={busyKey === `user-role-${user.id}`}
                          >
                            {ROLE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={user.is_active ? 'danger-btn' : 'secondary-btn'}
                            onClick={() => handleUserActiveToggle(user.id, !user.is_active)}
                            disabled={busyKey === `user-active-${user.id}`}
                          >
                            {user.is_active ? 'Geler' : 'Reactiver'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="Aucun utilisateur charge." />
            )}

            <h2>Gestion categories</h2>
            <form className="form-grid" onSubmit={handleCategoryCreate}>
              <InputField
                id="category-name"
                label="Nouvelle categorie"
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="Ex: Maison moderne"
              />
              <button type="submit" className="secondary-btn" disabled={busyKey === 'category-create'}>
                <i className="bi bi-plus-circle" /> Ajouter
              </button>
            </form>

            {categories.length > 0 ? (
              <div className="table-wrap">
                <table className="model-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Slug</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td>{category.name}</td>
                        <td>{category.slug}</td>
                        <td>
                          <button
                            type="button"
                            className="danger-btn"
                            onClick={() => handleCategoryDelete(category.id)}
                            disabled={busyKey === `category-delete-${category.id}`}
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

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
          </>
        ) : null}
      </section>
    </main>
  )
}

