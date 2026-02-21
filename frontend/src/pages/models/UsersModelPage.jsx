import ModelViewPage from '../../components/ModelViewPage'

export default function UsersModelPage() {
  return (
    <ModelViewPage
      title="Users"
      description="Vues React par modele User."
      resourcePath="/api/users"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Nom' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
      ]}
      detailFields={[
        { key: 'id', label: 'Identifiant' },
        { key: 'name', label: 'Nom complet' },
        { key: 'email', label: 'Adresse email' },
        { key: 'role', label: 'Role' },
        { key: 'created_at', label: 'Cree le' },
      ]}
    />
  )
}


