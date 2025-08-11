"use client"

import { useState } from 'react'

interface OrderTrackingProps {
  orderId: string
  status: string
  createdAt: string
  updatedAt?: string
  adminNote?: string
  className?: string
}

const statusSteps = [
  { key: 'pending', label: 'Ordine Ricevuto', description: 'Il tuo ordine è stato ricevuto e confermato' },
  { key: 'processing', label: 'In Elaborazione', description: 'Stiamo preparando il tuo ordine' },
  { key: 'shipped', label: 'Spedito', description: 'Il tuo ordine è stato spedito' },
  { key: 'delivered', label: 'Consegnato', description: 'Il tuo ordine è stato consegnato' }
]

const statusColors = {
  'pending': 'bg-yellow-500',
  'processing': 'bg-blue-500',
  'shipped': 'bg-purple-500',
  'delivered': 'bg-green-500',
  'cancelled': 'bg-red-500'
}

export default function OrderTracking({
  orderId,
  status,
  createdAt,
  updatedAt,
  adminNote,
  className = ''
}: OrderTrackingProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getCurrentStepIndex = () => {
    if (status === 'cancelled') return -1
    return statusSteps.findIndex(step => step.key === status)
  }

  const currentStepIndex = getCurrentStepIndex()
  const isCancelled = status === 'cancelled'

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Tracking Ordine #{orderId.slice(0, 8)}
          </h3>
          <p className="text-sm text-gray-500">
            Creato il {new Date(createdAt).toLocaleDateString('it-IT')}
          </p>
        </div>
        
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isCancelled 
              ? 'bg-red-100 text-red-800' 
              : statusColors[status as keyof typeof statusColors] 
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
          }`}>
            {isCancelled ? 'Annullato' : statusSteps.find(s => s.key === status)?.label || status}
          </span>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="block mt-2 text-sm text-orange-600 hover:text-orange-700"
          >
            {showDetails ? 'Nascondi dettagli' : 'Mostra dettagli'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {!isCancelled && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {statusSteps.map((step, index) => (
              <div key={step.key} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                  index <= currentStepIndex ? statusColors[step.key as keyof typeof statusColors] : 'bg-gray-300'
                }`}>
                  {index < currentStepIndex ? '✓' : index + 1}
                </div>
                <span className="text-xs text-gray-500 mt-1 text-center max-w-20">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          
          {/* Progress Line */}
          <div className="relative">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200"></div>
            <div 
              className="absolute top-4 left-4 h-0.5 bg-orange-500 transition-all duration-500"
              style={{ width: `${Math.max(0, currentStepIndex) * 33.33}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Status Description */}
      {!isCancelled && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-900 mb-2">
            Stato Attuale: {statusSteps.find(s => s.key === status)?.label}
          </h4>
          <p className="text-sm text-blue-800">
            {statusSteps.find(s => s.key === status)?.description}
          </p>
        </div>
      )}

      {/* Cancelled Status */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-red-900 mb-2">
            Ordine Annullato
          </h4>
          <p className="text-sm text-red-800">
            Questo ordine è stato annullato. Se hai domande, contattaci.
          </p>
        </div>
      )}

      {/* Details Section */}
      {showDetails && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Dettagli Ordine</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">ID Ordine:</span>
              <p className="font-mono text-gray-900">{orderId}</p>
            </div>
            
            <div>
              <span className="text-gray-500">Data Creazione:</span>
              <p className="text-gray-900">
                {new Date(createdAt).toLocaleString('it-IT')}
              </p>
            </div>
            
            {updatedAt && updatedAt !== createdAt && (
              <div>
                <span className="text-gray-500">Ultimo Aggiornamento:</span>
                <p className="text-gray-900">
                  {new Date(updatedAt).toLocaleString('it-IT')}
                </p>
              </div>
            )}
            
            <div>
              <span className="text-gray-500">Stato:</span>
              <p className="text-gray-900 capitalize">
                {statusSteps.find(s => s.key === status)?.label || status}
              </p>
            </div>
          </div>

          {adminNote && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h5 className="font-medium text-yellow-900 mb-1">Nota dell&apos;Amministratore</h5>
              <p className="text-sm text-yellow-800">{adminNote}</p>
            </div>
          )}
        </div>
      )}

      {/* Estimated Delivery */}
      {!isCancelled && status === 'shipped' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-1">Consegna Stimata</h4>
          <p className="text-sm text-green-800">
            Il tuo ordine è in transito. La consegna è prevista entro 2-5 giorni lavorativi.
          </p>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-3">
          Hai domande sul tuo ordine?
        </p>
        <div className="flex space-x-3">
          <a
            href="/contact"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            Contattaci
          </a>
          <span className="text-gray-300">|</span>
          <a
            href="/account/orders"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            Tutti i miei ordini
          </a>
        </div>
      </div>
    </div>
  )
}
