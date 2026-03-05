import { useCallback, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'favoritePlans'

function readFavorites() {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return new Set()
    const parsed = JSON.parse(stored)
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch (error) {
    console.error('Impossible de charger les favoris', error)
    return new Set()
  }
}

export default function useFavorites(initialValue) {
  const [favoriteIds, setFavoriteIds] = useState(() => {
    if (initialValue instanceof Set) {
      return new Set(initialValue)
    }
    return readFavorites()
  })

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const payload = JSON.stringify(Array.from(favoriteIds))
    window.localStorage.setItem(STORAGE_KEY, payload)
    return undefined
  }, [favoriteIds])

  const toggleFavorite = useCallback((planId) => {
    setFavoriteIds((previous) => {
      const next = new Set(previous)
      if (next.has(planId)) next.delete(planId)
      else next.add(planId)
      return next
    })
  }, [])

  const hasFavorites = useMemo(() => favoriteIds.size > 0, [favoriteIds])

  return { favoriteIds, toggleFavorite, hasFavorites }
}
