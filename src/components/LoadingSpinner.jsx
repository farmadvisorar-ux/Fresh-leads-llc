export default function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-fresh-black gap-4">
      <div
        className={`${sizes[size]} border-fresh-border border-t-fresh-orange rounded-full animate-spin`}
      />
      {message && <p className="text-fresh-muted text-sm">{message}</p>}
    </div>
  )
}
