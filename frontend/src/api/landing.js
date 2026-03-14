import { readJson } from './http'

const initialLandingResponse = {
  heroPlan: null,
  featuredPlans: [],
  galleryPlans: [],
  stats: null,
  priceRange: { min: 0, max: 0 },
  categoryFilters: [],
}

export async function fetchLandingData() {
  const response = await fetch('/api/landing', {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    return { ok: false, message: 'Impossible de récupérer les données de la page d’accueil.' }
  }

  const payload = await readJson(response)
  if (!payload) {
    return { ok: false, message: 'Données de la landing indisponibles.' }
  }

  return {
    ok: true,
    data: {
      heroPlan: payload?.hero_plan ?? null,
      featuredPlans: Array.isArray(payload?.featured_plans) ? payload.featured_plans : [],
      galleryPlans: Array.isArray(payload?.gallery_plans) ? payload.gallery_plans : [],
      stats: payload?.stats ?? null,
      priceRange: payload?.price_range ?? { min: 0, max: 0 },
      categoryFilters: Array.isArray(payload?.category_filters) ? payload.category_filters : [],
    },
  }
}
