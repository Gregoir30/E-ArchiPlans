import { useMemo, useState } from 'react'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import InputField from '../components/ui/InputField'
import StatusBadge from '../components/ui/StatusBadge'
import { createPlan, deletePlan, updatePlan } from '../api/plans'
import { formatPrice } from '../utils/format'
import useSellerPlans from '../hooks/useSellerPlans'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'pending', label: 'En attente' },
  { value: 'approved', label: 'Approuve' },
  { value: 'rejected', label: 'Rejete' },
]

const STATUS_LABELS = {
  draft: 'Brouillon',
  pending: 'En attente',
  approved: 'Approuve',
  rejected: 'Rejete',
}

export default function ManagePlansPage({ onRefreshPlans = () => {} }) {
  const [form, setForm] = useState({
    id: null,
    category_id: '',
    title: '',
    slug: '',
    description: '',
    price_cents: '',
    currency: 'XAF',
    status: 'draft',
    surface: '0',
    rooms: '1',
    levels: '1',
  })
  const [coverImage, setCoverImage] = useState(null)
  const [planFile, setPlanFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [previewPlan, setPreviewPlan] = useState(null)

  const { plans, status: plansStatus, error: plansError, refresh: refreshSellerPlans } = useSellerPlans()

  const categories = useMemo(() => {
    const map = new Map()
    plans.forEach((plan) => {
      if (plan.category?.id && plan.category?.name) map.set(plan.category.id, plan.category.name)
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [plans])

  const categoryOptions = [
    { value: '', label: 'Choisir une categorie' },
    ...categories.map((category) => ({ value: String(category.id), label: category.name })),
  ]

  function resetForm() {
    setForm({
      id: null,
      category_id: '',
      title: '',
      slug: '',
      description: '',
      price_cents: '',
      currency: 'USD',
      status: 'draft',
      surface: '0',
      rooms: '1',
      levels: '1',
    })
    setCoverImage(null)
    setPlanFile(null)
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function startEdit(plan) {
    setForm({
      id: plan.id,
      category_id: String(plan.category_id ?? ''),
      title: plan.title ?? '',
      slug: plan.slug ?? '',
      description: plan.description ?? '',
      price_cents: String(plan.price_cents ?? ''),
      currency: plan.currency ?? 'XAF',
      status: plan.status ?? 'draft',
      surface: String(plan.surface ?? 0),
      rooms: String(plan.rooms ?? 0),
      levels: String(plan.levels ?? 0),
    })
    setCoverImage(null)
    setPlanFile(null)
    setFeedback('')
  }

  function startPreview(plan) {
    setPreviewPlan(plan)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setFeedback('')

    const payload = {
      ...form,
      coverImage,
      planFile,
    }

    try {
      const result = form.id ? await updatePlan(form.id, payload) : await createPlan(payload)
      if (!result.ok) {
        setFeedback(result.message)
        return
      }

      setFeedback(form.id ? 'Plan mis a jour.' : 'Plan cree avec succes.')
      resetForm()
      await refreshSellerPlans()
      await onRefreshPlans()
    } catch {
      setFeedback('Service indisponible.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(planId) {
    setDeletingId(planId)
    setFeedback('')

    try {
      const result = await deletePlan(planId)
      if (!result.ok) {
        setFeedback(result.message)
        return
      }
      setFeedback('Plan supprime.')
      if (form.id === planId) resetForm()
      await refreshSellerPlans()
      await onRefreshPlans()
    } catch {
      setFeedback('Service indisponible.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="page">
      <section className="section-intro">
        <p className="eyebrow">Gestion des plans</p>
        <h1>Creer, modifier et supprimer vos plans</h1>
        <p>Utilisez ce module pour publier votre catalogue et gerer les fichiers associes.</p>
      </section>

      <section className="manage-layout">
        <form className="contact-form" onSubmit={handleSubmit}>
          <InputField
            id="category_id"
            name="category_id"
            label="Categorie"
            as="select"
            value={form.category_id}
            onChange={handleChange}
            required
            options={categoryOptions}
          />

          <InputField id="title" name="title" label="Titre" value={form.title} onChange={handleChange} required />

          <InputField id="slug" name="slug" label="Slug" value={form.slug} onChange={handleChange} required />

          <InputField
            id="description"
            name="description"
            label="Description"
            as="textarea"
            value={form.description}
            onChange={handleChange}
            rows={4}
          />

          <InputField
            id="surface"
            name="surface"
            label="Surface (m²)"
            type="number"
            min="0"
            value={form.surface}
            onChange={handleChange}
            required
          />

          <InputField
            id="rooms"
            name="rooms"
            label="Pièces"
            type="number"
            min="0"
            value={form.rooms}
            onChange={handleChange}
            required
          />

          <InputField
            id="levels"
            name="levels"
            label="Niveaux"
            type="number"
            min="0"
            value={form.levels}
            onChange={handleChange}
            required
          />

          <InputField
            id="price_cents"
            name="price_cents"
            label="Prix (en cents)"
            type="number"
            min="0"
            value={form.price_cents}
            onChange={handleChange}
            required
          />

          <InputField
            id="currency"
            name="currency"
            label="Devise"
            maxLength={3}
            value={form.currency}
            onChange={handleChange}
            required
          />

          <InputField
            id="status"
            name="status"
            label="Statut"
            as="select"
            value={form.status}
            onChange={handleChange}
            required
            options={STATUS_OPTIONS}
          />

          <InputField
            id="cover_image"
            name="cover_image"
            label="Image de couverture"
            type="file"
            accept="image/*"
            onChange={(event) => setCoverImage(event.target.files?.[0] ?? null)}
          />

          <InputField
            id="plan_file"
            name="plan_file"
            label="Fichier du plan"
            type="file"
            accept=".pdf,.dwg,.dxf,.zip"
            onChange={(event) => setPlanFile(event.target.files?.[0] ?? null)}
          />

          <div className="manage-actions">
            <Button type="submit" variant="primary" icon="bi bi-save" disabled={submitting}>
              {submitting ? 'Traitement...' : form.id ? 'Mettre a jour' : 'Creer le plan'}
            </Button>
            {form.id ? (
              <Button type="button" variant="secondary" icon="bi bi-x-circle" onClick={resetForm}>
                Annuler l'edition
              </Button>
            ) : null}
          </div>

          {feedback ? <p className={feedback.includes('succes') ? 'success' : 'error'}>{feedback}</p> : null}
        </form>

        <section className="plans-section">
          <div className="plans-header">
            <p className="eyebrow">Liste des plans</p>
            <h2>Plans existants</h2>
          </div>

          {plansStatus === 'loading' ? <p>Chargement...</p> : null}
          {plansStatus === 'error' ? <p className="error">{plansError}</p> : null}
          {plansStatus === 'success' && plans.length === 0 ? <EmptyState title="Aucun plan." /> : null}

          {previewPlan ? (
            <article className="plan-card">
              <StatusBadge value={previewPlan.status} labelMap={STATUS_LABELS} />
              <h3>{previewPlan.title}</h3>
              <p>{previewPlan.description || 'Sans description'}</p>
              <p>
                {previewPlan.category?.name ?? 'Sans categorie'} - {formatPrice(previewPlan.price_cents, previewPlan.currency)}
              </p>
              <p>
                Surface: {previewPlan.surface ?? 'Non renseigne'} m² • Pièces: {previewPlan.rooms ?? 'Non renseigne'} • Niveaux: {previewPlan.levels ?? 'Non renseigne'}
              </p>
              <Button type="button" variant="secondary" icon="bi bi-x-lg" onClick={() => setPreviewPlan(null)}>
                Fermer l'apercu
              </Button>
            </article>
          ) : null}

          {plansStatus === 'success' && plans.length > 0 ? (
            <div className="plans-grid">
              {plans.map((plan) => (
                <article key={plan.id} className="plan-card">
                  <StatusBadge value={plan.status} labelMap={STATUS_LABELS} />
                  <h3>{plan.title}</h3>
                  <p>{plan.category?.name ?? 'Sans categorie'}</p>
                  <p className="plan-price">{formatPrice(plan.price_cents, plan.currency)}</p>
                  <p className="plan-specs">
                    Surface: {plan.surface ?? 'NC'} m² • Pièces: {plan.rooms ?? 'NC'} • Niveaux: {plan.levels ?? 'NC'}
                  </p>
                  <div className="card-actions">
                    <Button type="button" variant="secondary" icon="bi bi-eye" title="Apercu" onClick={() => startPreview(plan)}>
                      Apercu
                    </Button>
                    <Button type="button" variant="secondary" icon="bi bi-pencil" title="Modifier" onClick={() => startEdit(plan)}>
                      Modifier
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      icon="bi bi-trash"
                      title="Supprimer"
                      onClick={() => handleDelete(plan.id)}
                      disabled={deletingId === plan.id}
                    >
                      {deletingId === plan.id ? 'Suppression...' : 'Supprimer'}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </section>
    </main>
  )
}
