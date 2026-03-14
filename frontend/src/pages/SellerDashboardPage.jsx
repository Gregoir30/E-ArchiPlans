import { useEffect, useState } from 'react'
import { fetchSellerDashboard } from '../api/dashboard'

const PLAN_STATUS = {
  draft: { label: 'Brouillon', bg: '#f0ede8', color: '#7a6a5a' },
  pending: { label: 'En attente', bg: '#fff4e0', color: '#b07a10' },
  approved: { label: 'Approuvé', bg: '#e6f4ec', color: '#2d7a4f' },
  rejected: { label: 'Rejeté', bg: '#fdecea', color: '#c0392b' },
}

function fmt(cents, cur = 'EUR') {
  if (cents == null) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(cents / 100)
}

function planGrad(id = 1) {
  const gs = ['linear-gradient(135deg,#e8ddd0,#d4c5b0)', 'linear-gradient(135deg,#d0dde8,#b0c5d4)', 'linear-gradient(135deg,#d0e8d8,#b0d4bc)', 'linear-gradient(135deg,#e8e0d0,#d4c8b0)']
  return gs[(id - 1) % gs.length]
}

// Mini sparkline — fake bar chart
function MiniBar({ value, max, color }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '28px' }}>
      {[0.4, 0.6, 0.5, 0.8, 0.65, 0.9, pct / 100].map((h, i) => (
        <div key={i} style={{
          width: '4px', borderRadius: '2px',
          height: `${Math.round(h * 100)}%`,
          background: i === 6 ? color : `${color}40`,
          transition: 'height .4s ease',
        }} />
      ))}
    </div>
  )
}

export default function SellerDashboardPage({ onNavigate }) {
  const [status, setStatus] = useState('loading')
  const [data, setData] = useState(null)
  const [errMsg, setErrMsg] = useState('')

  function nav(e, path) { e?.preventDefault?.(); onNavigate?.(e, path) }

  useEffect(() => {
    let mounted = true
    setStatus('loading')
    fetchSellerDashboard().then((r) => {
      if (!mounted) return
      if (!r.ok) { setErrMsg(r.message); setStatus('error'); return }
      setData(r.data); setStatus('success')
    })
    return () => { mounted = false }
  }, [])

  const s = data?.summary ?? {}
  const statusTotal = Object.values(s.plans_by_status ?? {}).reduce((a, b) => a + b, 0) || 1

  return (
    <>
      <style>{CSS}</style>
      <div className="dash-page">

        {/* ── HEADER ── */}
        <div className="dash-header">
          <div>
            <p className="dash-eyebrow">Dashboard vendeur</p>
            <h1 className="dash-title">Vue <em>d'ensemble</em></h1>
            <p className="dash-lead">Suivez vos plans, ventes et revenus en temps réel.</p>
          </div>
          {/* Remplacez la ligne existante par celle-ci */}
          <button
            className="dash-cta"
            onClick={(e) => {
              e.preventDefault();
              onNavigate(e, '/gestion-plans');
            }}
          >
            <i className="bi bi-plus-lg" /> Déposer un plan
          </button>
        </div>

        {/* ── LOADING ── */}
        {status === 'loading' && (
          <div className="dash-skeletons">
            <div className="dash-skels-row">
              {[1, 2, 3, 4].map((i) => <div key={i} className="skel-kpi" style={{ animationDelay: `${i * 60}ms` }} />)}
            </div>
            <div className="skel-table" />
          </div>
        )}

        {/* ── ERROR ── */}
        {status === 'error' && (
          <div className="dash-empty">
            <div className="dash-empty-icon" style={{ background: '#fdecea', color: '#c0392b' }}>
              <i className="bi bi-wifi-off" />
            </div>
            <h2>Données indisponibles</h2>
            <p>{errMsg || 'Impossible de charger le dashboard.'}</p>
          </div>
        )}

        {status === 'success' && (
          <>
            {/* ── KPI ROW ── */}
            <div className="dash-kpis">
              {[
                { label: 'Revenu estimé', value: fmt(s.revenue_cents, s.currency), icon: 'bi-currency-euro', accent: true, bar: true, barVal: s.revenue_cents, barMax: 500000, barColor: '#c97d4e' },
                { label: 'Commandes payées', value: s.orders_count ?? 0, icon: 'bi-bag-check', accent: false, bar: true, barVal: s.orders_count, barMax: 100, barColor: '#3b82f6' },
                { label: 'Plans vendus', value: s.sold_items_count ?? 0, icon: 'bi-house-check', accent: false, bar: true, barVal: s.sold_items_count, barMax: 150, barColor: '#8b5cf6' },
                { label: 'Plans publiés', value: s.plans_total ?? 0, icon: 'bi-grid-3x3-gap', accent: false, bar: false },
              ].map((kpi, i) => (
                <div key={kpi.label} className={`dash-kpi ${kpi.accent ? 'dash-kpi--accent' : ''}`}
                  style={{ animationDelay: `${i * 70}ms` }}>
                  <div className="kpi-top">
                    <div className={`kpi-icon ${kpi.accent ? 'kpi-icon--accent' : ''}`}>
                      <i className={`bi ${kpi.icon}`} aria-hidden="true" />
                    </div>
                    {kpi.bar && <MiniBar value={kpi.barVal} max={kpi.barMax} color={kpi.barColor} />}
                  </div>
                  <p className="kpi-value">{kpi.value}</p>
                  <p className="kpi-label">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* ── STATUS ROW ── */}
            <div className="dash-status-row">
              <div className="dash-status-header">
                <p className="dash-section-eyebrow">Répartition des plans</p>
                <span className="dash-status-total">{statusTotal} plans</span>
              </div>
              <div className="dash-status-bars">
                {Object.entries(s.plans_by_status ?? {}).map(([key, val]) => {
                  const meta = PLAN_STATUS[key] ?? { label: key, color: '#9a8f87', bg: '#f0ede8' }
                  const pct = Math.round((val / statusTotal) * 100)
                  return (
                    <div key={key} className="status-bar-item">
                      <div className="status-bar-track">
                        <div className="status-bar-fill"
                          style={{ width: `${pct}%`, background: meta.color }} />
                      </div>
                      <div className="status-bar-meta">
                        <span className="status-pill" style={{ background: meta.bg, color: meta.color }}>
                          {meta.label}
                        </span>
                        <span className="status-bar-val">{val} <em>({pct}%)</em></span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── RECENT PLANS ── */}
            <div className="dash-section">
              <div className="dash-section-head">
                <div>
                  <p className="dash-section-eyebrow">Activité récente</p>
                  <h2 className="dash-section-title">Plans récents</h2>
                </div>
                <button className="dash-link-btn" onClick={(e) => nav(e, '/modeles/plans')}>
                  Voir tous <i className="bi bi-arrow-right" />
                </button>
              </div>

              {data.recent_plans?.length > 0 ? (
                <div className="dash-plans-list">
                  {data.recent_plans.map((plan, i) => {
                    const meta = PLAN_STATUS[plan.status] ?? PLAN_STATUS.draft
                    return (
                      <div key={plan.id} className="dash-plan-row"
                        style={{ animationDelay: `${i * 60}ms` }}>
                        <div className="dpr-thumb" style={{ background: planGrad(plan.id) }}>
                          <span>{(plan.title ?? 'P').slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="dpr-info">
                          <span className="dpr-title">{plan.title}</span>
                          <span className="dpr-cat">{plan.category?.name ?? '—'}</span>
                        </div>
                        <span className="dpr-status"
                          style={{ background: meta.bg, color: meta.color }}>
                          {meta.label}
                        </span>
                        <span className="dpr-price">{fmt(plan.price_cents, plan.currency)}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="dash-empty-inline">
                  <i className="bi bi-house" /> Aucun plan récent.
                </div>
              )}
            </div>

            {/* ── RECENT SALES ── */}
            <div className="dash-section">
              <div className="dash-section-head">
                <div>
                  <p className="dash-section-eyebrow">Transactions</p>
                  <h2 className="dash-section-title">Ventes récentes</h2>
                </div>
                <button className="dash-link-btn" onClick={(e) => nav(e, '/modeles/orders')}>
                  Voir toutes <i className="bi bi-arrow-right" />
                </button>
              </div>

              {data.recent_sales?.length > 0 ? (
                <div className="dash-sales-list">
                  <div className="dsl-head">
                    <span>Commande</span>
                    <span>Acheteur</span>
                    <span>Plan</span>
                    <span>Montant</span>
                  </div>
                  {data.recent_sales.map((sale, i) => (
                    <div key={`${sale.order_id}-${i}`} className="dsl-row"
                      style={{ animationDelay: `${i * 50}ms` }}>
                      <span className="dsl-id">#{sale.order_id}</span>
                      <div className="dsl-buyer">
                        <div className="dsl-avatar">
                          {(sale.buyer_name ?? 'A').charAt(0).toUpperCase()}
                        </div>
                        <span>{sale.buyer_name ?? '—'}</span>
                      </div>
                      <span className="dsl-plan">{sale.plan_title ?? '—'}</span>
                      <span className="dsl-amount">{fmt(sale.unit_price_cents, s.currency)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dash-empty-inline">
                  <i className="bi bi-bag" /> Aucune vente récente.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Playfair+Display:ital,wght@0,500;1,500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --sand:#f5efe6;--sand-mid:#ede4d6;--sand-dark:#e0d4c2;
    --ink:#1a1614;--ink-soft:#4a3f38;--ink-muted:#9a8f87;
    --accent:#c97d4e;--accent-light:#f0dcc8;--accent-dark:#a8623a;
    --white:#ffffff;--border:rgba(26,22,20,0.09);--border-strong:rgba(26,22,20,0.18);
    --shadow-card:0 2px 8px rgba(26,22,20,0.06),0 16px 48px rgba(26,22,20,0.08);
    --radius:16px;--radius-sm:10px;--radius-pill:999px;
    --transition:220ms cubic-bezier(.4,0,.2,1);
    --font-display:'Playfair Display',Georgia,serif;
    --font-body:'DM Sans',system-ui,sans-serif;
  }
  body{background:var(--sand);font-family:var(--font-body);color:var(--ink)}

  .dash-page{max-width:1060px;margin:0 auto;padding:52px 40px 80px;display:flex;flex-direction:column;gap:32px}

  /* ── HEADER ── */
  .dash-header{
    display:flex;align-items:flex-end;justify-content:space-between;
    gap:24px;padding-bottom:28px;border-bottom:1px solid var(--border);flex-wrap:wrap;
  }
  .dash-eyebrow{font-size:.65rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:8px}
  .dash-title{font-family:var(--font-display);font-size:clamp(1.8rem,3vw,2.6rem);font-weight:500;color:var(--ink);letter-spacing:-.025em;line-height:1.1;margin-bottom:8px}
  .dash-title em{font-style:italic}
  .dash-lead{font-size:.875rem;font-weight:300;color:var(--ink-muted);line-height:1.6}
  .dash-cta{
    display:flex;align-items:center;gap:7px;height:44px;padding:0 22px;
    border-radius:var(--radius-pill);border:none;
    background:var(--ink);color:var(--white);
    font-family:var(--font-body);font-size:.85rem;font-weight:600;
    cursor:pointer;white-space:nowrap;transition:all var(--transition);flex-shrink:0;
  }
  .dash-cta:hover{background:var(--accent);transform:translateY(-1px);box-shadow:0 6px 20px rgba(201,125,78,.35)}

  /* ── SKELETONS ── */
  .dash-skeletons{display:flex;flex-direction:column;gap:20px}
  .dash-skels-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .skel-kpi{height:110px;border-radius:var(--radius);background:var(--sand-mid);animation:shimmer 1.4s ease infinite both}
  .skel-table{height:220px;border-radius:var(--radius);background:var(--sand-mid);animation:shimmer 1.4s ease .2s infinite both}
  @keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}

  /* ── EMPTY ── */
  .dash-empty{display:flex;flex-direction:column;align-items:center;text-align:center;padding:80px 24px;gap:14px}
  .dash-empty-icon{width:64px;height:64px;border-radius:18px;background:var(--sand-mid);display:flex;align-items:center;justify-content:center;font-size:1.5rem;color:var(--ink-muted)}
  .dash-empty h2{font-family:var(--font-display);font-size:1.25rem;font-weight:500;color:var(--ink)}
  .dash-empty p{font-size:.875rem;color:var(--ink-muted);font-weight:300}

  /* ── KPIs ── */
  .dash-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .dash-kpi{
    background:var(--white);border:1px solid var(--border);
    border-radius:var(--radius);padding:22px 20px;
    display:flex;flex-direction:column;gap:8px;
    box-shadow:var(--shadow-card);
    animation:fadeUp .4s ease both;
    transition:transform var(--transition),box-shadow var(--transition);
    position:relative;overflow:hidden;
  }
  .dash-kpi::before{
    content:'';position:absolute;top:0;left:0;right:0;height:2px;
    background:linear-gradient(90deg,transparent,var(--border),transparent);
    transition:background var(--transition);
  }
  .dash-kpi:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(26,22,20,.09),0 24px 56px rgba(26,22,20,.08)}
  .dash-kpi--accent{background:var(--ink)}
  .dash-kpi--accent::before{background:linear-gradient(90deg,transparent,var(--accent),transparent)}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  .kpi-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
  .kpi-icon{width:38px;height:38px;border-radius:11px;background:var(--sand-mid);display:flex;align-items:center;justify-content:center;font-size:1rem;color:var(--ink-soft)}
  .kpi-icon--accent{background:rgba(201,125,78,.2);color:var(--accent)}
  .kpi-value{font-family:var(--font-display);font-size:1.65rem;font-weight:500;color:var(--ink);letter-spacing:-.03em;line-height:1}
  .dash-kpi--accent .kpi-value{color:var(--white)}
  .kpi-label{font-size:.7rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-muted)}
  .dash-kpi--accent .kpi-label{color:rgba(255,255,255,.45)}

  /* ── STATUS BARS ── */
  .dash-status-row{
    background:var(--white);border:1px solid var(--border);
    border-radius:var(--radius);padding:24px 28px;
    box-shadow:var(--shadow-card);
  }
  .dash-status-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
  .dash-section-eyebrow{font-size:.65rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--accent)}
  .dash-status-total{font-size:.78rem;color:var(--ink-muted);font-weight:500}
  .dash-status-bars{display:flex;flex-direction:column;gap:14px}
  .status-bar-item{display:flex;flex-direction:column;gap:6px}
  .status-bar-track{height:6px;border-radius:3px;background:var(--sand-mid);overflow:hidden}
  .status-bar-fill{height:100%;border-radius:3px;transition:width .6s cubic-bezier(.4,0,.2,1)}
  .status-bar-meta{display:flex;align-items:center;justify-content:space-between}
  .status-pill{display:inline-flex;padding:3px 9px;border-radius:var(--radius-pill);font-size:.65rem;font-weight:700;letter-spacing:.06em}
  .status-bar-val{font-size:.78rem;color:var(--ink-muted);font-weight:500}
  .status-bar-val em{font-style:normal;opacity:.65}

  /* ── SECTIONS ── */
  .dash-section{background:var(--white);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow-card)}
  .dash-section-head{
    display:flex;align-items:center;justify-content:space-between;
    padding:20px 28px;border-bottom:1px solid var(--border);
  }
  .dash-section-title{font-family:var(--font-display);font-size:1.1rem;font-weight:500;color:var(--ink);letter-spacing:-.01em;margin-top:4px}
  .dash-link-btn{
    display:flex;align-items:center;gap:6px;
    height:36px;padding:0 14px;border-radius:var(--radius-pill);
    border:1.5px solid var(--border);background:transparent;
    font-family:var(--font-body);font-size:.75rem;font-weight:600;
    color:var(--ink-soft);cursor:pointer;transition:all var(--transition);white-space:nowrap;
  }
  .dash-link-btn:hover{background:var(--ink);color:var(--white);border-color:var(--ink)}

  .dash-empty-inline{
    display:flex;align-items:center;gap:8px;justify-content:center;
    padding:40px 24px;font-size:.875rem;color:var(--ink-muted);font-weight:300;
  }

  /* ── PLANS LIST ── */
  .dash-plans-list{display:flex;flex-direction:column}
  .dash-plan-row{
    display:grid;grid-template-columns:44px 1fr auto auto;
    align-items:center;gap:14px;
    padding:14px 28px;border-bottom:1px solid var(--border);
    animation:fadeUp .35s ease both;
    transition:background var(--transition);
  }
  .dash-plan-row:last-child{border-bottom:none}
  .dash-plan-row:hover{background:rgba(245,239,230,.5)}
  .dpr-thumb{
    width:44px;height:44px;border-radius:12px;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    font-family:var(--font-display);font-size:.85rem;font-weight:600;color:rgba(26,22,20,.2);
  }
  .dpr-info{display:flex;flex-direction:column;gap:2px;min-width:0}
  .dpr-title{font-size:.875rem;font-weight:600;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dpr-cat{font-size:.72rem;color:var(--ink-muted);font-weight:300}
  .dpr-status{display:inline-flex;padding:3px 10px;border-radius:var(--radius-pill);font-size:.65rem;font-weight:700;letter-spacing:.06em;white-space:nowrap}
  .dpr-price{font-family:var(--font-display);font-size:.95rem;font-weight:500;color:var(--ink);white-space:nowrap;letter-spacing:-.01em}

  /* ── SALES LIST ── */
  .dash-sales-list{display:flex;flex-direction:column}
  .dsl-head{
    display:grid;grid-template-columns:80px 1fr 1fr auto;
    gap:16px;padding:10px 28px;
    border-bottom:1px solid var(--border);
    font-size:.62rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-muted);
  }
  .dsl-row{
    display:grid;grid-template-columns:80px 1fr 1fr auto;
    align-items:center;gap:16px;
    padding:14px 28px;border-bottom:1px solid var(--border);
    animation:fadeUp .35s ease both;
    transition:background var(--transition);
  }
  .dsl-row:last-child{border-bottom:none}
  .dsl-row:hover{background:rgba(245,239,230,.5)}
  .dsl-id{font-size:.8rem;font-weight:700;color:var(--ink-muted)}
  .dsl-buyer{display:flex;align-items:center;gap:8px;font-size:.85rem;font-weight:500;color:var(--ink)}
  .dsl-avatar{
    width:28px;height:28px;border-radius:8px;
    background:var(--ink);color:var(--white);
    display:flex;align-items:center;justify-content:center;
    font-size:.72rem;font-weight:700;flex-shrink:0;
  }
  .dsl-plan{font-size:.825rem;font-weight:300;color:var(--ink-soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dsl-amount{font-family:var(--font-display);font-size:.95rem;font-weight:500;color:var(--accent);letter-spacing:-.01em;white-space:nowrap}

  /* ── RESPONSIVE ── */
  @media(max-width:900px){
    .dash-page{padding:32px 20px 60px;gap:20px}
    .dash-kpis{grid-template-columns:repeat(2,1fr)}
    .dsl-head,.dsl-row{grid-template-columns:60px 1fr auto}
    .dsl-head span:nth-child(3),.dsl-plan{display:none}
  }
  @media(max-width:560px){
    .dash-kpis{grid-template-columns:1fr 1fr}
    .dash-plan-row{grid-template-columns:36px 1fr auto}
    .dpr-price{display:none}
  }
`
