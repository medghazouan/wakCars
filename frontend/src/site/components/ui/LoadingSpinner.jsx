const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-3 border-gray-200 rounded-full" />
        <div className="absolute inset-0 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}

export default LoadingSpinner
