import { NextResponse } from 'next/server'
import { mockOrders } from '@/lib/mock-orders'
// import { supabase } from '@/lib/supabase'

// GET /api/orders/[id] - Fetch single order
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // For testing, use mock data
    const order = mockOrders.find(o => o.id === params.id)
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    return NextResponse.json(order)
    
    // Uncomment below when Supabase is set up:
    /*
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(order)
    */
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/orders/[id] - Update order status
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // For testing, simulate update (in real app this would update the database)
    const orderIndex = mockOrders.findIndex(o => o.id === params.id)
    
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Update the mock order
    mockOrders[orderIndex].status = status
    mockOrders[orderIndex].updated_at = new Date().toISOString()
    
    return NextResponse.json(mockOrders[orderIndex])
    
    // Uncomment below when Supabase is set up:
    /*
    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(order)
    */
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}