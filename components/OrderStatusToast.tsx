"use client"

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Truck, Package } from 'lucide-react'

interface OrderStatusToastProps {
  orderId: string
  status: string
  message?: string
  onClose: () => void
  autoClose?: boolean
  duration?: number
}

const statusConfig = {
  'pending': {
    icon: Package,
    title: 'Ordine Confermato',
    message: 'Il tuo ordine è stato ricevuto e confermato',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-500'
  },
  'processing': {
    icon: Package,
    title: 'Ordine in Elaborazione',
    message: 'Stiamo preparando il tuo ordine',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500'
  },
  'shipped': {
    icon: Truck,
    title: 'Ordine Spedito',
    message: 'Il tuo ordine è stato spedito e arriverà presto',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    iconColor: 'text-purple-500'
  },
  'delivered': {
    icon: CheckCircle,
    title: 'Ordine Consegnato',
    message: 'Il tuo ordine è stato consegnato con successo',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-500'
  },
  'cancelled': {
    icon: XCircle,
    title: 'Ordine Annullato',
    message: 'Il tuo ordine è stato annullato',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-500'
  }
}

export default function OrderStatusToast({
  orderId,
  status,
  message,
  onClose,
  autoClose = true,
  duration = 5000
}: OrderStatusToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  const IconComponent = config.icon

  useEffect(() => {
    if (!autoClose) return

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          setIsVisible(false)
          setTimeout(onClose, 300) // Wait for fade out animation
          return 0
        }
        return prev - (100 / (duration / 100))
      })
    }, 100)

    return () => clearInterval(timer)
  }, [autoClose, duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div
        className={`${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg p-4 transform transition-all duration-300 ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
            <div>
              <h4 className={`font-medium ${config.textColor}`}>
                {config.title}
              </h4>
              <p className="text-sm text-gray-600">
                Ordine #{orderId.slice(0, 8)}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <p className={`mt-2 text-sm ${config.textColor}`}>
          {message || config.message}
        </p>

        {/* Progress Bar */}
        {autoClose && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all duration-100 ${config.iconColor.replace('text-', 'bg-')}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-3 flex space-x-2">
          <button
            onClick={() => window.location.href = `/account/orders`}
            className={`text-xs px-3 py-1 rounded border ${config.borderColor} ${config.textColor} hover:bg-white transition-colors`}
          >
            Visualizza Ordini
          </button>
          
          {status === 'shipped' && (
            <button
              onClick={() => window.location.href = `/account/orders`}
              className="text-xs px-3 py-1 rounded bg-orange-600 text-white hover:bg-orange-700 transition-colors"
            >
              Traccia Consegna
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Hook per gestire le notifiche degli ordini
export function useOrderStatusNotification() {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    orderId: string
    status: string
    message?: string
  }>>([])

  const addNotification = (orderId: string, status: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { id, orderId, status, message }])
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      removeNotification(id)
    }, 8000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return {
    notifications,
    addNotification,
    removeNotification
  }
}
