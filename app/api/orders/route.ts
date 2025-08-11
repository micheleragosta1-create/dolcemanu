import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import emailService from '@/lib/email-service'

// Forza runtime Node.js per accedere in sicurezza alle env server-side
export const runtime = 'nodejs'

// Client anonimo (letture pubbliche)
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Client admin (service role) se disponibile, altrimenti null (fallback ad anon)
const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.length > 20)
const supabaseAdmin = hasServiceKey
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  : null

// GET /api/orders - Fetch all orders (admin only)
export async function GET(request: Request) {
  try {
    // Verifica autenticazione admin (qui dovresti implementare la verifica del ruolo)
    const { data: orders, error } = await supabaseAnon
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Errore Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Errore interno:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/orders - Create a new order
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      user_email,
      items,
      shipping_address,
      shipping_city,
      shipping_postal_code,
      shipping_country
    } = body
    // Hotfix: genera un order_number lato server (sostituibile con trigger DB)
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`

    // Validazione payload
    if (!user_email || typeof user_email !== 'string') {
      return NextResponse.json({ error: 'Campo user_email mancante o invalido' }, { status: 400 })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Lista items mancante o vuota' }, { status: 400 })
    }
    if (!shipping_address || typeof shipping_address !== 'string') {
      return NextResponse.json({ error: 'Campo shipping_address mancante o invalido' }, { status: 400 })
    }
    if (!shipping_city || typeof shipping_city !== 'string') {
      return NextResponse.json({ error: 'Campo shipping_city mancante o invalido' }, { status: 400 })
    }
    if (!shipping_postal_code || typeof shipping_postal_code !== 'string') {
      return NextResponse.json({ error: 'Campo shipping_postal_code mancante o invalido' }, { status: 400 })
    }
    if (!shipping_country || typeof shipping_country !== 'string') {
      return NextResponse.json({ error: 'Campo shipping_country mancante o invalido' }, { status: 400 })
    }

    // Normalizza items e valida quantità
    const normalizedItems = items.map((raw: any) => ({
      product_id: raw.product_id || raw.id,
      quantity: Number(raw.quantity ?? raw.qty ?? 0)
    }))
    for (const it of normalizedItems) {
      if (!it.product_id || typeof it.product_id !== 'string') {
        return NextResponse.json({ error: 'Ogni item deve avere un product_id valido' }, { status: 400 })
      }
      if (!Number.isFinite(it.quantity) || it.quantity <= 0) {
        return NextResponse.json({ error: 'Ogni item deve avere una quantity > 0' }, { status: 400 })
      }
    }

    // Recupera i prezzi reali dai products per il calcolo server-side
    const productIds = Array.from(new Set(normalizedItems.map(i => i.product_id)))
    const { data: products, error: productsError } = await supabaseAnon
      .from('products')
      .select('id, price, stock_quantity')
      .in('id', productIds)
    if (productsError) {
      return NextResponse.json({ error: `Errore lettura prodotti: ${productsError.message}` }, { status: 500 })
    }
    if (!products || products.length !== productIds.length) {
      return NextResponse.json({ error: 'Alcuni prodotti non esistono' }, { status: 400 })
    }
    const productById = new Map(products.map(p => [p.id, p]))

    // Calcolo totale lato server e verifica stock locale
    let totalAmount = 0
    for (const it of normalizedItems) {
      const p = productById.get(it.product_id) as { id: string, price: number, stock_quantity: number }
      if (!p) {
        return NextResponse.json({ error: 'Prodotto non trovato' }, { status: 400 })
      }
      if (p.stock_quantity < it.quantity) {
        return NextResponse.json({ error: `Stock insufficiente per prodotto ${p.id}` }, { status: 400 })
      }
      totalAmount += Number(p.price) * it.quantity
    }

    // Inizia una transazione
    const adminClient = supabaseAdmin ?? supabaseAnon
    let { data: order, error: orderError } = await adminClient
      .from('orders')
      .insert([{ 
        user_email,
        total_amount: totalAmount,
        shipping_address,
        shipping_city,
        shipping_postal_code,
        shipping_country,
        order_number: orderNumber,
        status: 'pending'
      }])
      .select('id')
      .single()

    // Fallback automatico se la service key risulta invalida
    if (orderError && typeof orderError.message === 'string' && orderError.message.toLowerCase().includes('invalid api key') && adminClient !== supabaseAnon) {
      const retry = await supabaseAnon
        .from('orders')
        .insert([{ 
          user_email,
          total_amount: totalAmount,
          shipping_address,
          shipping_city,
          shipping_postal_code,
          shipping_country,
          order_number: orderNumber,
          status: 'pending'
        }])
        .select('id')
        .single()
      order = retry.data as any
      orderError = retry.error as any
    }

    if (orderError) {
      console.error('Errore creazione ordine:', orderError)
      return NextResponse.json({ error: orderError.message }, { status: 400 })
    }

    // Crea gli item dell'ordine (usa unit_price / total_price coerenti con lo schema DB)
    const orderItems = normalizedItems.map((item: any) => {
      const quantity = item.quantity
      const unitPrice = Number((productById.get(item.product_id) as any).price)
      return {
        order_id: order.id,
        product_id: item.product_id,
        quantity,
        unit_price: unitPrice,
        total_price: unitPrice * quantity
      }
    })

    const clientForItems = orderError ? adminClient : (adminClient ?? supabaseAnon)
    let { error: itemsError } = await clientForItems
      .from('order_items')
      .insert(orderItems)

    // Fallback su client anonimo se la service key è invalida
    if (itemsError && typeof itemsError.message === 'string' && itemsError.message.toLowerCase().includes('invalid api key') && clientForItems !== supabaseAnon) {
      const retryItems = await supabaseAnon
        .from('order_items')
        .insert(orderItems)
      itemsError = retryItems.error as any
    }

    if (itemsError) {
      console.error('Errore creazione item ordine:', itemsError)
      // Rollback dell'ordine se fallisce la creazione degli item
      const rollbackClient = supabaseAdmin ?? clientForItems
      await rollbackClient.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    // Aggiorna lo stock dei prodotti usando RPC dedicata per ogni item
    for (const item of normalizedItems) {
      let { error: rpcError } = await clientForItems
        .rpc('decrease_stock', { 
          product_id: item.product_id, 
          quantity: item.quantity 
        })

      if (rpcError && typeof rpcError.message === 'string' && rpcError.message.toLowerCase().includes('invalid api key') && clientForItems !== supabaseAnon) {
        const retryRpc = await supabaseAnon
          .rpc('decrease_stock', { 
            product_id: item.product_id, 
            quantity: item.quantity 
          })
        rpcError = retryRpc.error as any
      }

      if (rpcError) {
        console.error('Errore decrease_stock RPC:', rpcError)
      }
    }

    // Invia email di conferma al cliente
    try {
      await emailService.sendOrderConfirmation({
        orderId: order.id,
        userEmail: user_email,
        totalAmount: total_amount,
        items: items.map((item: any) => ({
          name: item.name || 'Prodotto',
          quantity: item.quantity || item.qty,
          price: item.price || item.unit_amount
        })),
        shippingAddress: shipping_address,
        status: 'pending'
      })
    } catch (emailError) {
      console.error('Errore invio email conferma:', emailError)
      // Non blocchiamo l'ordine se fallisce l'email
    }

    // Invia notifica all'amministratore
    try {
      await emailService.sendOrderNotificationToAdmin({
        orderId: order.id,
        userEmail: user_email,
        totalAmount: total_amount,
        items: items.map((item: any) => ({
          name: item.name || 'Prodotto',
          quantity: item.quantity || item.qty,
          price: item.price || item.unit_amount
        })),
        shippingAddress: shipping_address,
        status: 'pending'
      })
    } catch (emailError) {
      console.error('Errore invio notifica admin:', emailError)
      // Non blocchiamo l'ordine se fallisce l'email
    }

    return NextResponse.json({ 
      order_id: order.id,
      message: 'Ordine creato con successo'
    }, { status: 201 })
  } catch (error) {
    console.error('Errore interno:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}