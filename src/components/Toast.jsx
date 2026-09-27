import { useEffect } from 'react'
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react'

const ICONS = {
  success: <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />,
  error: <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />,
  warning: <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />,
  info: <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />,
}

const COLORS = {
  success: 'bg-green-900/30 border-green-800/50 text-green-200',
  error: 'bg-red-900/30 border-red-800/50 text-red-200',
  warning: 'bg-yellow-900/30 border-yellow-800/50 text-yellow-200',
  info: 'bg-blue-900/30 border-blue-800/50 text-blue-200',
}

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${COLORS[type]} animate-slide-up max-w-sm`}>
      {ICONS[type]}
      <p className="text-sm flex-1">{message}</p>
      <button onClick={onClose} className="text-current opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  )
}

// Toast state hook
import { useState, useCallback } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}
