import { forwardRef, useState } from 'react'

const Input = forwardRef(({
  label,
  error,
  type = 'text',
  className = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const hasValue = props.value || props.defaultValue

  return (
    <div className={`input-group ${className}`}>
      <input
        ref={ref}
        type={type}
        className={`input-field ${error ? 'border-primary' : ''}`}
        placeholder=" "
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {label && (
        <label
          className={`input-label ${
            isFocused || hasValue ? 'top-0 text-xs' : ''
          } ${isFocused ? 'text-primary' : ''} ${error ? 'text-primary' : ''}`}
        >
          {label}
        </label>
      )}
      {error && (
        <span className="absolute -bottom-5 left-0 text-xs text-primary animate-shake">
          {error}
        </span>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export const Select = forwardRef(({
  label,
  error,
  options = [],
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`input-group ${className}`}>
      <select
        ref={ref}
        className={`input-field ${error ? 'border-primary' : ''}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {label && (
        <label className="input-label top-0 text-xs text-text-secondary">
          {label}
        </label>
      )}
      {error && (
        <span className="absolute -bottom-5 left-0 text-xs text-primary">
          {error}
        </span>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Input
