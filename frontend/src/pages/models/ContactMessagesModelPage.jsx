import ModelViewPage from '../../components/ModelViewPage'

export default function ContactMessagesModelPage() {
  return (
    <ModelViewPage
      title="Contact Messages"
      description="Vues React par modele ContactMessage."
      resourcePath="/api/contact-messages"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Nom' },
        { key: 'email', label: 'Email' },
        { key: 'subject', label: 'Sujet' },
      ]}
      detailFields={[
        { key: 'id', label: 'Identifiant' },
        { key: 'name', label: 'Nom' },
        { key: 'email', label: 'Email' },
        { key: 'subject', label: 'Sujet' },
        { key: 'message', label: 'Message' },
        { key: 'created_at', label: 'Recu le' },
      ]}
    />
  )
}


