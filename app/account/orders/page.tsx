"use client"

import { useAuth } from '@/components/AuthContext'
import { useOrders } from '@/hooks/useSupabase'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

const statusLabels: Record<string, string> = {
  'pending': 'In Attesa',
  'processing': 'In Elaborazione',
  'shipped': 'Spedito',
  'delivered': 'Consegnato',
  'cancelled': 'Annullato'
}

const statusColors: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'processing': 'bg-blue-100 text-blue-800',
  'shipped': 'bg-purple-100 text-purple-800',
  'delivered': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800'
}

export default function OrdersPage() {
  const { user } = useAuth()
  const { orders, loading, error, refetch } = useOrders(user?.email, user?.id)
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  // Debug: mostra info utente e ordini
  useEffect(() => {
    console.log('👤 Utente loggato:', user?.email, 'ID:', user?.id)
    console.log('📦 Ordini caricati:', orders?.length, orders)
    console.log('⏳ Loading:', loading)
    console.log('❌ Error:', error)
  }, [user, orders, loading, error])

  // Ricarica ordini quando la pagina diventa visibile
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.email) {
        console.log('🔄 Ricaricamento ordini per:', user.email)
        refetch()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user?.email, refetch])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Accesso Richiesto
            </h1>
            <p className="text-gray-600 mb-6">
              Devi accedere per visualizzare i tuoi ordini
            </p>
            <a
              href="/auth"
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Accedi
            </a>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const toggleOrderDetails = (orderId: string) => {
    setSelectedOrder(selectedOrder === orderId ? null : orderId)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: it })
    } catch {
      return dateString
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              I Miei Ordini
            </h1>
            <p className="text-gray-600">
              Visualizza e traccia tutti i tuoi ordini
            </p>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Caricamento ordini...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">Errore nel caricamento degli ordini: {error}</p>
              <button
                onClick={refetch}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Riprova
              </button>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Nessun ordine trovato
              </h2>
              <p className="text-gray-600 mb-6">
                Non hai ancora effettuato ordini. Inizia a fare shopping!
              </p>
              <a
                href="/shop"
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Vai allo Shop
              </a>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Header ordine */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Ordine #{order.id.slice(0, 8)}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          €{order.total_amount.toFixed(2)}
                        </p>
                        <button
                          onClick={() => toggleOrderDetails(order.id)}
                          className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                        >
                          {selectedOrder === order.id ? 'Nascondi dettagli' : 'Mostra dettagli'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dettagli ordine (espandibili) */}
                  {selectedOrder === order.id && (
                    <div className="px-6 py-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Indirizzo di Spedizione</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-line">
                            {order.shipping_address}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Stato Ordine</h4>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                ['pending', 'processing', 'shipped', 'delivered'].includes(order.status) 
                                  ? 'bg-green-500' 
                                  : 'bg-gray-300'
                              }`}></div>
                              <span className="text-sm text-gray-600">Ordine ricevuto</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                ['processing', 'shipped', 'delivered'].includes(order.status) 
                                  ? 'bg-green-500' 
                                  : 'bg-gray-300'
                              }`}></div>
                              <span className="text-sm text-gray-600">In elaborazione</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                ['shipped', 'delivered'].includes(order.status) 
                                  ? 'bg-green-500' 
                                  : 'bg-gray-300'
                              }`}></div>
                              <span className="text-sm text-gray-600">Spedito</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                order.status === 'delivered' 
                                  ? 'bg-green-500' 
                                  : 'bg-gray-300'
                              }`}></div>
                              <span className="text-sm text-gray-600">Consegnato</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {order.admin_note && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1">Nota dell&apos;amministratore</h4>
                          <p className="text-sm text-blue-800">{order.admin_note}</p>
                        </div>
                      )}

                      {order.updated_at !== order.created_at && (
                        <p className="text-xs text-gray-500 mt-4">
                          Ultimo aggiornamento: {formatDate(order.updated_at)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
