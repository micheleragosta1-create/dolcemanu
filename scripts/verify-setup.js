require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function verifySetup() {
  console.log('\n🔍 Verifica Setup Sistema PDF e Ordini\n')
  console.log('=' .repeat(50))
  
  let allGood = true

  // 1. Verifica connessione Supabase
  console.log('\n1️⃣  Connessione Supabase...')
  if (!supabaseUrl || !supabaseKey) {
    console.log('   ❌ Variabili d\'ambiente mancanti')
    allGood = false
  } else {
    console.log('   ✅ Configurazione trovata')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // 2. Verifica esistenza ordini
  console.log('\n2️⃣  Ordini nel database...')
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, user_email, total_amount, status, created_at')
      .limit(5)

    if (error) {
      console.log(`   ❌ Errore: ${error.message}`)
      allGood = false
    } else if (!orders || orders.length === 0) {
      console.log('   ⚠️  Nessun ordine trovato')
      console.log('      Esegui: node scripts/create-sample-order.js')
    } else {
      console.log(`   ✅ Trovati ${orders.length} ordini`)
      orders.forEach((order, i) => {
        console.log(`      ${i + 1}. ${order.user_email} - €${order.total_amount} - ${order.status}`)
      })
    }
  } catch (e) {
    console.log(`   ❌ Errore: ${e.message}`)
    allGood = false
  }

  // 3. Verifica order_items
  console.log('\n3️⃣  Items degli ordini...')
  try {
    const { data: items, error } = await supabase
      .from('order_items')
      .select('id')
      .limit(1)

    if (error) {
      console.log(`   ❌ Errore: ${error.message}`)
      allGood = false
    } else {
      console.log(`   ✅ Tabella order_items accessibile`)
    }
  } catch (e) {
    console.log(`   ❌ Errore: ${e.message}`)
    allGood = false
  }

  // 4. Verifica server locale
  console.log('\n4️⃣  Server locale...')
  try {
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (response.status === 403) {
      console.log('   ⚠️  Server risponde ma richiede autenticazione (normale)')
      console.log('      Questo è OK - l\'API è protetta')
    } else if (response.ok) {
      const data = await response.json()
      console.log(`   ✅ Server risponde - ${data.length} ordini accessibili`)
    } else {
      console.log(`   ⚠️  Server risponde con status ${response.status}`)
    }
  } catch (e) {
    console.log(`   ❌ Server non raggiungibile`)
    console.log('      Esegui: npm run dev')
    allGood = false
  }

  // 5. Verifica file necessari
  console.log('\n5️⃣  File del sistema...')
  const fs = require('fs')
  const path = require('path')
  
  const requiredFiles = [
    'lib/pdf-service.ts',
    'lib/email-service.ts',
    'app/api/orders/[id]/pdf/route.ts',
    'supabase-simple-admin-fix.sql'
  ]

  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file)
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file}`)
    } else {
      console.log(`   ❌ ${file} - MANCANTE`)
      allGood = false
    }
  })

  // Riepilogo
  console.log('\n' + '='.repeat(50))
  if (allGood) {
    console.log('\n✅ TUTTO OK! Il sistema è configurato correttamente.\n')
    console.log('📋 Prossimi passi:')
    console.log('   1. Vai su http://localhost:3000/auth e fai login')
    console.log('   2. Vai su http://localhost:3000/admin/orders')
    console.log('   3. Dovresti vedere gli ordini!')
    console.log('   4. Clicca su un ordine e scarica il PDF\n')
  } else {
    console.log('\n⚠️  Ci sono alcuni problemi da risolvere.\n')
    console.log('📋 Controlla:')
    console.log('   1. Hai eseguito lo script SQL su Supabase?')
    console.log('      File: supabase-simple-admin-fix.sql')
    console.log('   2. Il server è in esecuzione?')
    console.log('      Comando: npm run dev')
    console.log('   3. Hai creato un ordine di test?')
    console.log('      Comando: node scripts/create-sample-order.js\n')
    console.log('📖 Leggi: ISTRUZIONI_VISUALIZZARE_ORDINI.md\n')
  }
}

verifySetup().catch(console.error)

