import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { action } = await request.json().catch(()=>({}))
    if (!['approve','reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const supabase = getSupabaseClient()
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


