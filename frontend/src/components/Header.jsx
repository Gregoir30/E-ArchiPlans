import { useMemo, useState, useEffect, useRef } from 'react'

// Constantes déplacées à l'extérieur pour éviter la re-création à chaque render
const NAV_ITEMS = [
  { path: '/', label: 'Accueil' },
  { path: '/plans', label: 'Plans' },
  { path: '/a-propos', label: 'À propos' },
]

const CHIPS = ['Style', 'Surface', 'Prix']

const AUTH_ACTIONS = [
  { label: 'Connexion', path: '/login' },
  { label: 'Inscription', path: '/register' },
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
  const [activeChip, setActiveChip] = useState(CHIPS[0])
  const [isScrolled, setIsScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)
  
  const navItems = useMemo(() => NAV_ITEMS, [])
  const profileLabel = user?.name ? user.name.split(' ')[0] : 'Profil'

  // Gestion du scroll pour l'effet de transparence/ombre
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fermeture du dropdown au clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Navigation générique
  function handleNavigate(event, nextPath) {
    event?.preventDefault?.()
    onNavigate(event, nextPath)
    setIsMenuOpen(false)
    setDropdownOpen(false)
    setIsSearchOpen(false)
  }

  // Soumission de la recherche
  function handleSearchSubmit(event) {
    event.preventDefault()
    const trimmed = searchTerm.trim()
    if (trimmed) {
      const queryPath = `/plans?q=${encodeURIComponent(trimmed)}&filter=${activeChip.toLowerCase()}`
      window.history.replaceState({}, '', queryPath)
    }
    onNavigate(event, '/plans')
    setSearchTerm('')
    setIsMenuOpen(false)
  }

  function handleCartClick(event) {
    event.preventDefault()
    if (typeof onCartNavigate === 'function') onCartNavigate(event)
    else onNavigate(event, '/commandes')
    setIsMenuOpen(false)
    setIsSearchOpen(false)
  }

  function handleSearchToggle(event) {
    event.preventDefault()
    setIsMenuOpen(false)
    setDropdownOpen(false)
    setIsSearchOpen(true)
    setSearchTerm('')
    setTimeout(() => searchInputRef.current?.focus(), 50)
  }

  function handleSearchClose(event) {
    event.preventDefault()
    setSearchTerm('')
    setIsSearchOpen(false)
  }

  function handleProjectClick(event) {
    event.preventDefault()
    const targetPath =
      user?.role === 'seller' || user?.role === 'admin' ? '/gestion-plans' : '/contact'
    onNavigate(event, targetPath)
    setIsMenuOpen(false)
    setIsSearchOpen(false)
  }

  return (
    <header className={`site-header ${isMenuOpen ? 'menu-open' : ''} ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="header-brand">
        <a href="/" onClick={(e) => handleNavigate(e, '/')} className="brand">
          E-ArchiPlans
        </a>
      </div>

      <form
        className={`header-search ${isSearchOpen ? 'is-open' : 'is-closed'}`}
        onSubmit={handleSearchSubmit}
        role="search"
        aria-label="Rechercher un plan"
      >
        <div className="search-row">
          {!isSearchOpen && (
            <button
              type="button"
              className="search-toggle"
              onClick={handleSearchToggle}
              aria-label="Ouvrir la recherche"
            >
              <i className="bi bi-search" aria-hidden="true" />
            </button>
          )}

          {isSearchOpen && (
            <>
              <input
                ref={searchInputRef}
                className="search-input"
                placeholder="Villa, duplex, 100m²..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="search-submit" aria-label="Lancer la recherche">
                <i className="bi bi-arrow-right" />
              </button>
              <button
                type="button"
                className="search-close"
                onClick={handleSearchClose}
                aria-label="Fermer la recherche"
              >
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {isSearchOpen && (
          <div className="search-chips" role="group" aria-label="Filtres rapides">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                className={`search-chip ${activeChip === chip ? 'is-active' : ''}`}
                onClick={() => setActiveChip(chip)}
                aria-pressed={activeChip === chip}
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </form>

      <nav className={`site-nav ${isMenuOpen ? 'is-open' : ''}`} aria-label="Navigation principale">
        {navItems.map((item) => {
          const isActive = currentPath === item.path
          return (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => handleNavigate(e, item.path)}
              className={`nav-pill ${isActive ? 'is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
              {item.path === '/plans' && <span className="nav-pill-indicator" aria-hidden="true" />}
            </a>
          )
        })}
      </nav>

      <div className="header-actions">
        <button type="button" className="cart-pill" onClick={handleCartClick} aria-label="Voir le panier">
          <i className="bi bi-bag-check" aria-hidden="true" />
          {cartCount > 0 && (
            <span className="cart-badge" aria-live="polite">
              {cartCount}
            </span>
          )}
        </button>

        <button type="button" className="cta-secondary" onClick={handleProjectClick}>
          Déposer un plan
        </button>

        {isAuthenticated ? (
          <div className="profile-group" ref={dropdownRef}>
            <button
              type="button"
              className={`profile-avatar ${dropdownOpen ? 'is-open' : ''}`}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label="Ouvrir le menu profil"
            >
              <span className="profile-initials">{profileLabel.charAt(0).toUpperCase()}</span>
            </button>

            <div className={`profile-dropdown ${dropdownOpen ? 'is-open' : ''}`} role="menu">
              <div className="profile-summary" role="presentation">
                <strong>{profileLabel}</strong>
                <span>{getRoleLabel(user?.role)}</span>
              </div>
              <button
                type="button"
                className="dropdown-item"
                role="menuitem"
                onClick={(event) => handleNavigate(event, '/profil')}
              >
                Mon profil
              </button>
              <button
                type="button"
                className="dropdown-item"
                role="menuitem"
                onClick={(event) => handleNavigate(event, '/commandes')}
              >
                Mes commandes
              </button>
              <div className="dropdown-divider" aria-hidden="true" />
              <button
                type="button"
                className="dropdown-item danger"
                role="menuitem"
                aria-label="Déconnexion"
                onClick={(event) => handleNavigate(event, '/logout')}
              >
                <i className="bi bi-box-arrow-right" aria-hidden="true" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="auth-actions">
            {AUTH_ACTIONS.map((btn) => (
              <button
                key={btn.path}
                type="button"
                className="gray-btn"
                onClick={(e) => handleNavigate(e, btn.path)}
              >
                {btn.label}
              </button>
            ))}
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
        <i className={`bi ${isMenuOpen ? 'bi-x-lg' : 'bi-list'}`} aria-hidden="true" />
      </button>
    </header>
  )
}
