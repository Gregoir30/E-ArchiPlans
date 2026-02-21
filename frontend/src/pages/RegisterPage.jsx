import { useState } from 'react'
import { registerUser } from '../api/auth'

export default function RegisterPage({ onAuthSuccess }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [feedback, setFeedback] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (form.password !== form.password_confirmation) {
      setFeedback('Les mots de passe ne correspondent pas.')
      return
    }

    const result = await registerUser(form)
    if (!result.ok) {
      setFeedback(result.message)
      return
    }

    setFeedback(result.message)
    setForm({ name: '', email: '', password: '', password_confirmation: '' })
    if (onAuthSuccess) onAuthSuccess(result.user ?? null)
  }

  return (
    <main className="page">
      <section className="section-intro">
        <p className="eyebrow">Nouveau compte</p>
        <h1>
          <i className="bi bi-person-plus icon-title" /> Inscription
        </h1>
        <p>Creez votre compte et commencez a commander des plans.</p>
      </section>

      <form className="contact-form auth-form" onSubmit={handleSubmit}>
        <label htmlFor="register_name">
          Nom complet
          <input id="register_name" name="name" type="text" value={form.name} onChange={handleChange} required />
        </label>

        <label htmlFor="register_email">
          Email
          <input
            id="register_email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label htmlFor="register_password">
          Mot de passe
          <input
            id="register_password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <label htmlFor="register_password_confirmation">
          Confirmation du mot de passe
          <input
            id="register_password_confirmation"
            name="password_confirmation"
            type="password"
            value={form.password_confirmation}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit">
          <i className="bi bi-person-badge" /> Creer mon compte
        </button>

        {feedback ? <p className={feedback.includes('correspondent') ? 'error' : 'success'}>{feedback}</p> : null}
      </form>
    </main>
  )
}
