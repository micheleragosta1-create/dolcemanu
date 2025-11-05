import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

// Funzione per verificare il pagamento PayPal
async function verifyPayPalPayment(orderId: string) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('PayPal non configurato')
  }

  // Ottieni access token
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const tokenResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })

  if (!tokenResponse.ok) {
    throw new Error('Errore autenticazione PayPal')
  }

  const { access_token } = await tokenResponse.json()

  // Verifica l'ordine
  const orderResponse = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!orderResponse.ok) {
    throw new Error('Ordine PayPal non trovato')
  }

  return await orderResponse.json()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      paypalOrderId,
      orderDetails,
      userEmail,
      shippingAddress
    } = body

    // Verifica il pagamento con PayPal
    const paypalOrder = await verifyPayPalPayment(paypalOrderId)

    // Controlla che il pagamento sia completato
    if (paypalOrder.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Pagamento non completato' },
        { status: 400 }
      )
    }

    // Inizializza Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Calcola il totale
    const totalAmount = orderDetails.items.reduce(
      (sum: number, item: any) => sum + (item.price * item.quantity),
      0
    )

    // Crea l'ordine nel database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_email: userEmail,
        total_amount: totalAmount,
        status: 'processing',
        payment_method: 'paypal',
        payment_id: paypalOrderId,
        shipping_address: shippingAddress.address,
        shipping_city: shippingAddress.city,
        shipping_zip: shippingAddress.zip,
        shipping_country: shippingAddress.country || 'Italia',
        notes: shippingAddress.notes || '',
      })
      .select()
      .single()

    if (orderError) {
      console.error('Errore creazione ordine:', orderError)
      return NextResponse.json(
        { error: 'Errore nella creazione dell\'ordine' },
        { status: 500 }
      )
    }

    // Inserisci gli items dell'ordine
    const orderItems = orderDetails.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price_at_time: item.price
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Errore inserimento items:', itemsError)
      // Rollback: elimina l'ordine
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Errore nell\'elaborazione degli items' },
        { status: 500 }
      )
    }

    // Diminuisci lo stock dei prodotti
    for (const item of orderDetails.items) {
      await supabase.rpc('decrease_product_stock', {
        p_product_id: item.productId,
        p_quantity: item.quantity
      })
    }

    // Invia email di conferma (opzionale)
    try {
      // Recupera i dettagli completi dell'ordine per l'email
      const { data: fullOrder } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              price
            )
          )
        `)
        .eq('id', order.id)
        .single()

      if (fullOrder) {
        // Qui puoi chiamare il servizio email
        // await sendOrderConfirmationEmail(fullOrder)
        console.log('📧 Email da inviare per ordine:', fullOrder.id)
      }
    } catch (emailError) {
      console.error('Errore invio email:', emailError)
      // Non bloccare la risposta se l'email fallisce
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'Ordine creato con successo'
    })

  } catch (error: any) {
    console.error('Errore PayPal capture:', error)
    return NextResponse.json(
      { error: error.message || 'Errore nel processare il pagamento' },
      { status: 500 }
    )
  }
}

