import { useEffect, useState, useMemo } from 'react'
import { fetchCurrentUser, updateCurrentUser } from '../api/auth'
import { getStoredUser } from '../utils/authToken'

function getRoleLabel(role) {
  if (role === 'admin') return 'Administrateur'
  if (role === 'seller') return 'Vendeur'
  if (role === 'buyer') return 'Acheteur'
  return role ?? ''
}
function getRoleIcon(role) {
  if (role === 'admin') return 'bi-shield-fill'
  if (role === 'seller') return 'bi-shop'
  return 'bi-person-fill'
}

export default function ProfilePage({ onNavigate }) {
  const [user, setUser] = useState(getStoredUser())
  const [loadStatus, setLoadStatus] = useState('loading')
  const [saveStatus, setSaveStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [touched, setTouched] = useState({})
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState('info') // 'info' | 'security'

  const [form, setForm] = useState({
    name: getStoredUser()?.name ?? '',
    email: getStoredUser()?.email ?? '',
    password: '',
    password_confirmation: '',
  })

  useEffect(() => {
    let mounted = true
    fetchCurrentUser().then((result) => {
      if (!mounted) return
      if (result.ok) {
        setUser(result.user)
        setForm((p) => ({ ...p, name: result.user.name ?? '', email: result.user.email ?? '' }))
        setLoadStatus('success')
      } else {
        setLoadStatus('error')
      }
    })
    return () => { mounted = false }
  }, [])

  const validation = useMemo(() => ({
    name: form.name.trim().length > 1,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    password: !form.password || form.password.length >= 6,
    password_confirmation: !form.password || form.password_confirmation === form.password,
  }), [form])

  const canSave = validation.name && validation.email && validation.password && validation.password_confirmation

  function handleChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    setMessage(''); setError('')
  }
  function handleBlur(e) { setTouched((p) => ({ ...p, [e.target.name]: true })) }
  const err = (f) => touched[f] && !validation[f]

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSave) return
    setSaveStatus('saving')
    setMessage(''); setError('')
    const payload = { name: form.name, email: form.email }
    if (form.password) { payload.password = form.password; payload.password_confirmation = form.password_confirmation }
    const result = await updateCurrentUser(payload)
    if (!result.ok) { setError(result.message); setSaveStatus('idle'); return }
    setUser((p) => ({ ...p, ...result.user }))
    setForm((p) => ({ ...p, password: '', password_confirmation: '' }))
    setTouched({})
    setMessage(result.message)
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2500)
  }

  function nav(e, path) { e?.preventDefault?.(); onNavigate?.(e, path) }

  const initials = (user?.name ?? 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  // ── Error / loading states ──
  if (loadStatus === 'loading') {
    return (
      <>
        <style>{baseStyles}</style>
        <div className="profile-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div className="skeleton-avatar" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <div className="skeleton-line" style={{ width: '160px' }} />
              <div className="skeleton-line" style={{ width: '100px', opacity: .6 }} />
            </div>
          </div>
        </div>
      </>
    )
  }

  if (loadStatus === 'error' && !user) {
    return (
      <>
        <style>{baseStyles}</style>
        <div className="profile-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            background: 'var(--white)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '56px 44px', textAlign: 'center',
            maxWidth: '400px', width: '100%',
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '18px',
              background: '#fdecea', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', color: '#c0392b', margin: '0 auto 20px',
            }}>
              <i className="bi bi-lock" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 500, marginBottom: '10px', letterSpacing: '-.02em' }}>Session requise</h2>
            <p style={{ fontSize: '.875rem', color: 'var(--ink-muted)', fontWeight: 300, lineHeight: 1.7, marginBottom: '28px' }}>
              Connectez-vous pour accéder à votre profil et gérer vos informations.
            </p>
            <button style={{
              height: '48px', padding: '0 28px', borderRadius: 'var(--radius-pill)',
              border: 'none', background: 'var(--ink)', color: 'var(--white)',
              fontFamily: 'var(--font-body)', fontSize: '.875rem', fontWeight: 600,
              cursor: 'pointer',
            }} onClick={(e) => nav(e, '/login')}>
              Se connecter
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{baseStyles}</style>
      <div className="profile-page">

        {/* ── SIDEBAR ── */}
        <aside className="profile-sidebar">
          <div className="sidebar-sticky">

            {/* Avatar */}
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">{initials}</div>
              <div className="avatar-status" aria-hidden="true" />
            </div>

            <div className="profile-identity">
              <h2 className="profile-name">{user?.name ?? '—'}</h2>
              <span className="profile-email">{user?.email ?? '—'}</span>
              <div className="profile-role-badge">
                <i className={`bi ${getRoleIcon(user?.role)}`} aria-hidden="true" />
                {getRoleLabel(user?.role)}
              </div>
            </div>

            {/* Stats */}
            <div className="profile-stats">
              <div className="profile-stat">
                <strong>#{user?.id ?? '—'}</strong>
                <span>ID compte</span>
              </div>
              <div className="profile-stat-divider" />
              <div className="profile-stat">
                <strong>0</strong>
                <span>Commandes</span>
              </div>
              <div className="profile-stat-divider" />
              <div className="profile-stat">
                <strong>0</strong>
                <span>Plans</span>
              </div>
            </div>

            {/* Nav */}
            <nav className="profile-nav" aria-label="Navigation du profil">
              {[
                { id: 'info', icon: 'bi-person', label: 'Informations' },
                { id: 'security', icon: 'bi-lock', label: 'Sécurité' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`profile-nav-item ${activeTab === tab.id ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  <i className={`bi ${tab.icon}`} aria-hidden="true" />
                  {tab.label}
                </button>
              ))}

              {(user?.role === 'seller' || user?.role === 'admin') && (
                <button
                  type="button"
                  className="profile-nav-item profile-nav-item--accent"
                  onClick={(e) => nav(e, '/dashboard')}
                >
                  <i className="bi bi-speedometer2" aria-hidden="true" />
                  Mon dashboard
                </button>
              )}
            </nav>

            <button
              type="button"
              className="profile-logout-btn"
              onClick={(e) => nav(e, '/logout')}
            >
              <i className="bi bi-box-arrow-right" aria-hidden="true" />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="profile-main">

          {/* Header */}
          <div className="profile-main-header">
            <div>
              <p className="pm-eyebrow">
                {activeTab === 'info' ? 'Informations personnelles' : 'Sécurité du compte'}
              </p>
              <h1 className="pm-title">
                {activeTab === 'info' ? <>Mon <em>profil</em></> : <>Mot de <em>passe</em></>}
              </h1>
            </div>
          </div>

          <form className="profile-form" onSubmit={handleSubmit} noValidate>

            {/* ── TAB: info ── */}
            {activeTab === 'info' && (
              <div className="profile-card" aria-label="Informations personnelles">
                <div className="card-section-title">Identité</div>

                <div className="pf-field-row">
                  <div className={`pf-field ${err('name') ? 'has-error' : touched.name && validation.name ? 'is-valid' : ''}`}>
                    <label className="pf-label" htmlFor="pf-name">Nom complet</label>
                    <div className="pf-wrap">
                      <input className="pf-input" id="pf-name" name="name" type="text"
                        value={form.name} onChange={handleChange} onBlur={handleBlur}
                        autoComplete="name" />
                      <i className="bi bi-person pf-icon" aria-hidden="true" />
                      {touched.name && validation.name && <i className="bi bi-check-circle-fill pf-check" aria-hidden="true" />}
                    </div>
                    {err('name') && <span className="pf-error">Nom requis.</span>}
                  </div>

                  <div className={`pf-field ${err('email') ? 'has-error' : touched.email && validation.email ? 'is-valid' : ''}`}>
                    <label className="pf-label" htmlFor="pf-email">Adresse email</label>
                    <div className="pf-wrap">
                      <input className="pf-input" id="pf-email" name="email" type="email"
                        value={form.email} onChange={handleChange} onBlur={handleBlur}
                        autoComplete="email" />
                      <i className="bi bi-envelope pf-icon" aria-hidden="true" />
                      {touched.email && validation.email && <i className="bi bi-check-circle-fill pf-check" aria-hidden="true" />}
                    </div>
                    {err('email') && <span className="pf-error">Email invalide.</span>}
                  </div>
                </div>

                <div className="card-section-title" style={{ marginTop: '24px' }}>Compte</div>
                <div className="profile-meta-list">
                  {[
                    { icon: 'bi-hash', label: 'Identifiant', value: `#${user?.id ?? '—'}` },
                    { icon: 'bi-person-badge', label: 'Rôle', value: getRoleLabel(user?.role) },
                  ].map((item) => (
                    <div className="meta-item" key={item.label}>
                      <div className="meta-icon"><i className={`bi ${item.icon}`} aria-hidden="true" /></div>
                      <div>
                        <span className="meta-label">{item.label}</span>
                        <span className="meta-value">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB: security ── */}
            {activeTab === 'security' && (
              <div className="profile-card" aria-label="Sécurité du compte">
                <div className="card-section-title">Modifier le mot de passe</div>
                <p className="card-section-sub">Laissez vide pour conserver votre mot de passe actuel.</p>

                <div className={`pf-field ${err('password') ? 'has-error' : ''}`} style={{ marginTop: '20px' }}>
                  <label className="pf-label" htmlFor="pf-pwd">Nouveau mot de passe</label>
                  <div className="pf-wrap">
                    <input className="pf-input" id="pf-pwd" name="password"
                      type={showPwd ? 'text' : 'password'}
                      value={form.password} onChange={handleChange} onBlur={handleBlur}
                      placeholder="6 caractères minimum" autoComplete="new-password" />
                    <i className="bi bi-lock pf-icon" aria-hidden="true" />
                    <button type="button" className="pf-toggle"
                      onClick={() => setShowPwd((p) => !p)}
                      aria-label={showPwd ? 'Masquer' : 'Afficher'}>
                      <i className={`bi bi-eye${showPwd ? '-slash' : ''}`} aria-hidden="true" />
                    </button>
                  </div>
                  {err('password') && <span className="pf-error">6 caractères minimum.</span>}
                </div>

                <div className={`pf-field ${err('password_confirmation') ? 'has-error' : touched.password_confirmation && validation.password_confirmation && form.password ? 'is-valid' : ''}`} style={{ marginTop: '16px' }}>
                  <label className="pf-label" htmlFor="pf-confirm">Confirmation</label>
                  <div className="pf-wrap">
                    <input className="pf-input" id="pf-confirm" name="password_confirmation"
                      type={showConfirm ? 'text' : 'password'}
                      value={form.password_confirmation} onChange={handleChange} onBlur={handleBlur}
                      placeholder="Répétez le mot de passe" autoComplete="new-password" />
                    <i className="bi bi-lock-fill pf-icon" aria-hidden="true" />
                    {touched.password_confirmation && validation.password_confirmation && form.password
                      ? <i className="bi bi-check-circle-fill pf-check" aria-hidden="true" />
                      : <button type="button" className="pf-toggle"
                          onClick={() => setShowConfirm((p) => !p)}
                          aria-label={showConfirm ? 'Masquer' : 'Afficher'}>
                          <i className={`bi bi-eye${showConfirm ? '-slash' : ''}`} aria-hidden="true" />
                        </button>}
                  </div>
                  {err('password_confirmation') && <span className="pf-error">Les mots de passe ne correspondent pas.</span>}
                </div>

                {/* Security tips */}
                <div className="security-tips">
                  {[
                    'Utilisez au moins 8 caractères',
                    'Mélangez majuscules et chiffres',
                    'Évitez les mots courants',
                  ].map((tip) => (
                    <div className="security-tip" key={tip}>
                      <i className="bi bi-dot" aria-hidden="true" />
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {message && (
              <div className="pf-feedback success" role="status">
                <i className="bi bi-check-circle-fill" aria-hidden="true" /> {message}
              </div>
            )}
            {error && (
              <div className="pf-feedback error" role="alert">
                <i className="bi bi-exclamation-circle-fill" aria-hidden="true" /> {error}
              </div>
            )}

            {/* Submit */}
            <div className="pf-submit-row">
              <button
                type="submit"
                className={`pf-submit ${saveStatus === 'saving' ? 'is-saving' : ''} ${saveStatus === 'saved' ? 'is-saved' : ''}`}
                disabled={!canSave || saveStatus === 'saving' || saveStatus === 'saved'}
                aria-busy={saveStatus === 'saving'}
              >
                {saveStatus === 'saving' && <><span className="pf-spinner" aria-hidden="true" /> Enregistrement…</>}
                {saveStatus === 'saved' && <><i className="bi bi-check-lg" aria-hidden="true" /> Enregistré !</>}
                {(saveStatus === 'idle') && <><i className="bi bi-floppy" aria-hidden="true" /> Enregistrer les modifications</>}
              </button>
              <p className="pf-save-note"><i className="bi bi-shield-check" /> Modifications sécurisées</p>
            </div>
          </form>
        </main>
      </div>
    </>
  )
}

const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Playfair+Display:ital,wght@0,500;1,500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --sand:#f5efe6;--sand-mid:#ede4d6;--sand-dark:#e0d4c2;
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

  /* ── PAGE LAYOUT ── */
  .profile-page{
    min-height:100vh;display:grid;
    grid-template-columns:280px 1fr;
    align-items:start;
    max-width:1100px;margin:0 auto;
    padding:48px 40px 80px;gap:32px;
  }

  /* ── SIDEBAR ── */
  .profile-sidebar{position:relative}
  .sidebar-sticky{
    position:sticky;top:88px;
    display:flex;flex-direction:column;gap:0;
  }
  .profile-avatar-wrap{
    position:relative;width:fit-content;margin-bottom:20px;
  }
  .profile-avatar{
    width:72px;height:72px;border-radius:22px;
    background:var(--ink);color:var(--white);
    display:flex;align-items:center;justify-content:center;
    font-family:var(--font-display);font-size:1.5rem;font-weight:500;
    letter-spacing:-.02em;
  }
  .avatar-status{
    position:absolute;bottom:4px;right:4px;
    width:12px;height:12px;border-radius:50%;
    background:#4ade80;border:2px solid var(--sand);
  }

  .profile-identity{display:flex;flex-direction:column;gap:4px;margin-bottom:24px}
  .profile-name{
    font-family:var(--font-display);font-size:1.15rem;font-weight:500;
    color:var(--ink);letter-spacing:-.015em;
  }
  .profile-email{font-size:.78rem;color:var(--ink-muted);font-weight:300}
  .profile-role-badge{
    display:inline-flex;align-items:center;gap:5px;
    margin-top:6px;padding:4px 10px;
    background:var(--accent-light);border-radius:var(--radius-pill);
    font-size:.68rem;font-weight:700;letter-spacing:.06em;
    text-transform:uppercase;color:var(--accent);width:fit-content;
  }

  /* Stats row */
  .profile-stats{
    display:flex;align-items:center;
    background:var(--white);border:1px solid var(--border);
    border-radius:var(--radius-sm);padding:14px 16px;
    margin-bottom:20px;
  }
  .profile-stat{flex:1;text-align:center}
  .profile-stat strong{
    display:block;font-family:var(--font-display);font-size:1.1rem;
    font-weight:500;color:var(--ink);letter-spacing:-.02em;
  }
  .profile-stat span{font-size:.65rem;color:var(--ink-muted);font-weight:500;letter-spacing:.06em;text-transform:uppercase}
  .profile-stat-divider{width:1px;height:32px;background:var(--border);flex-shrink:0}

  /* Nav */
  .profile-nav{display:flex;flex-direction:column;gap:2px;margin-bottom:16px}
  .profile-nav-item{
    display:flex;align-items:center;gap:10px;
    width:100%;padding:10px 14px;
    border-radius:var(--radius-sm);border:none;
    background:transparent;
    font-family:var(--font-body);font-size:.875rem;font-weight:400;
    color:var(--ink-soft);cursor:pointer;text-align:left;
    transition:all var(--transition);
  }
  .profile-nav-item:hover{background:var(--sand-mid);color:var(--ink)}
  .profile-nav-item.is-active{background:var(--ink);color:var(--white);font-weight:500}
  .profile-nav-item--accent{color:var(--accent)}
  .profile-nav-item--accent:hover{background:var(--accent-light);color:var(--accent-dark)}

  .profile-logout-btn{
    display:flex;align-items:center;gap:8px;
    width:100%;padding:10px 14px;
    border-radius:var(--radius-sm);border:none;
    background:transparent;
    font-family:var(--font-body);font-size:.825rem;font-weight:400;
    color:var(--ink-muted);cursor:pointer;text-align:left;
    margin-top:4px;
    transition:all var(--transition);
  }
  .profile-logout-btn:hover{background:#fdecea;color:var(--red)}

  /* ── MAIN ── */
  .profile-main{display:flex;flex-direction:column;gap:20px}

  .profile-main-header{
    display:flex;align-items:flex-end;justify-content:space-between;
    padding-bottom:20px;border-bottom:1px solid var(--border);
    margin-bottom:4px;
  }
  .pm-eyebrow{
    font-size:.65rem;font-weight:700;letter-spacing:.18em;
    text-transform:uppercase;color:var(--accent);margin-bottom:6px;
  }
  .pm-title{
    font-family:var(--font-display);font-size:1.75rem;font-weight:500;
    color:var(--ink);letter-spacing:-.025em;
  }
  .pm-title em{font-style:italic}

  /* Card */
  .profile-card{
    background:var(--white);border:1px solid var(--border);
    border-radius:var(--radius);padding:32px;
    box-shadow:var(--shadow-card);
    animation:fadeUp .35s ease both;
  }
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

  .card-section-title{
    font-size:.68rem;font-weight:700;letter-spacing:.16em;
    text-transform:uppercase;color:var(--ink-muted);margin-bottom:16px;
  }
  .card-section-sub{font-size:.825rem;font-weight:300;color:var(--ink-muted);margin-top:-8px;margin-bottom:4px}

  /* Field row */
  .pf-field-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .pf-field{display:flex;flex-direction:column;gap:6px}
  .pf-label{
    font-size:.7rem;font-weight:700;letter-spacing:.08em;
    text-transform:uppercase;color:var(--ink-soft);
  }
  .pf-wrap{position:relative}
  .pf-icon{
    position:absolute;left:14px;top:50%;transform:translateY(-50%);
    font-size:.9rem;color:var(--ink-muted);pointer-events:none;
    transition:color var(--transition);
  }
  .pf-wrap:focus-within .pf-icon{color:var(--accent)}
  .pf-input{
    width:100%;height:48px;padding:0 40px;
    background:var(--sand);border:1.5px solid var(--border);
    border-radius:var(--radius-sm);
    font-family:var(--font-body);font-size:.875rem;color:var(--ink);
    outline:none;transition:border-color var(--transition),box-shadow var(--transition),background var(--transition);
  }
  .pf-input:focus{background:var(--white);border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-light)}
  .pf-field.has-error .pf-input{border-color:var(--red);box-shadow:0 0 0 3px var(--red-bg)}
  .pf-field.is-valid .pf-input{border-color:#2ecc71;box-shadow:0 0 0 3px rgba(46,204,113,.12)}
  .pf-field.has-error .pf-icon{color:var(--red)}
  .pf-error{font-size:.7rem;color:var(--red);font-weight:500}
  .pf-check{
    position:absolute;right:12px;top:50%;transform:translateY(-50%);
    font-size:.85rem;color:#2ecc71;pointer-events:none;
    animation:popIn .2s cubic-bezier(.22,1,.36,1);
  }
  @keyframes popIn{from{opacity:0;transform:translateY(-50%) scale(.4)}to{opacity:1;transform:translateY(-50%) scale(1)}}
  .pf-toggle{
    position:absolute;right:12px;top:50%;transform:translateY(-50%);
    width:28px;height:28px;border-radius:6px;border:none;
    background:transparent;color:var(--ink-muted);
    cursor:pointer;display:flex;align-items:center;justify-content:center;
    font-size:.9rem;transition:color var(--transition);
  }
  .pf-toggle:hover{color:var(--ink)}

  /* Meta list */
  .profile-meta-list{display:flex;flex-direction:column;gap:0}
  .meta-item{
    display:flex;align-items:center;gap:12px;
    padding:14px 0;border-bottom:1px solid var(--border);
  }
  .meta-item:last-child{border-bottom:none}
  .meta-icon{
    width:34px;height:34px;border-radius:10px;
    background:var(--sand);display:flex;align-items:center;justify-content:center;
    font-size:.85rem;color:var(--ink-soft);flex-shrink:0;
  }
  .meta-label{display:block;font-size:.68rem;color:var(--ink-muted);font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:2px}
  .meta-value{font-size:.875rem;font-weight:500;color:var(--ink)}

  /* Security tips */
  .security-tips{
    margin-top:20px;padding:16px;
    background:var(--sand);border-radius:var(--radius-sm);
    display:flex;flex-direction:column;gap:6px;
  }
  .security-tip{font-size:.78rem;color:var(--ink-muted);font-weight:300;display:flex;align-items:center;gap:2px}
  .security-tip i{color:var(--accent);font-size:1.1rem}

  /* Feedback */
  .pf-feedback{
    display:flex;align-items:flex-start;gap:10px;
    padding:12px 16px;border-radius:var(--radius-sm);
    font-size:.825rem;line-height:1.5;
    animation:fbIn .3s ease;
  }
  @keyframes fbIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
  .pf-feedback.success{background:var(--green-bg);color:var(--green);border:1px solid rgba(45,122,79,.2)}
  .pf-feedback.error{background:var(--red-bg);color:var(--red);border:1px solid rgba(192,57,43,.2)}
  .pf-feedback i{font-size:1rem;flex-shrink:0;margin-top:1px}

  /* Submit */
  .pf-submit-row{display:flex;align-items:center;gap:16px}
  .pf-submit{
    height:50px;padding:0 28px;border-radius:var(--radius-pill);
    border:none;background:var(--ink);color:var(--white);
    font-family:var(--font-body);font-size:.875rem;font-weight:600;
    cursor:pointer;display:flex;align-items:center;gap:8px;
    transition:all var(--transition);
  }
  .pf-submit:hover:not(:disabled){background:var(--accent);transform:translateY(-1px);box-shadow:0 6px 20px rgba(201,125,78,.35)}
  .pf-submit:disabled{opacity:.45;cursor:not-allowed;transform:none}
  .pf-submit.is-saving{background:var(--ink-soft)}
  .pf-submit.is-saved{background:var(--green)}
  .pf-spinner{
    width:15px;height:15px;border-radius:50%;
    border:2px solid rgba(255,255,255,.3);border-top-color:var(--white);
    animation:spin .7s linear infinite;flex-shrink:0;
  }
  @keyframes spin{to{transform:rotate(360deg)}}
  .pf-save-note{font-size:.72rem;color:var(--ink-muted);display:flex;align-items:center;gap:5px}
  .pf-save-note i{color:#4ade80}

  /* Skeletons */
  .skeleton-avatar{
    width:72px;height:72px;border-radius:22px;
    background:var(--sand-mid);
    animation:shimmer 1.5s ease infinite;
  }
  .skeleton-line{
    height:14px;border-radius:6px;
    background:var(--sand-mid);
    animation:shimmer 1.5s ease infinite;
  }
  @keyframes shimmer{
    0%,100%{opacity:.6}50%{opacity:1}
  }

  /* Responsive */
  @media(max-width:800px){
    .profile-page{grid-template-columns:1fr;padding:24px 20px 60px;gap:24px}
    .sidebar-sticky{position:static}
    .pf-field-row{grid-template-columns:1fr}
  }
`
