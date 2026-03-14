import { useState } from 'react'
import { logoutUser } from '../api/auth'

export default function LogoutPage({ onLoggedOut, onNavigate, user }) {
  const [status, setStatus] = useState('idle') // idle | sending | done

  function nav(e, path) { e?.preventDefault?.(); onNavigate?.(e, path) }

  async function handleLogout() {
    setStatus('sending')
    const result = await logoutUser()
    if (!result.ok) {
      setStatus('idle')
      return
    }
    setStatus('done')
    setTimeout(() => onLoggedOut?.(), 1200)
  }

  const firstName = user?.name?.split(' ')[0] ?? 'vous'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Playfair+Display:ital,wght@0,500;1,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --sand:#f5efe6;--sand-mid:#ede4d6;
          --ink:#1a1614;--ink-soft:#4a3f38;--ink-muted:#9a8f87;
          --accent:#c97d4e;--accent-light:#f0dcc8;
          --white:#ffffff;--border:rgba(26,22,20,0.09);
          --green:#2d7a4f;--green-bg:#e6f4ec;
          --font-display:'Playfair Display',Georgia,serif;
          --font-body:'DM Sans',system-ui,sans-serif;
          --transition:200ms cubic-bezier(.4,0,.2,1);
          --radius:16px;--radius-sm:10px;--radius-pill:999px;
        }
        body{background:var(--sand);font-family:var(--font-body);color:var(--ink);min-height:100vh}

        .logout-page{
          min-height:100vh;
          display:flex;align-items:center;justify-content:center;
          padding:40px 24px;
          position:relative;overflow:hidden;
        }
        /* Background texture */
        .logout-page::before{
          content:'';position:fixed;inset:0;
          background-image:linear-gradient(rgba(26,22,20,.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(26,22,20,.04) 1px,transparent 1px);
          background-size:48px 48px;pointer-events:none;z-index:0;
        }
        .logout-page::after{
          content:'';position:fixed;inset:0;
          background:
            radial-gradient(ellipse 60% 50% at 80% 20%,rgba(201,125,78,.08) 0%,transparent 60%),
            radial-gradient(ellipse 50% 60% at 20% 80%,rgba(201,125,78,.06) 0%,transparent 60%);
          pointer-events:none;z-index:0;
        }

        .logout-card{
          position:relative;z-index:1;
          width:100%;max-width:480px;
          background:var(--white);
          border:1px solid var(--border);
          border-radius:24px;
          box-shadow:0 4px 16px rgba(26,22,20,.06),0 24px 64px rgba(26,22,20,.09);
          overflow:hidden;
          animation:cardIn .5s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes cardIn{from{opacity:0;transform:translateY(24px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}

        /* Top accent band */
        .logout-card-accent{
          height:3px;
          background:linear-gradient(90deg,transparent,var(--accent) 30%,var(--accent) 70%,transparent);
        }

        .logout-card-body{padding:48px 44px 44px}

        /* Icon */
        .logout-icon-wrap{
          width:72px;height:72px;border-radius:20px;
          background:var(--sand-mid);
          display:flex;align-items:center;justify-content:center;
          margin-bottom:28px;
          transition:all var(--transition);
        }
        .logout-icon-wrap.is-done{background:var(--green-bg)}
        .logout-icon-wrap i{
          font-size:1.75rem;color:var(--ink-soft);
          transition:color var(--transition);
        }
        .logout-icon-wrap.is-done i{color:var(--green)}

        /* Text */
        .logout-eyebrow{
          display:inline-flex;align-items:center;gap:7px;
          font-size:.65rem;font-weight:700;letter-spacing:.18em;
          text-transform:uppercase;color:var(--accent);margin-bottom:10px;
        }
        .logout-eyebrow::before{content:'';display:block;width:16px;height:1px;background:var(--accent)}
        .logout-title{
          font-family:var(--font-display);
          font-size:1.75rem;font-weight:500;
          color:var(--ink);letter-spacing:-.02em;
          line-height:1.15;margin-bottom:12px;
        }
        .logout-title em{font-style:italic;color:var(--accent)}
        .logout-desc{
          font-size:.9rem;font-weight:300;
          color:var(--ink-muted);line-height:1.7;margin-bottom:32px;
        }

        /* User pill */
        .logout-user{
          display:inline-flex;align-items:center;gap:10px;
          padding:8px 14px 8px 8px;
          background:var(--sand);
          border:1px solid var(--border);
          border-radius:var(--radius-pill);
          margin-bottom:32px;
        }
        .logout-avatar{
          width:32px;height:32px;border-radius:50%;
          background:var(--ink);color:var(--white);
          display:flex;align-items:center;justify-content:center;
          font-size:.75rem;font-weight:600;font-family:var(--font-body);
          flex-shrink:0;
        }
        .logout-user-name{font-size:.825rem;font-weight:500;color:var(--ink)}
        .logout-user-role{font-size:.68rem;font-weight:400;color:var(--ink-muted);display:block;margin-top:1px;letter-spacing:.04em}

        /* Buttons */
        .logout-btns{display:flex;flex-direction:column;gap:10px}
        .btn-logout{
          width:100%;height:52px;border-radius:var(--radius-pill);
          border:none;
          background:var(--ink);color:var(--white);
          font-family:var(--font-body);font-size:.9rem;font-weight:600;
          cursor:pointer;letter-spacing:.02em;
          display:flex;align-items:center;justify-content:center;gap:8px;
          transition:all var(--transition);
        }
        .btn-logout:hover:not(:disabled){background:#c0392b;transform:translateY(-1px);box-shadow:0 6px 20px rgba(192,57,43,.3)}
        .btn-logout:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .btn-logout.is-sending{background:var(--ink-soft)}
        .btn-logout.is-done{background:var(--green);pointer-events:none}

        .btn-stay{
          width:100%;height:48px;border-radius:var(--radius-pill);
          border:1.5px solid var(--border);background:transparent;
          font-family:var(--font-body);font-size:.875rem;font-weight:500;
          color:var(--ink-soft);cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:8px;
          transition:all var(--transition);
        }
        .btn-stay:hover{border-color:var(--border-strong,rgba(26,22,20,.18));background:var(--sand);color:var(--ink)}

        /* Spinner */
        .l-spinner{
          width:16px;height:16px;border-radius:50%;
          border:2px solid rgba(255,255,255,.3);border-top-color:var(--white);
          animation:spin .7s linear infinite;flex-shrink:0;
        }
        @keyframes spin{to{transform:rotate(360deg)}}

        /* Success banner */
        .logout-success{
          display:flex;align-items:center;gap:10px;
          padding:12px 14px;margin-top:4px;
          background:var(--green-bg);color:var(--green);
          border:1px solid rgba(45,122,79,.2);
          border-radius:var(--radius-sm);
          font-size:.825rem;font-weight:500;
          animation:fbIn .3s ease;
        }
        @keyframes fbIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}

        /* Footer link */
        .logout-card-footer{
          padding:20px 44px 28px;
          border-top:1px solid var(--border);
          display:flex;align-items:center;justify-content:center;gap:6px;
          font-size:.78rem;color:var(--ink-muted);
        }
        .logout-card-footer a{
          color:var(--accent);font-weight:600;text-decoration:none;
          transition:opacity var(--transition);
        }
        .logout-card-footer a:hover{opacity:.75}
      `}</style>

      <div className="logout-page">
        <div className="logout-card" role="main">
          <div className="logout-card-accent" aria-hidden="true" />

          <div className="logout-card-body">

            {/* Icon */}
            <div className={`logout-icon-wrap ${status === 'done' ? 'is-done' : ''}`}>
              <i className={`bi ${status === 'done' ? 'bi-check-lg' : 'bi-box-arrow-right'}`} aria-hidden="true" />
            </div>

            {/* Eyebrow + title */}
            <p className="logout-eyebrow">Session</p>
            <h1 className="logout-title">
              {status === 'done'
                ? <>À bientôt, <em>{firstName}</em> !</>
                : <>Vous partez<br /><em>déjà ?</em></>}
            </h1>
            <p className="logout-desc">
              {status === 'done'
                ? 'Vous avez été déconnecté avec succès. Vous allez être redirigé.'
                : 'Voulez-vous fermer votre session ? Vos données restent sauvegardées.'}
            </p>

            {/* User pill — visible only before logout */}
            {status !== 'done' && user && (
              <div className="logout-user">
                <div className="logout-avatar">
                  {(user.name ?? 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="logout-user-name">{user.name}</span>
                  <span className="logout-user-role">{user.email}</span>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="logout-btns">
              <button
                type="button"
                className={`btn-logout ${status === 'sending' ? 'is-sending' : ''} ${status === 'done' ? 'is-done' : ''}`}
                onClick={handleLogout}
                disabled={status === 'sending' || status === 'done'}
                aria-busy={status === 'sending'}
              >
                {status === 'sending' && <><span className="l-spinner" aria-hidden="true" /> Déconnexion…</>}
                {status === 'done' && <><i className="bi bi-check-lg" aria-hidden="true" /> Déconnecté</>}
                {status === 'idle' && <><i className="bi bi-door-open" aria-hidden="true" /> Se déconnecter</>}
              </button>

              {status !== 'done' && (
                <button
                  type="button"
                  className="btn-stay"
                  onClick={(e) => nav(e, '/')}
                >
                  <i className="bi bi-arrow-left" aria-hidden="true" /> Rester connecté
                </button>
              )}

              {status === 'done' && (
                <div className="logout-success" role="status">
                  <i className="bi bi-shield-check" aria-hidden="true" />
                  Déconnexion sécurisée effectuée.
                </div>
              )}
            </div>
          </div>

          <div className="logout-card-footer">
            <span>Pas votre compte ?</span>
            <a href="/login" onClick={(e) => nav(e, '/login')}>Changer de session →</a>
          </div>
        </div>
      </div>
    </>
  )
}
