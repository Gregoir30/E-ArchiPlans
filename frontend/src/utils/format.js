export function formatPrice(priceCents, currency = 'USD') {
  const amount = Number(priceCents ?? 0) / 100
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

