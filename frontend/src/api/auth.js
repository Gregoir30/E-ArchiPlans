import { getFirstValidationError, readJson } from './http'
import {
  clearAuthToken,
  clearStoredUser,
  setAuthToken,
  setStoredUser,
  withAuthHeader,
} from '../utils/authToken'

export async function registerUser(payload) {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await readJson(response)

  if (response.ok) {
    if (data?.token) setAuthToken(data.token)
    if (data?.user) setStoredUser(data.user)
    return { ok: true, message: data?.message ?? 'Compte cree avec succes.', user: data?.user ?? null }
  }

  return {
    ok: false,
    message: getFirstValidationError(data?.errors, "Echec de l'inscription."),
  }
}

export async function loginUser(payload) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await readJson(response)
  if (response.ok && data?.token) {
    setAuthToken(data.token)
    if (data?.user) setStoredUser(data.user)
    return { ok: true, message: data?.message ?? 'Connexion reussie.', user: data?.user ?? null }
  }

  return {
    ok: false,
    message: data?.message ?? getFirstValidationError(data?.errors, 'Echec de connexion.'),
  }
}

export async function logoutUser() {
  const response = await fetch('/api/logout', {
    method: 'POST',
    headers: withAuthHeader({ Accept: 'application/json' }),
  })

  const data = await readJson(response)
  clearAuthToken()
  clearStoredUser()

  if (response.ok) {
    return { ok: true, message: data?.message ?? 'Deconnexion reussie.' }
  }

  return { ok: false, message: data?.message ?? 'Session fermee localement.' }
}

export async function fetchCurrentUser() {
  const response = await fetch('/api/me', {
    headers: withAuthHeader({ Accept: 'application/json' }),
  })

  const data = await readJson(response)

  if (response.ok && data?.user) {
    setStoredUser(data.user)
    return { ok: true, user: data.user }
  }

  return { ok: false, user: null }
}

export async function updateCurrentUser(payload) {
  const response = await fetch('/api/me', {
    method: 'PUT',
    headers: withAuthHeader({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
    body: JSON.stringify(payload),
  })

  const data = await readJson(response)

  if (response.ok && data?.user) {
    setStoredUser(data.user)
    return { ok: true, user: data.user, message: data?.message ?? 'Profil mis a jour.' }
  }

  return {
    ok: false,
    user: null,
    message: data?.message ?? getFirstValidationError(data?.errors, 'Mise a jour impossible.'),
  }
}