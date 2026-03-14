import { useState, useMemo } from 'react'
import { registerUser } from '../api/auth'

const STEPS = ['Identité', 'Accès', 'Confirmation']

function PasswordStrength({ password }) {
  const score = useMemo(() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 8) s++
    if (/[A-Z]/.test(password)) s++
    if (/[0-9]/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s
  }, [password])

  if (!password) return null
  const labels = ['Très faible', 'Faible', 'Correct', 'Fort', 'Excellent']
  const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#27ae60']

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '5px' }}>
        {[0,1,2,3].map((i) => (
          <div key={i} style={{
            flex: 1, height: '3px', borderRadius: '2px',
            background: i < score ? colors[score] : 'rgba(26,22,20,0.10)',
            transition: 'background 300ms ease',
          }} />
        ))}
      </div>
      <span style={{ fontSize: '0.7rem', color: colors[score], fontWeight: 600 }}>
        {labels[score]}
      </span>
    </div>
  )
}

export default function RegisterPage({ onAuthSuccess, onNavigate }) {
  const [step, setStep] = useState(0) // 0=identity 1=access 2=confirm
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus] = useState('idle')
  const [feedback, setFeedback] = useState('')
  const [touched, setTouched] = useState({})

  function nav(e, path) { e?.preventDefault?.(); onNavigate?.(e, path) }

  const validation = useMemo(() => ({
    name: form.name.trim().length > 1,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    password: form.password.length >= 6,
    password_confirmation: form.password_confirmation === form.password && form.password.length >= 6,
  }), [form])

  const stepValid = [
    validation.name && validation.email,
    validation.password && validation.password_confirmation,
    true,
  ]

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }
  function handleBlur(e) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }
  const err = (f) => touched[f] && !validation[f]

  function nextStep() {
    if (stepValid[step]) setStep((s) => s + 1)
  }
  function prevStep() { setStep((s) => Math.max(0, s - 1)) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!Object.values(validation).every(Boolean)) return
    setStatus('sending')
    setFeedback('')
    const result = await registerUser(form)
    if (!result.ok) {
      setStatus('error')
      setFeedback(result.message)
      return
    }
    setStatus('success')
    setFeedback(result.message)
    setTimeout(() => onAuthSuccess?.(result.user ?? null), 1000)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Playfair+Display:ital,wght@0,500;1,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --sand:#f5efe6;--sand-mid:#ede4d6;
          --ink:#1a1614;--ink-soft:#4a3f38;--ink-muted:#9a8f87;
          --accent:#c97d4e;--accent-light:#f0dcc8;--accent-dark:#a8623a;
          --white:#ffffff;--border:rgba(26,22,20,0.09);--border-strong:rgba(26,22,20,0.18);
          --red:#c0392b;--red-bg:#fdecea;--green:#2d7a4f;--green-bg:#e6f4ec;
          --font-display:'Playfair Display',Georgia,serif;
          --font-body:'DM Sans',system-ui,sans-serif;
          --transition:200ms cubic-bezier(.4,0,.2,1);
          --radius:16px;--radius-sm:10px;--radius-pill:999px;
        }
        body{background:var(--sand);font-family:var(--font-body);color:var(--ink)}

        .reg-page{
          min-height:100vh;display:grid;
          grid-template-columns:1fr 1fr;
        }

        /* ── LEFT ── */
        .reg-left{
          background:var(--ink);position:relative;overflow:hidden;
          display:flex;flex-direction:column;justify-content:space-between;
          padding:64px 56px;min-height:100vh;
        }
        .reg-left::before{
          content:'';position:absolute;inset:0;
          background:
            radial-gradient(ellipse 65% 70% at 10% 30%,rgba(201,125,78,.16) 0%,transparent 65%),
            radial-gradient(ellipse 40% 50% at 85% 80%,rgba(201,125,78,.10) 0%,transparent 65%);
          pointer-events:none;
        }
        .reg-left::after{
          content:'';position:absolute;inset:0;
          background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
          background-size:52px 52px;pointer-events:none;
        }
        .rl-inner{position:relative;z-index:1;display:flex;flex-direction:column;gap:0}
        .rl-brand{
          font-family:var(--font-display);font-size:1.4rem;font-weight:500;
          color:var(--white);text-decoration:none;letter-spacing:-.02em;
          display:inline-block;margin-bottom:64px;
        }
        .rl-brand span{
          display:block;font-family:var(--font-body);font-size:.58rem;font-weight:600;
          letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-top:3px;
        }
        .rl-eyebrow{
          display:inline-flex;align-items:center;gap:8px;
          font-size:.68rem;font-weight:600;letter-spacing:.18em;
          text-transform:uppercase;color:var(--accent);margin-bottom:18px;
        }
        .rl-eyebrow::before{content:'';display:block;width:20px;height:1px;background:var(--accent)}
        .rl-h1{
          font-family:var(--font-display);font-size:clamp(2rem,3.5vw,3rem);
          font-weight:500;color:var(--white);line-height:1.1;
          letter-spacing:-.025em;margin-bottom:16px;
        }
        .rl-h1 em{font-style:italic;color:var(--accent)}
        .rl-lead{
          font-size:.95rem;font-weight:300;
          color:rgba(255,255,255,.45);line-height:1.75;max-width:340px;margin-bottom:48px;
        }

        /* Perks */
        .rl-perks{display:flex;flex-direction:column;gap:0}
        .rl-perk{
          display:flex;align-items:center;gap:14px;
          padding:16px 0;border-top:1px solid rgba(255,255,255,.07);
        }
        .rl-perk:last-child{border-bottom:1px solid rgba(255,255,255,.07)}
        .rl-perk-icon{
          width:36px;height:36px;flex-shrink:0;border-radius:10px;
          background:rgba(201,125,78,.14);border:1px solid rgba(201,125,78,.22);
          display:flex;align-items:center;justify-content:center;
          font-size:.9rem;color:var(--accent);
        }
        .rl-perk span{font-size:.825rem;font-weight:300;color:rgba(255,255,255,.45)}

        .rl-bottom{position:relative;z-index:1}
        .rl-trust{
          display:flex;align-items:center;gap:8px;
          font-size:.72rem;color:rgba(255,255,255,.28);
        }
        .rl-trust i{color:#4ade80}

        /* ── RIGHT ── */
        .reg-right{
          background:var(--sand);
          display:flex;align-items:center;justify-content:center;
          padding:64px 56px;
        }
        .reg-box{width:100%;max-width:440px}

        /* Step indicator */
        .step-indicator{
          display:flex;align-items:center;gap:0;
          margin-bottom:36px;
        }
        .step-item{
          display:flex;align-items:center;gap:8px;flex:1;
        }
        .step-item:last-child{flex:0}
        .step-dot{
          width:28px;height:28px;border-radius:50%;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          font-size:.7rem;font-weight:700;
          transition:all var(--transition);
          border:1.5px solid var(--border);
          background:var(--white);color:var(--ink-muted);
        }
        .step-dot.is-done{background:var(--green);border-color:var(--green);color:var(--white)}
        .step-dot.is-active{background:var(--ink);border-color:var(--ink);color:var(--white)}
        .step-line{
          flex:1;height:1.5px;
          background:var(--border);
          margin:0 4px;
          position:relative;overflow:hidden;
        }
        .step-line-fill{
          position:absolute;top:0;left:0;height:100%;
          background:var(--accent);
          transition:width .4s cubic-bezier(.4,0,.2,1);
        }
        .step-label{
          display:none;
        }

        /* Header */
        .reg-header{margin-bottom:28px}
        .reg-title{
          font-family:var(--font-display);font-size:1.6rem;font-weight:500;
          color:var(--ink);letter-spacing:-.02em;margin-bottom:4px;
        }
        .reg-sub{font-size:.875rem;font-weight:300;color:var(--ink-muted)}

        /* Form */
        .reg-form{display:flex;flex-direction:column;gap:16px}

        .rf-field{display:flex;flex-direction:column;gap:6px}
        .rf-label{
          font-size:.72rem;font-weight:700;letter-spacing:.08em;
          text-transform:uppercase;color:var(--ink-soft);
        }
        .rf-wrap{position:relative}
        .rf-wrap .rf-icon{
          position:absolute;left:14px;top:50%;transform:translateY(-50%);
          font-size:.9rem;color:var(--ink-muted);pointer-events:none;
          transition:color var(--transition);
        }
        .rf-wrap:focus-within .rf-icon{color:var(--accent)}
        .rf-input{
          width:100%;height:50px;padding:0 42px;
          background:var(--white);border:1.5px solid var(--border);
          border-radius:var(--radius-sm);
          font-family:var(--font-body);font-size:.875rem;color:var(--ink);
          outline:none;appearance:none;
          transition:border-color var(--transition),box-shadow var(--transition);
        }
        .rf-input::placeholder{color:#c0b5ae}
        .rf-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-light)}
        .rf-field.has-error .rf-input{border-color:var(--red);box-shadow:0 0 0 3px var(--red-bg)}
        .rf-field.has-error .rf-icon{color:var(--red)}
        .rf-field.is-valid .rf-input{border-color:#2ecc71;box-shadow:0 0 0 3px rgba(46,204,113,.12)}
        .rf-error{font-size:.72rem;color:var(--red);font-weight:500}

        /* Check icon for valid */
        .rf-check{
          position:absolute;right:12px;top:50%;transform:translateY(-50%);
          font-size:.85rem;color:#2ecc71;pointer-events:none;
          animation:popIn .2s cubic-bezier(.22,1,.36,1);
        }
        @keyframes popIn{from{opacity:0;transform:translateY(-50%) scale(.5)}to{opacity:1;transform:translateY(-50%) scale(1)}}

        .rf-pwd-toggle{
          position:absolute;right:12px;top:50%;transform:translateY(-50%);
          width:28px;height:28px;border-radius:6px;border:none;
          background:transparent;color:var(--ink-muted);
          cursor:pointer;display:flex;align-items:center;justify-content:center;
          font-size:.9rem;transition:color var(--transition);
        }
        .rf-pwd-toggle:hover{color:var(--ink)}

        /* Nav buttons */
        .reg-nav{display:flex;gap:10px;margin-top:8px}
        .btn-back{
          height:52px;padding:0 20px;border-radius:var(--radius-pill);
          border:1.5px solid var(--border);background:transparent;
          font-family:var(--font-body);font-size:.875rem;font-weight:500;
          color:var(--ink-soft);cursor:pointer;
          display:flex;align-items:center;gap:6px;
          transition:all var(--transition);flex-shrink:0;
        }
        .btn-back:hover{border-color:var(--border-strong,rgba(26,22,20,.18));background:var(--sand-mid);color:var(--ink)}
        .btn-next{
          flex:1;height:52px;border-radius:var(--radius-pill);
          border:none;background:var(--ink);color:var(--white);
          font-family:var(--font-body);font-size:.9rem;font-weight:600;
          cursor:pointer;letter-spacing:.02em;
          display:flex;align-items:center;justify-content:center;gap:8px;
          transition:all var(--transition);
        }
        .btn-next:hover:not(:disabled){background:var(--accent);transform:translateY(-1px);box-shadow:0 6px 20px rgba(201,125,78,.35)}
        .btn-next:disabled{opacity:.4;cursor:not-allowed;transform:none}
        .btn-next.is-sending{background:var(--ink-soft);pointer-events:none}
        .btn-next.is-success{background:var(--green);pointer-events:none}

        .rf-spinner{
          width:16px;height:16px;border-radius:50%;
          border:2px solid rgba(255,255,255,.3);border-top-color:var(--white);
          animation:spin .7s linear infinite;flex-shrink:0;
        }
        @keyframes spin{to{transform:rotate(360deg)}}

        /* Feedback */
        .rf-feedback{
          display:flex;align-items:flex-start;gap:10px;
          padding:12px 14px;border-radius:var(--radius-sm);
          font-size:.825rem;font-weight:400;line-height:1.5;
          animation:fbIn .3s ease;
        }
        @keyframes fbIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
        .rf-feedback.success{background:var(--green-bg);color:var(--green);border:1px solid rgba(45,122,79,.2)}
        .rf-feedback.error{background:var(--red-bg);color:var(--red);border:1px solid rgba(192,57,43,.2)}
        .rf-feedback i{font-size:1rem;flex-shrink:0;margin-top:1px}

        /* Summary (step 2) */
        .reg-summary{
          background:var(--white);border:1px solid var(--border);
          border-radius:var(--radius-sm);padding:20px;
          display:flex;flex-direction:column;gap:12px;margin-bottom:4px;
        }
        .reg-summary-row{
          display:flex;align-items:center;gap:10px;
          font-size:.825rem;
        }
        .reg-summary-icon{
          width:32px;height:32px;border-radius:8px;
          background:var(--sand);
          display:flex;align-items:center;justify-content:center;
          font-size:.85rem;color:var(--ink-muted);flex-shrink:0;
        }
        .reg-summary-val{font-weight:500;color:var(--ink)}
        .reg-summary-sub{font-size:.72rem;color:var(--ink-muted);display:block;margin-top:1px}

        /* Login CTA */
        .reg-login-cta{
          text-align:center;font-size:.825rem;color:var(--ink-muted);
          font-weight:300;margin-top:8px;
        }
        .reg-login-cta a{color:var(--accent);font-weight:600;text-decoration:none;transition:opacity var(--transition)}
        .reg-login-cta a:hover{opacity:.75}

        /* Responsive */
        @media(max-width:860px){
          .reg-page{grid-template-columns:1fr}
          .reg-left{display:none}
          .reg-right{min-height:100vh;padding:48px 24px}
        }
      `}</style>

      <div className="reg-page">

        {/* ── LEFT ── */}
        <aside className="reg-left">
          <div className="rl-inner">
            <a href="/" className="rl-brand" onClick={(e) => nav(e, '/')}>
              E-ArchiPlans<span>Plans certifiés</span>
            </a>
            <p className="rl-eyebrow">Nouveau compte</p>
            <h1 className="rl-h1">Rejoignez<br /><em>la plateforme.</em></h1>
            <p className="rl-lead">
              Accédez à des centaines de plans d'architecte certifiés et téléchargez-les en quelques clics.
            </p>
            <div className="rl-perks">
              {[
                { icon: 'bi-grid-3x3-gap', text: 'Catalogue de 500+ plans disponibles' },
                { icon: 'bi-download', text: 'Téléchargement immédiat après paiement' },
                { icon: 'bi-headset', text: 'Support dédié à chaque étape' },
              ].map((p) => (
                <div className="rl-perk" key={p.text}>
                  <div className="rl-perk-icon"><i className={`bi ${p.icon}`} aria-hidden="true" /></div>
                  <span>{p.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rl-bottom">
            <p className="rl-trust"><i className="bi bi-shield-lock-fill" /> Inscription sécurisée — RGPD conforme</p>
          </div>
        </aside>

        {/* ── RIGHT ── */}
        <section className="reg-right">
          <div className="reg-box">

            {/* Step indicator */}
            <div className="step-indicator" aria-label="Étapes d'inscription">
              {STEPS.map((label, i) => (
                <div className="step-item" key={label}>
                  <div className={`step-dot ${i < step ? 'is-done' : i === step ? 'is-active' : ''}`}
                    aria-current={i === step ? 'step' : undefined}
                  >
                    {i < step ? <i className="bi bi-check" aria-hidden="true" /> : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="step-line">
                      <div className="step-line-fill" style={{ width: i < step ? '100%' : '0%' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="reg-header">
              <h2 className="reg-title">
                {step === 0 && 'Votre identité'}
                {step === 1 && 'Sécurisez votre accès'}
                {step === 2 && 'Confirmation'}
              </h2>
              <p className="reg-sub">
                {step === 0 && 'Étape 1 sur 3 — Informations personnelles'}
                {step === 1 && 'Étape 2 sur 3 — Créez votre mot de passe'}
                {step === 2 && 'Étape 3 sur 3 — Vérifiez et créez votre compte'}
              </p>
            </div>

            <form className="reg-form" onSubmit={handleSubmit} noValidate>

              {/* ── STEP 0: identity ── */}
              {step === 0 && <>
                <div className={`rf-field ${err('name') ? 'has-error' : touched.name && validation.name ? 'is-valid' : ''}`}>
                  <label className="rf-label" htmlFor="reg_name">Nom complet</label>
                  <div className="rf-wrap">
                    <input className="rf-input" id="reg_name" name="name" type="text"
                      value={form.name} onChange={handleChange} onBlur={handleBlur}
                      placeholder="Ama Kossi" autoComplete="name" />
                    <i className="bi bi-person rf-icon" aria-hidden="true" />
                    {touched.name && validation.name && <i className="bi bi-check-circle-fill rf-check" aria-hidden="true" />}
                  </div>
                  {err('name') && <span className="rf-error">Veuillez entrer votre nom complet.</span>}
                </div>

                <div className={`rf-field ${err('email') ? 'has-error' : touched.email && validation.email ? 'is-valid' : ''}`}>
                  <label className="rf-label" htmlFor="reg_email">Adresse email</label>
                  <div className="rf-wrap">
                    <input className="rf-input" id="reg_email" name="email" type="email"
                      value={form.email} onChange={handleChange} onBlur={handleBlur}
                      placeholder="votre@email.com" autoComplete="email" />
                    <i className="bi bi-envelope rf-icon" aria-hidden="true" />
                    {touched.email && validation.email && <i className="bi bi-check-circle-fill rf-check" aria-hidden="true" />}
                  </div>
                  {err('email') && <span className="rf-error">Adresse email invalide.</span>}
                </div>
              </>}

              {/* ── STEP 1: password ── */}
              {step === 1 && <>
                <div className={`rf-field ${err('password') ? 'has-error' : ''}`}>
                  <label className="rf-label" htmlFor="reg_pwd">Mot de passe</label>
                  <div className="rf-wrap">
                    <input className="rf-input" id="reg_pwd" name="password"
                      type={showPwd ? 'text' : 'password'}
                      value={form.password} onChange={handleChange} onBlur={handleBlur}
                      placeholder="6 caractères minimum" autoComplete="new-password" />
                    <i className="bi bi-lock rf-icon" aria-hidden="true" />
                    <button type="button" className="rf-pwd-toggle"
                      onClick={() => setShowPwd((p) => !p)}
                      aria-label={showPwd ? 'Masquer' : 'Afficher'}>
                      <i className={`bi bi-eye${showPwd ? '-slash' : ''}`} aria-hidden="true" />
                    </button>
                  </div>
                  <PasswordStrength password={form.password} />
                  {err('password') && <span className="rf-error">6 caractères minimum.</span>}
                </div>

                <div className={`rf-field ${err('password_confirmation') ? 'has-error' : touched.password_confirmation && validation.password_confirmation ? 'is-valid' : ''}`}>
                  <label className="rf-label" htmlFor="reg_confirm">Confirmation</label>
                  <div className="rf-wrap">
                    <input className="rf-input" id="reg_confirm" name="password_confirmation"
                      type={showConfirm ? 'text' : 'password'}
                      value={form.password_confirmation} onChange={handleChange} onBlur={handleBlur}
                      placeholder="Répétez votre mot de passe" autoComplete="new-password" />
                    <i className="bi bi-lock-fill rf-icon" aria-hidden="true" />
                    {touched.password_confirmation && validation.password_confirmation
                      ? <i className="bi bi-check-circle-fill rf-check" aria-hidden="true" />
                      : <button type="button" className="rf-pwd-toggle"
                          onClick={() => setShowConfirm((p) => !p)}
                          aria-label={showConfirm ? 'Masquer' : 'Afficher'}>
                          <i className={`bi bi-eye${showConfirm ? '-slash' : ''}`} aria-hidden="true" />
                        </button>
                    }
                  </div>
                  {err('password_confirmation') && <span className="rf-error">Les mots de passe ne correspondent pas.</span>}
                </div>
              </>}

              {/* ── STEP 2: review ── */}
              {step === 2 && <>
                <div className="reg-summary">
                  {[
                    { icon: 'bi-person', label: 'Nom', val: form.name },
                    { icon: 'bi-envelope', label: 'Email', val: form.email },
                    { icon: 'bi-lock', label: 'Mot de passe', val: '•'.repeat(Math.min(form.password.length, 10)) },
                  ].map((row) => (
                    <div className="reg-summary-row" key={row.label}>
                      <div className="reg-summary-icon">
                        <i className={`bi ${row.icon}`} aria-hidden="true" />
                      </div>
                      <div>
                        <span className="reg-summary-val">{row.val}</span>
                        <span className="reg-summary-sub">{row.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {status === 'success' && (
                  <div className="rf-feedback success" role="status">
                    <i className="bi bi-check-circle-fill" aria-hidden="true" /> {feedback}
                  </div>
                )}
                {status === 'error' && (
                  <div className="rf-feedback error" role="alert">
                    <i className="bi bi-exclamation-circle-fill" aria-hidden="true" /> {feedback}
                  </div>
                )}
              </>}

              {/* Navigation */}
              <div className="reg-nav">
                {step > 0 && (
                  <button type="button" className="btn-back" onClick={prevStep}>
                    <i className="bi bi-arrow-left" aria-hidden="true" /> Retour
                  </button>
                )}
                {step < 2 ? (
                  <button type="button" className="btn-next"
                    disabled={!stepValid[step]}
                    onClick={nextStep}>
                    Continuer <i className="bi bi-arrow-right" aria-hidden="true" />
                  </button>
                ) : (
                  <button type="submit"
                    className={`btn-next ${status === 'sending' ? 'is-sending' : ''} ${status === 'success' ? 'is-success' : ''}`}
                    disabled={status === 'sending' || status === 'success'}>
                    {status === 'sending' && <><span className="rf-spinner" aria-hidden="true" /> Création…</>}
                    {status === 'success' && <><i className="bi bi-check-lg" aria-hidden="true" /> Compte créé !</>}
                    {(status === 'idle' || status === 'error') && <><i className="bi bi-person-badge" aria-hidden="true" /> Créer mon compte</>}
                  </button>
                )}
              </div>

              {step === 0 && (
                <p className="reg-login-cta">
                  Déjà inscrit ?{' '}
                  <a href="/login" onClick={(e) => nav(e, '/login')}>Se connecter →</a>
                </p>
              )}
            </form>
          </div>
        </section>
      </div>
    </>
  )
}
