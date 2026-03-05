import { getFirstValidationError, readJson } from './http'
import { withAuthHeader } from '../utils/authToken'

export async function fetchAdminUsers() {
  const response = await fetch('/api/admin/users', {
    headers: withAuthHeader({ Accept: 'application/json' }),
  })

  const data = await readJson(response)
  if (response.ok) return { ok: true, users: Array.isArray(data?.data) ? data.data : [] }
  return { ok: false, users: [], message: data?.message ?? 'Impossible de charger les utilisateurs.' }
}

export async function updateAdminUser(userId, payload) {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    headers: withAuthHeader({ Accept: 'application/json', 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  })

  const data = await readJson(response)
  if (response.ok) return { ok: true, user: data?.user }
  return { ok: false, message: getFirstValidationError(data?.errors, data?.message ?? 'Mise a jour impossible.') }
}

export async function moderatePlan(planId, status) {
  const response = await fetch(`/api/admin/plans/${planId}/moderate`, {
    method: 'PATCH',
    headers: withAuthHeader({ Accept: 'application/json', 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status }),
  })

  const data = await readJson(response)
  if (response.ok) return { ok: true, plan: data?.plan, message: data?.message ?? '' }
  return { ok: false, message: data?.message ?? 'Moderation impossible.' }
}

export async function fetchAdminCategories() {
  const response = await fetch('/api/admin/categories', {
    headers: withAuthHeader({ Accept: 'application/json' }),
  })

  const data = await readJson(response)
  if (response.ok) return { ok: true, categories: Array.isArray(data?.data) ? data.data : [] }
  return { ok: false, categories: [], message: data?.message ?? 'Impossible de charger les categories.' }
}

export async function createAdminCategory(payload) {
  const response = await fetch('/api/admin/categories', {
    method: 'POST',
    headers: withAuthHeader({ Accept: 'application/json', 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  })

  const data = await readJson(response)
  if (response.ok) return { ok: true }
  return { ok: false, message: getFirstValidationError(data?.errors, data?.message ?? 'Creation impossible.') }
}

export async function deleteAdminCategory(categoryId) {
  const response = await fetch(`/api/admin/categories/${categoryId}`, {
    method: 'DELETE',
    headers: withAuthHeader({ Accept: 'application/json' }),
  })

  if (response.ok) return { ok: true }
  const data = await readJson(response)
  return { ok: false, message: data?.message ?? 'Suppression impossible.' }
}

