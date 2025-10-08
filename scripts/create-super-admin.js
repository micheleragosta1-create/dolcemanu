#!/usr/bin/env node

/**
 * Script per creare un utente Super Admin per test in locale
 * 
 * Uso: node scripts/create-super-admin.js
 */

// Carica le variabili d'ambiente dal file .env.local
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Configurazione
const SUPER_ADMIN_EMAIL = 'michele.ragota1@gmail.com'
const SUPER_ADMIN_PASSWORD = '1234'

async function createSuperAdmin() {
  console.log('🚀 Creazione Super Admin per test in locale...\n')

  // Verifica variabili d'ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  console.log('🔍 Debug variabili:')
  console.log('   URL:', supabaseUrl ? '✅ Configurato' : '❌ Mancante')
  console.log('   ANON_KEY:', supabaseKey ? '✅ Configurato' : '❌ Mancante')
  console.log('   SERVICE_KEY:', supabaseServiceKey ? '✅ Configurato' : '❌ Mancante')
  console.log('')

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Errore: Variabili d\'ambiente Supabase non configurate')
    console.log('')
    console.log('📝 Crea un file .env.local nella root del progetto con:')
    console.log('')
    console.log('NEXT_PUBLIC_SUPABASE_URL=https://tuoprogetto.supabase.co')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=tua-anon-key')
    console.log('SUPABASE_SERVICE_ROLE_KEY=tua-service-key')
    console.log('')
    process.exit(1)
  }

  // Crea client Supabase (usa service key se disponibile per bypassare RLS)
  const supabase = createClient(
    supabaseUrl,
    supabaseServiceKey || supabaseKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    console.log('📧 Email:', SUPER_ADMIN_EMAIL)
    console.log('🔑 Password:', SUPER_ADMIN_PASSWORD)
    console.log('')

    // 1. Verifica se l'utente esiste già
    console.log('1️⃣ Verifica esistenza utente...')
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === SUPER_ADMIN_EMAIL)

    let userId

    if (existingUser) {
      console.log('   ℹ️  Utente già esistente:', existingUser.id)
      userId = existingUser.id
    } else {
      // 2. Crea l'utente
      console.log('2️⃣ Creazione utente...')
      
      if (supabaseServiceKey) {
        // Con service key, usa admin API
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: SUPER_ADMIN_EMAIL,
          password: SUPER_ADMIN_PASSWORD,
          email_confirm: true,
          user_metadata: {
            role: 'super_admin'
          }
        })

        if (createError) {
          throw new Error(`Errore creazione utente: ${createError.message}`)
        }

        console.log('   ✅ Utente creato con successo:', newUser.user.id)
        userId = newUser.user.id
      } else {
        // Senza service key, usa signUp normale
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: SUPER_ADMIN_EMAIL,
          password: SUPER_ADMIN_PASSWORD,
          options: {
            data: {
              role: 'super_admin'
            }
          }
        })

        if (signUpError) {
          throw new Error(`Errore registrazione: ${signUpError.message}`)
        }

        console.log('   ✅ Utente registrato con successo:', signUpData.user?.id)
        console.log('   ⚠️  Conferma l\'email se richiesto da Supabase')
        userId = signUpData.user?.id
      }
    }

    if (!userId) {
      throw new Error('Impossibile ottenere user ID')
    }

    // 3. Assegna il ruolo super_admin
    console.log('3️⃣ Assegnazione ruolo super_admin...')
    
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert(
        {
          user_id: userId,
          role: 'super_admin'
        },
        { onConflict: 'user_id' }
      )

    if (roleError) {
      console.warn('   ⚠️  Errore assegnazione ruolo:', roleError.message)
      console.log('   💡 Prova a eseguire manualmente questo SQL in Supabase:')
      console.log(`   INSERT INTO user_roles (user_id, role) VALUES ('${userId}', 'super_admin')`)
      console.log(`   ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';`)
    } else {
      console.log('   ✅ Ruolo super_admin assegnato con successo')
    }

    // 4. Verifica il ruolo
    console.log('4️⃣ Verifica finale...')
    const { data: roleData, error: verifyError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single()

    if (verifyError) {
      console.warn('   ⚠️  Impossibile verificare il ruolo:', verifyError.message)
    } else {
      console.log('   ✅ Ruolo verificato:', roleData.role)
    }

    console.log('')
    console.log('✨ Super Admin creato con successo!')
    console.log('')
    console.log('📋 Credenziali:')
    console.log('   Email:', SUPER_ADMIN_EMAIL)
    console.log('   Password:', SUPER_ADMIN_PASSWORD)
    console.log('   Ruolo: super_admin')
    console.log('')
    console.log('🔗 Puoi ora accedere a: http://localhost:3000/auth')
    console.log('🔧 Pannello admin: http://localhost:3000/admin')

  } catch (error) {
    console.error('')
    console.error('❌ Errore durante la creazione del super admin:')
    console.error('  ', error.message)
    console.error('')
    console.error('💡 Suggerimenti:')
    console.error('   1. Verifica che Supabase sia configurato correttamente')
    console.error('   2. Esegui prima supabase-roles.sql nel SQL Editor di Supabase')
    console.error('   3. Usa SUPABASE_SERVICE_ROLE_KEY se disponibile per permessi completi')
    process.exit(1)
  }
}

// Esegui lo script
createSuperAdmin()