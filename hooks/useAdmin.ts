"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import { 
  getAllOrders, 
  updateOrderStatus, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getAllUsers,
  updateUserRole,
  getUserRole,
  Product,
  Order
} from '@/lib/supabase'

export function useAdmin() {
  const { user } = useAuth()
  const [userRole, setUserRole] = useState<'user' | 'admin' | 'super_admin' | null>(null)
  const [loading, setLoading] = useState(true)

  // Verifica il ruolo dell'utente
  useEffect(() => {
    async function checkUserRole() {
      if (!user) {
        setUserRole(null)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await getUserRole(user.id)
        if (error) {
          console.error('Errore nel recupero ruolo:', error)
          setUserRole('user')
        } else {
          setUserRole(data || 'user')
        }
      } catch (error) {
        console.error('Errore nel controllo ruolo:', error)
        setUserRole('user')
      } finally {
        setLoading(false)
      }
    }

    checkUserRole()
  }, [user])

  const isAdmin = userRole === 'admin' || userRole === 'super_admin'
  const isSuperAdmin = userRole === 'super_admin'

  // Gestione ordini
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  const fetchAllOrders = async () => {
    if (!isAdmin) return
    
    setOrdersLoading(true)
    try {
      const { data, error } = await getAllOrders()
      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Errore nel recupero ordini:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  const updateOrder = async (orderId: string, status: Order['status']) => {
    if (!isAdmin) return { error: 'Accesso negato' }
    
    try {
      const { data, error } = await updateOrderStatus(orderId, status)
      if (error) throw error
      
      // Aggiorna la lista ordini
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      ))
      
      return { data, error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Gestione prodotti
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)

  const fetchProducts = async () => {
    if (!isAdmin) return
    
    setProductsLoading(true)
    try {
      const { data, error } = await getAllOrders() // Usiamo getAllOrders per ora
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Errore nel recupero prodotti:', error)
    } finally {
      setProductsLoading(false)
    }
  }

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    if (!isAdmin) return { error: 'Accesso negato' }
    
    try {
      const { data, error } = await createProduct(productData)
      if (error) throw error
      
      // Aggiorna la lista prodotti
      setProducts(prev => [data, ...prev])
      
      return { data, error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  const editProduct = async (productId: string, productData: Partial<Product>) => {
    if (!isAdmin) return { error: 'Accesso negato' }
    
    try {
      const { data, error } = await updateProduct(productId, productData)
      if (error) throw error
      
      // Aggiorna la lista prodotti
      setProducts(prev => prev.map(product => 
        product.id === productId ? { ...product, ...data } : product
      ))
      
      return { data, error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  const removeProduct = async (productId: string) => {
    if (!isSuperAdmin) return { error: 'Solo i super admin possono eliminare prodotti' }
    
    try {
      const { error } = await deleteProduct(productId)
      if (error) throw error
      
      // Rimuove il prodotto dalla lista
      setProducts(prev => prev.filter(product => product.id !== productId))
      
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Gestione utenti (solo super admin)
  const [users, setUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

  const fetchAllUsers = async () => {
    if (!isSuperAdmin) return
    
    setUsersLoading(true)
    try {
      const { data, error } = await getAllUsers()
      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Errore nel recupero utenti:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  const changeUserRole = async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
    if (!isSuperAdmin) return { error: 'Solo i super admin possono modificare i ruoli' }
    
    try {
      const { data, error } = await updateUserRole(userId, newRole)
      if (error) throw error
      
      // Aggiorna la lista utenti
      setUsers(prev => prev.map(user => 
        user.user_id === userId ? { ...user, role: newRole } : user
      ))
      
      return { data, error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  return {
    // Stato utente
    userRole,
    isAdmin,
    isSuperAdmin,
    loading,
    
    // Gestione ordini
    orders,
    ordersLoading,
    fetchAllOrders,
    updateOrder,
    
    // Gestione prodotti
    products,
    productsLoading,
    fetchProducts,
    addProduct,
    editProduct,
    removeProduct,
    
    // Gestione utenti
    users,
    usersLoading,
    fetchAllUsers,
    changeUserRole
  }
}
