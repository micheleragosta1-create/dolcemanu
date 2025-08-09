import { NextResponse } from 'next/server'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { mockProducts } from '@/lib/mock-data'

// GET /api/products/[id] - Fetch single product
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isSupabaseConfigured) {
      const product = mockProducts.find(p => p.id === params.id)
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      return NextResponse.json(product)
    }

    const supabase = getSupabase()!
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, price, image_url, category, stock_quantity } = body

    if (!isSupabaseConfigured) {
      const idx = mockProducts.findIndex(p => p.id === params.id)
      if (idx === -1) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      mockProducts[idx] = {
        ...mockProducts[idx],
        name,
        description,
        price,
        image_url,
        category,
        stock_quantity,
        updated_at: new Date().toISOString(),
      }
      return NextResponse.json(mockProducts[idx])
    }

    const supabase = getSupabase()!
    const { data: product, error } = await supabase
      .from('products')
      .update({
        name,
        description,
        price,
        image_url,
        category,
        stock_quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isSupabaseConfigured) {
      const idx = mockProducts.findIndex(p => p.id === params.id)
      if (idx === -1) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      mockProducts.splice(idx, 1)
      return NextResponse.json({ message: 'Product deleted successfully' })
    }

    const supabase = getSupabase()!
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}