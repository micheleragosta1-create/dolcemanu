import { NextResponse } from 'next/server'
import { mockOrders } from '@/lib/mock-orders'
// import { supabase } from '@/lib/supabase'

// GET /api/orders - Fetch all orders (using mock data for testing)
export async function GET() {
  try {
    // For testing, return mock data
    return NextResponse.json(mockOrders)
    
    // Uncomment below when Supabase is set up:
    /*
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(orders)
    */
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/orders - Create a new order (mocked implementation until Supabase is configured)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_email, items, shipping_address, total_amount } = body

    if (!user_email || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Temporary mocked order response
    const order = {
      id: Math.floor(Math.random() * 1_000_000),
      user_email,
      total_amount,
      shipping_address,
      status: 'pending',
      created_at: new Date().toISOString(),
      items: items.map((item: any, idx: number) => ({
        id: idx + 1,
        product_id: item.product_id ?? item.id ?? idx + 1,
        quantity: item.quantity ?? item.qty ?? 1,
        price: item.price ?? item.unit_amount ?? 0,
      })),
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}