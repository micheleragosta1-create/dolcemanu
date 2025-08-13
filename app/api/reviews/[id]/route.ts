import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { action } = await request.json().catch(()=>({}))
    if (!['approve','reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!urlEnv || !(anon || service)) {
      return NextResponse.json({ error: 'Supabase non configurato' }, { status: 500 })
    }
    const supabase = createClient(urlEnv, (service && service.length > 20 ? service : anon) as string)
    const { data, error } = await supabase
      .from('product_reviews')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select('id, status')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


