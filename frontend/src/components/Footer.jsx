export default function Footer({ onNavigate }) {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <p>Copyright {year} E-ArchiPlans. Tous droits reserves.</p>
      <nav aria-label="Liens de pied de page" className="footer-nav">
        <a href="/" onClick={(event) => onNavigate(event, '/')}>
          Accueil
        </a>
        <a href="/plans" onClick={(event) => onNavigate(event, '/plans')}>
          Plans
        </a>
        <a href="/contact" onClick={(event) => onNavigate(event, '/contact')}>
          Contact
        </a>
      </nav>
    </footer>
  )
}
