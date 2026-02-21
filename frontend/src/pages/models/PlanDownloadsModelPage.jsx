import ModelViewPage from '../../components/ModelViewPage'

export default function PlanDownloadsModelPage() {
  return (
    <ModelViewPage
      title="Plan Downloads"
      description="Vues React par modele PlanDownload."
      resourcePath="/api/plan-downloads"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'order_item_id', label: 'Order item' },
        { key: 'token', label: 'Token' },
        { key: 'expires_at', label: 'Expire le' },
        { key: 'downloaded_at', label: 'Telecharge le' },
      ]}
      detailFields={[
        { key: 'id', label: 'Identifiant' },
        { key: 'order_item_id', label: 'Order item (ID)' },
        { key: 'order_item.order_id', label: 'Commande liee' },
        { key: 'order_item.plan_id', label: 'Plan lie' },
        { key: 'token', label: 'Token acces' },
        { key: 'expires_at', label: 'Date expiration' },
        { key: 'downloaded_at', label: 'Date telechargement' },
      ]}
    />
  )
}


