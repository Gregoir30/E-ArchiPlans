const MODEL_LINKS = [
  { path: '/modeles/users', label: 'Users', icon: 'bi-people' },
  { path: '/modeles/categories', label: 'Categories', icon: 'bi-tags' },
  { path: '/modeles/plans', label: 'Plans', icon: 'bi-house-gear' },
  { path: '/modeles/orders', label: 'Orders', icon: 'bi-bag-check' },
  { path: '/modeles/order-items', label: 'Order Items', icon: 'bi-card-list' },
  { path: '/modeles/plan-downloads', label: 'Plan Downloads', icon: 'bi-download' },
  { path: '/modeles/contact-messages', label: 'Contact Messages', icon: 'bi-envelope-open' },
]

export default function ModelsHubPage({ onNavigate }) {
  return (
    <main className="page">
      <section className="section-intro">
        <p className="eyebrow">Modeles</p>
        <h1>Vues React par modele</h1>
        <p>Acces rapide aux vues liees aux modeles backend crees.</p>
      </section>

      <section className="plans-section">
        <div className="plans-grid">
          {MODEL_LINKS.map((item) => (
            <article key={item.path} className="plan-card">
              <h3>
                <i className={`bi ${item.icon}`} /> {item.label}
              </h3>
              <button
                type="button"
                className="secondary-btn"
                onClick={(event) => onNavigate(event, item.path)}
              >
                Ouvrir la vue
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

