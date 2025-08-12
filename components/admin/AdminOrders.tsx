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
  const [sortKey, setSortKey] = useState<'created_at' | 'user_email' | 'shipping_address' | 'total_amount' | 'status' | 'id'>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  useEffect(() => {
    fetchAllOrders()
  }, [fetchAllOrders])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.shipping_address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    const getVal = (o: any) => {
      switch (sortKey) {
        case 'total_amount': return o.total_amount ?? 0
        case 'created_at': return new Date(o.created_at).getTime()
        case 'user_email': return (o.user_email || '').toLowerCase()
        case 'shipping_address': return (o.shipping_address || '').toLowerCase()
        case 'status': return (o.status || '').toLowerCase()
        case 'id': return (o.id || '').toLowerCase()
        default: return ''
      }
    }
    const va = getVal(a)
    const vb = getVal(b)
    if (va < vb) return -1 * dir
    if (va > vb) return 1 * dir
    return 0
  })

  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedOrders = sortedOrders.slice(pageStart, pageStart + pageSize)

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

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleString('it-IT', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    } catch {
      return iso
    }
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
    <div className="admin-container" style={{ padding: '2rem' }}>
      {/* Header e filtri */}
      <div className="card" style={{marginBottom:'1.5rem'}}>
        <div className="card-head"><h3>Gestione Ordini</h3></div>
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Ricerca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cerca per ID ordine o indirizzo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
              />
            </div>

            {/* Filtro per stato */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white shadow-sm"
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
      </div>

      {/* Lista ordini in tabella: una riga per ordine */}
      <div className="card">
        <div className="card-head"><h3>Ordini</h3></div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{cursor:'pointer'}} onClick={() => handleSort('id')}>ID {sortKey==='id' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th style={{cursor:'pointer'}} onClick={() => handleSort('created_at')}>Data {sortKey==='created_at' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th style={{cursor:'pointer'}} onClick={() => handleSort('user_email')}>Email {sortKey==='user_email' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th style={{cursor:'pointer'}} onClick={() => handleSort('shipping_address')}>Indirizzo {sortKey==='shipping_address' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th style={{cursor:'pointer'}} onClick={() => handleSort('total_amount')}>Totale {sortKey==='total_amount' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th style={{cursor:'pointer'}} onClick={() => handleSort('status')}>Stato {sortKey==='status' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id.slice(0,8)}...</td>
                  <td>
                    <span className="row-with-icon"><Calendar className="row-icon" />{formatDateTime(order.created_at)}</span>
                  </td>
                  <td>{order.user_email}</td>
                  <td className="truncate" title={order.shipping_address}>{order.shipping_address}</td>
                  <td className="semibold">{formatCurrency(order.total_amount)}</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>{getStatusLabel(order.status)}</span>
                  </td>
                  <td>
                    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                      <button onClick={() => openOrderDetails(order)} className="btn btn-secondary small" title="Dettagli">
                        <Eye className="w-4 h-4" />
                      </button>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        disabled={updatingOrder === order.id}
                        className="px-2 py-1 border border-gray-200 rounded-lg text-sm"
                        aria-label="Aggiorna stato"
                      >
                        <option value="pending">In attesa</option>
                        <option value="confirmed">Confermato</option>
                        <option value="shipped">Spedito</option>
                        <option value="delivered">Consegnato</option>
                        <option value="cancelled">Annullato</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="card-body" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem'}}>
          <div>
            <label style={{marginRight:8}}>Righe per pagina</label>
            <select value={pageSize} onChange={(e)=>{setPageSize(parseInt(e.target.value)); setPage(1)}} className="px-2 py-1 border border-gray-200 rounded-lg">
              {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button className="btn btn-secondary small" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={currentPage===1}>Precedente</button>
            <span>Pagina {currentPage} di {totalPages}</span>
            <button className="btn btn-primary small" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages}>Successiva</button>
          </div>
        </div>

        {filteredOrders.length === 0 && (
          <div className="card-body center">
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
                  className="btn btn-secondary"
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
