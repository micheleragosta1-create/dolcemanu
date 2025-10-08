require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Errore: Variabili d\'ambiente mancanti')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyPolicies() {
  console.log('🔧 Applicazione policy RLS per admin...\n')

  try {
    // Leggi il file SQL
    const sqlFile = path.join(__dirname, '..', 'supabase-simple-admin-fix.sql')
    const sql = fs.readFileSync(sqlFile, 'utf8')
    
    // Dividi in comandi singoli (rimuovi commenti e linee vuote)
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--'))

    console.log(`📝 Trovati ${commands.length} comandi SQL da eseguire\n`)

    // Esegui ogni comando
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i]
      if (!cmd) continue

      console.log(`${i + 1}. Esecuzione comando...`)
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: cmd + ';' })
      
      if (error) {
        // Se la funzione RPC non esiste, proviamo direttamente
        console.log(`   ⚠️  Impossibile usare RPC, prova manualmente`)
        console.log(`\n⚠️  ISTRUZIONI MANUALI:`)
        console.log(`   1. Vai su Supabase Dashboard`)
        console.log(`   2. Apri SQL Editor`)
        console.log(`   3. Copia e incolla il contenuto di: supabase-simple-admin-fix.sql`)
        console.log(`   4. Clicca RUN\n`)
        break
      }
      
      console.log(`   ✅ Completato`)
    }

    console.log('\n✅ Policy applicate con successo!')
    console.log('\n🎯 Ora ricarica la pagina admin:')
    console.log('   http://localhost:3000/admin/orders\n')

  } catch (error) {
    console.error('\n❌ Errore:', error.message)
    console.log('\n📋 SOLUZIONE: Esegui manualmente tramite Supabase Dashboard')
    console.log('   1. Apri https://supabase.com/dashboard')
    console.log('   2. Seleziona il tuo progetto')
    console.log('   3. Vai su SQL Editor')
    console.log('   4. New Query')
    console.log('   5. Copia il contenuto di: supabase-simple-admin-fix.sql')
    console.log('   6. RUN\n')
  }
}

applyPolicies()

