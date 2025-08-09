import { NextResponse } from 'next/server'
import { mockProducts } from '@/lib/mock-data'

// PUT /api/products/[id]/stock - Update product stock
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { stock_quantity } = body

    if (typeof stock_quantity !== 'number' || stock_quantity < 0) {
      return NextResponse.json({ error: 'Invalid stock quantity' }, { status: 400 })
    }

    // For testing, update mock data (in real app this would update the database)
    const productIndex = mockProducts.findIndex(p => p.id === params.id)
    
    if (productIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    // Update the mock product stock
    mockProducts[productIndex].stock_quantity = stock_quantity
    mockProducts[productIndex].updated_at = new Date().toISOString()
    
    return NextResponse.json({
      id: params.id,
      stock_quantity,
      updated_at: mockProducts[productIndex].updated_at
    })
    
    // Uncomment below when Supabase is set up:
    /*
    const { data: product, error } = await supabase
      .from('products')
      .update({
        stock_quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select('id, stock_quantity, updated_at')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(product)
    */
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}