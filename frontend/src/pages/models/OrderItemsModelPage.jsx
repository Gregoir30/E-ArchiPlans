import ModelViewPage from '../../components/ModelViewPage'

export default function OrderItemsModelPage() {
  return (
    <ModelViewPage
      title="Order Items"
      description="Vues React par modele OrderItem."
      resourcePath="/api/order-items"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'order_id', label: 'Order' },
        { key: 'plan_id', label: 'Plan' },
        { key: 'unit_price_cents', label: 'Prix unitaire' },
      ]}
      detailFields={[
        { key: 'id', label: 'Identifiant' },
        { key: 'order_id', label: 'Commande (ID)' },
        { key: 'order.payment_status', label: 'Statut paiement commande' },
        { key: 'plan_id', label: 'Plan (ID)' },
        { key: 'plan.title', label: 'Plan (Titre)' },
        { key: 'unit_price_cents', label: 'Prix unitaire (cents)' },
      ]}
    />
  )
}


