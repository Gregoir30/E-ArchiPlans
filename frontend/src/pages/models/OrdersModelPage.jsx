import ModelViewPage from '../../components/ModelViewPage'

export default function OrdersModelPage() {
  return (
    <ModelViewPage
      title="Orders"
      description="Vues React par modele Order."
      resourcePath="/api/orders"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'buyer_id', label: 'Buyer' },
        { key: 'total_cents', label: 'Total' },
        { key: 'payment_status', label: 'Paiement' },
      ]}
      detailFields={[
        { key: 'id', label: 'Identifiant commande' },
        { key: 'buyer_id', label: 'Acheteur (ID)' },
        { key: 'buyer.name', label: 'Acheteur (Nom)' },
        { key: 'total_cents', label: 'Total (cents)' },
        { key: 'currency', label: 'Devise' },
        { key: 'payment_status', label: 'Statut paiement' },
        { key: 'payment_provider', label: 'Provider' },
        { key: 'payment_reference', label: 'Reference' },
      ]}
    />
  )
}


