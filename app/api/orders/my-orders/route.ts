import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    // Ottieni il token dall'header Authorization
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    console.log('🔐 Token presente:', !!token)

    if (!token) {
      return NextResponse.json({ error: 'Token mancante' }, { status: 401 })
    }

    // Crea client Supabase con Service Role Key per bypassare RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verifica il token e ottieni user_id
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('❌ Errore autenticazione:', authError)
      return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 })
    }

    console.log('🔍 Recupero ordini per user:', user.id, user.email)

    // Recupera ordini con user_id usando Service Role Key
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            price,
            image_url
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Errore recupero ordini:', ordersError)
      return NextResponse.json({ error: ordersError.message }, { status: 500 })
    }

    console.log('✅ Ordini trovati:', orders?.length || 0)

    return NextResponse.json({ orders: orders || [] })

  } catch (error: any) {
    console.error('Errore API my-orders:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

