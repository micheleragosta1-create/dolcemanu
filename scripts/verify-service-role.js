/**
 * Script per verificare la configurazione della Service Role Key
 * Esegui con: node scripts/verify-service-role.js
 */

require('dotenv').config({ path: '.env.local' })

const checks = {
  url: {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    value: process.env.NEXT_PUBLIC_SUPABASE_URL,
    required: true,
    validate: (val) => val && val.includes('supabase.co')
  },
  anonKey: {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    required: true,
    validate: (val) => val && val.startsWith('eyJ') && val.length > 100
  },
  serviceRoleKey: {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    value: process.env.SUPABASE_SERVICE_ROLE_KEY,
    required: false, // Opzionale ma raccomandato
    validate: (val) => val && val.startsWith('eyJ') && val.length > 100
  }
}

console.log('🔍 Verifica Configurazione Supabase\n')
console.log('=' .repeat(60))

let allOk = true
let warnings = []

Object.entries(checks).forEach(([name, check]) => {
  const exists = Boolean(check.value)
  const isValid = exists ? check.validate(check.value) : false
  
  let status = '✅'
  let message = 'Configurata correttamente'
  
  if (!exists) {
    if (check.required) {
      status = '❌'
      message = 'MANCANTE (RICHIESTA)'
      allOk = false
    } else {
      status = '⚠️ '
      message = 'Non configurata (RACCOMANDATA per eliminare prodotti)'
      warnings.push(check.key)
    }
  } else if (!isValid) {
    status = '⚠️ '
    message = 'Configurata ma formato sospetto'
    warnings.push(check.key)
  }
  
  console.log(`${status} ${check.key}`)
  console.log(`   ${message}`)
  
  if (exists && name !== 'serviceRoleKey') {
    // Mostra preview (non per service role per sicurezza)
    const preview = check.value.substring(0, 20) + '...'
    console.log(`   Preview: ${preview}`)
  }
  console.log('')
})

console.log('=' .repeat(60))

if (allOk && warnings.length === 0) {
  console.log('✅ Configurazione completa e corretta!\n')
} else if (allOk) {
  console.log('⚠️  Configurazione base OK, ma ci sono raccomandazioni:\n')
  warnings.forEach(key => {
    if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
      console.log(`   - Aggiungi ${key} per abilitare l'eliminazione prodotti`)
      console.log('     La trovi su: Supabase Dashboard > Settings > API > service_role')
      console.log('     ⚠️  Non condividere mai questa chiave!')
    }
  })
  console.log('')
} else {
  console.log('❌ Configurazione incompleta. Segui questi passi:\n')
  console.log('1. Crea il file .env.local nella root del progetto')
  console.log('2. Aggiungi le variabili mancanti')
  console.log('3. Riavvia il server di sviluppo\n')
  console.log('Esempio .env.local:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://tuoprogetto.supabase.co')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...')
  console.log('SUPABASE_SERVICE_ROLE_KEY=eyJ...\n')
}

// Test di connessione se tutto è configurato
if (checks.url.value && checks.anonKey.value) {
  console.log('🧪 Test connessione a Supabase...\n')
  
  const { createClient } = require('@supabase/supabase-js')
  
  const testAnon = async () => {
    console.log('   Testing ANON key...')
    const supabaseAnon = createClient(checks.url.value, checks.anonKey.value)
    const { data, error } = await supabaseAnon.from('products').select('id').limit(1)
    
    if (error) {
      console.log(`   ❌ Errore con ANON key: ${error.message}`)
      return false
    } else {
      console.log('   ✅ ANON key funzionante')
      return true
    }
  }
  
  const testServiceRole = async () => {
    if (!checks.serviceRoleKey.value) {
      console.log('   ⏭️  Service Role Key non configurata, skip test')
      return null
    }
    
    console.log('   Testing SERVICE ROLE key...')
    const supabaseService = createClient(checks.url.value, checks.serviceRoleKey.value)
    const { data, error } = await supabaseService.from('products').select('id').limit(1)
    
    if (error) {
      console.log(`   ❌ Errore con SERVICE ROLE key: ${error.message}`)
      return false
    } else {
      console.log('   ✅ SERVICE ROLE key funzionante')
      return true
    }
  }
  
  ;(async () => {
    const anonOk = await testAnon()
    const serviceOk = await testServiceRole()
    
    console.log('')
    console.log('=' .repeat(60))
    
    if (anonOk && (serviceOk === null || serviceOk)) {
      console.log('✅ Tutto configurato correttamente!')
      console.log('\n📝 Prossimi passi:')
      console.log('   1. Riavvia il server: npm run dev')
      console.log('   2. Vai su /admin e prova a eliminare un prodotto')
      console.log('   3. Verifica che scompaia sia dalla dashboard che dallo shop')
    } else {
      console.log('⚠️  Ci sono problemi con la connessione a Supabase')
      console.log('\n🔧 Cosa fare:')
      console.log('   1. Controlla che le chiavi siano corrette su Supabase Dashboard')
      console.log('   2. Verifica che il progetto Supabase sia attivo')
      console.log('   3. Controlla la connessione internet')
    }
    console.log('')
  })()
} else {
  console.log('⏭️  Salta test connessione (configurazione base mancante)\n')
}

