const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <span className="text-text-secondary font-ui text-sm uppercase tracking-wider">
          Chargement...
        </span>
      </div>
    </div>
  )
}

export default LoadingSpinner
