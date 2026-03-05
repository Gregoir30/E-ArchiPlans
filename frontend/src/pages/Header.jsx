import { useState } from 'react'
import './Header.css'

export default function Header({ onNavigate, cartCount = 0 }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  const handleSearch = (e) => {
    e.preventDefault()
    // TODO: Implement search logic or navigation to search page
    console.log('Searching for:', searchQuery)
    if (onNavigate) onNavigate(e, `/plans?q=${searchQuery}`)
  }

  const navLinks = [
    { label: 'Accueil', path: '/' },
    { label: 'Plans', path: '/plans' },
    { label: 'À propos', path: '/a-propos' },
    { label: 'Contact', path: '/contact' },
  ]

  return (
    <header className="site-header">
      {/* Logo */}
      <a href="/" className="header-logo" onClick={(e) => onNavigate(e, '/')}>
        E-ArchiPlans
      </a>

      {/* Desktop Navigation */}
      <nav className="header-nav" aria-label="Navigation principale">
        {navLinks.map((link) => (
          <a key={link.path} href={link.path} onClick={(e) => onNavigate(e, link.path)}>
            {link.label}
          </a>
        ))}
      </nav>

      {/* Search Bar (Desktop) */}
      <form className="header-search" onSubmit={handleSearch} role="search">
        <i className="bi bi-search" aria-hidden="true"></i>
        <input
          type="text"
          placeholder="Rechercher un plan (titre, surface...)"
          aria-label="Rechercher"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {/* Actions */}
      <div className="header-actions">
        <button className="header-icon-btn" aria-label="Panier">
          <i className="bi bi-cart"></i>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
        
        <a href="/login" className="btn-login" onClick={(e) => onNavigate(e, '/login')}>
          Connexion
        </a>

        <button 
          className="header-icon-btn mobile-menu-toggle" 
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isMobileMenuOpen}
        >
          <i className={`bi ${isMobileMenuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isMobileMenuOpen ? 'is-open' : ''}`}>
        <form className="mobile-search" onSubmit={handleSearch}>
          <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </form>
        {navLinks.map((link) => (
          <a key={link.path} href={link.path} onClick={(e) => { onNavigate(e, link.path); setIsMobileMenuOpen(false); }}>
            {link.label}
          </a>
        ))}
        <a href="/login" onClick={(e) => { onNavigate(e, '/login'); setIsMobileMenuOpen(false); }}>Connexion</a>
      </div>
    </header>
  )
}