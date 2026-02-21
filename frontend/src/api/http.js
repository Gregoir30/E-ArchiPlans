export async function readJson(response) {
  return response.json().catch(() => null)
}

export function getFirstValidationError(errors, fallback) {
  if (!errors) return fallback
  const firstError = Object.values(errors)[0]
  return Array.isArray(firstError) ? firstError[0] : fallback
}

