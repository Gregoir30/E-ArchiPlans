const BASE_URL = import.meta.env.VITE_API_URL || '';

export function getApiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}

export async function readJson(response) {
  return response.json().catch(() => null)
}

export function getFirstValidationError(errors, fallback) {
  if (!errors) return fallback
  const firstError = Object.values(errors)[0]
  return Array.isArray(firstError) ? firstError[0] : fallback
}
