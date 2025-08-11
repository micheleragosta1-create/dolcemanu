import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import emailService from '@/lib/email-service'

// Inizializza il client Supabase con chiave anonima (più permissiva)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/orders/[id] - Get order details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: order, error } = await supabase
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

    return NextResponse.json(order)
  } catch (error) {
    console.error('Errore interno:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/orders/[id] - Update order status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status,
        admin_note: admin_note || null,
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
      const { data: orderDetails } = await supabase
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
            price: item.price
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
    // Verifica che l'ordine esista e sia cancellabile
    const { data: order, error: fetchError } = await supabase
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
    const { error: updateError } = await supabase
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
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', params.id)

      if (orderItems) {
        for (const item of orderItems) {
          await supabase
            .from('products')
            .update({ 
              stock_quantity: supabase.rpc('increase_stock', { 
                product_id: item.product_id, 
                quantity: item.quantity 
              })
            })
            .eq('id', item.product_id)
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