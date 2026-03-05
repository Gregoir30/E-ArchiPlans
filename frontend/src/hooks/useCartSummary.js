import { useCallback, useEffect, useState } from 'react'
import { fetchCartSummary } from '../api/orders'

export default function useCartSummary({ enabled = false } = {}) {
  const [itemsCount, setItemsCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const refreshCart = useCallback(async () => {
    if (!enabled) {
      setItemsCount(0)
      return
    }

    setLoading(true)
    const result = await fetchCartSummary()
    setLoading(false)

    if (result.ok) {
      setItemsCount(result.itemsCount)
    } else {
      setItemsCount(0)
    }
  }, [enabled])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  return {
    itemsCount,
    loading,
    refreshCart,
  }
}
