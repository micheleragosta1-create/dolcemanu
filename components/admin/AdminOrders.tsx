"use client"

import { useEffect, useState } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { getSupabaseClient } from '@/lib/supabase'
import { 
  Search, 
  Filter, 
  Calendar,
  Package,
  Mail,
  MapPin,
  Download,
  Clock,
  CheckCircle,
  Truck,
  XCircle
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
  const [updatingOrder, setUpdatingStatus] = useState<string | null>(null)
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<'created_at' | 'user_email' | 'shipping_address' | 'total_amount' | 'status' | 'id'>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [mounted, setMounted] = useState(false)

  // Evita hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchAllOrders()
  }, [fetchAllOrders])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.shipping_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user_email.toLowerCase().includes(searchTerm.toLowerCase())
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

  const statusConfig = {
    pending: {
      label: 'In Attesa',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      icon: Clock,
      description: 'Ordine ricevuto, in attesa di conferma'
    },
    processing: {
      label: 'In Elaborazione',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      icon: Package,
      description: 'Ordine confermato, in elaborazione'
    },
    shipped: {
      label: 'Spedito',
      color: '#8b5cf6',
      bgColor: '#e9d5ff',
      icon: Truck,
      description: 'Ordine spedito al cliente'
    },
    delivered: {
      label: 'Consegnato',
      color: '#10b981',
      bgColor: '#d1fae5',
      icon: CheckCircle,
      description: 'Ordine consegnato con successo'
    },
    cancelled: {
      label: 'Annullato',
      color: '#ef4444',
      bgColor: '#fee2e2',
      icon: XCircle,
      description: 'Ordine annullato'
    }
  }

  const getStatusInfo = (status: string) => statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

  const getStatusLabel = (status: string) => {
    return getStatusInfo(status).label
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDateTime = (iso: string) => {
    if (!mounted) return iso
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

  const downloadOrderPDF = async (orderId: string, orderNumber?: string) => {
    try {
      setDownloadingPDF(orderId)
      
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/orders/${orderId}/pdf`, {
        method: 'GET',
        headers
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `proforma_${orderNumber || orderId.substring(0, 8)}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const error = await response.json()
        alert('Errore: ' + error.error)
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Errore nel download del PDF')
    } finally {
      setDownloadingPDF(null)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId)
      
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus, updated_at: updatedOrder.updated_at })
        }
        
        fetchAllOrders()
        
        alert('Status aggiornato con successo!')
      } else {
        const error = await response.json()
        alert('Errore: ' + error.error)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Errore nell\'aggiornamento dello status')
    } finally {
      setUpdatingStatus(null)
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
                placeholder="Cerca per ID, email o indirizzo..."
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
                <option value="processing">In elaborazione</option>
                <option value="shipped">Spedito</option>
                <option value="delivered">Consegnato</option>
                <option value="cancelled">Annullato</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista ordini in tabella */}
      <div className="card">
        <div className="card-head"><h3>Ordini ({filteredOrders.length})</h3></div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{cursor:'pointer'}} onClick={() => handleSort('id')}>ID {sortKey==='id' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th style={{cursor:'pointer'}} onClick={() => handleSort('created_at')}>Data {sortKey==='created_at' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th style={{cursor:'pointer'}} onClick={() => handleSort('user_email')}>Cliente {sortKey==='user_email' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th style={{cursor:'pointer'}} onClick={() => handleSort('total_amount')}>Totale {sortKey==='total_amount' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th style={{cursor:'pointer'}} onClick={() => handleSort('status')}>Stato {sortKey==='status' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map(order => {
                const statusInfo = getStatusInfo(order.status)
                const StatusIcon = statusInfo.icon
                
                return (
                  <tr key={order.id}>
                    <td>#{order.id.slice(0,8)}...</td>
                    <td>
                      <span className="row-with-icon">
                        <Calendar className="row-icon" />
                        {formatDateTime(order.created_at)}
                      </span>
                    </td>
                    <td>
                      <span className="row-with-icon">
                        <Mail className="row-icon" />
                        {order.user_email}
                      </span>
                    </td>
                    <td className="semibold">{formatCurrency(order.total_amount)}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{
                          backgroundColor: statusInfo.bgColor,
                          color: statusInfo.color
                        }}
                      >
                        <StatusIcon size={14} />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => setSelectedOrder(order)} 
                        className="btn-view-details"
                      >
                        Dettagli
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="card-body" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
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

      {/* Pannello Dettagli Ordine - Stile identico a /admin/orders e dashboard */}
      {selectedOrder && (
        <div className="order-details">
          <div className="details-header">
            <h2>Dettagli Ordine #{selectedOrder.id}</h2>
            <div className="header-actions-group">
              <button 
                className="btn-download-pdf"
                onClick={() => downloadOrderPDF(selectedOrder.id, selectedOrder.order_number)}
                disabled={downloadingPDF === selectedOrder.id}
                title="Scarica PDF Proforma"
              >
                <Download size={18} />
                {downloadingPDF === selectedOrder.id ? 'Download...' : 'Scarica PDF'}
              </button>
              <button 
                className="close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>
          </div>

          <div className="details-content">
            {/* Status Update */}
            <div className="status-section">
              <h3>Status Ordine</h3>
              <div className="current-status">
                {(() => {
                  const statusInfo = getStatusInfo(selectedOrder.status)
                  const StatusIcon = statusInfo.icon
                  return (
                    <div 
                      className="status-display"
                      style={{
                        backgroundColor: statusInfo.bgColor,
                        color: statusInfo.color
                      }}
                    >
                      <StatusIcon size={20} />
                      <div>
                        <strong>{statusInfo.label}</strong>
                        <p>{statusInfo.description}</p>
                      </div>
                    </div>
                  )
                })()}
              </div>
              
              <div className="status-actions">
                <label>Cambia Status:</label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  disabled={updatingOrder === selectedOrder.id}
                >
                  {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map(status => (
                    <option key={status} value={status}>
                      {statusConfig[status].label}
                    </option>
                  ))}
                </select>
                {updatingOrder === selectedOrder.id && <span className="updating">Aggiornamento...</span>}
              </div>
            </div>

            {/* Customer Info */}
            <div className="customer-section">
              <h3>Informazioni Cliente</h3>
              <div className="customer-info">
                <div className="info-item">
                  <Mail size={16} />
                  <span>{selectedOrder.user_email}</span>
                </div>
                <div className="info-item">
                  <MapPin size={16} />
                  <span>{selectedOrder.shipping_address}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="items-section">
              <h3>Prodotti Ordinati</h3>
              <div className="items-list">
                {selectedOrder.order_items?.map((item: any, index: number) => (
                  <div key={index} className="order-item">
                    <img 
                      src={item.products?.image_url || '/images/prodotto-1.svg'} 
                      alt={item.products?.name || 'Prodotto'} 
                    />
                    <div className="item-details">
                      <h4>{item.products?.name || 'Prodotto'}</h4>
                      <p className="item-category">{item.products?.category || 'Categoria'}</p>
                      <p className="item-price">€ {(item.price || item.unit_price)?.toFixed(2)} x {item.quantity}</p>
                    </div>
                    <div className="item-total">
                      € {((item.price || item.unit_price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="order-summary">
                <div className="summary-row">
                  <span>Subtotale:</span>
                  <span>€ {selectedOrder.total_amount.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <strong>Totale: € {selectedOrder.total_amount.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="timeline-section">
              <h3>Cronologia</h3>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-icon">
                    <Clock size={16} />
                  </div>
                  <div className="timeline-content">
                    <strong>Ordine Creato</strong>
                    <span>{formatDateTime(selectedOrder.created_at)}</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-icon">
                    <Package size={16} />
                  </div>
                  <div className="timeline-content">
                    <strong>Ultimo Aggiornamento</strong>
                    <span>{formatDateTime(selectedOrder.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .btn-view-details {
          padding: 0.5rem 1rem;
          background: var(--color-brown);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-view-details:hover {
          background: #a0522d;
          transform: translateY(-1px);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        /* Order Details Panel - Stile identico a /admin/orders */}
        .order-details {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          margin-top: 2rem;
          overflow: hidden;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .details-header h2 {
          color: var(--color-navy);
          font-size: 1.3rem;
          margin: 0;
        }

        .header-actions-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .btn-download-pdf {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          background: var(--color-brown);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .btn-download-pdf:hover:not(:disabled) {
          background: #a0522d;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
        }

        .btn-download-pdf:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #999;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .close-btn:hover {
          background: #f0f0f0;
          color: #666;
        }

        .details-content {
          padding: 1.5rem;
        }

        .status-section,
        .customer-section,
        .items-section,
        .timeline-section {
          margin-bottom: 2rem;
        }

        .status-section h3,
        .customer-section h3,
        .items-section h3,
        .timeline-section h3 {
          color: var(--color-navy);
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .status-display {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .status-display strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .status-display p {
          font-size: 0.9rem;
          opacity: 0.8;
          margin: 0;
        }

        .status-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .status-actions label {
          font-weight: 600;
          color: var(--color-navy);
          font-size: 0.9rem;
        }

        .status-actions select {
          padding: 0.6rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-family: inherit;
        }

        .updating {
          color: var(--color-brown);
          font-size: 0.85rem;
          font-style: italic;
        }

        .customer-info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          color: #666;
        }

        .info-item svg {
          margin-top: 0.1rem;
          flex-shrink: 0;
        }

        .items-list {
          margin-bottom: 1rem;
        }

        .order-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px;
          margin-bottom: 0.75rem;
        }

        .order-item img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .item-details {
          flex: 1;
        }

        .item-details h4 {
          margin: 0 0 0.25rem 0;
          color: var(--color-navy);
          font-size: 1rem;
        }

        .item-category {
          margin: 0 0 0.25rem 0;
          color: #666;
          font-size: 0.85rem;
        }

        .item-price {
          margin: 0;
          color: #666;
          font-size: 0.85rem;
        }

        .item-total {
          font-weight: 700;
          color: var(--color-brown);
          font-size: 1.1rem;
        }

        .order-summary {
          border-top: 2px solid #e9ecef;
          padding-top: 1rem;
          margin-top: 1rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
          color: #666;
        }

        .summary-row.total {
          font-size: 1.2rem;
          color: var(--color-brown);
          border-top: 2px solid #e9ecef;
          padding-top: 0.75rem;
          margin-top: 0.75rem;
        }

        .timeline {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .timeline-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .timeline-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-brown);
          flex-shrink: 0;
        }

        .timeline-content {
          display: flex;
          flex-direction: column;
        }

        .timeline-content strong {
          color: var(--color-navy);
          font-size: 0.95rem;
          margin-bottom: 0.25rem;
        }

        .timeline-content span {
          color: #666;
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .details-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .header-actions-group {
            width: 100%;
            justify-content: space-between;
          }

          .order-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .item-total {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  )
}
