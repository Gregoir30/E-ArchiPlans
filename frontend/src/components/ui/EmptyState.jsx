import Button from './Button'

export default function EmptyState({
  title = 'Aucune donnee.',
  description = '',
  actionLabel,
  onAction,
  actionIcon,
  actionVariant = 'secondary',
  className = '',
}) {
  return (
    <div className={`empty-state${className ? ` ${className}` : ''}`}>
      <p>{title}</p>
      {description ? <p>{description}</p> : null}
      {actionLabel && onAction ? (
        <Button type="button" variant={actionVariant} icon={actionIcon} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
