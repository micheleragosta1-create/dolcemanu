import { useState, useEffect } from 'react'
import { getSupabaseClient, type Product, type Order, type Profile } from '@/lib/supabase'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = getSupabaseClient()
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (supabaseError) throw supabaseError
      setProducts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento prodotti')
    } finally {
      setLoading(false)
    }
  }

  const getProductById = async (id: string): Promise<Product | null> => {
    try {
      const supabase = getSupabaseClient()
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      
      if (supabaseError) throw supabaseError
      return data
    } catch (err) {
      console.error('Errore nel recupero prodotto:', err)
      return null
    }
  }

  const getProductsByCategory = async (category: string): Promise<Product[]> => {
    try {
      const supabase = getSupabaseClient()
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })
      
      if (supabaseError) throw supabaseError
      return data || []
    } catch (err) {
      console.error('Errore nel recupero prodotti per categoria:', err)
      return []
    }
  }

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    getProductById,
    getProductsByCategory
  }
}

export function useOrders(userEmail?: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserOrders = async (email: string) => {
    try {
      setLoading(true)
      setError(null)
      const supabase = getSupabaseClient()
      const { data, error: supabaseError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: false })
      
      if (supabaseError) throw supabaseError
      setOrders(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento ordini')
    } finally {
      setLoading(false)
    }
  }

  const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> => {
    try {
      const supabase = getSupabaseClient()
      const { data, error: supabaseError } = await supabase
        .from('orders')
        .insert([orderData])
        .select('id')
        .single()
      
      if (supabaseError) throw supabaseError
      
      // Aggiorna la lista degli ordini se l'utente è lo stesso
      if (userEmail && orderData.user_email === userEmail) {
        await fetchUserOrders(userEmail)
      }
      
      return data.id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella creazione ordine')
      return null
    }
  }

  useEffect(() => {
    if (userEmail) {
      fetchUserOrders(userEmail)
    }
  }, [userEmail])

  return {
    orders,
    loading,
    error,
    createOrder,
    refetch: () => userEmail ? fetchUserOrders(userEmail) : Promise.resolve()
  }
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseClient()
    
    // Ottieni la sessione corrente
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Ascolta i cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signOut = async () => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }
}
