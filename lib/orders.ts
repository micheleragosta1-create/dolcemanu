import { getSupabase, isSupabaseConfigured, Order } from './supabase'

export interface CreateOrderData {
  user_email: string
  items: {
    product_id: string
    quantity: number
    price: number
  }[]
  shipping_address: string
  total_amount: number
}

export async function createOrder(orderData: CreateOrderData): Promise<Order | null> {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      throw new Error('Failed to create order')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating order:', error)
    return null
  }
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  if (!isSupabaseConfigured) {
    // Fallback: return empty list in environments without Supabase
    return []
  }
  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*)
      )
    `)
    .eq('user_email', email)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return data || []
}

export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true
  const supabase = getSupabase()!
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) {
    console.error('Error updating order status:', error)
    return false
  }

  return true
}