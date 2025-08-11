// Script di test per verificare la connessione Supabase
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testSupabaseConnection() {
  console.log('🧪 Test Connessione Supabase...\n')
  
  // Verifica variabili d'ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  console.log('📋 Variabili d\'ambiente:')
  console.log(`  URL: ${supabaseUrl ? '✅ Configurato' : '❌ Mancante'}`)
  console.log(`  Anon Key: ${supabaseAnonKey ? '✅ Configurato' : '❌ Mancante'}`)
  console.log(`  Service Role Key: ${serviceRoleKey ? '✅ Configurato' : '❌ Mancante'}\n`)
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Variabili d\'ambiente mancanti. Controlla il file .env.local')
    return
  }
  
  try {
    // Test con client anonimo
    console.log('🔑 Test Client Anonimo...')
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test lettura prodotti (dovrebbe funzionare)
    console.log('  📦 Test lettura prodotti...')
    const { data: products, error: productsError } = await supabaseAnon
      .from('products')
      .select('*')
      .limit(1)
    
    if (productsError) {
      console.log(`    ❌ Errore: ${productsError.message}`)
    } else {
      console.log(`    ✅ Successo: ${products?.length || 0} prodotti trovati`)
    }
    
    // Test lettura ordini (dovrebbe fallire senza autenticazione)
    console.log('  📋 Test lettura ordini (anonimo)...')
    const { data: orders, error: ordersError } = await supabaseAnon
      .from('orders')
      .select('*')
      .limit(1)
    
    if (ordersError) {
      console.log(`    ✅ Comportamento corretto: ${ordersError.message}`)
    } else {
      console.log(`    ⚠️  Attenzione: ordini visibili senza autenticazione`)
    }
    
    // Test con service role (dovrebbe funzionare)
    if (serviceRoleKey) {
      console.log('\n🔐 Test Client Service Role...')
      const supabaseService = createClient(supabaseUrl, serviceRoleKey)
      
      console.log('  📋 Test lettura ordini (service role)...')
      const { data: serviceOrders, error: serviceOrdersError } = await supabaseService
        .from('orders')
        .select('*')
        .limit(1)
      
      if (serviceOrdersError) {
        console.log(`    ❌ Errore: ${serviceOrdersError.message}`)
      } else {
        console.log(`    ✅ Successo: ${serviceOrders?.length || 0} ordini trovati`)
      }
      
      // Test funzioni RPC
      console.log('  ⚙️  Test funzioni RPC...')
      try {
        const { data: rpcTest, error: rpcError } = await supabaseService
          .rpc('decrease_stock', { 
            product_id: '00000000-0000-0000-0000-000000000000', 
            quantity: 1 
          })
        
        if (rpcError) {
          console.log(`    ❌ Errore RPC: ${rpcError.message}`)
        } else {
          console.log('    ✅ Funzione RPC disponibile')
        }
      } catch (rpcErr) {
        console.log(`    ❌ Errore RPC: ${rpcErr.message}`)
      }
    }
    
    // Test autenticazione
    console.log('\n👤 Test Autenticazione...')
    const { data: { session }, error: authError } = await supabaseAnon.auth.getSession()
    
    if (authError) {
      console.log(`  ❌ Errore autenticazione: ${authError.message}`)
    } else {
      console.log(`  ✅ Autenticazione funzionante: ${session ? 'Sessione attiva' : 'Nessuna sessione'}`)
    }
    
  } catch (error) {
    console.log(`❌ Errore generale: ${error.message}`)
  }
  
  console.log('\n📋 Riepilogo Test:')
  console.log('  - Se vedi errori di permessi per ordini, le politiche RLS funzionano')
  console.log('  - Se vedi errori di connessione, controlla URL e chiavi')
  console.log('  - Se le funzioni RPC falliscono, esegui lo script SQL completo')
}

// Esegui il test
testSupabaseConnection().catch(console.error)
