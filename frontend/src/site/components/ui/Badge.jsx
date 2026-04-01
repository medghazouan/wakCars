const variants = {
  primary: 'badge-primary',
  gold: 'badge-gold',
  airport: 'badge-airport',
  default: 'bg-gray-100 text-gray-800',
}

const Badge = ({ children, variant = 'primary', className = '' }) => {
  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
