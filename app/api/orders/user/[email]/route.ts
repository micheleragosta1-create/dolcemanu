import { NextResponse } from 'next/server'
import { mockOrders } from '@/lib/mock-orders'

// GET /api/orders/user/[email] - Fetch orders for a specific user
export async function GET(request: Request, { params }: { params: { email: string } }) {
  try {
    const email = decodeURIComponent(params.email)
    
    // Filter orders by user email
    const userOrders = mockOrders
      .filter(order => order.user_email === email)
      .map(order => ({
        id: order.id,
        date: order.created_at,
        total: order.total_amount,
        status: order.status,
        items: order.order_items.map(item => ({
          name: item.products?.name || `Prodotto ${item.product_id}`,
          quantity: item.quantity,
          price: item.price
        }))
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Most recent first
    
    return NextResponse.json(userOrders)
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}