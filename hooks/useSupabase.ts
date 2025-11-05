import { useState, useEffect } from 'react'
import { getSupabaseClient, type Product, type Order, type Profile, isSupabaseConfigured } from '@/lib/supabase'
import { mockProducts } from '@/lib/mock-data'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()

    // Ricarica i prodotti quando la pagina diventa visibile
    // Questo assicura che le modifiche dalla dashboard vengano riflesse
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProducts()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Se Supabase non è configurato, usa i dati mock
      if (!isSupabaseConfigured) {
        console.log('📦 Usando dati mock (Supabase non configurato)')
        setProducts(mockProducts as Product[])
        setLoading(false)
        return
      }
      
      const supabase = getSupabaseClient()
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .is('deleted_at', null) // Filtra prodotti eliminati (soft delete)
        .order('created_at', { ascending: false })
      
      if (supabaseError) throw supabaseError
      
      // Se Supabase è configurato ma non ha prodotti, usa i dati mock come fallback
      if (!data || data.length === 0) {
        console.log('📦 Usando dati mock (Supabase vuoto)')
        setProducts(mockProducts as Product[])
      } else {
        setProducts(data)
      }
    } catch (err) {
      console.log('📦 Usando dati mock (errore Supabase)')
      // In caso di errore, usa i dati mock invece di mostrare errore
      setProducts(mockProducts as Product[])
      setError(null) // Non mostrare errore se abbiamo i mock
    } finally {
      setLoading(false)
    }
  }

  const getProductById = async (id: string): Promise<Product | null> => {
    try {
      // Se Supabase non è configurato, cerca nei dati mock
      if (!isSupabaseConfigured) {
        const product = mockProducts.find(p => p.id === id)
        return (product as Product) || null
      }
      
      const supabase = getSupabaseClient()
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null) // Filtra prodotti eliminati (soft delete)
        .single()
      
      if (supabaseError) throw supabaseError
      
      // Se non trovato in Supabase, cerca nei mock
      if (!data) {
        const product = mockProducts.find(p => p.id === id)
        return (product as Product) || null
      }
      
      return data
    } catch (err) {
      console.error('Errore nel recupero prodotto:', err)
      // Fallback ai dati mock
      const product = mockProducts.find(p => p.id === id)
      return (product as Product) || null
    }
  }

  const getProductsByCategory = async (category: string): Promise<Product[]> => {
    try {
      // Se Supabase non è configurato, filtra i dati mock
      if (!isSupabaseConfigured) {
        return mockProducts.filter(p => p.category === category) as Product[]
      }
      
      const supabase = getSupabaseClient()
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .is('deleted_at', null) // Filtra prodotti eliminati (soft delete)
        .order('created_at', { ascending: false })
      
      if (supabaseError) throw supabaseError
      
      // Se Supabase vuoto, usa i mock
      if (!data || data.length === 0) {
        return mockProducts.filter(p => p.category === category) as Product[]
      }
      
      return data || []
    } catch (err) {
      console.error('Errore nel recupero prodotti per categoria:', err)
      // Fallback ai dati mock
      return mockProducts.filter(p => p.category === category) as Product[]
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

export function useOrders(userEmail?: string, userId?: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserOrders = async (email?: string, uid?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Recupero ordini via API per user:', uid, email)
      
      // Ottieni il token di autenticazione da Supabase
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('Sessione non valida')
      }
      
      console.log('🔐 Token ottenuto, chiamata API...')
      
      // Usa API server-side che bypassa RLS con token nell'header
      const response = await fetch('/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore nel recupero ordini')
      }
      
      const data = await response.json()
      console.log('📦 Ordini recuperati:', data.orders?.length || 0, data.orders)
      setOrders(data.orders || [])
    } catch (err) {
      console.error('Errore fetchUserOrders:', err)
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
    if (userId || userEmail) {
      fetchUserOrders(userEmail, userId)
    }
  }, [userEmail, userId])

  return {
    orders,
    loading,
    error,
    createOrder,
    refetch: () => (userId || userEmail) ? fetchUserOrders(userEmail, userId) : Promise.resolve()
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
    try {
      // Prova lo scope globale (default SDK). Alcuni progetti possono rispondere 403.
      let { error } = await supabase.auth.signOut({ scope: 'global' as any })
      if (error && typeof error?.message === 'string' && /403|forbidden/i.test(error.message)) {
        // Fallback: scope locale
        const resLocal = await supabase.auth.signOut({ scope: 'local' as any })
        error = resLocal.error
      }
      // Hard fallback: pulizia storage locale per chiudere sessione client-side
      try {
        if (typeof window !== 'undefined') {
          Object.keys(localStorage)
            .filter(k => k.startsWith('sb-'))
            .forEach(k => localStorage.removeItem(k))
        }
      } catch {}
      return { error: null }
    } catch (err: any) {
      return { error: err }
    }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }
}
