import { useState, useEffect } from 'react'
import { getSupabaseClient, type Product, type Order, type Profile, isSupabaseConfigured } from '@/lib/supabase'
import { mockProducts } from '@/lib/mock-data'

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
