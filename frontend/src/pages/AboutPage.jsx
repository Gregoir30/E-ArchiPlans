export default function AboutPage() {
  const steps = [
    {
      num: "01",
      title: "Dépôt",
      desc: "Les architectes soumettent leurs plans avec toutes les informations techniques nécessaires.",
      icon: "bi-upload",
    },
    {
      num: "02",
      title: "Validation",
      desc: "Notre équipe vérifie la qualité, la conformité et l'exploitabilité de chaque plan.",
      icon: "bi-patch-check",
    },
    {
      num: "03",
      title: "Publication",
      desc: "Le plan est mis en ligne dans le catalogue et visible par tous les acheteurs.",
      icon: "bi-eye",
    },
    {
      num: "04",
      title: "Livraison",
      desc: "Après paiement, l'acheteur télécharge immédiatement les fichiers exploitables.",
      icon: "bi-download",
    },
  ]

  const values = [
    { icon: "bi-shield-check", label: "Qualité certifiée", desc: "Chaque plan est vérifié par nos experts avant publication." },
    { icon: "bi-lightning-charge", label: "Livraison immédiate", desc: "Téléchargez vos plans dès la confirmation de paiement." },
    { icon: "bi-people", label: "Architectes certifiés", desc: "Tous nos vendeurs sont des professionnels agréés." },
    { icon: "bi-arrow-repeat", label: "Support continu", desc: "Un accompagnement dédié à chaque étape de votre projet." },
  ]

  return (
    <>
      <main className="about-page">

        {/* ── HERO ── */}
        <section className="about-hero">
          <div className="hero-inner">
            <div className="hero-left">
              <p className="about-eyebrow">À propos</p>
              <h1 className="hero-h1">
                L'architecture,<br />
                <em>accessible à tous.</em>
              </h1>
              <p className="hero-lead">
                Notre mission est de rendre l'architecture accessible grâce à des plans de qualité,
                vérifiés et directement exploitables — livrés en quelques clics.
              </p>
            </div>

            <div className="hero-card-wrap">
              <div className="hero-card">
                <p className="hero-card-label">La plateforme en chiffres</p>
                <div className="hero-numbers">
                  <div className="hero-num">
                    <strong>500<span>+</span></strong>
                    <small>Plans disponibles</small>
                  </div>
                  <div className="hero-num">
                    <strong>120<span>+</span></strong>
                    <small>Architectes certifiés</small>
                  </div>
                  <div className="hero-num">
                    <strong>98<span>%</span></strong>
                    <small>Satisfaction client</small>
                  </div>
                  <div className="hero-num">
                    <strong>24<span>h</span></strong>
                    <small>Livraison garantie</small>
                  </div>
                </div>
                <div className="hero-card-divider" />
                <div className="hero-card-footer">
                  <i className="bi bi-patch-check-fill" />
                  Plans vérifiés par nos experts
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── VISION & MISSION ── */}
        <section className="about-section">
          <div className="section-header">
            <p className="section-eyebrow">Notre ADN</p>
            <h2 className="section-title">Vision &amp; <em>mission</em></h2>
            <p className="section-lead">
              Deux piliers qui guident chacune de nos décisions produit.
            </p>
          </div>
          <div className="vision-grid">
            <article className="vision-card">
              <div className="vision-icon">
                <i className="bi bi-eye" aria-hidden="true" />
              </div>
              <h2>Notre vision</h2>
              <p>
                Offrir un marché structuré où les architectes valorisent leurs créations
                et où les acheteurs trouvent rapidement un plan parfaitement adapté à
                leur projet, sans friction ni intermédiaire inutile.
              </p>
            </article>
            <article className="vision-card">
              <div className="vision-icon">
                <i className="bi bi-compass" aria-hidden="true" />
              </div>
              <h2>Notre mission</h2>
              <p>
                Démocratiser l'accès à des plans d'architecte professionnels, certifiés
                et exploitables immédiatement — afin que chaque porteur de projet
                puisse avancer avec confiance et sérénité.
              </p>
            </article>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="process-section">
          <div className="about-section">
            <div className="section-header">
              <p className="section-eyebrow">Le processus</p>
              <h2 className="section-title">Comment ça <em>fonctionne</em></h2>
              <p className="section-lead">
                De la soumission du plan à la livraison finale, un parcours simple et transparent.
              </p>
            </div>
            <div className="steps-grid">
              {steps.map((step, i) => (
                <div className="step-card" key={step.num}>
                  <span className="step-num">{step.num}</span>
                  <div className="step-icon">
                    <i className={`bi ${step.icon}`} aria-hidden="true" />
                  </div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                  {i < steps.length - 1 && <span className="step-line" aria-hidden="true" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="about-section">
          <div className="section-header">
            <p className="section-eyebrow">Nos engagements</p>
            <h2 className="section-title">Ce qui nous <em>distingue</em></h2>
          </div>
          <div className="values-grid">
            {values.map((v) => (
              <div className="value-card" key={v.label}>
                <div className="value-icon">
                  <i className={`bi ${v.icon}`} aria-hidden="true" />
                </div>
                <p className="value-label">{v.label}</p>
                <p className="value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="cta-banner">
          <div className="cta-inner">
            <div className="cta-text">
              <h2>Prêt à démarrer votre projet ?</h2>
              <p>Parcourez notre catalogue ou déposez votre demande sur-mesure.</p>
            </div>
            <div className="cta-btns">
              <button type="button" className="cta-primary">Voir les plans</button>
              <button type="button" className="cta-ghost">Déposer un projet</button>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}
