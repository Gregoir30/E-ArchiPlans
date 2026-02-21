const TOKEN_KEY = 'earchiplans_api_token'
const USER_KEY = 'earchiplans_user'
const AUTH_EVENT = 'auth-state-changed'

function emitAuthStateChanged() {
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) ?? ''
}

export function setAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
  emitAuthStateChanged()
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY)
  emitAuthStateChanged()
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  emitAuthStateChanged()
}

export function clearStoredUser() {
  localStorage.removeItem(USER_KEY)
  emitAuthStateChanged()
}

export function withAuthHeader(headers = {}) {
  const token = getAuthToken()
  if (!token) return headers
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  }
}

export { AUTH_EVENT }