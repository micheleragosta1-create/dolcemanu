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

  // Determina se stiamo usando sandbox o produzione
  // Le credenziali sandbox di solito contengono "sb" o iniziano con caratteri specifici
  const isSandbox = clientId.includes('sb') || clientId === 'sb' || 
                    process.env.PAYPAL_MODE === 'sandbox' ||
                    process.env.NODE_ENV === 'development'
  
  const baseUrl = isSandbox 
    ? 'https://api-m.sandbox.paypal.com' 
    : 'https://api-m.paypal.com'

  console.log(`PayPal API: Usando ${isSandbox ? 'SANDBOX' : 'PRODUCTION'} - ${baseUrl}`)

  // Ottieni access token
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    console.error('Errore autenticazione PayPal:', errorText)
    throw new Error(`Errore autenticazione PayPal: ${tokenResponse.status}`)
  }

  const { access_token } = await tokenResponse.json()
  console.log('Access token ottenuto con successo')

  // Verifica l'ordine
  const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!orderResponse.ok) {
    const errorText = await orderResponse.text()
    console.error('Errore recupero ordine PayPal:', errorText)
    throw new Error(`Ordine PayPal non trovato: ${orderResponse.status}`)
  }

  const orderData = await orderResponse.json()
  console.log('Ordine PayPal recuperato:', orderData.id, orderData.status)
  
  return orderData
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

    console.log('📦 Dati ricevuti:', {
      paypalOrderId,
      userEmail,
      itemsCount: orderDetails?.items?.length,
      shippingAddress
    })

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

    // Prepara l'indirizzo completo (metti tutto in shipping_address)
    const fullAddress = [
      shippingAddress.address,
      shippingAddress.city,
      shippingAddress.zip,
      shippingAddress.country || 'Italia'
    ].filter(Boolean).join(', ')

    // Prepara i dati dell'ordine (solo campi che esistono nel DB)
    const orderData = {
      user_email: userEmail,
      total_amount: totalAmount,
      status: 'processing',
      shipping_address: fullAddress || 'Indirizzo non fornito',
      admin_note: `Pagamento PayPal completato.\nPayPal Order ID: ${paypalOrderId}\nIndirizzo: ${fullAddress}${shippingAddress.notes ? '\nNote: ' + shippingAddress.notes : ''}`,
    }

    console.log('Tentativo inserimento ordine:', orderData)

    // Crea l'ordine nel database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error('Errore creazione ordine Supabase:', {
        message: orderError.message,
        details: orderError.details,
        hint: orderError.hint,
        code: orderError.code
      })
      return NextResponse.json(
        { 
          error: 'Errore nella creazione dell\'ordine',
          details: orderError.message,
          code: orderError.code
        },
        { status: 500 }
      )
    }

    console.log('Ordine creato con successo:', order.id)

    // Recupera i dettagli dei prodotti per completare order_items
    const productIds = orderDetails.items.map((item: any) => item.productId)
    console.log('🔍 Product IDs da recuperare:', productIds)
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, image_url')
      .in('id', productIds)
    
    if (productsError) {
      console.error('Errore recupero prodotti:', productsError)
    }
    console.log('✅ Prodotti recuperati:', products?.length || 0)
    
    // Crea una mappa prodotto per accesso veloce
    const productMap = new Map(products?.map(p => [p.id, p]) || [])

    // Inserisci gli items dell'ordine
    const orderItems = orderDetails.items.map((item: any) => {
      const product = productMap.get(item.productId)
      return {
        order_id: order.id,
        product_id: item.productId,
        product_name: product?.name || 'Prodotto sconosciuto',
        product_image_url: product?.image_url || '',
        quantity: item.quantity,
        price: item.price
      }
    })

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
      const { error: stockError } = await supabase.rpc('decrease_stock', {
        product_id: item.productId,
        quantity: item.quantity
      })
      if (stockError) {
        console.warn(`Errore diminuzione stock per prodotto ${item.productId}:`, stockError)
        // Non blocchiamo l'ordine per questo errore
      }
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

