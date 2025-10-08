require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Errore: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere configurati in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createSampleOrder() {
  try {
    console.log('🔄 Creazione ordine di test...\n')

    // 1. Recupera alcuni prodotti esistenti
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price')
      .limit(3)

    if (productsError || !products || products.length === 0) {
      console.error('❌ Errore: Nessun prodotto trovato nel database')
      console.log('   Esegui prima: npm run seed:products')
      process.exit(1)
    }

    console.log(`✅ Trovati ${products.length} prodotti disponibili`)

    // 2. Calcola totale
    const orderItems = products.map(product => {
      const quantity = Math.floor(Math.random() * 3) + 1 // 1-3 quantità
      return {
        product_id: product.id,
        quantity: quantity,
        price: product.price // Nota: lo schema usa 'price' non 'unit_price'
      }
    })

    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // 3. Crea ordine (solo colonne esistenti nello schema)
    const orderData = {
      user_email: 'cliente.test@example.com',
      total_amount: totalAmount,
      status: 'processing',
      shipping_address: 'Mario Rossi, Via Roma 123, 80100 Napoli, Italia',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (orderError) {
      console.error('❌ Errore creazione ordine:', orderError.message)
      process.exit(1)
    }

    console.log(`\n✅ Ordine creato con successo!`)
    console.log(`   ID: ${order.id}`)
    console.log(`   Totale: €${order.total_amount.toFixed(2)}`)

    // 5. Crea items dell'ordine
    const itemsToInsert = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert)

    if (itemsError) {
      console.error('❌ Errore creazione items ordine:', itemsError.message)
      // Rollback ordine
      await supabase.from('orders').delete().eq('id', order.id)
      process.exit(1)
    }

    console.log(`✅ ${itemsToInsert.length} prodotti aggiunti all'ordine\n`)

    // 6. Mostra dettagli
    console.log('📋 Dettagli Ordine:')
    console.log('   ================')
    console.log(`   Email: ${order.user_email}`)
    console.log(`   Indirizzo: ${order.shipping_address}`)
    console.log(`   Stato: ${order.status}`)
    console.log('\n   Prodotti:')
    orderItems.forEach((item, index) => {
      const product = products[index]
      const itemTotal = item.price * item.quantity
      console.log(`   - ${product.name} x${item.quantity} = €${itemTotal.toFixed(2)}`)
    })
    console.log(`\n   TOTALE: €${order.total_amount.toFixed(2)}`)

    console.log('\n🎯 Prossimi passi:')
    console.log('   1. Avvia il server: npm run dev')
    console.log('   2. Accedi all\'admin: http://localhost:3000/admin/orders')
    console.log(`   3. Cerca l'ordine con email: ${order.user_email}`)
    console.log(`   4. Oppure cerca per ID: ${order.id.substring(0, 8)}...`)
    console.log('   5. Clicca "Scarica PDF" per testare la generazione\n')

    console.log('📄 Testa direttamente l\'endpoint PDF:')
    console.log(`   GET http://localhost:3000/api/orders/${order.id}/pdf\n`)

  } catch (error) {
    console.error('❌ Errore generico:', error)
    process.exit(1)
  }
}

// Esegui
createSampleOrder()
  .then(() => {
    console.log('✅ Script completato con successo!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Errore fatale:', error)
    process.exit(1)
  })

