import { useMemo, useState } from 'react'
import { sendContactMessage } from '../api/contact'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState('idle')
  const [feedback, setFeedback] = useState('')

  const canSubmit = useMemo(() => {
    return (
      formData.name.trim().length > 1 &&
      formData.email.includes('@') &&
      formData.subject.trim().length > 2 &&
      formData.message.trim().length > 9
    )
  }, [formData])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canSubmit) return

    setStatus('sending')
    setFeedback('')

    try {
      const result = await sendContactMessage(formData)
      if (!result.ok) {
        setStatus('error')
        setFeedback(result.message)
        return
      }
      setStatus('sent')
      setFeedback('Message envoye. Nous vous contacterons rapidement.')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch {
      setStatus('error')
      setFeedback('Le service est indisponible pour le moment.')
    }
  }

  return (
    <main className="page">
      <section className="section-intro">
        <p className="eyebrow">Contact</p>
        <h1>Parlons de votre projet.</h1>
        <p>Laissez votre message. Nous revenons vers vous rapidement.</p>
      </section>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label htmlFor="name">
          Nom complet
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Ama Kossi"
            required
          />
        </label>

        <label htmlFor="email">
          Email
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="votre@email.com"
            required
          />
        </label>

        <label htmlFor="subject">
          Sujet
          <input
            id="subject"
            name="subject"
            type="text"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Demande d'information"
            required
          />
        </label>

        <label htmlFor="message">
          Message
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Decrivez votre besoin..."
            rows={6}
            required
          />
        </label>

        <button type="submit" disabled={!canSubmit || status === 'sending'}>
          {status === 'sending' ? 'Envoi...' : 'Envoyer'}
        </button>

        {status === 'sent' ? <p className="success">{feedback}</p> : null}
        {status === 'error' ? <p className="error">{feedback}</p> : null}
      </form>
    </main>
  )
}
