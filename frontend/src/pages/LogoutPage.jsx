import { useState } from 'react'
import { logoutUser } from '../api/auth'

export default function LogoutPage({ onLoggedOut }) {
  const [feedback, setFeedback] = useState('')

  async function handleLogout() {
    const result = await logoutUser()
    setFeedback(result.message)
    if (onLoggedOut) onLoggedOut()
  }

  return (
    <main className="page">
      <section className="section-intro">
        <p className="eyebrow">Session</p>
        <h1>
          <i className="bi bi-box-arrow-right icon-title" /> Logout
        </h1>
        <p>Deconnectez-vous en toute securite.</p>
      </section>

      <section className="plans-section auth-logout">
        <p>Voulez-vous fermer votre session maintenant ?</p>
        <button type="button" className="danger-btn" onClick={handleLogout}>
          <i className="bi bi-door-open" /> Se deconnecter
        </button>
        {feedback ? <p className="success">{feedback}</p> : null}
      </section>
    </main>
  )
}
