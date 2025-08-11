"use client"

import { useEffect, useState } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  Euro,
  Calendar,
  AlertCircle
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
                <th>Importo</th>
                <th>Stato</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(order => (
                <tr key={order.id}>
                  <td>#{order.id.slice(0,8)}...</td>
                  <td>
                    <span className="row-with-icon"><Calendar className="row-icon" />{new Date(order.created_at).toLocaleDateString('it-IT')}</span>
                  </td>
                  <td className="semibold">{formatCurrency(order.total_amount)}</td>
                  <td><span className={`status-badge ${order.status}`}>{getStatusLabel(order.status)}</span></td>
                </tr>
              ))}
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
    </div>
  )
}
