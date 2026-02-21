import { readJson } from './http'
import { withAuthHeader } from '../utils/authToken'

export async function fetchSellerDashboard() {
  const response = await fetch('/api/dashboard/seller', {
    headers: withAuthHeader({ Accept: 'application/json' }),
  })

  const data = await readJson(response)

  if (response.ok) {
    return { ok: true, data, message: '' }
  }

  if (response.status === 401) return { ok: false, data: null, message: 'Connexion requise.' }
  if (response.status === 403) return { ok: false, data: null, message: 'Acces reserve au vendeur.' }
  return { ok: false, data: null, message: data?.message ?? 'Impossible de charger le dashboard vendeur.' }
}

export async function fetchAdminDashboard() {
  const response = await fetch('/api/dashboard/admin', {
    headers: withAuthHeader({ Accept: 'application/json' }),
  })

  const data = await readJson(response)

  if (response.ok) {
    return { ok: true, data, message: '' }
  }

  if (response.status === 401) return { ok: false, data: null, message: 'Connexion requise.' }
  if (response.status === 403) return { ok: false, data: null, message: 'Acces reserve a l\'administrateur.' }
  return { ok: false, data: null, message: data?.message ?? 'Impossible de charger le dashboard admin.' }
}
