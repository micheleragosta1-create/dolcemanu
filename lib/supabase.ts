import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Safe lazy initialization to avoid crashing builds when env vars are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl && supabaseAnonKey
)

let cachedClient: SupabaseClient | null = null

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
    throw new Error('Supabase non è configurato correttamente')
  }
  return client
}

// Types for our ecommerce data
export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  stock: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address: string
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

// Funzioni helper per i prodotti
export async function getProducts(): Promise<Product[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
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

export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
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
  const supabase = getSupabaseClient()
  return await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*)
      )
    `)
    .order('created_at', { ascending: false })
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<{ data: any, error: any }> {
  const supabase = getSupabaseClient()
  return await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()
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

export async function updateUserRole(userId: string, role: UserRole['role']): Promise<{ data: any, error: any }> {
  const supabase = getSupabaseClient()
  return await supabase.rpc('update_user_role', { target_user_id: userId, new_role: role })
}

export async function getUserRole(userId: string): Promise<{ data: any, error: any }> {
  const supabase = getSupabaseClient()
  return await supabase.rpc('get_user_role', { user_uuid: userId })
}