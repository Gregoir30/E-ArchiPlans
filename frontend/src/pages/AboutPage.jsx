export default function AboutPage() {
  return (
    <main className="page">
      <section className="section-intro">
        <p className="eyebrow">A propos</p>
        <h1>Une plateforme de plans qui accelere vos projets immobiliers.</h1>
        <p>
          Notre mission est de rendre l'architecture plus accessible grace a des plans de qualite,
          verifies et directement exploitables.
        </p>
      </section>

      <section className="grid-two">
        <article>
          <h2>Notre vision</h2>
          <p>
            Offrir un marche structure ou les architectes valorisent leurs creations et ou les acheteurs
            trouvent rapidement un plan adapte.
          </p>
        </article>
        <article>
          <h2>Comment ca fonctionne</h2>
          <p>
            Les vendeurs deposent leurs plans, l'administration valide la qualite, puis les acheteurs
            consultent, paient et telechargent.
          </p>
        </article>
      </section>
    </main>
  )
}
