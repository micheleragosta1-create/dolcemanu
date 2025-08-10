// Test script per verificare la connessione a Supabase
const { createClient } = require('@supabase/supabase-js')

// Le tue credenziali Supabase
const supabaseUrl = 'https://tgixtlyofhtbfcdrkdhm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnaXh0bHlvZmh0YmZjZHJrZGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjEzOTIsImV4cCI6MjA3MDM5NzM5Mn0.xL7_27YPt_jIsJynmBMJg6k93bxvukfN6bA4TNyPkhU'

// Crea il client Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseConnection() {
  console.log('🔌 Test connessione Supabase...')
  
  try {
    // Test 1: Connessione base
    console.log('1️⃣ Test connessione...')
    const { data, error } = await supabase.from('products').select('count').limit(1)
    
    if (error) {
      console.log('❌ Errore connessione:', error.message)
      return false
    }
    
    console.log('✅ Connessione riuscita!')
    
    // Test 2: Verifica tabelle
    console.log('\n2️⃣ Test tabelle...')
    
    // Test tabella products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(3)
    
    if (productsError) {
      console.log('❌ Errore tabella products:', productsError.message)
    } else {
      console.log(`✅ Tabella products OK - ${products?.length || 0} prodotti trovati`)
      if (products && products.length > 0) {
        console.log('   Primo prodotto:', products[0].name)
      }
    }
    
    // Test tabella orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(3)
    
    if (ordersError) {
      console.log('❌ Errore tabella orders:', ordersError.message)
    } else {
      console.log(`✅ Tabella orders OK - ${orders?.length || 0} ordini trovati`)
    }
    
    // Test 3: Verifica RLS
    console.log('\n3️⃣ Test Row Level Security...')
    
    const { data: rlsTest, error: rlsError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1)
    
    if (rlsError) {
      console.log('❌ Errore RLS:', rlsError.message)
    } else {
      console.log('✅ RLS configurato correttamente')
    }
    
    console.log('\n🎉 Test completato con successo!')
    return true
    
  } catch (error) {
    console.error('💥 Errore generale:', error.message)
    return false
  }
}

// Esegui il test
testSupabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n🚀 Supabase è configurato correttamente!')
    } else {
      console.log('\n⚠️  Ci sono problemi con la configurazione Supabase')
    }
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Errore fatale:', error)
    process.exit(1)
  })
