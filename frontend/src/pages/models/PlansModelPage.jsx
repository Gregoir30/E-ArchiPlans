import ModelViewPage from '../../components/ModelViewPage'

export default function PlansModelPage() {
  return (
    <ModelViewPage
      title="Plans"
      description="Vues React par modele Plan."
      resourcePath="/api/plans"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'Titre' },
        { key: 'status', label: 'Statut' },
        { key: 'category.name', label: 'Categorie' },
        { key: 'price_cents', label: 'Prix (cents)' },
      ]}
      detailFields={[
        { key: 'id', label: 'Identifiant' },
        { key: 'title', label: 'Titre du plan' },
        { key: 'slug', label: 'Slug' },
        { key: 'description', label: 'Description' },
        { key: 'status', label: 'Statut' },
        { key: 'category.name', label: 'Categorie' },
        { key: 'seller.name', label: 'Vendeur' },
        { key: 'price_cents', label: 'Prix (cents)' },
        { key: 'currency', label: 'Devise' },
      ]}
    />
  )
}


