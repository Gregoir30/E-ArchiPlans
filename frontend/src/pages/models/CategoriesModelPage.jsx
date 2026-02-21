import ModelViewPage from '../../components/ModelViewPage'

export default function CategoriesModelPage() {
  return (
    <ModelViewPage
      title="Categories"
      description="Vues React par modele Category."
      resourcePath="/api/categories"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Nom' },
        { key: 'slug', label: 'Slug' },
      ]}
      detailFields={[
        { key: 'id', label: 'Identifiant' },
        { key: 'name', label: 'Nom categorie' },
        { key: 'slug', label: 'Slug' },
        { key: 'created_at', label: 'Cree le' },
      ]}
    />
  )
}


