#!/usr/bin/env node

/**
 * Script per inserire i prodotti mock nel database Supabase
 * 
 * Uso: node scripts/seed-products.js
 */

// Carica le variabili d'ambiente dal file .env.local
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Prodotti mock da inserire
const mockProducts = [
  {
    id: '1',
    name: 'Praline Costiera - Box da 6',
    description: 'Box da 6 praline artigianali con ripieno di nocciola, pistacchio e limoncello della Costiera Amalfitana. Creati con ingredienti locali di prima qualità.',
    price: 18.90,
    image_url: '/images/img_praline_costiera.png',
    category: 'praline',
    stock_quantity: 50,
    chocolate_type: 'misto',
    collection: 'Costiera Amalfitana',
    box_format: 6,
    is_new: true,
    is_bestseller: true,
    discount_percentage: 0
  },
  {
    id: '2',
    name: 'Praline Costiera - Box da 9',
    description: 'Box da 9 praline esclusive della collezione Costiera con sapori mediterranei autentici.',
    price: 26.90,
    image_url: '/images/img_praline_costiera.png',
    category: 'praline',
    stock_quantity: 45,
    chocolate_type: 'misto',
    collection: 'Costiera Amalfitana',
    box_format: 9,
    is_new: true,
    is_bestseller: true,
    discount_percentage: 0
  },
  {
    id: '3',
    name: 'Praline Costiera - Box da 12',
    description: 'Box da 12 praline della collezione Costiera, perfette per regali speciali o per assaporare tutta la gamma.',
    price: 34.90,
    image_url: '/images/img_praline_costiera.png',
    category: 'praline',
    stock_quantity: 40,
    chocolate_type: 'misto',
    collection: 'Costiera Amalfitana',
    box_format: 12,
    is_new: true,
    is_bestseller: true,
    discount_percentage: 10
  },
  {
    id: '4',
    name: 'Praline Tradizione - Box da 6',
    description: 'Praline della collezione Tradizione con ricette classiche rivisitate con maestria artigianale.',
    price: 16.90,
    image_url: '/images/prodotto-1.svg',
    category: 'praline',
    stock_quantity: 35,
    chocolate_type: 'fondente',
    collection: 'Tradizione',
    box_format: 6,
    is_new: false,
    is_bestseller: false,
    discount_percentage: 0
  },
  {
    id: '5',
    name: 'Praline Tradizione - Box da 9',
    description: 'Selezione di 9 praline della collezione Tradizione per chi ama i grandi classici.',
    price: 24.90,
    image_url: '/images/prodotto-1.svg',
    category: 'praline',
    stock_quantity: 30,
    chocolate_type: 'fondente',
    collection: 'Tradizione',
    box_format: 9,
    is_new: false,
    is_bestseller: true,
    discount_percentage: 0
  },
  {
    id: '6',
    name: 'Praline Luxury - Box da 12',
    description: 'La nostra collezione Luxury con ingredienti selezionati e lavorazioni raffinate. Un\'esperienza esclusiva.',
    price: 49.90,
    image_url: '/images/prodotto-2.svg',
    category: 'praline',
    stock_quantity: 20,
    chocolate_type: 'misto',
    collection: 'Luxury',
    box_format: 12,
    is_new: true,
    is_bestseller: false,
    discount_percentage: 0
  },
  {
    id: '7',
    name: 'Praline al Latte - Box da 6',
    description: 'Praline al cioccolato al latte cremoso con ripieno morbido. Dolcezza pura.',
    price: 15.90,
    image_url: '/images/prodotto-3.svg',
    category: 'praline',
    stock_quantity: 55,
    chocolate_type: 'latte',
    collection: 'Tradizione',
    box_format: 6,
    is_new: false,
    is_bestseller: true,
    discount_percentage: 15
  },
  {
    id: '8',
    name: 'Praline Ruby - Box da 9',
    description: 'Esclusive praline con cioccolato ruby, dal colore naturale rosa e dal sapore fruttato unico.',
    price: 38.90,
    image_url: '/images/prodotto-1.svg',
    category: 'praline',
    stock_quantity: 15,
    chocolate_type: 'ruby',
    collection: 'Luxury',
    box_format: 9,
    is_new: true,
    is_bestseller: false,
    discount_percentage: 0
  },
  {
    id: '9',
    name: 'Tavoletta Fondente 70%',
    description: 'Cioccolato fondente premium al 70% con note di mare della Costiera. Un sapore intenso che richiama i profumi del Mediterraneo.',
    price: 8.50,
    image_url: '/images/prodotto-2.svg',
    category: 'tavolette',
    stock_quantity: 60,
    chocolate_type: 'fondente',
    collection: 'Costiera Amalfitana',
    box_format: null,
    is_new: false,
    is_bestseller: true,
    discount_percentage: 0
  },
  {
    id: '10',
    name: 'Tavoletta al Latte con Nocciole',
    description: 'Tavoletta di cioccolato al latte arricchita con nocciole tostate della Campania.',
    price: 7.90,
    image_url: '/images/prodotto-3.svg',
    category: 'tavolette',
    stock_quantity: 50,
    chocolate_type: 'latte',
    collection: 'Tradizione',
    box_format: null,
    is_new: false,
    is_bestseller: true,
    discount_percentage: 0
  },
  {
    id: '11',
    name: 'Tavoletta Bianca al Limone',
    description: 'Tavoletta di cioccolato bianco aromatizzato al limone di Amalfi. Fresco e delicato.',
    price: 9.90,
    image_url: '/images/prodotto-1.svg',
    category: 'tavolette',
    stock_quantity: 40,
    chocolate_type: 'bianco',
    collection: 'Costiera Amalfitana',
    box_format: null,
    is_new: true,
    is_bestseller: false,
    discount_percentage: 0
  },
  {
    id: '12',
    name: 'Confezione Regalo Deluxe',
    description: 'Elegante confezione regalo con una selezione dei nostri migliori prodotti. Perfetta per occasioni speciali.',
    price: 59.90,
    image_url: '/images/prodotto-2.svg',
    category: 'confezioni',
    stock_quantity: 25,
    chocolate_type: 'misto',
    collection: 'Luxury',
    box_format: null,
    is_new: false,
    is_bestseller: true,
    discount_percentage: 20
  }
]

async function seedProducts() {
  console.log('🌱 Seeding prodotti nel database Supabase...\n')

  // Verifica variabili d'ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  console.log('🔍 Debug configurazione:')
  console.log('   URL:', supabaseUrl ? '✅' : '❌')
  console.log('   ANON_KEY:', supabaseKey ? '✅' : '❌')
  console.log('   SERVICE_KEY:', supabaseServiceKey ? '✅' : '❌')
  console.log('')

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Errore: Variabili d\'ambiente Supabase non configurate')
    console.log('   Crea un file .env.local con le credenziali Supabase')
    process.exit(1)
  }

  // Usa service key per bypassare RLS (necessario per inserire prodotti)
  const supabase = createClient(
    supabaseUrl,
    supabaseServiceKey || supabaseKey
  )

  try {
    console.log(`📦 Inserimento di ${mockProducts.length} prodotti...\n`)

    // Opzione 1: Elimina tutti i prodotti esistenti (ATTENZIONE!)
    console.log('⚠️  Vuoi eliminare i prodotti esistenti? (salta per ora)')
    // const { error: deleteError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    // if (deleteError) console.warn('Warning:', deleteError.message)

    // Inserisci i prodotti uno alla volta con gestione errori
    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const product of mockProducts) {
      process.stdout.write(`   Inserimento: ${product.name}... `)

      // Non specifichiamo l'ID, lasciamo che il database generi UUID automaticamente
      const { data, error } = await supabase
        .from('products')
        .insert({
            name: product.name,
            description: product.description,
            price: product.price,
            image_url: product.image_url,
            category: product.category,
            stock_quantity: product.stock_quantity,
            chocolate_type: product.chocolate_type,
            collection: product.collection,
            box_format: product.box_format,
            is_new: product.is_new,
            is_bestseller: product.is_bestseller,
            discount_percentage: product.discount_percentage
          })
        .select()

      if (error) {
        console.log('❌')
        console.log(`      Errore: ${error.message}`)
        errorCount++
      } else {
        console.log('✅')
        successCount++
      }
    }

    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 Riepilogo:')
    console.log(`   ✅ Inseriti: ${successCount}`)
    console.log(`   ⏭️  Saltati: ${skipCount}`)
    console.log(`   ❌ Errori: ${errorCount}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')

    if (errorCount > 0) {
      console.log('💡 Se vedi errori sui campi aggiuntivi (chocolate_type, collection, ecc.):')
      console.log('   1. Apri scripts/seed-products.js')
      console.log('   2. Commenta le righe dei campi che non esistono nel tuo schema')
      console.log('   3. Oppure aggiungi le colonne al database con ALTER TABLE')
      console.log('')
    }

    console.log('✨ Seeding completato!')
    console.log('🔗 Verifica su: http://localhost:3000/shop')

  } catch (error) {
    console.error('')
    console.error('❌ Errore durante il seeding:')
    console.error('  ', error.message)
    console.error('')
    console.error('💡 Suggerimenti:')
    console.error('   1. Verifica che la tabella products esista (esegui supabase-schema.sql)')
    console.error('   2. Usa SUPABASE_SERVICE_ROLE_KEY per permessi completi')
    console.error('   3. Controlla che i campi della tabella corrispondano ai dati')
    process.exit(1)
  }
}

// Esegui lo script
seedProducts()
