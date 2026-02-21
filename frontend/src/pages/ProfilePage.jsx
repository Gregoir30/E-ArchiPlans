import { useEffect, useState } from 'react'
import { fetchCurrentUser, updateCurrentUser } from '../api/auth'
import { getStoredUser } from '../utils/authToken'

function getRoleLabel(role) {
  if (role === 'admin') return 'Administrateur'
  if (role === 'seller') return 'Vendeur'
  if (role === 'buyer') return 'Acheteur'
  return role ?? ''
}

export default function ProfilePage({ onNavigate }) {
  const [user, setUser] = useState(getStoredUser())
  const [status, setStatus] = useState('idle')
  const [form, setForm] = useState({
    name: getStoredUser()?.name ?? '',
    email: getStoredUser()?.email ?? '',
    password: '',
    password_confirmation: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      setStatus('loading')
      const result = await fetchCurrentUser()
      if (!isMounted) return

      if (result.ok) {
        setUser(result.user)
        setForm((prev) => ({
          ...prev,
          name: result.user?.name ?? '',
          email: result.user?.email ?? '',
        }))
        setStatus('success')
        return
      }

      setStatus('error')
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  function onFieldChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSaving(true)

    const payload = {
      name: form.name,
      email: form.email,
    }

    if (form.password) {
      payload.password = form.password
      payload.password_confirmation = form.password_confirmation
    }

    const result = await updateCurrentUser(payload)

    if (!result.ok) {
      setError(result.message)
      setIsSaving(false)
      return
    }

    setUser(result.user)
    setForm((prev) => ({
      ...prev,
      name: result.user?.name ?? prev.name,
      email: result.user?.email ?? prev.email,
      password: '',
      password_confirmation: '',
    }))
    setMessage(result.message)
    setIsSaving(false)
  }

  if (status === 'error' && !user) {
    return (
      <main className="page">
        <section className="section-intro">
          <p className="eyebrow">Profil</p>
          <h1>Session requise</h1>
          <p>Veuillez vous connecter pour acceder a votre profil.</p>
          <button type="button" className="secondary-btn" onClick={(event) => onNavigate(event, '/login')}>
            Aller a la connexion
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="page">
      <section className="section-intro">
        <p className="eyebrow">Profil</p>
        <h1>
          <i className="bi bi-person-circle icon-title" />
          Mon profil
        </h1>
        <p>Consultez et mettez a jour les informations de votre compte.</p>
      </section>

      <section className="plans-section">
        {status === 'loading' ? <p>Chargement du profil...</p> : null}

        {user ? (
          <div className="profile-grid">
            <p><strong>ID :</strong> {user.id}</p>
            <p><strong>Role :</strong> {getRoleLabel(user.role)}</p>
          </div>
        ) : null}

        {user && (user.role === 'seller' || user.role === 'admin') ? (
          <div className="card-actions">
            <button type="button" className="secondary-btn" onClick={(event) => onNavigate(event, '/dashboard')}>
              <i className="bi bi-speedometer2" /> Ouvrir mon dashboard
            </button>
          </div>
        ) : null}

        <form className="contact-form auth-form" onSubmit={handleSubmit}>
          <label htmlFor="profile-name">
            Nom
            <input id="profile-name" name="name" type="text" value={form.name} onChange={onFieldChange} required />
          </label>

          <label htmlFor="profile-email">
            Email
            <input id="profile-email" name="email" type="email" value={form.email} onChange={onFieldChange} required />
          </label>

          <label htmlFor="profile-password">
            Nouveau mot de passe (optionnel)
            <input
              id="profile-password"
              name="password"
              type="password"
              value={form.password}
              onChange={onFieldChange}
              minLength={8}
            />
          </label>

          <label htmlFor="profile-password-confirmation">
            Confirmation du mot de passe
            <input
              id="profile-password-confirmation"
              name="password_confirmation"
              type="password"
              value={form.password_confirmation}
              onChange={onFieldChange}
              minLength={8}
            />
          </label>

          <button type="submit" disabled={isSaving}>
            <i className="bi bi-save" /> {isSaving ? 'Mise a jour...' : 'Mettre a jour le profil'}
          </button>

          {message ? <p className="success">{message}</p> : null}
          {error ? <p className="error">{error}</p> : null}
        </form>
      </section>
    </main>
  )
}
