import { getFirstValidationError, readJson } from './http'
import { withAuthHeader } from '../utils/authToken'

export async function fetchPlans() {
  const response = await fetch('/api/plans', {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    return { ok: false, message: 'Impossible de charger les plans pour le moment.' }
  }

  const data = await readJson(response)
  const plans = Array.isArray(data?.data) ? data.data : []
  return { ok: true, plans }
}

export async function createPlan(payload) {
  return submitPlan('/api/plans', payload, false)
}

export async function updatePlan(planId, payload) {
  return submitPlan(`/api/plans/${planId}`, payload, true)
}

async function submitPlan(url, payload, isUpdate) {
  const body = new FormData()
  if (isUpdate) body.append('_method', 'PUT')

  body.append('category_id', payload.category_id)
  body.append('title', payload.title)
  body.append('slug', payload.slug)
  body.append('description', payload.description ?? '')
  body.append('surface', payload.surface)
  body.append('rooms', payload.rooms)
  body.append('levels', payload.levels)
  body.append('price_cents', payload.price_cents)
  body.append('currency', payload.currency)
  body.append('status', payload.status)

  if (payload.coverImage) body.append('cover_image', payload.coverImage)
  if (payload.planFile) body.append('plan_file', payload.planFile)

  const response = await fetch(url, {
    method: 'POST',
    headers: withAuthHeader({ Accept: 'application/json' }),
    body,
  })

  if (response.ok) return { ok: true }

  const data = await readJson(response)
  if (response.status === 401) return { ok: false, message: 'Connexion requise pour gerer les plans.' }
  if (response.status === 403) return { ok: false, message: 'Permission refusee pour cette action.' }

  return {
    ok: false,
    message: getFirstValidationError(data?.errors, 'Operation echouee. Reessayez.'),
  }
}

export async function deletePlan(planId) {
  const response = await fetch(`/api/plans/${planId}`, {
    method: 'DELETE',
    headers: withAuthHeader({ Accept: 'application/json' }),
  })

  if (response.ok) return { ok: true }
  if (response.status === 401) return { ok: false, message: 'Connexion requise.' }
  if (response.status === 403) return { ok: false, message: 'Permission refusee.' }
  return { ok: false, message: 'Suppression impossible.' }
}
