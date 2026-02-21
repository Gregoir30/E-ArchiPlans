import { useEffect, useState } from 'react'

function buildNavItems({ isAuthenticated, role }) {
  const items = [
    { path: '/', label: 'Accueil' },
    { path: '/a-propos', label: 'A propos' },
    { path: '/contact', label: 'Contact' },
    { path: '/plans', label: 'Plans' },
  ]

  if (!isAuthenticated) {
    items.push({ path: '/login', label: 'Connexion' })
    items.push({ path: '/register', label: 'Inscription' })
    return items
  }

  items.push({ path: '/commandes', label: 'Commandes' })

  if (role === 'seller' || role === 'admin') {
    items.push({ path: '/gestion-plans', label: 'Gestion des plans' })
  }
  if (role === 'admin') {
    items.push({ path: '/modeles', label: 'Modeles' })
  }

  items.push({ path: '/logout', label: 'Deconnexion' })
  return items
}

function getRoleLabel(role) {
  if (role === 'admin') return 'Administrateur'
  if (role === 'seller') return 'Vendeur'
  if (role === 'buyer') return 'Acheteur'
  return role ?? ''
}

export default function Header({ currentPath, onNavigate, user, isAuthenticated }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = buildNavItems({
    isAuthenticated,
    role: user?.role ?? '',
  })

  useEffect(() => {
    setIsMenuOpen(false)
  }, [currentPath])

  function handleMenuNavigate(event, nextPath) {
    onNavigate(event, nextPath)
    setIsMenuOpen(false)
  }

  return (
    <header className={`site-header ${isMenuOpen ? 'menu-open' : ''}`}>
      <a href="/" onClick={(event) => handleMenuNavigate(event, '/')} className="brand">
        E-ArchiPlans
      </a>

      <button
        type="button"
        className="hamburger-btn"
        aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={isMenuOpen}
        aria-controls="main-navigation"
        onClick={() => setIsMenuOpen((prev) => !prev)}
      >
        <i className={`bi ${isMenuOpen ? 'bi-x-lg' : 'bi-list'}`} />
      </button>

      <nav id="main-navigation" className={`site-nav ${isMenuOpen ? 'is-open' : ''}`} aria-label="Navigation principale">
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

      {isAuthenticated ? (
        <a
          href="/profil"
          onClick={(event) => handleMenuNavigate(event, '/profil')}
          className={`header-user ${currentPath === '/profil' ? 'is-active' : ''}`}
        >
          <i className="bi bi-person-circle" />
          <span>{user?.name ?? 'Utilisateur'}</span>
          <small>{getRoleLabel(user?.role)}</small>
        </a>
      ) : null}
    </header>
  )
}
