#!/usr/bin/env node

/**
 * Test dettagliato della connessione Supabase
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Test Connessione Supabase Dettagliato\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('📋 Configurazione:')
console.log('   URL:', supabaseUrl)
console.log('   ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '❌ Mancante')
console.log('   SERVICE_KEY:', supabaseServiceKey ? '✅ Configurato' : '❌ Mancante')
console.log('')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Configurazione mancante!')
  process.exit(1)
}

// Crea client con anon key
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

// Crea client con service key (se disponibile)
const supabaseService = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

async function testConnection() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  // Test 1: Connessione base
  console.log('1️⃣ Test connessione base...')
  try {
    const { data, error } = await supabaseAnon.from('products').select('count', { count: 'exact', head: true })
    if (error) {
      console.log('   ❌ Errore:', error.message)
      console.log('   Codice:', error.code)
      console.log('   Dettagli:', error.details)
      console.log('   Hint:', error.hint)
    } else {
      console.log('   ✅ Connessione OK')
    }
  } catch (err) {
    console.log('   ❌ Eccezione:', err.message)
  }
  console.log('')

  // Test 2: Lettura prodotti
  console.log('2️⃣ Test lettura prodotti...')
  try {
    const { data, error } = await supabaseAnon.from('products').select('*').limit(1)
    if (error) {
      console.log('   ❌ Errore:', error.message)
      console.log('   Codice:', error.code)
    } else if (data && data.length > 0) {
      console.log('   ✅ Prodotti trovati:', data.length)
      console.log('   Esempio:', data[0].name)
    } else {
      console.log('   ⚠️  Nessun prodotto trovato')
    }
  } catch (err) {
    console.log('   ❌ Eccezione:', err.message)
  }
  console.log('')

  // Test 3: Autenticazione
  console.log('3️⃣ Test autenticazione...')
  try {
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email: 'michele.ragota1@gmail.com',
      password: '1234'
    })
    if (error) {
      console.log('   ❌ Errore login:', error.message)
      if (error.message.includes('Invalid login credentials')) {
        console.log('   💡 L\'utente potrebbe non esistere o la password è errata')
      }
    } else {
      console.log('   ✅ Login riuscito!')
      console.log('   User ID:', data.user?.id)
      console.log('   Email:', data.user?.email)
    }
  } catch (err) {
    console.log('   ❌ Eccezione:', err.message)
  }
  console.log('')

  // Test 4: Verifica tabelle esistenti (con service key)
  if (supabaseService) {
    console.log('4️⃣ Test verifica tabelle (con SERVICE_KEY)...')
    try {
      // Prova a leggere dalla tabella user_roles
      const { data, error } = await supabaseService.from('user_roles').select('*').limit(1)
      if (error) {
        console.log('   ❌ Errore user_roles:', error.message)
        console.log('   💡 La tabella user_roles potrebbe non esistere')
      } else {
        console.log('   ✅ Tabella user_roles esiste')
        console.log('   Record trovati:', data?.length || 0)
      }

      // Lista tutti gli utenti
      const { data: users, error: usersError } = await supabaseService.auth.admin.listUsers()
      if (usersError) {
        console.log('   ❌ Errore lista utenti:', usersError.message)
      } else {
        console.log('   ✅ Utenti trovati:', users?.users?.length || 0)
        if (users?.users && users.users.length > 0) {
          console.log('   📧 Email utenti:')
          users.users.forEach(u => {
            console.log(`      - ${u.email} (ID: ${u.id})`)
          })
        }
      }
    } catch (err) {
      console.log('   ❌ Eccezione:', err.message)
    }
    console.log('')
  }

  // Test 5: Verifica stato progetto
  console.log('5️⃣ Test stato progetto...')
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    })
    console.log('   Status HTTP:', response.status)
    if (response.status === 200) {
      console.log('   ✅ Progetto attivo')
    } else if (response.status === 404) {
      console.log('   ⚠️  Progetto potrebbe essere in pausa')
    } else {
      console.log('   ⚠️  Status inaspettato')
    }
  } catch (err) {
    console.log('   ❌ Errore fetch:', err.message)
    if (err.message.includes('fetch failed')) {
      console.log('   💡 Il progetto Supabase potrebbe essere in pausa o non raggiungibile')
    }
  }
  console.log('')

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('📝 Suggerimenti:')
  console.log('   1. Controlla che il progetto Supabase sia ATTIVO (non in pausa)')
  console.log('   2. Verifica che le tabelle siano state create (esegui supabase-schema.sql)')
  console.log('   3. Verifica le RLS policies (Row Level Security)')
  console.log('   4. Crea l\'utente admin dalla dashboard Supabase')
  console.log('')
}

testConnection().catch(err => {
  console.error('\n❌ Errore generale:', err)
  process.exit(1)
})

