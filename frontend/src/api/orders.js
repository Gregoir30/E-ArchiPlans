import { readJson } from './http'
import { withAuthHeader } from '../utils/authToken'

export async function createOrder(planIds) {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: withAuthHeader({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
    body: JSON.stringify({ plan_ids: planIds }),
  })

  const data = await readJson(response)
  if (response.ok) {
    return {
      ok: true,
      order: data?.order,
      message: data?.message ?? 'Commande créée. Paiement FedaPay en attente.',
    }
  }
  if (response.status === 401) return { ok: false, message: 'Connexion requise.' }
  return { ok: false, message: data?.message ?? 'Création de commande impossible.' }
}

export async function fetchMyOrders() {
  const response = await fetch('/api/my-orders', {
    headers: withAuthHeader({ Accept: 'application/json' }),
  })
  const data = await readJson(response)

  if (!response.ok) {
    if (response.status === 401) return { ok: false, orders: [], message: 'Connexion requise.' }
    return { ok: false, orders: [], message: 'Impossible de charger vos commandes.' }
  }

  return {
    ok: true,
    orders: Array.isArray(data?.data) ? data.data : [],
    message: '',
  }
}

export async function fetchCartSummary() {
  const response = await fetch('/api/cart', {
    headers: withAuthHeader({ Accept: 'application/json' }),
  })
  if (!response.ok) {
    return { ok: false, itemsCount: 0 }
  }
  const data = await readJson(response)
  return {
    ok: true,
    itemsCount: Number(data?.items_count ?? 0),
  }
}

async function readErrorMessage(response, fallback) {
  const data = await readJson(response)
  if (data?.message) return data.message

  const text = await response.text().catch(() => '')
  if (text && text.trim().length > 0) return text

  return fallback
}

export async function simulateFedapayPayment(orderId, outcome) {
  const response = await fetch(`/api/orders/${orderId}/simulate-fedapay`, {
    method: 'POST',
    headers: withAuthHeader({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
    body: JSON.stringify({ outcome }),
  })

  const data = await readJson(response)
  if (response.ok) return { ok: true, message: data?.message ?? 'Simulation FedaPay effectuée.' }
  if (response.status === 401) return { ok: false, message: 'Connexion requise.' }
  if (response.status === 403) return { ok: false, message: data?.message ?? 'Action non autorisée.' }
  return { ok: false, message: data?.message ?? 'Simulation FedaPay impossible.' }
}

export async function downloadPlanByToken(token, signedUrl = '') {
  const targetUrl = signedUrl || `/api/downloads/${token}`
  const response = await fetch(targetUrl, {
    headers: withAuthHeader({ Accept: 'application/json, */*' }),
  })

  if (!response.ok) {
    if (response.status === 401) return { ok: false, message: 'Connexion requise.' }
    if (response.status === 403) return { ok: false, message: await readErrorMessage(response, 'Accès refusé.') }
    if (response.status === 404) return { ok: false, message: await readErrorMessage(response, 'Fichier introuvable.') }
    if (response.status === 410) return { ok: false, message: await readErrorMessage(response, 'Lien expiré.') }
    return { ok: false, message: await readErrorMessage(response, 'Téléchargement impossible.') }
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'plan'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)

  return { ok: true, message: 'Téléchargement lancé.' }
}

export async function cancelOrder(orderId) {
  const response = await fetch(`/api/orders/${orderId}/cancel`, {
    method: 'POST',
    headers: withAuthHeader({ Accept: 'application/json' }),
  })

  const data = await readJson(response)
  if (response.ok) return { ok: true, message: data?.message ?? 'Commande annulée.' }
  if (response.status === 401) return { ok: false, message: 'Connexion requise.' }
  if (response.status === 403) return { ok: false, message: 'Action non autorisée.' }
  return { ok: false, message: data?.message ?? 'Annulation impossible.' }
}
