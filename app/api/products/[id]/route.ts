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
      .is('deleted_at', null) // Filtra prodotti eliminati (soft delete)
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
    const { 
      name, description, price, image_url, category, stock_quantity, 
      box_formats, collection, chocolate_type, is_new, is_bestseller, 
      discount_percentage, is_box_praline, single_price 
    } = body

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

    // Usa service role key se disponibile per bypassare RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Usa service role key se disponibile, altrimenti usa anon key
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey && serviceRoleKey.length > 20 ? serviceRoleKey : anonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data, error } = await supabase
      .from('products')
      .update({
        name,
        description,
        price,
        image_url,
        category,
        stock_quantity,
        box_formats: box_formats ?? null,
        collection: collection || null,
        chocolate_type: chocolate_type || null,
        is_new: is_new ?? false,
        is_bestseller: is_bestseller ?? false,
        discount_percentage: discount_percentage || null,
        // Campi per box personalizzata
        is_box_praline: is_box_praline ?? false,
        single_price: single_price || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Verifica che sia stato aggiornato almeno un record
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Soft delete product
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

    // Usa la service role key se disponibile per bypassare RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Usa service role key se disponibile, altrimenti usa anon key
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey && serviceRoleKey.length > 20 ? serviceRoleKey : anonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // SOFT DELETE: Invece di eliminare fisicamente, imposta deleted_at
    // Questo mantiene l'integrità referenziale con order_items
    const { data, error } = await supabase
      .from('products')
      .update({ 
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .is('deleted_at', null) // Solo se non è già eliminato
      .select()

    if (error) {
      console.error('Soft delete error:', error)
      
      // Se l'errore è ancora di foreign key, significa che c'è un altro problema
      if (error.message.includes('foreign key')) {
        return NextResponse.json({ 
          error: 'Impossibile eliminare il prodotto perché ha ordini associati. Contatta il supporto tecnico.' 
        }, { status: 409 })
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Product not found or already deleted' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Product deleted successfully',
      product: data[0]
    })
  } catch (error) {
    console.error('Delete exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}