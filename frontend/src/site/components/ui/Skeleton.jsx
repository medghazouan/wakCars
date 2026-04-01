const Skeleton = ({ className = '', variant = 'default' }) => {
  const variants = {
    default: 'h-4 w-full',
    title: 'h-8 w-3/4',
    card: 'h-64 w-full',
    image: 'aspect-video w-full',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-12 w-32',
  }

  return (
    <div
      className={`skeleton bg-gray-200 ${variants[variant]} ${className}`}
      style={{
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s linear infinite',
      }}
    />
  )
}

export const CarCardSkeleton = () => (
  <div className="bg-white p-4">
    <Skeleton variant="image" className="mb-4" />
    <Skeleton variant="title" className="mb-2" />
    <Skeleton className="w-1/2 mb-4" />
    <div className="flex gap-2">
      <Skeleton className="w-16 h-6" />
      <Skeleton className="w-16 h-6" />
      <Skeleton className="w-16 h-6" />
    </div>
  </div>
)

export default Skeleton
