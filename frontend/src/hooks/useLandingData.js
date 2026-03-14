import { useCallback, useEffect, useState } from 'react'
import { fetchLandingData } from '../api/landing'

const initialLandingState = {
  heroPlan: null,
  featuredPlans: [],
  galleryPlans: [],
  stats: null,
  priceRange: { min: 0, max: 0 },
  categoryFilters: [],
}

export default function useLandingData() {
  const [landingData, setLandingData] = useState(() => ({ ...initialLandingState }))
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const loadLandingData = useCallback(async () => {
    setStatus('loading')
    setError('')
    const result = await fetchLandingData()
    if (!result.ok) {
    setLandingData({ ...initialLandingState })
      setStatus('error')
      setError(result.message)
      return
    }

    setLandingData(result.data)
    setStatus('success')
  }, [])

  useEffect(() => {
    loadLandingData()
  }, [loadLandingData])

  return {
    landingData,
    landingStatus: status,
    landingError: error,
    refreshLanding: loadLandingData,
  }
}
