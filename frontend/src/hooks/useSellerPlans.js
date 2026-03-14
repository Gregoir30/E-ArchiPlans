import { useCallback, useEffect, useState } from 'react'
import { fetchSellerPlans } from '../api/dashboard'

export default function useSellerPlans() {
  const [plans, setPlans] = useState([])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const loadSellerPlans = useCallback(async () => {
    setStatus('loading')
    setError('')
    const result = await fetchSellerPlans()
    if (!result.ok) {
      setPlans([])
      setStatus('error')
      setError(result.message)
      return
    }

    setPlans(result.plans)
    setStatus('success')
  }, [])

  useEffect(() => {
    loadSellerPlans()
  }, [loadSellerPlans])

  return {
    plans,
    status,
    error,
    refresh: loadSellerPlans,
  }
}
