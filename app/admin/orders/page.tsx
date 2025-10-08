"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, User, Mail, MapPin, Search, X, Download } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
  products: {
    id: string
    name: string
    image_url: string
    category: string
  }
}

type Order = {
  id: string
  order_number?: string
  user_email: string
  total_amount: number
  status: OrderStatus
  shipping_address: string
  created_at: string
  updated_at: string
  order_items: OrderItem[]
}

const statusConfig = {
  pending: { 
    label: 'In Attesa', 
    color: '#f59e0b', 
    bgColor: '#fef3c7',
    icon: Clock,
    description: 'Ordine ricevuto, in attesa di elaborazione'
  },
  processing: { 
    label: 'In Elaborazione', 
    color: '#3b82f6', 
    bgColor: '#dbeafe',
    icon: Package,
    description: 'Ordine in elaborazione, preparazione in corso'
  },
  shipped: { 
    label: 'Spedito', 
    color: '#8b5cf6', 
    bgColor: '#e9d5ff',
    icon: Truck,
    description: 'Ordine spedito, in transito verso la destinazione'
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null)

  // Fetch orders
  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      // Recupera il token di autenticazione da Supabase
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('/api/orders', { headers })
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        const error = await response.json()
        console.error('Error fetching orders:', error)
        
        if (response.status === 403) {
          alert('⚠️ Accesso negato. Devi essere loggato come admin.\n\nVai su /auth per effettuare il login.')
        } else {
          alert(`Errore nel caricamento ordini: ${error.error || 'Sconosciuto'}`)
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      alert('Errore di connessione al server')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingStatus(orderId)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus, updated_at: updatedOrder.updated_at } : order
        ))
        
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)
        }
        
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

  const downloadOrderPDF = async (orderId: string, orderNumber?: string) => {
    try {
      setDownloadingPDF(orderId)
      
      // Recupera il token di autenticazione da Supabase
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
        a.download = `proforma_${orderNumber || orderId}.pdf`
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

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    if (!searchQuery.trim()) {
      return matchesStatus
    }
    
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch = 
      order.id.toLowerCase().includes(query) ||
      order.user_email.toLowerCase().includes(query) ||
      order.shipping_address.toLowerCase().includes(query) ||
      order.order_items.some(item => 
        item.products.name.toLowerCase().includes(query) ||
        item.products.category.toLowerCase().includes(query)
      )
    
    return matchesStatus && matchesSearch
  })

  const getOrderTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
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

  const getStatusInfo = (status: OrderStatus) => statusConfig[status]

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setSelectedOrder(null)
  }

  if (loading) {
    return (
      <main>
        <Header />
        <section className="admin-section">
          <div className="admin-container">
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Caricamento ordini...</p>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main>
      <Header />
      <section className="admin-section">
        <div className="admin-container">
          <div className="admin-header">
            <div className="header-left">
              <a href="/admin" className="back-btn">
                <ArrowLeft size={20} />
                Torna al Pannello
              </a>
              <h1 className="poppins">Gestione Ordini</h1>
              <p className="subtitle">
                {filteredOrders.length} ordini trovati 
                {(searchQuery || statusFilter !== 'all') && ` (${orders.length} totali)`}
              </p>
            </div>
            
            <div className="header-actions">
              <button className="btn btn-secondary" onClick={fetchOrders}>
                Aggiorna
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="search-and-filters">
            <div className="search-container">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Cerca per ID ordine, email, indirizzo o prodotto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchQuery('')}
                  title="Cancella ricerca"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            {(searchQuery || statusFilter !== 'all') && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Cancella Filtri
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="status-filters">
            <button 
              className={`status-chip ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              Tutti ({orders.length})
            </button>
            {(Object.keys(statusConfig) as OrderStatus[]).map(status => {
              const count = orders.filter(o => o.status === status).length
              const config = statusConfig[status]
              return (
                <button
                  key={status}
                  className={`status-chip ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    backgroundColor: statusFilter === status ? config.color : config.bgColor,
                    color: statusFilter === status ? 'white' : config.color,
                    border: `2px solid ${config.color}`
                  }}
                >
                  <config.icon size={16} />
                  {config.label} ({count})
                </button>
              )
            })}
          </div>

          <div className="orders-layout">
            {/* Orders List */}
            <div className="orders-list">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status)
                const StatusIcon = statusInfo.icon
                
                return (
                  <div 
                    key={order.id} 
                    className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="order-header">
                      <div className="order-number">
                        <strong>#{order.id}</strong>
                        <span className="order-date">{formatDate(order.created_at)}</span>
                      </div>
                      <div 
                        className="status-badge"
                        style={{
                          backgroundColor: statusInfo.bgColor,
                          color: statusInfo.color
                        }}
                      >
                        <StatusIcon size={14} />
                        {statusInfo.label}
                      </div>
                    </div>
                    
                    <div className="order-customer">
                      <Mail size={16} />
                      {order.user_email}
                    </div>
                    
                    <div className="order-items-preview">
                      {order.order_items.slice(0, 2).map(item => (
                        <div key={item.id} className="item-preview">
                          <img src={item.products.image_url} alt={item.products.name} />
                          <span>{item.quantity}x {item.products.name}</span>
                        </div>
                      ))}
                      {order.order_items.length > 2 && (
                        <div className="more-items">
                          +{order.order_items.length - 2} altri
                        </div>
                      )}
                    </div>
                    
                    <div className="order-total">
                      <strong>€ {order.total_amount.toFixed(2)}</strong>
                    </div>
                  </div>
                )
              })}
              
              {filteredOrders.length === 0 && (
                <div className="no-orders">
                  <Package size={48} />
                  <h3>Nessun ordine trovato</h3>
                  <p>Non ci sono ordini con il filtro selezionato.</p>
                </div>
              )}
            </div>

            {/* Order Details */}
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
                        onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                        disabled={updatingStatus === selectedOrder.id}
                      >
                        {(Object.keys(statusConfig) as OrderStatus[]).map(status => (
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
                      {selectedOrder.order_items.map(item => (
                        <div key={item.id} className="order-item">
                          <img src={item.products.image_url} alt={item.products.name} />
                          <div className="item-details">
                            <h4>{item.products.name}</h4>
                            <p className="item-category">{item.products.category}</p>
                            <p className="item-price">€ {item.price.toFixed(2)} x {item.quantity}</p>
                          </div>
                          <div className="item-total">
                            € {(item.price * item.quantity).toFixed(2)}
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
          </div>
        </div>
      </section>
      <Footer />

      <style jsx global>{`
        .admin-section {
          padding: 15rem 2rem 3rem;
          background: var(--color-cream);
          min-height: 100vh;
        }
        
        .admin-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-left h1 {
          font-size: 2rem;
          color: var(--color-navy);
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #666;
          font-size: 1rem;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-brown);
          text-decoration: none;
          margin-bottom: 1rem;
          font-weight: 500;
          transition: opacity 0.3s ease;
        }

        .back-btn:hover {
          opacity: 0.8;
        }

        .search-and-filters {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .search-container {
          position: relative;
          flex: 1;
          max-width: 500px;
        }

        .search-input {
          width: 100%;
          padding: 0.8rem 1rem 0.8rem 3rem;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 0.95rem;
          font-family: inherit;
          transition: all 0.3s ease;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-brown);
          box-shadow: 0 0 0 3px rgba(94, 54, 33, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          pointer-events: none;
        }

        .clear-search {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 50%;
          color: #666;
          transition: all 0.3s ease;
        }

        .clear-search:hover {
          background: #f0f0f0;
          color: #333;
        }

        .clear-filters-btn {
          padding: 0.8rem 1.2rem;
          background: #fff;
          border: 2px solid var(--color-brown);
          color: var(--color-brown);
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .clear-filters-btn:hover {
          background: var(--color-brown);
          color: white;
        }

        .status-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .status-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          border-radius: 999px;
          border: 2px solid #e9ecef;
          background: white;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }

        .status-chip:hover {
          transform: translateY(-1px);
        }

        .status-chip.active {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .orders-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2rem;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .order-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }

        .order-card.selected {
          border-color: var(--color-brown);
          transform: translateY(-2px);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .order-number strong {
          color: var(--color-navy);
          font-size: 1.1rem;
        }

        .order-date {
          display: block;
          font-size: 0.85rem;
          color: #666;
          margin-top: 0.25rem;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .order-customer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .order-items-preview {
          margin-bottom: 1rem;
        }

        .item-preview {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .item-preview img {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          object-fit: cover;
        }

        .more-items {
          color: #666;
          font-size: 0.85rem;
          font-style: italic;
        }

        .order-total {
          text-align: right;
          font-size: 1.2rem;
          color: var(--color-brown);
        }

        .no-orders {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .no-orders svg {
          color: #ccc;
          margin-bottom: 1rem;
        }

        .order-details {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          max-height: calc(100vh - 200px);
          overflow-y: auto;
          position: sticky;
          top: 120px;
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
          width: 48px;
          height: 48px;
          border-radius: 8px;
          object-fit: cover;
        }

        .item-details {
          flex: 1;
        }

        .item-details h4 {
          color: var(--color-navy);
          font-size: 0.95rem;
          margin-bottom: 0.25rem;
        }

        .item-category {
          color: #666;
          font-size: 0.8rem;
          margin-bottom: 0.25rem;
        }

        .item-price {
          color: #666;
          font-size: 0.85rem;
        }

        .item-total {
          font-weight: 700;
          color: var(--color-brown);
        }

        .order-summary {
          border-top: 1px solid #e9ecef;
          padding-top: 1rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .summary-row.total {
          font-size: 1.1rem;
          color: var(--color-brown);
          border-top: 1px solid #e9ecef;
          padding-top: 0.5rem;
          margin-top: 0.5rem;
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
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--color-cream);
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
          font-size: 0.9rem;
        }

        .timeline-content span {
          color: #666;
          font-size: 0.85rem;
        }

        .loading-container {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,.08);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid var(--color-brown);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .orders-layout {
            grid-template-columns: 1fr;
          }
          
          .order-details {
            position: static;
            max-height: none;
          }
        }

        @media (max-width: 768px) {
          .admin-section {
            padding: 6rem 1rem 2rem;
          }
          
          .admin-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-and-filters {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          
          .search-container {
            max-width: none;
          }
          
          .clear-filters-btn {
            text-align: center;
          }
          
          .status-filters {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .status-chip {
            justify-content: center;
          }
          
          .order-card {
            padding: 1rem;
          }
          
          .details-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .details-header h2 {
            font-size: 1.1rem;
          }

          .header-actions-group {
            width: 100%;
            justify-content: space-between;
          }

          .btn-download-pdf {
            flex: 1;
          }
        }
      `}</style>
    </main>
  )
}