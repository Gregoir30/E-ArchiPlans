export default function StatusBadge({
  value,
  labelMap = {},
  className = '',
  prefix = 'status-',
}) {
  const label = labelMap[value] ?? value
  const classes = `plan-status ${prefix}${value}${className ? ` ${className}` : ''}`

  return <p className={classes}>{label}</p>
}
