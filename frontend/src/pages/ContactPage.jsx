import { useMemo, useState } from 'react'
import { sendContactMessage } from '../api/contact'

const SUBJECTS = [
  'Demande d\'information',
  'Support technique',
  'Partenariat / Vente',
  'Problème de commande',
  'Autre',
]

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [feedback, setFeedback] = useState('')
  const [touched, setTouched] = useState({})

  const validation = useMemo(() => ({
    name: formData.name.trim().length > 1,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    subject: formData.subject.trim().length > 2,
    message: formData.message.trim().length > 9,
  }), [formData])

  const canSubmit = Object.values(validation).every(Boolean)

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleBlur(e) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setStatus('sending')
    setFeedback('')
    try {
      const result = await sendContactMessage(formData)
      if (!result.ok) { setStatus('error'); setFeedback(result.message); return }
      setStatus('sent')
      setFeedback('Message envoyé. Nous vous contacterons rapidement.')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setTouched({})
    } catch {
      setStatus('error')
      setFeedback('Le service est indisponible pour le moment.')
    }
  }

  const err = (field) => touched[field] && !validation[field]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --sand: #f5efe6; --sand-mid: #ede4d6; --sand-dark: #e0d4c2;
          --ink: #1a1614; --ink-soft: #4a3f38; --ink-muted: #9a8f87;
          --accent: #c97d4e; --accent-light: #f0dcc8; --accent-dark: #a8623a;
          --white: #ffffff; --border: rgba(26,22,20,0.09); --border-strong: rgba(26,22,20,0.18);
          --red: #c0392b; --red-bg: #fdecea; --green: #2d7a4f; --green-bg: #e6f4ec;
          --shadow-card: 0 2px 8px rgba(26,22,20,0.06), 0 16px 48px rgba(26,22,20,0.08);
          --radius: 16px; --radius-sm: 10px; --radius-pill: 999px;
          --transition: 200ms cubic-bezier(.4,0,.2,1);
          --font-display: 'Playfair Display', Georgia, serif;
          --font-body: 'DM Sans', system-ui, sans-serif;
        }
        body { background: var(--sand); font-family: var(--font-body); color: var(--ink); }
        .contact-page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }

        /* ── LEFT PANEL ── */
        .contact-left {
          background: var(--ink);
          padding: 80px 56px;
          display: flex; flex-direction: column; justify-content: space-between;
          position: relative; overflow: hidden;
          min-height: 100vh;
        }
        .contact-left::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 70% at 80% 20%, rgba(201,125,78,0.18) 0%, transparent 65%),
            radial-gradient(ellipse 40% 50% at 20% 90%, rgba(201,125,78,0.10) 0%, transparent 65%);
          pointer-events: none;
        }
        .contact-left::after {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 52px 52px;
          pointer-events: none;
        }
        .left-content { position: relative; z-index: 1; }
        .left-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.68rem; font-weight: 600; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--accent); margin-bottom: 28px;
        }
        .left-eyebrow::before { content: ''; display: block; width: 24px; height: 1px; background: var(--accent); }
        .left-h1 {
          font-family: var(--font-display);
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 500; color: var(--white);
          line-height: 1.12; letter-spacing: -0.025em; margin-bottom: 20px;
        }
        .left-h1 em { font-style: italic; color: var(--accent); }
        .left-lead {
          font-size: 0.95rem; font-weight: 300;
          color: rgba(255,255,255,0.5); line-height: 1.75; max-width: 360px;
        }

        .contact-info { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 0; margin-top: 56px; }
        .info-item {
          display: flex; align-items: flex-start; gap: 16px;
          padding: 20px 0;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .info-item:last-child { border-bottom: 1px solid rgba(255,255,255,0.07); }
        .info-icon {
          width: 40px; height: 40px; flex-shrink: 0;
          border-radius: 10px;
          background: rgba(201,125,78,0.14);
          border: 1px solid rgba(201,125,78,0.22);
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; color: var(--accent);
        }
        .info-text strong { display: block; font-size: 0.78rem; font-weight: 600; color: rgba(255,255,255,0.9); letter-spacing: 0.04em; margin-bottom: 3px; }
        .info-text span { font-size: 0.8rem; font-weight: 300; color: rgba(255,255,255,0.42); }

        .left-bottom { position: relative; z-index: 1; }
        .response-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-pill);
          font-size: 0.78rem; color: rgba(255,255,255,0.55); font-weight: 400;
        }
        .response-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 0 3px rgba(74,222,128,0.2);
          animation: pulse-dot 2s ease infinite;
          flex-shrink: 0;
        }
        @keyframes pulse-dot {
          0%,100% { box-shadow: 0 0 0 3px rgba(74,222,128,0.2); }
          50% { box-shadow: 0 0 0 6px rgba(74,222,128,0.08); }
        }

        /* ── RIGHT PANEL ── */
        .contact-right {
          background: var(--sand);
          padding: 80px 56px;
          display: flex; flex-direction: column; justify-content: center;
        }
        .form-header { margin-bottom: 40px; }
        .form-title {
          font-family: var(--font-display);
          font-size: 1.6rem; font-weight: 500; color: var(--ink);
          letter-spacing: -0.02em; margin-bottom: 8px;
        }
        .form-sub { font-size: 0.875rem; color: var(--ink-muted); font-weight: 300; }

        /* ── FORM ── */
        .contact-form { display: flex; flex-direction: column; gap: 20px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .field { display: flex; flex-direction: column; gap: 6px; }
        .field label {
          font-size: 0.75rem; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--ink-soft);
        }
        .field-wrap { position: relative; }
        .field-wrap i {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          font-size: 0.9rem; color: var(--ink-muted); pointer-events: none;
          transition: color var(--transition);
        }
        .field-wrap.textarea-wrap i { top: 16px; transform: none; }

        .field input, .field select, .field textarea {
          width: 100%;
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          font-family: var(--font-body);
          font-size: 0.875rem; color: var(--ink);
          transition: border-color var(--transition), box-shadow var(--transition);
          outline: none;
          appearance: none;
        }
        .field input, .field select { height: 48px; padding: 0 14px 0 40px; }
        .field textarea { padding: 14px 14px 14px 40px; resize: vertical; min-height: 130px; line-height: 1.6; }
        .field input::placeholder, .field textarea::placeholder { color: #c0b5ae; }

        .field input:focus, .field select:focus, .field textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-light);
        }
        .field input:focus ~ i, .field select:focus ~ i,
        .field-wrap:focus-within i { color: var(--accent); }
        .field.has-error input, .field.has-error select, .field.has-error textarea {
          border-color: var(--red);
          box-shadow: 0 0 0 3px var(--red-bg);
        }
        .field.has-error .field-wrap i { color: var(--red); }
        .field-error { font-size: 0.72rem; color: var(--red); font-weight: 500; }

        .select-arrow {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          pointer-events: none; font-size: 0.7rem; color: var(--ink-muted);
        }

        /* ── CHAR COUNT ── */
        .field-footer { display: flex; justify-content: space-between; align-items: center; }
        .char-count { font-size: 0.7rem; color: var(--ink-muted); }

        /* ── SUBMIT ── */
        .submit-row { display: flex; align-items: center; gap: 16px; margin-top: 4px; }
        .submit-btn {
          flex: 1; height: 52px;
          border-radius: var(--radius-pill);
          border: none;
          background: var(--ink);
          color: var(--white);
          font-family: var(--font-body);
          font-size: 0.9rem; font-weight: 600;
          cursor: pointer; letter-spacing: 0.02em;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all var(--transition);
          position: relative; overflow: hidden;
        }
        .submit-btn:hover:not(:disabled) { background: var(--accent); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,125,78,0.35); }
        .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
        .submit-btn.is-sending { background: var(--ink-soft); }
        .btn-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: var(--white);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .privacy-note { font-size: 0.72rem; color: var(--ink-muted); line-height: 1.5; max-width: 200px; }
        .privacy-note i { color: var(--accent); }

        /* ── FEEDBACK ── */
        .feedback-banner {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 16px;
          border-radius: var(--radius-sm);
          font-size: 0.825rem; font-weight: 400; line-height: 1.5;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .feedback-banner.success { background: var(--green-bg); color: var(--green); border: 1px solid rgba(45,122,79,0.2); }
        .feedback-banner.error { background: var(--red-bg); color: var(--red); border: 1px solid rgba(192,57,43,0.2); }
        .feedback-banner i { font-size: 1.05rem; flex-shrink: 0; margin-top: 1px; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .contact-page { grid-template-columns: 1fr; }
          .contact-left { min-height: auto; padding: 60px 28px 48px; }
          .contact-right { padding: 48px 28px 64px; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="contact-page">

        {/* ── LEFT ── */}
        <aside className="contact-left">
          <div className="left-content">
            <p className="left-eyebrow">Contact</p>
            <h1 className="left-h1">Parlons de votre<br /><em>projet.</em></h1>
            <p className="left-lead">
              Une question, une demande sur-mesure ou un partenariat ?
              Notre équipe vous répond dans les meilleurs délais.
            </p>

            <div className="contact-info">
              {[
                { icon: 'bi-envelope', label: 'Email', value: 'contact@e-archiplans.com' },
                { icon: 'bi-telephone', label: 'Téléphone', value: '+228 90 00 00 00' },
                { icon: 'bi-geo-alt', label: 'Localisation', value: 'Lomé, Togo' },
              ].map((item) => (
                <div className="info-item" key={item.label}>
                  <div className="info-icon"><i className={`bi ${item.icon}`} aria-hidden="true" /></div>
                  <div className="info-text">
                    <strong>{item.label}</strong>
                    <span>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="left-bottom">
            <div className="response-badge">
              <span className="response-dot" aria-hidden="true" />
              Temps de réponse moyen : moins de 24h
            </div>
          </div>
        </aside>

        {/* ── RIGHT ── */}
        <section className="contact-right">
          <div className="form-header">
            <h2 className="form-title">Envoyez-nous un message</h2>
            <p className="form-sub">Tous les champs sont requis.</p>
          </div>

          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className={`field ${err('name') ? 'has-error' : ''}`}>
                <label htmlFor="name">Nom complet</label>
                <div className="field-wrap">
                  <input
                    id="name" name="name" type="text"
                    value={formData.name} onChange={handleChange} onBlur={handleBlur}
                    placeholder="Ama Kossi" autoComplete="name"
                  />
                  <i className="bi bi-person" aria-hidden="true" />
                </div>
                {err('name') && <span className="field-error">Veuillez entrer votre nom.</span>}
              </div>

              <div className={`field ${err('email') ? 'has-error' : ''}`}>
                <label htmlFor="email">Adresse email</label>
                <div className="field-wrap">
                  <input
                    id="email" name="email" type="email"
                    value={formData.email} onChange={handleChange} onBlur={handleBlur}
                    placeholder="votre@email.com" autoComplete="email"
                  />
                  <i className="bi bi-envelope" aria-hidden="true" />
                </div>
                {err('email') && <span className="field-error">Email invalide.</span>}
              </div>
            </div>

            <div className={`field ${err('subject') ? 'has-error' : ''}`}>
              <label htmlFor="subject">Sujet</label>
              <div className="field-wrap" style={{ position: 'relative' }}>
                <select
                  id="subject" name="subject"
                  value={formData.subject} onChange={handleChange} onBlur={handleBlur}
                >
                  <option value="">Choisissez un sujet…</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <i className="bi bi-tag" aria-hidden="true" />
                <span className="select-arrow"><i className="bi bi-chevron-down" /></span>
              </div>
              {err('subject') && <span className="field-error">Veuillez choisir un sujet.</span>}
            </div>

            <div className={`field ${err('message') ? 'has-error' : ''}`}>
              <label htmlFor="message">Message</label>
              <div className="field-wrap textarea-wrap">
                <textarea
                  id="message" name="message"
                  value={formData.message} onChange={handleChange} onBlur={handleBlur}
                  placeholder="Décrivez votre besoin en détail…"
                  rows={5} maxLength={1000}
                />
                <i className="bi bi-chat-left-text" aria-hidden="true" />
              </div>
              <div className="field-footer">
                {err('message')
                  ? <span className="field-error">Message trop court (10 caractères min).</span>
                  : <span />}
                <span className="char-count">{formData.message.length} / 1000</span>
              </div>
            </div>

            {status === 'sent' && (
              <div className="feedback-banner success" role="status">
                <i className="bi bi-check-circle-fill" aria-hidden="true" />
                {feedback}
              </div>
            )}
            {status === 'error' && (
              <div className="feedback-banner error" role="alert">
                <i className="bi bi-exclamation-circle-fill" aria-hidden="true" />
                {feedback}
              </div>
            )}

            <div className="submit-row">
              <button
                type="submit"
                className={`submit-btn ${status === 'sending' ? 'is-sending' : ''}`}
                disabled={!canSubmit || status === 'sending'}
                aria-busy={status === 'sending'}
              >
                {status === 'sending'
                  ? <><span className="btn-spinner" aria-hidden="true" /> Envoi en cours…</>
                  : <><i className="bi bi-send" aria-hidden="true" /> Envoyer le message</>}
              </button>
              <p className="privacy-note">
                <i className="bi bi-lock-fill" /> Vos données ne sont jamais revendues.
              </p>
            </div>
          </form>
        </section>
      </div>
    </>
  )
}
