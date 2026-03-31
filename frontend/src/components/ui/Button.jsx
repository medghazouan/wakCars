import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

const variants = {
  primary: 'bg-primary text-white hover:bg-red-700 shadow-sm',
  secondary: 'bg-secondary text-white hover:bg-gray-800 shadow-sm',
  outline: 'border border-gray-300 bg-transparent text-secondary hover:bg-gray-50',
  ghost: 'bg-transparent text-secondary hover:bg-gray-100',
  danger: 'bg-danger text-white hover:bg-red-700 shadow-sm',
}

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 py-2 text-sm',
  lg: 'h-12 px-6 py-3 text-base',
  icon: 'h-10 w-10 p-2',
}

export const Button = forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  type = 'button',
  ...props
}, ref) => {
  return (
    <motion.button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wider',
        variants[variant],
        sizes[size],
        className
      )}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </motion.button>
  )
})

Button.displayName = 'Button'
