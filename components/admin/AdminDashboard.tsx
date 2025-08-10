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
  }, [])

  // Calcola le statistiche quando i dati cambiano
  useEffect(() => {
    if (orders && products && users) {
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
      const pendingOrders = orders.filter(order => order.status === 'pending').length
      const lowStockProducts = products.filter(product => product.stock < 10).length

      setStats({
        totalOrders: orders.length,
        totalProducts: products.length,
        totalUsers: users.length,
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
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <span className="ml-2 text-gray-600">Caricamento dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Statistiche principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Ordini Totali</p>
              <p className="text-3xl font-bold">{stats.totalOrders}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Prodotti</p>
              <p className="text-3xl font-bold">{stats.totalProducts}</p>
            </div>
            <Package className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Utenti</p>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">Fatturato</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <Euro className="w-8 h-8 text-pink-200" />
          </div>
        </div>
      </div>

      {/* Statistiche secondarie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Ordini in Attesa</h3>
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            <p className="text-sm text-gray-600 mt-2">Richiedono attenzione</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Scorte Basse</h3>
            <Package className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-red-600">{stats.lowStockProducts}</p>
            <p className="text-sm text-gray-600 mt-2">Prodotti da rifornire</p>
          </div>
        </div>
      </div>

      {/* Ultimi ordini */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Ultimi Ordini</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(order.created_at).toLocaleDateString('it-IT')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nessun ordine trovato</p>
          </div>
        )}
      </div>
    </div>
  )
}
