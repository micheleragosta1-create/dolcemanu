require('dotenv').config({ path: '.env.local' })

async function testAdminAPI() {
  console.log('🔍 Test API Admin Orders...\n')
  
  try {
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log(`📡 Status: ${response.status} ${response.statusText}`)
    
    const data = await response.json()
    
    if (response.ok) {
      console.log(`✅ Risposta ricevuta: ${data.length} ordini\n`)
      
      if (data.length === 0) {
        console.log('⚠️  Nessun ordine trovato!')
        console.log('\n🔧 PROBLEMA: Le policy RLS di Supabase stanno bloccando l\'accesso')
        console.log('\n📋 SOLUZIONE:')
        console.log('   1. Hai eseguito lo script SQL su Supabase Dashboard?')
        console.log('   2. Vai su: https://supabase.com/dashboard')
        console.log('   3. SQL Editor > New Query')
        console.log('   4. Copia/incolla: supabase-simple-admin-fix.sql')
        console.log('   5. Clicca RUN\n')
      } else {
        console.log('📋 Ordini trovati:')
        data.forEach((order, i) => {
          console.log(`\n${i + 1}. ID: ${order.id}`)
          console.log(`   Email: ${order.user_email}`)
          console.log(`   Totale: €${order.total_amount}`)
          console.log(`   Status: ${order.status}`)
          console.log(`   Items: ${order.order_items?.length || 0} prodotti`)
        })
        console.log('\n✅ L\'API funziona! Controlla la console del browser per errori frontend.')
      }
    } else {
      console.log(`❌ Errore: ${JSON.stringify(data, null, 2)}`)
      
      if (response.status === 403) {
        console.log('\n⚠️  Accesso negato - Problema di autenticazione admin')
        console.log('   Sei loggato come admin nell\'interfaccia?')
      }
    }
    
  } catch (error) {
    console.error('❌ Errore di connessione:', error.message)
    console.log('\n⚠️  Il server è in esecuzione?')
    console.log('   Controlla che npm run dev sia attivo')
  }
}

testAdminAPI()

