import { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import StatusBadge from '../components/ui/StatusBadge'
import { cancelOrder, downloadPlanByToken, fetchMyOrders, simulateFedapayPayment } from '../api/orders'
import { formatPrice } from '../utils/format'

const STATUS_LABELS = {
  pending: 'En attente',
  paid: 'Payee',
  failed: 'Echouee',
  refunded: 'Remboursee',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [processingId, setProcessingId] = useState(null)

  async function loadOrders() {
    setStatus('loading')
    setMessage('')
    const result = await fetchMyOrders()
    if (!result.ok) {
      setOrders([])
      setStatus('error')
      setMessage(result.message)
      return
    }
    setOrders(result.orders)
    setStatus('success')
  }

  useEffect(() => {
    Promise.resolve().then(() => loadOrders())
  }, [])

  async function handleDownload(token) {
    const result = await downloadPlanByToken(token)
    setMessage(result.message)
  }

  async function handleCancel(orderId) {
    setProcessingId(orderId)
    const result = await cancelOrder(orderId)
    setMessage(result.message)
    if (result.ok) await loadOrders()
    setProcessingId(null)
  }

  async function handleFedapaySimulation(orderId, outcome) {
    setProcessingId(orderId)
    const result = await simulateFedapayPayment(orderId, outcome)
    setMessage(result.message)
    if (result.ok) await loadOrders()
    setProcessingId(null)
  }

  return (
    <main className="page">
      <section className="section-intro">
        <p className="eyebrow">Commandes</p>
        <h1>Historique et telechargements</h1>
        <p>Retrouvez vos commandes et telechargez vos plans achetes.</p>
      </section>

      <section className="plans-section">
        {status === 'loading' ? <p>Chargement...</p> : null}
        {status === 'error' ? <p className="error">{message}</p> : null}
        {status === 'success' && orders.length === 0 ? (
          <EmptyState title="Aucune commande." description="Vos achats apparaitront ici." />
        ) : null}
        {message && status === 'success' ? <p className="success">{message}</p> : null}

        {status === 'success'
          ? orders.map((order) => (
            <article key={order.id} className="plan-card">
              <StatusBadge value={order.payment_status} labelMap={STATUS_LABELS} />
              <h3>Commande #{order.id}</h3>
              <p>Total: {formatPrice(order.total_cents, order.currency)}</p>

              {order.payment_status === 'pending' ? (
                <div className="card-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    icon="bi bi-credit-card-2-front"
                    onClick={() => handleFedapaySimulation(order.id, 'success')}
                    disabled={processingId === order.id}
                    title="Simuler un paiement FedaPay valide"
                  >
                    Payer avec FedaPay (simulation)
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    icon="bi bi-x-octagon"
                    onClick={() => handleFedapaySimulation(order.id, 'failure')}
                    disabled={processingId === order.id}
                    title="Simuler un paiement FedaPay echoue"
                  >
                    Echec paiement FedaPay (simulation)
                  </Button>
                </div>
              ) : null}

              <div className="table-wrap">
                <table className="model-table">
                  <thead>
                    <tr>
                      <th>Plan</th>
                      <th>Prix</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.items ?? []).map((item) => (
                      <tr key={item.id}>
                        <td>{item.plan?.title ?? 'Plan'}</td>
                        <td>{formatPrice(item.unit_price_cents, item.plan?.currency ?? 'USD')}</td>
                        <td>
                          <div className="table-actions">
                            <Button
                              type="button"
                              variant="secondary"
                              icon="bi bi-download"
                              onClick={() => handleDownload(item.download?.token)}
                              disabled={!item.download?.token || order.payment_status !== 'paid'}
                              title="Telecharger"
                            >
                              Telecharger
                            </Button>

                            <Button
                              type="button"
                              variant="danger"
                              icon="bi bi-x-circle"
                              onClick={() => handleCancel(order.id)}
                              disabled={
                                processingId === order.id ||
                                !(order.payment_status === 'pending' || order.payment_status === 'paid')
                              }
                              title="Annuler la commande"
                            >
                              Annuler
                            </Button>

                            <Button
                              type="button"
                              variant="secondary"
                              icon="bi bi-box-arrow-up-right"
                              onClick={() => item.plan?.preview_url && window.open(item.plan.preview_url, '_blank')}
                              disabled={!item.plan?.preview_url}
                              title="Previsualiser"
                            >
                              Previsualiser
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))
          : null}
      </section>
    </main>
  )
}
