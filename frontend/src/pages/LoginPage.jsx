import { useState, useMemo } from 'react'
import { loginUser } from '../api/auth'

export default function LoginPage({ onAuthSuccess, onNavigate }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [feedback, setFeedback] = useState('')
  const [touched, setTouched] = useState({})

  const validation = useMemo(() => ({
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    password: form.password.length >= 6,
  }), [form])

  const canSubmit = validation.email && validation.password

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }
  function handleBlur(e) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }
  const err = (f) => touched[f] && !validation[f]

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setStatus('sending')
    setFeedback('')
    const result = await loginUser(form)
    if (result.ok) {
      setStatus('success')
      setFeedback(result.message)
      setForm({ email: '', password: '' })
      setTimeout(() => onAuthSuccess?.(result.user ?? null), 800)
    } else {
      setStatus('error')
      setFeedback(result.message)
    }
  }

  function nav(e, path) { e.preventDefault(); onNavigate?.(e, path) }

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
          --shadow-card:0 2px 8px rgba(26,22,20,0.06),0 16px 48px rgba(26,22,20,0.08);
          --radius:16px;--radius-sm:10px;--radius-pill:999px;
          --transition:200ms cubic-bezier(.4,0,.2,1);
          --font-display:'Playfair Display',Georgia,serif;
          --font-body:'DM Sans',system-ui,sans-serif;
        }
        body{background:var(--sand);font-family:var(--font-body);color:var(--ink)}

        .login-page{
          min-height:100vh;display:grid;
          grid-template-columns:1fr 1fr;
        }

        /* ── LEFT ── */
        .login-left{
          background:var(--ink);
          position:relative;overflow:hidden;
          display:flex;flex-direction:column;
          justify-content:space-between;padding:64px 56px;
          min-height:100vh;
        }
        .login-left::before{
          content:'';position:absolute;inset:0;
          background:
            radial-gradient(ellipse 65% 70% at 85% 30%,rgba(201,125,78,.18) 0%,transparent 65%),
            radial-gradient(ellipse 40% 50% at 15% 85%,rgba(201,125,78,.10) 0%,transparent 65%);
          pointer-events:none;
        }
        .login-left::after{
          content:'';position:absolute;inset:0;
          background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
          background-size:52px 52px;pointer-events:none;
        }
        .ll-top{position:relative;z-index:1}
        .ll-brand{
          font-family:var(--font-display);font-size:1.4rem;font-weight:500;
          color:var(--white);text-decoration:none;letter-spacing:-.02em;
          display:inline-block;margin-bottom:64px;
        }
        .ll-brand span{
          display:block;font-family:var(--font-body);font-size:.58rem;
          font-weight:600;letter-spacing:.18em;text-transform:uppercase;
          color:var(--accent);margin-top:3px;
        }
        .ll-eyebrow{
          display:inline-flex;align-items:center;gap:8px;
          font-size:.68rem;font-weight:600;letter-spacing:.18em;
          text-transform:uppercase;color:var(--accent);margin-bottom:20px;
        }
        .ll-eyebrow::before{content:'';display:block;width:20px;height:1px;background:var(--accent)}
        .ll-h1{
          font-family:var(--font-display);
          font-size:clamp(2rem,3.5vw,3rem);
          font-weight:500;color:var(--white);
          line-height:1.1;letter-spacing:-.025em;margin-bottom:16px;
        }
        .ll-h1 em{font-style:italic;color:var(--accent)}
        .ll-lead{
          font-size:.95rem;font-weight:300;
          color:rgba(255,255,255,.48);line-height:1.75;max-width:340px;
        }

        /* Feature list */
        .ll-features{
          position:relative;z-index:1;
          display:flex;flex-direction:column;gap:0;margin-top:48px;
        }
        .ll-feature{
          display:flex;align-items:center;gap:14px;
          padding:16px 0;border-top:1px solid rgba(255,255,255,.07);
        }
        .ll-feature:last-child{border-bottom:1px solid rgba(255,255,255,.07)}
        .ll-feature-icon{
          width:36px;height:36px;flex-shrink:0;border-radius:10px;
          background:rgba(201,125,78,.14);border:1px solid rgba(201,125,78,.22);
          display:flex;align-items:center;justify-content:center;
          font-size:.9rem;color:var(--accent);
        }
        .ll-feature span{font-size:.825rem;font-weight:300;color:rgba(255,255,255,.45)}

        .ll-bottom{
          position:relative;z-index:1;
          display:flex;align-items:center;gap:8px;
          font-size:.72rem;color:rgba(255,255,255,.28);
        }
        .ll-bottom i{color:#4ade80;font-size:.9rem}

        /* ── RIGHT ── */
        .login-right{
          background:var(--sand);
          display:flex;align-items:center;justify-content:center;
          padding:64px 56px;
        }
        .login-box{width:100%;max-width:420px}

        .login-box-header{margin-bottom:36px}
        .login-box-title{
          font-family:var(--font-display);font-size:1.75rem;font-weight:500;
          color:var(--ink);letter-spacing:-.02em;margin-bottom:6px;
        }
        .login-box-sub{font-size:.875rem;font-weight:300;color:var(--ink-muted)}

        /* ── FORM ── */
        .login-form{display:flex;flex-direction:column;gap:18px}

        .lf-field{display:flex;flex-direction:column;gap:6px}
        .lf-label{
          font-size:.72rem;font-weight:700;
          letter-spacing:.08em;text-transform:uppercase;color:var(--ink-soft);
        }
        .lf-wrap{position:relative}
        .lf-wrap .lf-icon{
          position:absolute;left:14px;top:50%;transform:translateY(-50%);
          font-size:.9rem;color:var(--ink-muted);pointer-events:none;
          transition:color var(--transition);
        }
        .lf-wrap:focus-within .lf-icon{color:var(--accent)}
        .lf-input{
          width:100%;height:50px;padding:0 42px;
          background:var(--white);border:1.5px solid var(--border);
          border-radius:var(--radius-sm);
          font-family:var(--font-body);font-size:.875rem;color:var(--ink);
          outline:none;appearance:none;
          transition:border-color var(--transition),box-shadow var(--transition);
        }
        .lf-input::placeholder{color:#c0b5ae}
        .lf-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-light)}
        .lf-field.has-error .lf-input{border-color:var(--red);box-shadow:0 0 0 3px var(--red-bg)}
        .lf-field.has-error .lf-icon{color:var(--red)}
        .lf-error{font-size:.72rem;color:var(--red);font-weight:500}

        /* Password toggle */
        .lf-pwd-toggle{
          position:absolute;right:12px;top:50%;transform:translateY(-50%);
          width:28px;height:28px;border-radius:6px;border:none;
          background:transparent;color:var(--ink-muted);
          cursor:pointer;display:flex;align-items:center;justify-content:center;
          font-size:.9rem;transition:color var(--transition);
        }
        .lf-pwd-toggle:hover{color:var(--ink)}

        /* Forgot */
        .lf-forgot-row{
          display:flex;justify-content:flex-end;margin-top:-6px;
        }
        .lf-forgot{
          font-size:.78rem;font-weight:500;color:var(--accent);
          text-decoration:none;transition:opacity var(--transition);
        }
        .lf-forgot:hover{opacity:.75}

        /* Submit */
        .lf-submit{
          width:100%;height:52px;border-radius:var(--radius-pill);
          border:none;background:var(--ink);color:var(--white);
          font-family:var(--font-body);font-size:.9rem;font-weight:600;
          cursor:pointer;letter-spacing:.02em;margin-top:4px;
          display:flex;align-items:center;justify-content:center;gap:8px;
          transition:all var(--transition);
        }
        .lf-submit:hover:not(:disabled){background:var(--accent);transform:translateY(-1px);box-shadow:0 6px 20px rgba(201,125,78,.35)}
        .lf-submit:disabled{opacity:.45;cursor:not-allowed;transform:none}
        .lf-submit.is-sending{background:var(--ink-soft)}
        .lf-submit.is-success{background:var(--green)}
        .lf-spinner{
          width:16px;height:16px;border-radius:50%;
          border:2px solid rgba(255,255,255,.3);border-top-color:var(--white);
          animation:spin .7s linear infinite;flex-shrink:0;
        }
        @keyframes spin{to{transform:rotate(360deg)}}

        /* Feedback */
        .lf-feedback{
          display:flex;align-items:flex-start;gap:10px;
          padding:12px 14px;border-radius:var(--radius-sm);
          font-size:.825rem;font-weight:400;line-height:1.5;
          animation:fbIn .3s ease;
        }
        @keyframes fbIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
        .lf-feedback.success{background:var(--green-bg);color:var(--green);border:1px solid rgba(45,122,79,.2)}
        .lf-feedback.error{background:var(--red-bg);color:var(--red);border:1px solid rgba(192,57,43,.2)}
        .lf-feedback i{font-size:1rem;flex-shrink:0;margin-top:1px}

        /* Divider */
        .lf-divider{
          display:flex;align-items:center;gap:12px;margin:4px 0;
        }
        .lf-divider::before,.lf-divider::after{
          content:'';flex:1;height:1px;background:var(--border);
        }
        .lf-divider span{font-size:.7rem;color:var(--ink-muted);white-space:nowrap}

        /* Register CTA */
        .lf-register{
          text-align:center;font-size:.825rem;color:var(--ink-muted);font-weight:300;
        }
        .lf-register a{
          color:var(--accent);font-weight:600;text-decoration:none;
          transition:opacity var(--transition);
        }
        .lf-register a:hover{opacity:.75}

        /* ── RESPONSIVE ── */
        @media(max-width:860px){
          .login-page{grid-template-columns:1fr}
          .login-left{display:none}
          .login-right{min-height:100vh;padding:48px 24px}
        }
      `}</style>

      <div className="login-page">

        {/* ── LEFT ── */}
        <aside className="login-left">
          <div className="ll-top">
            <a href="/" className="ll-brand" onClick={(e) => nav(e, '/')}>
              E-ArchiPlans
              <span>Plans certifiés</span>
            </a>
            <p className="ll-eyebrow">Votre espace</p>
            <h1 className="ll-h1">
              Bienvenue<br /><em>de retour.</em>
            </h1>
            <p className="ll-lead">
              Accédez à vos plans, suivez vos commandes et gérez votre profil en toute simplicité.
            </p>

            <div className="ll-features">
              {[
                { icon: 'bi-grid-3x3-gap', text: 'Accédez à tous vos plans téléchargés' },
                { icon: 'bi-receipt', text: 'Consultez l\'historique de vos commandes' },
                { icon: 'bi-person-gear', text: 'Gérez votre profil et vos préférences' },
              ].map((f) => (
                <div className="ll-feature" key={f.text}>
                  <div className="ll-feature-icon">
                    <i className={`bi ${f.icon}`} aria-hidden="true" />
                  </div>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ll-bottom">
            <i className="bi bi-shield-lock-fill" aria-hidden="true" />
            Connexion sécurisée — vos données sont protégées
          </div>
        </aside>

        {/* ── RIGHT ── */}
        <section className="login-right">
          <div className="login-box">

            <div className="login-box-header">
              <h2 className="login-box-title">Connexion</h2>
              <p className="login-box-sub">Entrez vos identifiants pour accéder à votre espace.</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit} noValidate>

              {/* Email */}
              <div className={`lf-field ${err('email') ? 'has-error' : ''}`}>
                <label className="lf-label" htmlFor="login_email">Adresse email</label>
                <div className="lf-wrap">
                  <input
                    className="lf-input"
                    id="login_email" name="email" type="email"
                    value={form.email} onChange={handleChange} onBlur={handleBlur}
                    placeholder="votre@email.com" autoComplete="email"
                    aria-describedby={err('email') ? 'email-err' : undefined}
                  />
                  <i className="bi bi-envelope lf-icon" aria-hidden="true" />
                </div>
                {err('email') && <span className="lf-error" id="email-err">Adresse email invalide.</span>}
              </div>

              {/* Password */}
              <div className={`lf-field ${err('password') ? 'has-error' : ''}`}>
                <label className="lf-label" htmlFor="login_password">Mot de passe</label>
                <div className="lf-wrap">
                  <input
                    className="lf-input"
                    id="login_password" name="password"
                    type={showPwd ? 'text' : 'password'}
                    value={form.password} onChange={handleChange} onBlur={handleBlur}
                    placeholder="6 caractères minimum" autoComplete="current-password"
                    aria-describedby={err('password') ? 'pwd-err' : undefined}
                  />
                  <i className="bi bi-lock lf-icon" aria-hidden="true" />
                  <button
                    type="button"
                    className="lf-pwd-toggle"
                    onClick={() => setShowPwd((p) => !p)}
                    aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    <i className={`bi bi-eye${showPwd ? '-slash' : ''}`} aria-hidden="true" />
                  </button>
                </div>
                {err('password') && <span className="lf-error" id="pwd-err">6 caractères minimum.</span>}
              </div>

              {/* Forgot */}
              <div className="lf-forgot-row">
                <a href="/mot-de-passe-oublie" className="lf-forgot" onClick={(e) => nav(e, '/mot-de-passe-oublie')}>
                  Mot de passe oublié ?
                </a>
              </div>

              {/* Feedback */}
              {status === 'success' && (
                <div className="lf-feedback success" role="status">
                  <i className="bi bi-check-circle-fill" aria-hidden="true" />
                  {feedback}
                </div>
              )}
              {status === 'error' && (
                <div className="lf-feedback error" role="alert">
                  <i className="bi bi-exclamation-circle-fill" aria-hidden="true" />
                  {feedback}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className={`lf-submit ${status === 'sending' ? 'is-sending' : ''} ${status === 'success' ? 'is-success' : ''}`}
                disabled={!canSubmit || status === 'sending' || status === 'success'}
                aria-busy={status === 'sending'}
              >
                {status === 'sending' && <><span className="lf-spinner" aria-hidden="true" /> Connexion…</>}
                {status === 'success' && <><i className="bi bi-check-lg" aria-hidden="true" /> Connecté !</>}
                {(status === 'idle' || status === 'error') && <><i className="bi bi-box-arrow-in-right" aria-hidden="true" /> Se connecter</>}
              </button>

              {/* Divider */}
              <div className="lf-divider"><span>Pas encore de compte ?</span></div>

              {/* Register */}
              <p className="lf-register">
                <a href="/register" onClick={(e) => nav(e, '/register')}>
                  Créer un compte gratuitement →
                </a>
              </p>

            </form>
          </div>
        </section>
      </div>
    </>
  )
}
