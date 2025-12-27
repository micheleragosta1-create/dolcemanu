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

  const updateOrder = useCallback(async (orderId: string, status: Order['status'] | string) => {
    if (!isAdmin) return { error: 'Accesso negato' }
    
    try {
      // Mappa eventuale 'confirmed' (vecchio label UI) a 'processing' (valore DB)
      const normalized = (status === 'confirmed' ? 'processing' : status) as Order['status']
      const { data, error } = await updateOrderStatus(orderId, normalized)
      if (error) throw error
      
      // Aggiorna la lista ordini
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: normalized } : order
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
      console.log('🔄 Caricamento prodotti...')
      
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
      
      console.log(`✅ Caricati ${productsList?.length || 0} prodotti`)
      setProducts(productsList || [])
    } catch (error) {
      console.error('❌ Errore nel recupero prodotti:', error)
    } finally {
      setProductsLoading(false)
    }
  }, [isAdmin])

  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    if (!isAdmin) return { error: 'Accesso negato' }
    try {
      console.log('📤 Invio dati prodotto:', productData)
      
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
      
      const payload = await res.json().catch(() => ({}))
      console.log('📥 Risposta API:', { status: res.status, payload })
      
      if (!res.ok) {
        const message = payload?.error || 'Errore creazione prodotto'
        console.error('❌ Errore API:', message)
        return { error: message }
      }
      
      // Aggiungi il prodotto alla lista locale
      setProducts(prev => {
        console.log('✅ Aggiunto prodotto alla lista:', payload.name)
        return [payload, ...prev]
      })
      
      return { data: payload, error: null }
    } catch (error: any) {
      console.error('❌ Errore catch:', error)
      return { error: error?.message || 'Errore rete' }
    }
  }, [isAdmin])

  const editProduct = useCallback(async (productId: string, productData: Partial<Product>) => {
    if (!isAdmin) return { error: 'Accesso negato' }
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = payload?.error || 'Errore aggiornamento prodotto'
        return { error: message }
      }
      setProducts(prev => prev.map(product => 
        product.id === productId ? { ...product, ...payload } : product
      ))
      return { data: payload, error: null }
    } catch (error: any) {
      return { error: error?.message || 'Errore rete' }
    }
  }, [isAdmin])

  const removeProduct = useCallback(async (productId: string) => {
    if (!isSuperAdmin) return { error: 'Solo i super admin possono eliminare prodotti' }
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        return { error: payload?.error || 'Errore eliminazione prodotto' }
      }
      setProducts(prev => prev.filter(product => product.id !== productId))
      return { error: null }
    } catch (error: any) {
      return { error: error?.message || 'Errore rete' }
    }
  }, [isSuperAdmin])

  // Gestione utenti (solo super admin)
  const [users, setUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersCount, setUsersCount] = useState<number | null>(null)

  const fetchAllUsers = useCallback(async () => {
    if (!isAdmin) return // Anche gli admin normali possono vedere gli utenti
    setUsersLoading(true)
    try {
      const { data, error } = await getAllUsers()
      if (error) {
        console.error('Errore getAllUsers:', error)
        // Fallback: prova a recuperare dalla tabella user_roles
        const supabase = await import('@/lib/supabase').then(m => m.getSupabaseClient())
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (!rolesError && rolesData) {
          console.log('Utenti recuperati da user_roles (fallback):', rolesData.length)
          setUsers(rolesData || [])
        } else {
          console.error('Errore anche nel fallback:', rolesError)
          setUsers([])
        }
      } else {
        console.log('Utenti recuperati da get_all_users():', data?.length, 'utenti')
        if (data && data.length > 0) {
          console.log('Esempio primo utente:', data[0])
        }
        setUsers(data || [])
      }
      
      // Recupera anche il count
      try {
        const { data: count } = await getUsersCountAdmin()
        if (typeof count === 'number') setUsersCount(count)
      } catch {}
    } catch (error) {
      console.error('Errore nel recupero utenti:', error)
      setUsers([])
    } finally {
      setUsersLoading(false)
    }
  }, [isAdmin])

  const changeUserRole = useCallback(async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
    if (!isSuperAdmin) return { error: 'Solo i super admin possono modificare i ruoli' }
    
    try {
      console.log('Cambio ruolo per utente:', userId, 'nuovo ruolo:', newRole)
      const { data, error } = await updateUserRole(userId, newRole)
      
      if (error) {
        console.error('Errore updateUserRole:', error)
        throw error
      }
      
      console.log('Ruolo aggiornato nel DB, risultato:', data)
      
      // Aggiorna immediatamente lo stato locale
      // Gestisce sia user.id che user.user_id per compatibilità
      setUsers(prev => {
        const updated = prev.map(user => {
          const currentUserId = user.id || user.user_id
          if (currentUserId === userId) {
            console.log('Aggiornando utente nello stato:', currentUserId, 'da', user.role, 'a', newRole)
            return { ...user, role: newRole }
          }
          return user
        })
        return updated
      })
      
      return { data, error: null }
    } catch (error: any) {
      console.error('Errore in changeUserRole:', error)
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
