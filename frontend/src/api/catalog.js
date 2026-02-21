import { readJson } from './http'

export async function fetchPublicCategories() {
  const response = await fetch('/api/public/categories', {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    return { ok: false, categories: [] }
  }

  const data = await readJson(response)
  return {
    ok: true,
    categories: Array.isArray(data?.data) ? data.data : [],
  }
}

