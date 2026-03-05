export function getPlanCoverUrl(plan) {
  if (!plan?.id || !plan?.cover_image_path) return null
  return `/api/plans/${plan.id}/cover-image`
}

export function getOnlineFallbackImageUrl(plan) {
  const seed = encodeURIComponent(plan?.slug ?? plan?.id ?? plan?.title ?? 'architecture')
  return `https://picsum.photos/seed/${seed}/1200/900`
}
