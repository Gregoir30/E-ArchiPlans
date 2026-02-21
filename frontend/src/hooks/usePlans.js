import { useCallback, useState } from 'react'
import { fetchPlans as fetchPlansApi } from '../api/plans'

export default function usePlans() {
  const [plans, setPlans] = useState([])
  const [plansStatus, setPlansStatus] = useState('idle')
  const [plansError, setPlansError] = useState('')

  const refreshPlans = useCallback(async () => {
    setPlansStatus('loading')
    setPlansError('')

    const result = await fetchPlansApi()
    if (!result.ok) {
      setPlans([])
      setPlansStatus('error')
      setPlansError(result.message)
      return
    }

    setPlans(result.plans)
    setPlansStatus('success')
  }, [])

  return {
    plans,
    plansStatus,
    plansError,
    refreshPlans,
  }
}
