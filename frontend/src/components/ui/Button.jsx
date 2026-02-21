export default function Button({
  type = 'button',
  variant = 'secondary',
  icon,
  children,
  className = '',
  ...props
}) {
  const variantClass =
    variant === 'danger'
      ? 'danger-btn'
      : variant === 'primary'
        ? 'primary-btn'
        : 'secondary-btn'

  const classes = `${variantClass}${className ? ` ${className}` : ''}`

  return (
    <button type={type} className={classes} {...props}>
      {icon ? <i className={icon} /> : null}
      {children}
    </button>
  )
}
