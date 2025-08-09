import { NextResponse } from 'next/server'
import { mockProducts } from '@/lib/mock-data'
// import { supabase } from '@/lib/supabase'

// GET /api/products - Fetch all products (using mock data for testing)
export async function GET() {
  try {
    // For testing, return mock data
    return NextResponse.json(mockProducts)
    
    // Uncomment below when Supabase is set up:
    /*
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(products)
    */
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/products - Create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, price, image_url, category, stock_quantity } = body

    if (!name || !price || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Temporary mocked insertion response until Supabase is configured
    const product = {
      id: Math.floor(Math.random() * 1_000_000),
      name,
      description: description || '',
      price,
      image_url: image_url || '',
      category,
      stock_quantity: stock_quantity || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}