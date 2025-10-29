import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import emailService from '@/lib/email-service'

// Inizializza il client Supabase con chiave anonima (più permissiva)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Client admin (service role) se disponibile
const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.length > 20)
const supabaseAdmin = hasServiceKey
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  : null

// Helper: estrae user e ruolo da Authorization: Bearer <token>
async function getUserAndRole(request: Request): Promise<{ user: any | null, role: 'user' | 'admin' | 'super_admin' | null }> {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return { user: null, role: null }
    }
    const token = authHeader.slice(7)
    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    if (userError || !userData?.user) return { user: null, role: null }

    // Whitelist email (env) per privilegi locali
    const whitelist = (process.env.ADMIN_EMAIL_WHITELIST || 'michele.ragosta1@gmail.com')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)
    if (userData.user.email && whitelist.includes(userData.user.email.toLowerCase())) {
      return { user: userData.user, role: 'super_admin' }
    }

    const client = supabaseAdmin ?? supabase
    const { data: roleData } = await client.rpc('get_user_role', { user_uuid: userData.user.id })
    let role: any = roleData
    if (Array.isArray(role)) {
      role = role[0]?.role ?? role[0]
    } else if (role && typeof role === 'object') {
      role = role.role ?? null
    }
    if (role !== 'admin' && role !== 'super_admin' && role !== 'user') role = 'user'
    return { user: userData.user, role }
  } catch {
    return { user: null, role: null }
  }
}

// GET /api/orders/[id] - Get order details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Consenti: admin/super_admin o proprietario dell'ordine
    const { user, role } = await getUserAndRole(request)
    const client = supabaseAdmin ?? supabase

    const { data: order, error } = await client
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Errore recupero ordine:', error)
      return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 })
    }

    if (role !== 'admin' && role !== 'super_admin') {
      if (!user || order.user_email !== user.email) {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
      }
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Errore interno:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/orders/[id] - Update order status (alias for PATCH)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return PATCH(request, { params })
}

// PATCH /api/orders/[id] - Update order status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Solo admin/super_admin può aggiornare lo stato
    const { role } = await getUserAndRole(request)
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    const body = await request.json()
    const { status, admin_note } = body

    if (!status) {
      return NextResponse.json({ error: 'Status richiesto' }, { status: 400 })
    }

    // Valida lo status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status non valido' }, { status: 400 })
    }

    // Aggiorna l'ordine
    const client = supabaseAdmin ?? supabase
    const { data: order, error: updateError } = await client
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Errore aggiornamento ordine:', updateError)
      return NextResponse.json({ error: 'Errore nell\'aggiornamento dell\'ordine' }, { status: 500 })
    }

    // Invia email di aggiornamento stato al cliente
    try {
      // Recupera i dettagli dell'ordine per l'email
      const { data: orderDetails } = await client
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq('id', params.id)
        .single()

      if (orderDetails) {
        await emailService.sendOrderStatusUpdate({
          orderId: orderDetails.id,
          userEmail: orderDetails.user_email,
          totalAmount: orderDetails.total_amount,
          items: orderDetails.order_items?.map((item: any) => ({
            name: item.products?.name || 'Prodotto',
            quantity: item.quantity,
            price: item.unit_price ?? item.price
          })) || [],
          shippingAddress: orderDetails.shipping_address,
          status: status
        })
      }
    } catch (emailError) {
      console.error('Errore invio email aggiornamento stato:', emailError)
      // Non blocchiamo l'aggiornamento se fallisce l'email
    }

    return NextResponse.json({ 
      message: 'Ordine aggiornato con successo',
      order
    })
  } catch (error) {
    console.error('Errore interno:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/orders/[id] - Cancel order (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Solo admin/super_admin può cancellare
    const { role } = await getUserAndRole(request)
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    // Verifica che l'ordine esista e sia cancellabile
    const client = supabaseAdmin ?? supabase
    const { data: order, error: fetchError } = await client
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 })
    }

    if (order.status === 'delivered') {
      return NextResponse.json({ error: 'Non è possibile cancellare un ordine già consegnato' }, { status: 400 })
    }

    // Aggiorna lo status a 'cancelled' invece di eliminare
    const { error: updateError } = await client
      .from('orders')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (updateError) {
      console.error('Errore cancellazione ordine:', updateError)
      return NextResponse.json({ error: 'Errore nella cancellazione dell\'ordine' }, { status: 500 })
    }

    // Ripristina lo stock se l'ordine era in elaborazione o spedito
    if (['processing', 'shipped'].includes(order.status)) {
      const { data: orderItems } = await client
        .from('order_items')
        .select('*')
        .eq('order_id', params.id)

      if (orderItems) {
        for (const item of orderItems) {
          await client.rpc('increase_stock', { 
            product_id: item.product_id, 
            quantity: item.quantity 
          })
        }
      }
    }

    // Invia email di cancellazione al cliente
    try {
      await emailService.sendOrderStatusUpdate({
        orderId: order.id,
        userEmail: order.user_email,
        totalAmount: order.total_amount,
        items: [], // Non necessario per la cancellazione
        shippingAddress: order.shipping_address,
        status: 'cancelled'
      })
    } catch (emailError) {
      console.error('Errore invio email cancellazione:', emailError)
    }

    return NextResponse.json({ 
      message: 'Ordine cancellato con successo'
    })
  } catch (error) {
    console.error('Errore interno:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}