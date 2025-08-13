import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const status = url.searchParams.get('status') || 'pending'
    const supabase = getSupabaseClient()
    let query = supabase
      .from('product_reviews')
      .select('id, product_id, user_email, rating, title, body, status, created_at, products:product_id ( id, name ))')
      .order('created_at', { ascending: false })
      .limit(100)
    if (status !== 'all') query = query.eq('status', status)
    const { data, error } = await query as any
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    // normalizza alias join
    const normalized = (Array.isArray(data) ? data : []).map((r: any) => ({
      ...r,
      product: r.products ? { id: r.products.id, name: r.products.name } : undefined
    }))
    return NextResponse.json(normalized)
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


