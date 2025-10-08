#!/usr/bin/env node

/**
 * Script semplificato per test locale SENZA Supabase
 * Mostra solo le istruzioni per creare manualmente l'utente
 */

console.log('🔧 Creazione Super Admin - Modalità Locale\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('📋 CREDENZIALI SUPER ADMIN:')
console.log('   Email:    michele.ragota1@gmail.com')
console.log('   Password: 1234')
console.log('   Ruolo:    super_admin')
console.log('')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log('📝 ISTRUZIONI PER CONFIGURARE SUPABASE:\n')

console.log('1️⃣  Crea un progetto su https://supabase.com')
console.log('')

console.log('2️⃣  Ottieni le credenziali:')
console.log('   • Vai su: Settings → API')
console.log('   • Copia URL del progetto')
console.log('   • Copia anon key')
console.log('   • Copia service_role key')
console.log('')

console.log('3️⃣  Crea il file .env.local nella root del progetto:')
console.log('   cp .env.local.example .env.local')
console.log('')

console.log('4️⃣  Configura le variabili in .env.local:')
console.log('   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co')
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...')
console.log('   SUPABASE_SERVICE_ROLE_KEY=eyJhb...')
console.log('')

console.log('5️⃣  Esegui lo schema SQL:')
console.log('   • Vai su: SQL Editor in Supabase')
console.log('   • Esegui: supabase-schema.sql')
console.log('   • Esegui: supabase-roles.sql')
console.log('')

console.log('6️⃣  Esegui lo script di creazione admin:')
console.log('   npm run create:admin')
console.log('')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log('💡 ALTERNATIVA - Test senza Supabase:\n')

console.log('L\'app funziona anche SENZA Supabase configurato!')
console.log('Utilizzerà automaticamente i dati mock in lib/mock-data.ts')
console.log('')
console.log('Per testare con i mock:')
console.log('   1. Non configurare le variabili Supabase')
console.log('   2. Avvia il dev server: npm run dev')
console.log('   3. I prodotti saranno caricati dai mock')
console.log('')
console.log('⚠️  Nota: Auth e ordini non funzioneranno senza Supabase')
console.log('')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log('✅ Per domande o problemi, consulta:')
console.log('   • SUPABASE_SETUP.md')
console.log('   • SETUP_COMPLETION.md')
console.log('   • README.md')
console.log('')
