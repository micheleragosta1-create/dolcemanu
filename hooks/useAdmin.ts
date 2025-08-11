"use client"

import { useState, useEffect, useCallback } from 'react'
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
  getUsersCountAdmin,
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

      // Override locale: email admin nota
      if (user.email === 'michele.ragosta1@gmail.com') {
        setUserRole('super_admin')
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

  const fetchAllOrders = useCallback(async () => {
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
  }, [isAdmin])

  const updateOrder = useCallback(async (orderId: string, status: Order['status']) => {
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
  }, [isAdmin])

  // Gestione prodotti
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)

  const fetchProducts = useCallback(async () => {
    if (!isAdmin) return
    setProductsLoading(true)
    try {
      // Usa l'helper prodotti corretto
      const productsList = await (async () => {
        try {
          // import lazy per evitare cicli
          const mod = await import('@/lib/supabase')
          return await mod.getProducts()
        } catch {
          return [] as Product[]
        }
      })()
      setProducts(productsList || [])
    } catch (error) {
      console.error('Errore nel recupero prodotti:', error)
    } finally {
      setProductsLoading(false)
    }
  }, [isAdmin])

  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
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
  }, [isAdmin])

  const editProduct = useCallback(async (productId: string, productData: Partial<Product>) => {
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
  }, [isAdmin])

  const removeProduct = useCallback(async (productId: string) => {
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
  }, [isSuperAdmin])

  // Gestione utenti (solo super admin)
  const [users, setUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersCount, setUsersCount] = useState<number | null>(null)

  const fetchAllUsers = useCallback(async () => {
    if (!isSuperAdmin) return
    setUsersLoading(true)
    try {
      const { data, error } = await getAllUsers()
      if (error) throw error
      setUsers(data || [])
      // Recupera anche il count con RPC semplificata (se l'utente è admin)
      try {
        const { data: count } = await getUsersCountAdmin()
        if (typeof count === 'number') setUsersCount(count)
      } catch {}
    } catch (error) {
      console.error('Errore nel recupero utenti:', error)
    } finally {
      setUsersLoading(false)
    }
  }, [isSuperAdmin])

  const changeUserRole = useCallback(async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
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
  }, [isSuperAdmin])

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
    usersCount,
    fetchAllUsers,
    changeUserRole
  }
}
