"use client"

import { useEffect, useState } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { getSupabaseClient } from '@/lib/supabase'
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  Euro,
  Calendar,
  AlertCircle,
  Mail,
  MapPin,
  Clock,
  Download,
  CheckCircle,
  Truck,
  XCircle
} from 'lucide-react'

export default function AdminDashboard() {
  const { 
    fetchAllOrders, 
    fetchProducts, 
    fetchAllUsers,
    orders,
    products,
    users,
    usersCount,
    ordersLoading,
    productsLoading,
    usersLoading
  } = useAdmin()

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0
  })

  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  // Carica i dati all'avvio
  useEffect(() => {
    fetchAllOrders()
    fetchProducts()
    fetchAllUsers()
  }, [fetchAllOrders, fetchProducts, fetchAllUsers])

  // Calcola le statistiche quando i dati cambiano
  useEffect(() => {
    if (orders && products && users) {
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
      const pendingOrders = orders.filter(order => order.status === 'pending').length
      const lowStockProducts = products.filter(product => product.stock < 10).length

      setStats({
        totalOrders: orders.length,
        totalProducts: products.length,
        totalUsers: typeof usersCount === 'number' ? usersCount : users.length,
        totalRevenue,
        pendingOrders,
        lowStockProducts
      })
    }
  }, [orders, products, users])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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

  if (ordersLoading || productsLoading || usersLoading) {
    return (
      <div className="admin-container" style={{padding:'2rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem'}}>
          <div className="animate-spin" style={{width:32,height:32,borderBottom:'2px solid #ec4899',borderRadius:'9999px'}} />
          <span className="text-gray-600">Caricamento dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-container" style={{padding:'2rem'}}>
      {/* Statistiche principali */}
      <div className="admin-grid">
        <div className="stat-card">
          <div className="stat-head">
            <div className="stat-label">Ordini Totali</div>
            <div className="stat-icon"><ShoppingCart /></div>
          </div>
          <div className="stat-number">{stats.totalOrders}</div>
        </div>

        <div className="stat-card">
          <div className="stat-head">
            <div className="stat-label">Prodotti</div>
            <div className="stat-icon"><Package /></div>
          </div>
          <div className="stat-number">{stats.totalProducts}</div>
        </div>

        <div className="stat-card">
          <div className="stat-head">
            <div className="stat-label">Utenti</div>
            <div className="stat-icon"><Users /></div>
          </div>
          <div className="stat-number">{stats.totalUsers}</div>
        </div>

        <div className="stat-card">
          <div className="stat-head">
            <div className="stat-label">Fatturato</div>
            <div className="stat-icon"><Euro /></div>
          </div>
          <div className="stat-number">{formatCurrency(stats.totalRevenue)}</div>
        </div>
      </div>

      {/* Statistiche secondarie */}
      <div className="admin-grid admin-grid-2">
        <div className="card">
          <div className="card-head">
            <h3>Ordini in Attesa</h3>
            <AlertCircle className="icon-attesa" />
          </div>
          <div className="card-body center">
            <div className="big-number yellow">{stats.pendingOrders}</div>
            <div className="muted">Richiedono attenzione</div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Scorte Basse</h3>
            <Package className="icon-danger" />
          </div>
          <div className="card-body center">
            <div className="big-number red">{stats.lowStockProducts}</div>
            <div className="muted">Prodotti da rifornire</div>
          </div>
        </div>
      </div>

      {/* Ultimi ordini */}
      <div className="card">
        <div className="card-head"><h3>Ultimi Ordini</h3></div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Importo</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(order => {
                const statusInfo = getStatusInfo(order.status)
                const StatusIcon = statusInfo.icon
                
                return (
                  <tr key={order.id}>
                    <td>#{order.id.slice(0,8)}...</td>
                    <td>
                      <span className="row-with-icon">
                        <Calendar className="row-icon" />
                        {formatDate(order.created_at)}
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
                        className="btn-view-details"
                        onClick={() => setSelectedOrder(order)}
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
        {orders.length === 0 && (
          <div className="empty">
            <ShoppingCart />
            <p>Nessun ordine trovato</p>
          </div>
        )}
      </div>

      {/* Pannello Dettagli Ordine - Stile identico a /admin/orders */}
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
                  disabled={updatingStatus === selectedOrder.id}
                >
                  {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map(status => (
                    <option key={status} value={status}>
                      {statusConfig[status].label}
                    </option>
                  ))}
                </select>
                {updatingStatus === selectedOrder.id && <span className="updating">Aggiornamento...</span>}
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
                    <span>{formatDate(selectedOrder.created_at)}</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-icon">
                    <Package size={16} />
                  </div>
                  <div className="timeline-content">
                    <strong>Ultimo Aggiornamento</strong>
                    <span>{formatDate(selectedOrder.updated_at)}</span>
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

        /* Order Details Panel - Stile identico a /admin/orders */
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
