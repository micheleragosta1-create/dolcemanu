import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/products - Fetch all products from Supabase
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(products)
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

    // Inserimento reale su Supabase (usa service role se presente)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !anon) {
      return NextResponse.json({ error: 'Supabase non configurato' }, { status: 500 })
    }
    const client = createClient(url, (service && service.length > 20 ? service : anon) as string)
    const { data, error } = await client
      .from('products')
      .insert({
        name,
        description: description || '',
        price,
        image_url: image_url || '',
        category,
        stock_quantity: Number.isFinite(stock_quantity) ? stock_quantity : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}