export default function InputField({
  id,
  label,
  as = 'input',
  options = [],
  className = '',
  inputClassName = 'category-filter',
  ...props
}) {
  return (
    <label htmlFor={id} className={`input-field${className ? ` ${className}` : ''}`}>
      {label}
      {as === 'select' ? (
        <select id={id} className={inputClassName} {...props}>
          {options.map((option) => (
            <option key={String(option.value)} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : as === 'textarea' ? (
        <textarea id={id} className={inputClassName} {...props} />
      ) : (
        <input id={id} className={inputClassName} {...props} />
      )}
    </label>
  )
}
