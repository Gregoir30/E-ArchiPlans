import { memo } from 'react'

export const FALLBACK_PLAN_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"%3E%3Crect width="900" height="600" fill="%23f5f0ea"/%3E%3Crect x="30" y="30" width="840" height="420" rx="18" fill="%23e3d5c7"/%3E%3Crect x="60" y="480" width="780" height="90" rx="12" fill="%23d1c3b0"/%3E%3Cpath d="M120 150 L400 80 L680 150" stroke="%23776355" stroke-width="10" fill="none"/%3E%3Ccircle cx="210" cy="320" r="42" fill="%23776355"/%3E%3Ccircle cx="590" cy="210" r="30" fill="%23bea988"/%3E%3Ctext x="450" y="360" text-anchor="middle" font-family="Manrope, sans-serif" font-size="48" fill="%236a4e3a"%3EPlan%3C/text%3E%3C/svg%3E'

export function getPlanCoverUrl(plan) {
  if (!plan?.id || !plan?.cover_image_path) return null
  return `/api/plans/${plan.id}/cover-image`
}

const PlanCover = memo(function PlanCover({ plan, className = '', toneClass = '', alt, ...props }) {
  const coverUrl = getPlanCoverUrl(plan)
  const src = coverUrl ?? FALLBACK_PLAN_IMAGE

  function handleError(event) {
    if (event.currentTarget.src !== FALLBACK_PLAN_IMAGE) {
      event.currentTarget.src = FALLBACK_PLAN_IMAGE
    }
  }

  return (
    <div className={`plan-cover ${className} ${toneClass}`.trim()} {...props}>
      <img src={src} alt={alt ?? 'Plan architecture'} loading="lazy" onError={handleError} />
    </div>
  )
})

export default PlanCover
