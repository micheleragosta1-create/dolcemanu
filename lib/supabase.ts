import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Safe lazy initialization to avoid crashing builds when env vars are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl && supabaseAnonKey
)

let cachedClient: SupabaseClient | null = null

// Minimal fallback client to avoid crashes when env vars are missing in development
function createNoopSupabaseClient(): SupabaseClient {
  const resultEmpty = Promise.resolve({ data: [] as any[], error: null as any }) as any
  const resultNull = Promise.resolve({ data: null as any, error: null as any }) as any

  const builder: any = {
    select: () => ({
      eq: () => ({
        single: () => resultNull
      }),
      order: () => resultEmpty
    }),
    eq: () => ({
      single: () => resultNull
    }),
    order: () => resultEmpty,
    single: () => resultNull,
    insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 'mock-id' }, error: null }) }) }),
    update: () => ({ eq: () => resultNull }),
    delete: () => ({ eq: () => resultNull })
  }

  const client: any = {
    from: () => builder,
    rpc: () => Promise.resolve({ data: null, error: null }),
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ error: { message: 'Supabase non configurato' } }),
      signUp: async () => ({ error: { message: 'Supabase non configurato' } }),
      signOut: async () => ({ error: null })
    }
  }

  return client as SupabaseClient
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    console.warn('Supabase non è configurato. Controlla le variabili d\'ambiente.')
    return null
  }
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  }
  return cachedClient
}

// Funzione per ottenere il client Supabase con gestione errori
export function getSupabaseClient(): SupabaseClient {
  const client = getSupabase()
  if (!client) {
    // Fallback sicuro: client no-op per ambiente locale senza ENV
    return createNoopSupabaseClient()
  }
  return client
}

// Types for our ecommerce data - Allineati con lo schema del database
export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  stock_quantity: number
  created_at: string
  updated_at: string
  deleted_at?: string | null // Soft delete: se NOT NULL, il prodotto è eliminato
  // Campi opzionali aggiuntivi
  ingredients?: string | null
  allergens?: string | null
  nutrition?: {
    energy_kcal?: number | null
    fat?: number | null
    saturated_fat?: number | null
    carbs?: number | null
    sugars?: number | null
    protein?: number | null
    salt?: number | null
  } | null
  // Nuovi campi per filtri avanzati
  chocolate_type?: 'fondente' | 'latte' | 'bianco' | 'ruby' | 'misto' | null
  collection?: string | null
  box_format?: 6 | 9 | 12 | null
  is_new?: boolean | null
  is_bestseller?: boolean | null
  discount_percentage?: number | null
  // Formati box con prezzi personalizzati
  box_formats?: {
    [key: string]: number // es. { "6": 18.90, "9": 26.90, "12": 34.90 }
  } | null
}

export interface Order {
  id: string
  user_email: string
  total_amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address: string
  admin_note?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
}

// Nuovi tipi per i ruoli
export interface UserRole {
  id: string
  user_id: string
  role: 'user' | 'admin' | 'super_admin'
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  role?: 'user' | 'admin' | 'super_admin'
  created_at: string
}

// Profile (anagrafica) type
export interface Profile {
  id: string
  user_id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  address?: string
  city?: string
  zip?: string
  created_at: string
  updated_at: string
}

// Funzioni helper per i prodotti
export async function getProducts(): Promise<Product[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .is('deleted_at', null) // Filtra prodotti eliminati (soft delete)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Errore nel recupero prodotti:', error)
    return []
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null) // Filtra prodotti eliminati (soft delete)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Errore nel recupero prodotto:', error)
    return null
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .is('deleted_at', null) // Filtra prodotti eliminati (soft delete)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Errore nel recupero prodotti per categoria:', error)
    return []
  }
}

// Funzioni helper per gli ordini
export async function createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select('id')
      .single()
    
    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Errore nella creazione ordine:', error)
    return null
  }
}

export async function createOrderItem(orderItemData: Omit<OrderItem, 'id' | 'created_at'>): Promise<string | null> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('order_items')
      .insert([orderItemData])
      .select('id')
      .single()
    
    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Errore nella creazione item ordine:', error)
    return null
  }
}

export async function getUserOrders(userEmail: string): Promise<Order[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Errore nel recupero ordini utente:', error)
    return []
  }
}

// Funzioni helper per admin
export async function getAllOrders(): Promise<{ data: any, error: any }> {
  try {
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

    // Usa l'API protetta invece di chiamare Supabase direttamente
    const response = await fetch('/api/orders', {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { data: null, error: errorData.error || 'Errore nel recupero ordini' }
    }

    const data = await response.json()
    return { data, error: null }
  } catch (error: any) {
    console.error('Errore nel recupero ordini:', error)
    return { data: null, error: error.message || 'Errore di connessione' }
  }
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<{ data: any, error: any }> {
  try {
    // Prova a includere il bearer token Supabase per permessi admin lato server
    const supabase = getSupabaseClient()
    const session = await supabase.auth.getSession()
    const accessToken = session?.data?.session?.access_token

  // Normalizza eventuali label UI non presenti nel tipo
  const normalized = status

    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      },
      body: JSON.stringify({ status: normalized })
    })
    const json = await res.json()
    if (!res.ok) return { data: null, error: json?.error || 'Update failed' }
    return { data: json, error: null }
  } catch (error: any) {
    return { data: null, error }
  }
}

export async function createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: any, error: any }> {
  const supabase = getSupabaseClient()
  return await supabase
    .from('products')
    .insert(productData)
    .select()
    .single()
}

export async function updateProduct(productId: string, productData: Partial<Product>): Promise<{ data: any, error: any }> {
  const supabase = getSupabaseClient()
  return await supabase
    .from('products')
    .update(productData)
    .eq('id', productId)
    .select()
    .single()
}

export async function deleteProduct(productId: string): Promise<{ data: any, error: any }> {
  const supabase = getSupabaseClient()
  return await supabase
    .from('products')
    .delete()
    .eq('id', productId)
}

export async function getAllUsers(): Promise<{ data: any, error: any }> {
  const supabase = getSupabaseClient()
  return await supabase.rpc('get_all_users')
}

// Conta utenti (solo admin) tramite RPC semplificata
export async function getUsersCountAdmin(): Promise<{ data: number | null, error: any }> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.rpc('admin_count_users')
    if (error) return { data: null, error }
    // data può essere number oppure un oggetto { count: number }
    const count = typeof data === 'number' ? data : (data && (data as any).count)
    return { data: count ?? null, error: null }
  } catch (error: any) {
    return { data: null, error }
  }
}

export async function updateUserRole(userId: string, role: UserRole['role']): Promise<{ data: any, error: any }> {
  const supabase = getSupabaseClient()
  return await supabase.rpc('update_user_role', { target_user_id: userId, new_role: role })
}

export async function getUserRole(userId: string): Promise<{ data: any, error: any }> {
  const supabase = getSupabaseClient()
  return await supabase.rpc('get_user_role', { user_uuid: userId })
}

// Profiles helpers
export async function upsertProfile(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: any, error: any }> {
  const supabase = getSupabaseClient()
  return await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'user_id' })
    .select()
    .single()
}

export async function getOwnProfile(userId: string): Promise<{ data: Profile | null, error: any }> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) return { data: null, error }
    return { data: data as Profile | null, error: null }
  } catch (error) {
    return { data: null, error }
  }
}