export function formatPrice(priceCents, currency = 'XAF') {
  const amount = Number(priceCents ?? 0) / 100
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(amount)

  if (currency.toUpperCase() === 'XAF') {
    return formatted.replace(/XAF|FCFA/g, 'F CFA')
  }

  return formatted
}
