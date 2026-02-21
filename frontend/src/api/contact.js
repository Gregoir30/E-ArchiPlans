import { getFirstValidationError, readJson } from './http'

export async function sendContactMessage(formData) {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(formData),
  })

  if (response.ok) {
    return { ok: true }
  }

  const data = await readJson(response)
  const message = getFirstValidationError(
    data?.errors,
    "Echec de l'envoi. Reessayez dans un instant."
  )

  return { ok: false, status: response.status, message }
}

