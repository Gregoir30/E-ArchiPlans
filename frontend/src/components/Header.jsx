import { useEffect, useMemo, useState } from 'react'

function buildNavItems({ isAuthenticated }) {
  const baseLinks = [
    { path: '/', label: 'Accueil' },
    { path: '/plans', label: 'Plans' },
    { path: '/contact', label: 'Contact' },
  ]

  if (isAuthenticated) {
    return baseLinks
  }

  return [...baseLinks, { path: '/login', label: 'Connexion' }, { path: '/register', label: 'Inscription' }]
}

function getRoleLabel(role) {
  if (role === 'admin') return 'Administrateur'
  if (role === 'seller') return 'Vendeur'
  if (role === 'buyer') return 'Acheteur'
  return role ?? ''
}

export default function Header({ currentPath, onNavigate, user, isAuthenticated }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navItems = useMemo(
    () =>
      buildNavItems({
        isAuthenticated,
        role: user?.role ?? '',
      }),
    [isAuthenticated, user?.role],
  )

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsMenuOpen(false))
    return () => window.cancelAnimationFrame(frame)
  }, [currentPath])

  function handleMenuNavigate(event, nextPath) {
    event.preventDefault()
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
  }

  return (
    <header className={`site-header ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="header-branding">
        <a href="/" onClick={(event) => handleMenuNavigate(event, '/')} className="brand">
          E-ArchiPlans
        </a>
        <p className="brand-subtitle">Plans prêts à livrer | Experts & certifiés</p>
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

      <button
        type="button"
        className="hamburger-btn"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        onClick={() => setIsMenuOpen((prev) => !prev)}
      >
        <i className={`bi ${isMenuOpen ? 'bi-x-lg' : 'bi-list'}`} />
      </button>

      <nav id="main-navigation" className={`site-nav ${isMenuOpen ? 'is-open' : ''}`}>
        {navItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            onClick={(event) => handleMenuNavigate(event, item.path)}
            className={currentPath === item.path ? 'is-active' : ''}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <button type="button" className="icon-btn cart-btn" aria-label="Voir le panier">
          <i className="bi bi-bag-check" />
          <span className="cart-badge" aria-live="polite">
            0
          </span>
        </button>
        {isAuthenticated ? (
          <button
            type="button"
            className="profile-btn"
            onClick={(event) => handleMenuNavigate(event, '/profil')}
          >
            <i className="bi bi-person-circle" />
            <span>
              {user?.name ?? 'Profil'}
              <small>{getRoleLabel(user?.role)}</small>
            </span>
          </button>
        ) : (
          <div className="auth-actions">
            <button type="button" className="ghost-btn" onClick={(event) => handleMenuNavigate(event, '/login')}>
              Connexion
            </button>
            <button type="button" className="primary-btn" onClick={(event) => handleMenuNavigate(event, '/register')}>
              Inscription
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
