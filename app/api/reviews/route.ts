import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const status = url.searchParams.get('status') || 'pending'
    const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!urlEnv || !(anon || service)) {
      return NextResponse.json({ error: 'Supabase non configurato' }, { status: 500 })
    }
    const supabase = createClient(urlEnv, (service && service.length > 20 ? service : anon) as string)

    let query = supabase
      .from('product_reviews')
      .select('id, product_id, user_email, rating, title, body, status, created_at, products:product_id ( id, name )')
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


