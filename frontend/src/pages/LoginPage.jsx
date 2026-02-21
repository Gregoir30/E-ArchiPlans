import { useState } from 'react'
import { loginUser } from '../api/auth'

export default function LoginPage({ onAuthSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [feedback, setFeedback] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const result = await loginUser(form)
    setFeedback(result.message)
    if (result.ok) {
      setForm({ email: '', password: '' })
      if (onAuthSuccess) onAuthSuccess(result.user ?? null)
    }
  }

  return (
    <main className="page">
      <section className="section-intro">
        <p className="eyebrow">Authentification</p>
        <h1>
          <i className="bi bi-box-arrow-in-right icon-title" /> Connexion
        </h1>
        <p>Connectez-vous pour gerer vos plans, commandes et telechargements.</p>
      </section>

      <form className="contact-form auth-form" onSubmit={handleSubmit}>
        <label htmlFor="login_email">
          Email
          <input id="login_email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>

        <label htmlFor="login_password">
          Mot de passe
          <input
            id="login_password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit">
          <i className="bi bi-person-check" /> Se connecter
        </button>

        {feedback ? <p className={feedback.includes('reussie') ? 'success' : 'error'}>{feedback}</p> : null}
      </form>
    </main>
  )
}
