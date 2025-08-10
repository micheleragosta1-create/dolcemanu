"use client"

import { useEffect, useState } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Calendar,
  MapPin,
  Euro,
  Package
} from 'lucide-react'

export default function AdminOrders() {
  const { 
    fetchAllOrders, 
    updateOrder, 
    orders, 
    ordersLoading 
  } = useAdmin()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

  useEffect(() => {
    fetchAllOrders()
  }, [fetchAllOrders])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.shipping_address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId)
    try {
      const result = await updateOrder(orderId, newStatus as any)
      if (result.error) {
        alert(`Errore: ${result.error}`)
      }
    } finally {
      setUpdatingOrder(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'confirmed': return 'text-blue-600 bg-blue-100'
      case 'shipped': return 'text-purple-600 bg-purple-100'
      case 'delivered': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'In attesa'
      case 'confirmed': return 'Confermato'
      case 'shipped': return 'Spedito'
      case 'delivered': return 'Consegnato'
      case 'cancelled': return 'Annullato'
      default: return status
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
  }

  if (ordersLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <span className="ml-2 text-gray-600">Caricamento ordini...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header e filtri */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Gestione Ordini</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Ricerca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cerca per ID ordine o indirizzo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Filtro per stato */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Tutti gli stati</option>
              <option value="pending">In attesa</option>
              <option value="confirmed">Confermato</option>
              <option value="shipped">Spedito</option>
              <option value="delivered">Consegnato</option>
              <option value="cancelled">Annullato</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista ordini */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Ordine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Importo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Indirizzo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        #{order.id.slice(0, 8)}...
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Euro className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      disabled={updatingOrder === order.id}
                      className={`text-xs font-semibold rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-pink-500 ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">In attesa</option>
                      <option value="confirmed">Confermato</option>
                      <option value="shipped">Spedito</option>
                      <option value="delivered">Consegnato</option>
                      <option value="cancelled">Annullato</option>
                    </select>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center max-w-xs">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-500 truncate">
                        {order.shipping_address}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Visualizza dettagli"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Modifica ordine"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Nessun ordine trovato</p>
            <p className="text-sm">Prova a modificare i filtri di ricerca</p>
          </div>
        )}
      </div>

      {/* Modal dettagli ordine */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Dettagli Ordine #{selectedOrder.id.slice(0, 8)}...
                </h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data Creazione</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedOrder.created_at).toLocaleString('it-IT')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stato</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Importo Totale</label>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(selectedOrder.total_amount)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Indirizzo di Spedizione</label>
                  <p className="text-sm text-gray-900">{selectedOrder.shipping_address}</p>
                </div>

                {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prodotti Ordinati</label>
                    <div className="space-y-2">
                      {selectedOrder.order_items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{item.products?.name || 'Prodotto'}</p>
                            <p className="text-sm text-gray-600">Quantità: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">{formatCurrency(item.price)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
