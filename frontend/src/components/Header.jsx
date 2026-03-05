import { useMemo, useState } from 'react'

const NAV_ITEMS = [
  { path: '/', label: 'Accueil' },
  { path: '/plans', label: 'Plans' },
  { path: '/a-propos', label: 'À propos' },
  { path: '/contact', label: 'Contact' },
]

function getRoleLabel(role) {
  if (role === 'admin') return 'Administrateur'
  if (role === 'seller') return 'Vendeur'
  if (role === 'buyer') return 'Acheteur'
  return role ?? ''
}

export default function Header({
  currentPath,
  onNavigate,
  user,
  isAuthenticated,
  cartCount = 0,
  onCartNavigate,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navItems = useMemo(() => NAV_ITEMS, [])

  const profileLabel = user?.name ? user.name.split(' ')[0] : 'Mon profil'

  function handleNavigate(event, nextPath) {
    event?.preventDefault?.()
    onNavigate(event, nextPath)
    setIsMenuOpen(false)
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    const trimmed = searchTerm.trim()
    if (trimmed) {
      const queryPath = `/plans?q=${encodeURIComponent(trimmed)}`
      window.history.replaceState({}, '', queryPath)
    }
    onNavigate(event, '/plans')
    setSearchTerm('')
    setIsMenuOpen(false)
  }

  function handleAuthNavigation(event, nextPath) {
    event.preventDefault()
    onNavigate(event, nextPath)
    setIsMenuOpen(false)
  }

  function handleCartClick(event) {
    event.preventDefault()
    if (typeof onCartNavigate === 'function') {
      onCartNavigate(event)
    } else {
      onNavigate(event, '/commandes')
    }
    setIsMenuOpen(false)
  }

  return (
    <header className={`site-header ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="header-brand">
        <a href="/" onClick={(event) => handleNavigate(event, '/')} className="brand">
          E-ArchiPlans
        </a>
        <span className="brand-caption">Plans prêts à livrer | Experts certifiés</span>
      </div>

      <form className="header-search" onSubmit={handleSearchSubmit}>
        <input
          aria-label="Rechercher un plan"
          placeholder="Rechercher un plan (titre, style, surface...)"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <button type="submit" aria-label="Lancer la recherche">
          <i className="bi bi-search" />
        </button>
      </form>

      <nav id="main-navigation" className={`site-nav ${isMenuOpen ? 'is-open' : ''}`}>
        {navItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            onClick={(event) => handleNavigate(event, item.path)}
            className={currentPath === item.path ? 'is-active' : ''}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <button type="button" className="cart-pill" onClick={handleCartClick}>
          <i className="bi bi-bag-check" />
          <span className="cart-pill-label">Panier</span>
          <span className="cart-badge" aria-live="polite">
            {cartCount}
          </span>
        </button>

        {isAuthenticated ? (
          <div className="auth-actions auth-actions--connected">
            <button
              type="button"
              className="ghost-btn profile-btn"
              onClick={(event) => handleAuthNavigation(event, '/profil')}
            >
              <i className="bi bi-person-circle" />
              <span>
                {profileLabel}
                <small>{getRoleLabel(user?.role)}</small>
              </span>
            </button>
            <button
              type="button"
              className="ghost-btn"
              onClick={(event) => handleAuthNavigation(event, '/logout')}
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <div className="auth-actions">
            <button type="button" className="ghost-btn" onClick={(event) => handleAuthNavigation(event, '/login')}>
              Connexion
            </button>
            <button type="button" className="primary-btn" onClick={(event) => handleAuthNavigation(event, '/register')}>
              Inscription
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        className="hamburger-btn"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        onClick={() => setIsMenuOpen((prev) => !prev)}
      >
        <i className={`bi ${isMenuOpen ? 'bi-x-lg' : 'bi-list'}`} />
      </button>
    </header>
  )
}
