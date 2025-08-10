const { createClient } = require('@supabase/supabase-js')

// Carica le variabili d'ambiente
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variabili d\'ambiente mancanti!')
  console.log('Verifica che .env.local contenga:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

console.log('🔌 Test API Autenticazione Supabase...')
console.log(`URL: ${supabaseUrl}`)
console.log(`Key: ${supabaseAnonKey.substring(0, 20)}...`)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  try {
    console.log('\n1️⃣ Test configurazione Auth...')
    
    // Test 1: Verifica configurazione
    const { data: settings, error: settingsError } = await supabase.auth.admin.listUsers()
    if (settingsError) {
      console.log('ℹ️  Configurazione Auth:', settingsError.message)
    } else {
      console.log('✅ Configurazione Auth OK')
    }

    console.log('\n2️⃣ Test registrazione utente...')
    
    // Test 2: Prova registrazione
    const testEmail = 'testauth@example.com'
    const testPassword = 'password123'
    
    console.log(`📧 Email: ${testEmail}`)
    console.log(`🔑 Password: ${testPassword}`)
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    })
    
    if (signUpError) {
      console.log(`❌ Errore registrazione: ${signUpError.message}`)
      console.log(`🔍 Codice: ${signUpError.status}`)
      console.log(`📋 Dettagli: ${JSON.stringify(signUpError, null, 2)}`)
    } else {
      console.log('✅ Registrazione riuscita!')
      console.log('📊 Dati:', JSON.stringify(signUpData, null, 2))
    }

    console.log('\n3️⃣ Test configurazione email...')
    
    // Test 3: Verifica configurazione email
    const { data: emailConfig, error: emailError } = await supabase.auth.admin.listUsers()
    if (emailError) {
      console.log('ℹ️  Configurazione email:', emailError.message)
    } else {
      console.log('✅ Configurazione email OK')
    }

  } catch (error) {
    console.error('❌ Errore generale:', error.message)
    console.error('🔍 Stack:', error.stack)
  }
}

testAuth()
