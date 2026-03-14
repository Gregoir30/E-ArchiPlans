import { useEffect, useState } from 'react'
import { cancelOrder, downloadPlanByToken, fetchMyOrders, simulateFedapayPayment } from '../api/orders'

const STATUS_META = {
  pending:  { label: 'En attente',   bg: '#fff4e0', color: '#b07a10', icon: 'bi-clock' },
  paid:     { label: 'Payée',        bg: '#e6f4ec', color: '#2d7a4f', icon: 'bi-check-circle-fill' },
  failed:   { label: 'Échouée',      bg: '#fdecea', color: '#c0392b', icon: 'bi-x-circle-fill' },
  refunded: { label: 'Remboursée',   bg: '#f0ede8', color: '#7a6a5a', icon: 'bi-arrow-counterclockwise' },
}

function fmt(cents, cur = 'EUR') {
  if (cents == null) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: cur }).format(cents / 100)
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}

function planGradient(id = 1) {
  const gs = ['linear-gradient(135deg,#e8ddd0,#d4c5b0)','linear-gradient(135deg,#d0dde8,#b0c5d4)','linear-gradient(135deg,#d0e8d8,#b0d4bc)']
  return gs[(id - 1) % gs.length]
}

export default function OrdersPage({ onNavigate }) {
  const [orders, setOrders]         = useState([])
  const [loadStatus, setLoadStatus] = useState('loading')
  const [toast, setToast]           = useState(null)    // { msg, type }
  const [processingId, setProc]     = useState(null)
  const [expandedId, setExpanded]   = useState(null)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function load() {
    setLoadStatus('loading')
    const result = await fetchMyOrders()
    if (!result.ok) { setLoadStatus('error'); showToast(result.message, 'error'); return }
    setOrders(result.orders)
    setLoadStatus('success')
    if (result.orders.length) setExpanded(result.orders[0].id)
  }

  useEffect(() => { load() }, [])

  async function handleDownload(token, url) {
    const r = await downloadPlanByToken(token, url)
    showToast(r.message, r.ok ? 'success' : 'error')
  }

  async function handleCancel(orderId) {
    setProc(orderId)
    const r = await cancelOrder(orderId)
    showToast(r.message, r.ok ? 'success' : 'error')
    if (r.ok) await load()
    setProc(null)
  }

  async function handleFedapay(orderId, outcome) {
    setProc(orderId)
    const r = await simulateFedapayPayment(orderId, outcome)
    showToast(r.message, r.ok ? 'success' : 'error')
    if (r.ok) await load()
    setProc(null)
  }

  function nav(e, path) { e?.preventDefault?.(); onNavigate?.(e, path) }

  return (
    <>
      <style>{CSS}</style>
      <div className="orders-page">

        {/* ── TOAST ── */}
        {toast && (
          <div className={`orders-toast ${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
            <i className={`bi ${toast.type === 'error' ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill'}`} />
            {toast.msg}
          </div>
        )}

        {/* ── HEADER ── */}
        <div className="orders-header">
          <div>
            <p className="orders-eyebrow">Mon espace</p>
            <h1 className="orders-title">Mes <em>commandes</em></h1>
          </div>
          <button className="orders-btn-catalog" onClick={(e) => nav(e, '/plans')}>
            <i className="bi bi-grid-3x3-gap" /> Explorer le catalogue
          </button>
        </div>

        {/* ── LOADING ── */}
        {loadStatus === 'loading' && (
          <div className="orders-skeletons">
            {[1,2,3].map((i) => <div key={i} className="order-skeleton" style={{ animationDelay: `${i * 80}ms` }} />)}
          </div>
        )}

        {/* ── ERROR ── */}
        {loadStatus === 'error' && (
          <div className="orders-empty">
            <div className="orders-empty-icon" style={{ background: '#fdecea', color: '#c0392b' }}>
              <i className="bi bi-wifi-off" />
            </div>
            <h2>Impossible de charger vos commandes</h2>
            <p>Vérifiez votre connexion et réessayez.</p>
            <button className="orders-btn-retry" onClick={load}>
              <i className="bi bi-arrow-clockwise" /> Réessayer
            </button>
          </div>
        )}

        {/* ── EMPTY ── */}
        {loadStatus === 'success' && orders.length === 0 && (
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <i className="bi bi-bag" />
            </div>
            <h2>Aucune commande</h2>
            <p>Vos achats et téléchargements apparaîtront ici.</p>
            <button className="orders-btn-retry" onClick={(e) => nav(e, '/plans')}>
              <i className="bi bi-grid-3x3-gap" /> Voir les plans
            </button>
          </div>
        )}

        {/* ── ORDERS LIST ── */}
        {loadStatus === 'success' && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order, idx) => {
              const meta = STATUS_META[order.payment_status] ?? STATUS_META.pending
              const isExpanded = expandedId === order.id
              const isProcessing = processingId === order.id

              return (
                <article key={order.id} className={`order-card ${isExpanded ? 'is-expanded' : ''}`}
                  style={{ animationDelay: `${idx * 70}ms` }}>

                  {/* ── ORDER HEADER (always visible) ── */}
                  <button
                    type="button"
                    className="order-summary"
                    onClick={() => setExpanded(isExpanded ? null : order.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`order-body-${order.id}`}
                  >
                    <div className="order-summary-left">
                      <div className="order-id-col">
                        <span className="order-num">#{order.id}</span>
                        <span className="order-date">{fmtDate(order.created_at)}</span>
                      </div>
                      <div className="order-items-preview">
                        {(order.items ?? []).slice(0, 2).map((item) => (
                          <div key={item.id} className="order-item-thumb"
                            style={{ background: planGradient(item.id) }}
                            title={item.plan?.title}>
                            <span>{(item.plan?.title ?? 'P').slice(0,2).toUpperCase()}</span>
                          </div>
                        ))}
                        {order.items?.length > 2 && (
                          <div className="order-item-thumb order-item-thumb--more">
                            +{order.items.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="order-summary-right">
                      <span className="order-status-badge"
                        style={{ background: meta.bg, color: meta.color }}>
                        <i className={`bi ${meta.icon}`} aria-hidden="true" />
                        {meta.label}
                      </span>
                      <span className="order-total">{fmt(order.total_cents, order.currency)}</span>
                      <i className={`bi bi-chevron-down order-chevron ${isExpanded ? 'is-open' : ''}`} aria-hidden="true" />
                    </div>
                  </button>

                  {/* ── ORDER BODY (expanded) ── */}
                  <div id={`order-body-${order.id}`} className={`order-body ${isExpanded ? 'is-open' : ''}`}>

                    {/* Payment actions for pending orders */}
                    {order.payment_status === 'pending' && (
                      <div className="order-pay-banner">
                        <div className="order-pay-text">
                          <i className="bi bi-exclamation-circle" aria-hidden="true" />
                          <div>
                            <strong>Paiement en attente</strong>
                            <span>Finalisez votre paiement pour accéder à vos plans.</span>
                          </div>
                        </div>
                        <div className="order-pay-btns">
                          <button
                            className="opay-btn opay-btn--success"
                            onClick={() => handleFedapay(order.id, 'success')}
                            disabled={isProcessing}
                          >
                            {isProcessing
                              ? <><span className="o-spinner" /> Traitement…</>
                              : <><i className="bi bi-credit-card-2-front" /> Payer (simulation)</>}
                          </button>
                          <button
                            className="opay-btn opay-btn--fail"
                            onClick={() => handleFedapay(order.id, 'failure')}
                            disabled={isProcessing}
                          >
                            <i className="bi bi-x-octagon" /> Échec (test)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Items table */}
                    <div className="order-items-table">
                      <div className="oit-head">
                        <span>Plan</span>
                        <span>Prix unitaire</span>
                        <span>Actions</span>
                      </div>
                      {(order.items ?? []).map((item) => {
                        const canDownload = !!item.download?.token && !!item.download?.signed_url && order.payment_status === 'paid'
                        const canCancel = !isProcessing && (order.payment_status === 'pending' || order.payment_status === 'paid')
                        const canPreview = !!item.plan?.preview_url

                        return (
                          <div key={item.id} className="oit-row">
                            <div className="oit-plan">
                              <div className="oit-thumb" style={{ background: planGradient(item.id) }}>
                                <span>{(item.plan?.title ?? 'P').slice(0,2).toUpperCase()}</span>
                              </div>
                              <span className="oit-plan-name">{item.plan?.title ?? 'Plan'}</span>
                            </div>
                            <span className="oit-price">{fmt(item.unit_price_cents, item.plan?.currency ?? 'EUR')}</span>
                            <div className="oit-actions">
                              <button
                                className="oit-btn oit-btn--download"
                                onClick={() => handleDownload(item.download?.token, item.download?.signed_url)}
                                disabled={!canDownload}
                                title={canDownload ? 'Télécharger le plan' : 'Disponible après paiement'}
                                aria-label={`Télécharger ${item.plan?.title}`}
                              >
                                <i className="bi bi-download" />
                                <span>Télécharger</span>
                              </button>
                              <button
                                className="oit-btn oit-btn--preview"
                                onClick={() => canPreview && window.open(item.plan.preview_url, '_blank')}
                                disabled={!canPreview}
                                title="Prévisualiser"
                                aria-label={`Prévisualiser ${item.plan?.title}`}
                              >
                                <i className="bi bi-eye" />
                              </button>
                              <button
                                className="oit-btn oit-btn--cancel"
                                onClick={() => handleCancel(order.id)}
                                disabled={!canCancel}
                                title="Annuler la commande"
                                aria-label="Annuler la commande"
                              >
                                {isProcessing
                                  ? <span className="o-spinner o-spinner--dark" />
                                  : <i className="bi bi-x-circle" />}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Order footer */}
                    <div className="order-footer">
                      <span className="order-footer-label">Total commande</span>
                      <span className="order-footer-total">{fmt(order.total_cents, order.currency)}</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
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
    --green:#2d7a4f;--green-bg:#e6f4ec;--red:#c0392b;--red-bg:#fdecea;
    --shadow-card:0 2px 8px rgba(26,22,20,0.06),0 16px 48px rgba(26,22,20,0.08);
    --radius:16px;--radius-sm:10px;--radius-pill:999px;
    --transition:200ms cubic-bezier(.4,0,.2,1);
    --font-display:'Playfair Display',Georgia,serif;
    --font-body:'DM Sans',system-ui,sans-serif;
  }
  body{background:var(--sand);font-family:var(--font-body);color:var(--ink)}

  .orders-page{max-width:900px;margin:0 auto;padding:48px 40px 80px;position:relative}

  /* ── TOAST ── */
  .orders-toast{
    position:fixed;top:20px;right:24px;z-index:500;
    display:flex;align-items:center;gap:10px;
    padding:13px 20px;border-radius:var(--radius-pill);
    font-size:.825rem;font-weight:500;
    box-shadow:0 4px 20px rgba(0,0,0,0.12);
    animation:toastIn .3s cubic-bezier(.22,1,.36,1);
    max-width:360px;
  }
  @keyframes toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
  .orders-toast.success{background:var(--green);color:#fff}
  .orders-toast.error{background:var(--red);color:#fff}

  /* ── HEADER ── */
  .orders-header{
    display:flex;align-items:flex-end;justify-content:space-between;
    margin-bottom:40px;padding-bottom:24px;border-bottom:1px solid var(--border);
    flex-wrap:wrap;gap:16px;
  }
  .orders-eyebrow{font-size:.65rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:6px}
  .orders-title{font-family:var(--font-display);font-size:clamp(1.75rem,3vw,2.5rem);font-weight:500;color:var(--ink);letter-spacing:-.025em}
  .orders-title em{font-style:italic}
  .orders-btn-catalog{
    display:flex;align-items:center;gap:7px;
    height:42px;padding:0 20px;border-radius:var(--radius-pill);
    border:1.5px solid var(--border-strong);background:transparent;
    font-family:var(--font-body);font-size:.825rem;font-weight:600;color:var(--ink);
    cursor:pointer;white-space:nowrap;transition:all var(--transition);
  }
  .orders-btn-catalog:hover{background:var(--ink);color:var(--white);border-color:var(--ink)}

  /* ── SKELETONS ── */
  .orders-skeletons{display:flex;flex-direction:column;gap:12px}
  .order-skeleton{
    height:80px;border-radius:var(--radius);
    background:var(--sand-mid);
    animation:shimmer 1.4s ease infinite both;
  }
  @keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}

  /* ── EMPTY / ERROR ── */
  .orders-empty{
    display:flex;flex-direction:column;align-items:center;
    text-align:center;padding:80px 24px;gap:14px;
  }
  .orders-empty-icon{
    width:68px;height:68px;border-radius:20px;
    background:var(--sand-mid);
    display:flex;align-items:center;justify-content:center;
    font-size:1.6rem;color:var(--ink-muted);margin-bottom:4px;
  }
  .orders-empty h2{font-family:var(--font-display);font-size:1.35rem;font-weight:500;color:var(--ink);letter-spacing:-.015em}
  .orders-empty p{font-size:.875rem;color:var(--ink-muted);font-weight:300}
  .orders-btn-retry{
    display:flex;align-items:center;gap:7px;height:42px;padding:0 20px;
    border-radius:var(--radius-pill);border:none;background:var(--ink);color:var(--white);
    font-family:var(--font-body);font-size:.825rem;font-weight:600;
    cursor:pointer;margin-top:8px;transition:all var(--transition);
  }
  .orders-btn-retry:hover{background:var(--accent)}

  /* ── LIST ── */
  .orders-list{display:flex;flex-direction:column;gap:12px}

  /* ── ORDER CARD ── */
  .order-card{
    background:var(--white);border:1px solid var(--border);
    border-radius:var(--radius);overflow:hidden;
    box-shadow:var(--shadow-card);
    animation:fadeUp .35s ease both;
    transition:box-shadow var(--transition);
  }
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  .order-card.is-expanded{box-shadow:0 4px 16px rgba(26,22,20,.08),0 20px 56px rgba(26,22,20,.10)}

  /* Summary row (always visible, acts as toggle) */
  .order-summary{
    width:100%;display:flex;align-items:center;justify-content:space-between;
    padding:18px 24px;gap:16px;
    background:transparent;border:none;cursor:pointer;
    text-align:left;transition:background var(--transition);
  }
  .order-summary:hover{background:rgba(245,239,230,.6)}
  .order-summary-left{display:flex;align-items:center;gap:16px}
  .order-id-col{display:flex;flex-direction:column;gap:2px;min-width:70px}
  .order-num{font-size:.95rem;font-weight:700;color:var(--ink);letter-spacing:-.01em}
  .order-date{font-size:.72rem;color:var(--ink-muted);font-weight:300}

  .order-items-preview{display:flex;gap:-4px;align-items:center}
  .order-item-thumb{
    width:36px;height:36px;border-radius:10px;
    display:flex;align-items:center;justify-content:center;
    font-family:var(--font-display);font-size:.75rem;font-weight:600;
    color:rgba(26,22,20,.3);border:2px solid var(--white);
    margin-left:-6px;
  }
  .order-item-thumb:first-child{margin-left:0}
  .order-item-thumb--more{background:var(--sand-mid);font-family:var(--font-body);font-size:.7rem;font-weight:700;color:var(--ink-muted)}

  .order-summary-right{display:flex;align-items:center;gap:14px;flex-shrink:0}
  .order-status-badge{
    display:inline-flex;align-items:center;gap:5px;
    padding:4px 10px;border-radius:var(--radius-pill);
    font-size:.68rem;font-weight:700;letter-spacing:.05em;white-space:nowrap;
  }
  .order-total{font-family:var(--font-display);font-size:1.05rem;font-weight:500;color:var(--ink);letter-spacing:-.02em}
  .order-chevron{font-size:.8rem;color:var(--ink-muted);transition:transform var(--transition);flex-shrink:0}
  .order-chevron.is-open{transform:rotate(180deg)}

  /* Body */
  .order-body{
    display:none;border-top:1px solid var(--border);
    flex-direction:column;gap:0;
  }
  .order-body.is-open{display:flex}

  /* Payment banner */
  .order-pay-banner{
    display:flex;align-items:center;justify-content:space-between;
    gap:16px;padding:16px 24px;
    background:#fffbf0;border-bottom:1px solid rgba(176,122,16,.15);
    flex-wrap:wrap;
  }
  .order-pay-text{display:flex;align-items:flex-start;gap:10px;font-size:.825rem}
  .order-pay-text i{color:#b07a10;font-size:1rem;margin-top:1px;flex-shrink:0}
  .order-pay-text strong{display:block;font-weight:600;color:var(--ink);margin-bottom:2px}
  .order-pay-text span{color:var(--ink-muted);font-weight:300}
  .order-pay-btns{display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap}
  .opay-btn{
    height:38px;padding:0 16px;border-radius:var(--radius-pill);
    border:none;font-family:var(--font-body);font-size:.78rem;font-weight:600;
    cursor:pointer;display:flex;align-items:center;gap:6px;
    transition:all var(--transition);white-space:nowrap;
  }
  .opay-btn:disabled{opacity:.5;cursor:not-allowed}
  .opay-btn--success{background:var(--ink);color:var(--white)}
  .opay-btn--success:hover:not(:disabled){background:var(--green)}
  .opay-btn--fail{background:transparent;border:1.5px solid rgba(192,57,43,.3);color:var(--red)}
  .opay-btn--fail:hover:not(:disabled){background:var(--red-bg)}

  /* Items table */
  .order-items-table{padding:8px 24px 0}
  .oit-head{
    display:grid;grid-template-columns:1fr auto 140px;
    gap:16px;padding:10px 0;
    border-bottom:1px solid var(--border);
    font-size:.65rem;font-weight:700;letter-spacing:.12em;
    text-transform:uppercase;color:var(--ink-muted);
  }
  .oit-row{
    display:grid;grid-template-columns:1fr auto 140px;
    gap:16px;align-items:center;
    padding:14px 0;border-bottom:1px solid var(--border);
    transition:background var(--transition);
  }
  .oit-row:last-child{border-bottom:none}
  .oit-plan{display:flex;align-items:center;gap:10px}
  .oit-thumb{
    width:38px;height:38px;border-radius:10px;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    font-family:var(--font-display);font-size:.8rem;font-weight:600;color:rgba(26,22,20,.25);
  }
  .oit-plan-name{font-size:.875rem;font-weight:500;color:var(--ink)}
  .oit-price{font-family:var(--font-display);font-size:.95rem;font-weight:500;color:var(--ink);white-space:nowrap}

  .oit-actions{display:flex;align-items:center;gap:6px;justify-content:flex-end}
  .oit-btn{
    display:flex;align-items:center;gap:5px;
    height:34px;border-radius:var(--radius-sm);border:1.5px solid var(--border);
    background:transparent;font-family:var(--font-body);font-size:.78rem;
    color:var(--ink-soft);cursor:pointer;padding:0 10px;
    transition:all var(--transition);white-space:nowrap;
  }
  .oit-btn:disabled{opacity:.35;cursor:not-allowed}
  .oit-btn--download:not(:disabled):hover{background:var(--ink);border-color:var(--ink);color:var(--white)}
  .oit-btn--preview:not(:disabled):hover{background:var(--sand-mid);color:var(--ink)}
  .oit-btn--cancel:not(:disabled):hover{background:var(--red-bg);border-color:rgba(192,57,43,.3);color:var(--red)}
  .oit-btn span{display:none}
  @media(min-width:600px){.oit-btn--download span{display:inline}}

  /* Order footer */
  .order-footer{
    display:flex;align-items:center;justify-content:flex-end;
    gap:12px;padding:16px 24px;
    background:var(--sand);border-top:1px solid var(--border);
  }
  .order-footer-label{font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-muted)}
  .order-footer-total{font-family:var(--font-display);font-size:1.2rem;font-weight:500;color:var(--ink);letter-spacing:-.02em}

  /* Spinner */
  .o-spinner{
    display:inline-block;width:14px;height:14px;border-radius:50%;
    border:2px solid rgba(255,255,255,.35);border-top-color:#fff;
    animation:spin .7s linear infinite;flex-shrink:0;
  }
  .o-spinner--dark{border-color:rgba(26,22,20,.2);border-top-color:var(--ink)}
  @keyframes spin{to{transform:rotate(360deg)}}

  /* Responsive */
  @media(max-width:640px){
    .orders-page{padding:24px 16px 60px}
    .order-summary{padding:14px 16px}
    .oit-head,.oit-row{grid-template-columns:1fr 100px}
    .oit-head span:nth-child(2),.oit-price{display:none}
    .order-items-table{padding:8px 16px 0}
    .order-footer{padding:14px 16px}
    .order-pay-banner{padding:12px 16px}
  }
`