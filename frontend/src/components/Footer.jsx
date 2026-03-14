import '../styles/footer.css'

const NAV_LINKS = [
  { path: '/', label: 'Accueil' },
  { path: '/plans', label: 'Plans' },
]

const LEGAL_LINKS = [
  { path: '/cgv', label: 'CGV' },
  { path: '/mentions-legales', label: 'Mentions légales' },
  { path: '/confidentialite', label: 'Confidentialité' },
]

const SOCIAL_LINKS = [
  { href: 'https://instagram.com', label: 'Instagram', icon: 'bi-instagram' },
  { href: 'https://pinterest.com', label: 'Pinterest', icon: 'bi-pinterest' },
  { href: 'https://linkedin.com', label: 'LinkedIn', icon: 'bi-linkedin' },
]

const CONTACT_ITEMS = [
  { icon: 'bi-geo-alt', text: 'Lomé, Togo' },
  { icon: 'bi-telephone', text: '+228 90 00 00 00', href: 'tel:+22890000000' },
  { icon: 'bi-envelope', text: 'contact@e-archiplans.com', href: 'mailto:contact@e-archiplans.com' },
]

const PAYMENT_METHODS = ['Visa', 'Mastercard', 'PayPal']

export default function Footer({ onNavigate }) {
  const year = new Date().getFullYear()

  const handleNavigation = (event, path) => {
    event.preventDefault()
    onNavigate?.(event, path)
  }

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <a href="/" onClick={(event) => handleNavigation(event, '/')} className="brand-link">
            E-ArchiPlans
          </a>
          <p className="footer-description">
            Des plans architecturaux prêts à livrer, validés par des experts et accompagnés par notre studio.
          </p>
          <div className="payment-badges" aria-label="Moyens de paiement acceptés">
            {PAYMENT_METHODS.map((method) => (
              <span key={method} className="payment-pill">
                {method}
              </span>
            ))}
          </div>
          <div className="footer-socials" aria-label="Réseaux sociaux">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="social-icon"
              >
                <i className={`bi ${link.icon}`} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <nav className="footer-links" aria-label="Navigation principale">
          <h4>Navigation</h4>
          {NAV_LINKS.map((link) => (
            <a key={link.path} href={link.path} onClick={(event) => handleNavigation(event, link.path)}>
              {link.label}
            </a>
          ))}
        </nav>

        <nav className="footer-links" aria-label="Liens légaux">
          <h4>Légal</h4>
          {LEGAL_LINKS.map((link) => (
            <a key={link.path} href={link.path} onClick={(event) => handleNavigation(event, link.path)}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="footer-contact">
          <h4>Contact</h4>
          <div className="contact-list">
            {CONTACT_ITEMS.map((item) =>
              item.href ? (
                <a
                  key={item.text}
                  href={item.href}
                  className="contact-item"
                >
                  <span className="contact-icon" aria-hidden="true">
                    <i className={`bi ${item.icon}`} />
                  </span>
                  <span>{item.text}</span>
                </a>
              ) : (
                <div key={item.text} className="contact-item">
                  <span className="contact-icon" aria-hidden="true">
                    <i className={`bi ${item.icon}`} />
                  </span>
                  <span>{item.text}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {year} E-ArchiPlans. Tous droits réservés.</p>
        <div className="footer-badges">
          <span className="footer-badge">
            <i className="bi bi-shield-check" aria-hidden="true" />
            RGPD conforme
          </span>
          <span className="footer-badge">
            <i className="bi bi-lock" aria-hidden="true" />
            Paiements sécurisés
          </span>
        </div>
      </div>
    </footer>
  )
}
