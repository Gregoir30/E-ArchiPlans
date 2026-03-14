const PLAN_STATUS_LABELS = {
  draft: 'Brouillon',
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
}

const PLAN_STATUS_STYLES = {
  draft:    { bg: '#f0ede8', color: '#7a6a5a' },
  pending:  { bg: '#fff4e0', color: '#b07a10' },
  approved: { bg: '#e6f4ec', color: '#2d7a4f' },
  rejected: { bg: '#fdecea', color: '#c0392b' },
}

function fmt(cents, cur = 'EUR') {
  if (cents == null) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: cur }).format(cents / 100)
}

function planGradient(id = 1) {
  const gs = [
    'linear-gradient(135deg,#e8ddd0,#d4c5b0)',
    'linear-gradient(135deg,#d0dde8,#b0c5d4)',
    'linear-gradient(135deg,#d0e8d8,#b0d4bc)',
    'linear-gradient(135deg,#e8e0d0,#d4c8b0)',
    'linear-gradient(135deg,#ddd0e8,#c5b0d4)',
    'linear-gradient(135deg,#e8d8d0,#d4bcb0)',
  ]
  return gs[(id - 1) % gs.length]
}

export default function PlanDetailPage({ plan, onBuyPlan, onNavigate }) {
  function nav(e, path) { e?.preventDefault?.(); onNavigate?.(e, path) }

  // ── Not found ──
  if (!plan) {
    return (
      <>
        <style>{styles}</style>
        <div className="pd-page pd-page--centered">
          <div className="pd-notfound">
            <div className="pd-notfound-icon">
              <i className="bi bi-search" aria-hidden="true" />
            </div>
            <h1 className="pd-notfound-title">Plan introuvable</h1>
            <p className="pd-notfound-desc">
              Ce plan n'existe pas ou n'est plus disponible dans notre catalogue.
            </p>
            <button className="pd-btn-primary" onClick={(e) => nav(e, '/plans')}>
              <i className="bi bi-grid-3x3-gap" aria-hidden="true" /> Voir le catalogue
            </button>
          </div>
        </div>
      </>
    )
  }

  const statusStyle = PLAN_STATUS_STYLES[plan.status] ?? { bg: '#f0ede8', color: '#7a6a5a' }
  const isAvailable = plan.status === 'approved'

  const specs = [
    { icon: 'bi-rulers',      label: 'Surface',   value: plan.surface ? `${plan.surface} m²` : '—' },
    { icon: 'bi-door-open',   label: 'Pièces',    value: plan.rooms ?? '—' },
    { icon: 'bi-layers',      label: 'Niveaux',   value: plan.levels ?? '—' },
    { icon: 'bi-grid-1x2',    label: 'Catégorie', value: plan.category?.name ?? 'Sans catégorie' },
    { icon: 'bi-person',      label: 'Architecte',value: plan.seller?.name ?? 'Non renseigné' },
    { icon: 'bi-tag',         label: 'Style',     value: plan.style ?? 'Non renseigné' },
  ]

  const initials = (plan.title ?? 'PA').slice(0, 2).toUpperCase()

  return (
    <>
      <style>{styles}</style>
      <div className="pd-page">

        {/* ── BREADCRUMB ── */}
        <nav className="pd-breadcrumb" aria-label="Fil d'ariane">
          <a href="/plans" className="pd-bc-link" onClick={(e) => nav(e, '/plans')}>
            <i className="bi bi-grid-3x3-gap" aria-hidden="true" /> Catalogue
          </a>
          <i className="bi bi-chevron-right pd-bc-sep" aria-hidden="true" />
          <span className="pd-bc-current">{plan.title}</span>
        </nav>

        <div className="pd-layout">

          {/* ── LEFT: Visual ── */}
          <div className="pd-visual-col">
            <div className="pd-visual" style={{ background: planGradient(plan.id) }}>
              <span className="pd-visual-initials">{initials}</span>
              {plan.status && (
                <span className="pd-status-badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                  {PLAN_STATUS_LABELS[plan.status] ?? plan.status}
                </span>
              )}
            </div>

            {/* Sticky CTA on desktop */}
            <div className="pd-sticky-cta">
              <div className="pd-price-row">
                <span className="pd-price">{fmt(plan.price_cents, plan.currency)}</span>
                {plan.surface && (
                  <span className="pd-price-per">
                    {fmt(Math.round((plan.price_cents ?? 0) / plan.surface), plan.currency)}/m²
                  </span>
                )}
              </div>
              <button
                className="pd-btn-primary"
                onClick={() => onBuyPlan?.(plan.id)}
                disabled={!isAvailable}
                aria-disabled={!isAvailable}
              >
                <i className="bi bi-bag-plus" aria-hidden="true" />
                {isAvailable ? 'Commander ce plan' : 'Non disponible'}
              </button>
              <button className="pd-btn-ghost" onClick={(e) => nav(e, '/plans')}>
                <i className="bi bi-arrow-left" aria-hidden="true" /> Retour au catalogue
              </button>
              <div className="pd-trust-row">
                {[
                  { icon: 'bi-download', text: 'Livraison immédiate' },
                  { icon: 'bi-shield-check', text: 'Plan certifié' },
                ].map((t) => (
                  <span key={t.text} className="pd-trust-item">
                    <i className={`bi ${t.icon}`} aria-hidden="true" /> {t.text}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Content ── */}
          <div className="pd-content-col">

            {/* Header */}
            <div className="pd-header">
              <p className="pd-eyebrow">
                {plan.category?.name ?? 'Plan architectural'}
              </p>
              <h1 className="pd-title">{plan.title}</h1>
              {plan.seller?.name && (
                <div className="pd-seller">
                  <div className="pd-seller-avatar">
                    {(plan.seller.name).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="pd-seller-name">{plan.seller.name}</span>
                    <span className="pd-seller-role">Architecte certifié</span>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="pd-section">
              <h2 className="pd-section-title">Description</h2>
              <p className="pd-desc">
                {plan.description || 'Aucune description fournie pour ce plan.'}
              </p>
            </div>

            {/* Specs grid */}
            <div className="pd-section">
              <h2 className="pd-section-title">Caractéristiques</h2>
              <div className="pd-specs-grid">
                {specs.map((spec) => (
                  <div className="pd-spec" key={spec.label}>
                    <div className="pd-spec-icon">
                      <i className={`bi ${spec.icon}`} aria-hidden="true" />
                    </div>
                    <div>
                      <span className="pd-spec-label">{spec.label}</span>
                      <span className="pd-spec-value">{spec.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What's included */}
            <div className="pd-section">
              <h2 className="pd-section-title">Inclus dans le plan</h2>
              <div className="pd-includes">
                {[
                  'Plans de masse et d\'implantation',
                  'Plans de façades (4 orientations)',
                  'Plans de coupes et sections',
                  'Note de surface détaillée',
                  'Format PDF haute résolution',
                  'Format DWG (AutoCAD)',
                ].map((item) => (
                  <div className="pd-include-item" key={item}>
                    <i className="bi bi-check-circle-fill" aria-hidden="true" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile CTA */}
            <div className="pd-mobile-cta">
              <div className="pd-price-row">
                <span className="pd-price">{fmt(plan.price_cents, plan.currency)}</span>
              </div>
              <button
                className="pd-btn-primary"
                onClick={() => onBuyPlan?.(plan.id)}
                disabled={!isAvailable}
              >
                <i className="bi bi-bag-plus" aria-hidden="true" />
                {isAvailable ? 'Commander ce plan' : 'Non disponible'}
              </button>
              <button className="pd-btn-ghost" onClick={(e) => nav(e, '/plans')}>
                <i className="bi bi-arrow-left" aria-hidden="true" /> Retour au catalogue
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --sand:#f5efe6;--sand-mid:#ede4d6;--sand-dark:#e0d4c2;
    --ink:#1a1614;--ink-soft:#4a3f38;--ink-muted:#9a8f87;
    --accent:#c97d4e;--accent-light:#f0dcc8;--accent-dark:#a8623a;
    --white:#ffffff;--border:rgba(26,22,20,0.09);--border-strong:rgba(26,22,20,0.18);
    --shadow-card:0 2px 8px rgba(26,22,20,0.06),0 16px 48px rgba(26,22,20,0.08);
    --shadow-hover:0 6px 20px rgba(26,22,20,0.10),0 24px 56px rgba(26,22,20,0.12);
    --radius:16px;--radius-sm:10px;--radius-pill:999px;
    --transition:200ms cubic-bezier(.4,0,.2,1);
    --font-display:'Playfair Display',Georgia,serif;
    --font-body:'DM Sans',system-ui,sans-serif;
  }
  body{background:var(--sand);font-family:var(--font-body);color:var(--ink)}

  /* ── PAGE ── */
  .pd-page{max-width:1100px;margin:0 auto;padding:40px 40px 80px}
  .pd-page--centered{display:flex;align-items:center;justify-content:center;min-height:70vh}

  /* ── BREADCRUMB ── */
  .pd-breadcrumb{
    display:flex;align-items:center;gap:8px;
    margin-bottom:32px;
    font-size:.78rem;color:var(--ink-muted);
  }
  .pd-bc-link{
    display:inline-flex;align-items:center;gap:5px;
    color:var(--ink-muted);text-decoration:none;font-weight:400;
    transition:color var(--transition);
  }
  .pd-bc-link:hover{color:var(--accent)}
  .pd-bc-sep{font-size:.65rem;opacity:.5}
  .pd-bc-current{color:var(--ink);font-weight:500}

  /* ── LAYOUT ── */
  .pd-layout{
    display:grid;
    grid-template-columns:420px 1fr;
    gap:48px;align-items:start;
  }

  /* ── VISUAL COL ── */
  .pd-visual-col{display:flex;flex-direction:column;gap:20px}
  .pd-visual{
    height:320px;border-radius:var(--radius);
    display:flex;align-items:center;justify-content:center;
    position:relative;overflow:hidden;
    box-shadow:var(--shadow-card);
  }
  .pd-visual-initials{
    font-family:var(--font-display);font-size:6rem;font-weight:600;
    color:rgba(26,22,20,0.12);letter-spacing:-.04em;user-select:none;
  }
  .pd-status-badge{
    position:absolute;top:16px;left:16px;
    display:inline-flex;align-items:center;
    padding:4px 12px;border-radius:var(--radius-pill);
    font-size:.68rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  }

  /* Sticky CTA */
  .pd-sticky-cta{
    position:sticky;top:88px;
    background:var(--white);border:1px solid var(--border);
    border-radius:var(--radius);padding:24px;
    box-shadow:var(--shadow-card);
    display:flex;flex-direction:column;gap:12px;
  }
  .pd-price-row{display:flex;align-items:baseline;gap:10px}
  .pd-price{
    font-family:var(--font-display);font-size:2rem;font-weight:500;
    color:var(--ink);letter-spacing:-.03em;
  }
  .pd-price-per{font-size:.78rem;color:var(--ink-muted);font-weight:300}

  .pd-btn-primary{
    width:100%;height:52px;border-radius:var(--radius-pill);
    border:none;background:var(--ink);color:var(--white);
    font-family:var(--font-body);font-size:.9rem;font-weight:600;
    cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;
    transition:all var(--transition);letter-spacing:.02em;
  }
  .pd-btn-primary:hover:not(:disabled){background:var(--accent);transform:translateY(-1px);box-shadow:0 6px 20px rgba(201,125,78,.35)}
  .pd-btn-primary:disabled{opacity:.4;cursor:not-allowed;transform:none}

  .pd-btn-ghost{
    width:100%;height:44px;border-radius:var(--radius-pill);
    border:1.5px solid var(--border);background:transparent;
    font-family:var(--font-body);font-size:.85rem;font-weight:500;
    color:var(--ink-soft);cursor:pointer;
    display:flex;align-items:center;justify-content:center;gap:8px;
    transition:all var(--transition);
  }
  .pd-btn-ghost:hover{border-color:var(--ink);color:var(--ink);background:var(--sand-mid)}

  .pd-trust-row{display:flex;flex-direction:column;gap:6px;padding-top:4px;border-top:1px solid var(--border)}
  .pd-trust-item{
    display:flex;align-items:center;gap:6px;
    font-size:.72rem;color:var(--ink-muted);font-weight:400;
  }
  .pd-trust-item i{color:var(--accent)}

  /* ── CONTENT COL ── */
  .pd-content-col{display:flex;flex-direction:column;gap:0}
  .pd-header{margin-bottom:32px}
  .pd-eyebrow{
    font-size:.68rem;font-weight:700;letter-spacing:.18em;
    text-transform:uppercase;color:var(--accent);margin-bottom:10px;
  }
  .pd-title{
    font-family:var(--font-display);font-size:clamp(1.8rem,3vw,2.6rem);
    font-weight:500;color:var(--ink);letter-spacing:-.025em;
    line-height:1.1;margin-bottom:20px;
  }

  .pd-seller{display:flex;align-items:center;gap:12px}
  .pd-seller-avatar{
    width:40px;height:40px;border-radius:12px;
    background:var(--ink);color:var(--white);
    display:flex;align-items:center;justify-content:center;
    font-family:var(--font-display);font-size:.95rem;font-weight:500;
    flex-shrink:0;
  }
  .pd-seller-name{display:block;font-size:.875rem;font-weight:600;color:var(--ink)}
  .pd-seller-role{display:block;font-size:.7rem;color:var(--accent);font-weight:500;letter-spacing:.04em;margin-top:1px}

  /* Sections */
  .pd-section{
    padding:28px 0;
    border-top:1px solid var(--border);
  }
  .pd-section-title{
    font-family:var(--font-display);font-size:1.1rem;font-weight:500;
    color:var(--ink);letter-spacing:-.01em;margin-bottom:16px;
  }
  .pd-desc{
    font-size:.925rem;font-weight:300;color:var(--ink-soft);
    line-height:1.8;
  }

  /* Specs */
  .pd-specs-grid{
    display:grid;grid-template-columns:repeat(3,1fr);
    gap:12px;
  }
  .pd-spec{
    display:flex;align-items:flex-start;gap:10px;
    background:var(--white);border:1px solid var(--border);
    border-radius:var(--radius-sm);padding:14px 16px;
    transition:border-color var(--transition);
  }
  .pd-spec:hover{border-color:var(--accent-light)}
  .pd-spec-icon{
    width:32px;height:32px;border-radius:8px;
    background:var(--accent-light);
    display:flex;align-items:center;justify-content:center;
    font-size:.85rem;color:var(--accent);flex-shrink:0;
  }
  .pd-spec-label{
    display:block;font-size:.65rem;font-weight:700;
    letter-spacing:.1em;text-transform:uppercase;
    color:var(--ink-muted);margin-bottom:3px;
  }
  .pd-spec-value{display:block;font-size:.875rem;font-weight:600;color:var(--ink)}

  /* Includes */
  .pd-includes{
    display:grid;grid-template-columns:1fr 1fr;gap:10px;
  }
  .pd-include-item{
    display:flex;align-items:center;gap:8px;
    font-size:.825rem;font-weight:300;color:var(--ink-soft);
  }
  .pd-include-item i{color:#2ecc71;font-size:.9rem;flex-shrink:0}

  /* Mobile CTA */
  .pd-mobile-cta{
    display:none;
    flex-direction:column;gap:10px;
    padding:24px;margin-top:24px;
    background:var(--white);border:1px solid var(--border);
    border-radius:var(--radius);
    box-shadow:var(--shadow-card);
  }

  /* Not found */
  .pd-notfound{
    display:flex;flex-direction:column;align-items:center;
    text-align:center;gap:16px;max-width:380px;
  }
  .pd-notfound-icon{
    width:72px;height:72px;border-radius:22px;
    background:var(--sand-mid);
    display:flex;align-items:center;justify-content:center;
    font-size:1.75rem;color:var(--ink-muted);
  }
  .pd-notfound-title{
    font-family:var(--font-display);font-size:1.5rem;font-weight:500;
    color:var(--ink);letter-spacing:-.02em;
  }
  .pd-notfound-desc{font-size:.875rem;color:var(--ink-muted);font-weight:300;line-height:1.7}

  /* ── RESPONSIVE ── */
  @media(max-width:900px){
    .pd-page{padding:24px 20px 60px}
    .pd-layout{grid-template-columns:1fr;gap:24px}
    .pd-sticky-cta{display:none}
    .pd-mobile-cta{display:flex}
    .pd-specs-grid{grid-template-columns:repeat(2,1fr)}
    .pd-includes{grid-template-columns:1fr}
  }
  @media(max-width:480px){
    .pd-specs-grid{grid-template-columns:1fr 1fr}
  }
`