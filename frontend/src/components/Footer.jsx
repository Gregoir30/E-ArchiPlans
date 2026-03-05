export default function Footer({ onNavigate }) {
  const year = new Date().getFullYear()
  const navLinks = [
    { path: '/', label: 'Accueil' },
    { path: '/plans', label: 'Plans' },
    { path: '/a-propos', label: 'À propos' },
    { path: '/contact', label: 'Contact' },
  ]
  const legalLinks = [
    { path: '/cgv', label: 'CGV' },
    { path: '/mentions-legales', label: 'Mentions légales' },
    { path: '/confidentialite', label: 'Politique de confidentialité' },
  ]
  const socialLinks = [
    { href: 'https://instagram.com', label: 'Instagram', icon: 'bi bi-instagram' },
    { href: 'https://pinterest.com', label: 'Pinterest', icon: 'bi bi-pinterest' },
    { href: 'https://linkedin.com', label: 'LinkedIn', icon: 'bi bi-linkedin' },
  ]

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <a href="/" onClick={(event) => onNavigate(event, '/')} className="brand-footer">
            E-ArchiPlans
          </a>
          <p>
            Plans architecturaux prêts à livrer, construits par des architectes certifiés et accompagnés
            par notre studio.
          </p>
          <div className="payment-logos" aria-label="Paiements sécurisés">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Instant</span>
          </div>
        </div>

        <div>
          <h4>Navigation</h4>
          <nav className="footer-nav" aria-label="Liens principaux">
            {navLinks.map((link) => (
              <a key={link.path} href={link.path} onClick={(event) => onNavigate(event, link.path)}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div>
          <h4>Légal</h4>
          <nav className="footer-nav" aria-label="Liens légaux">
            {legalLinks.map((link) => (
              <a key={link.path} href={link.path}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div>
          <h4>Contact</h4>
          <p>
            <a href="tel:+33123456789">+33 1 23 45 67 89</a>
          </p>
          <p>
            <a href="mailto:contact@earchiplans.com">contact@earchiplans.com</a>
          </p>
          <div className="footer-socials">
            {socialLinks.map((social) => (
              <a key={social.label} href={social.href} aria-label={social.label}>
                <i className={social.icon} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {year} E-ArchiPlans. Tous droits réservés.</p>
        <span>RGPD compliant</span>
      </div>
    </footer>
  )
}
