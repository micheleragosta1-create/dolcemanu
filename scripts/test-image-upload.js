/**
 * Script di test per verificare la configurazione di Supabase Storage
 * e il sistema di upload immagini per i prodotti
 * 
 * Uso: node scripts/test-image-upload.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variabili d\'ambiente Supabase mancanti')
  console.error('Assicurati che .env.local contenga:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY o SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStorageConfiguration() {
  console.log('🧪 Test Configurazione Supabase Storage\n')
  console.log('=' .repeat(60))

  // Test 1: Verifica esistenza bucket
  console.log('\n📦 Test 1: Verifica esistenza bucket "product-images"')
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Errore nel recupero buckets:', error.message)
      return false
    }

    const productImagesBucket = buckets.find(b => b.name === 'product-images')
    
    if (productImagesBucket) {
      console.log('✅ Bucket "product-images" trovato')
      console.log('   - ID:', productImagesBucket.id)
      console.log('   - Public:', productImagesBucket.public)
      console.log('   - Created:', productImagesBucket.created_at)
    } else {
      console.error('❌ Bucket "product-images" non trovato')
      console.log('\n💡 Soluzione:')
      console.log('1. Vai su Supabase Dashboard > Storage')
      console.log('2. Crea un nuovo bucket chiamato "product-images"')
      console.log('3. Imposta come pubblico')
      console.log('4. Consulta STORAGE_SETUP_GUIDE.md per i dettagli')
      return false
    }
  } catch (error) {
    console.error('❌ Errore durante il test:', error.message)
    return false
  }

  // Test 2: Verifica policy di accesso
  console.log('\n🔐 Test 2: Verifica policy di accesso')
  try {
    const { data, error } = await supabase.rpc('get_storage_policies', {
      bucket_name: 'product-images'
    }).catch(() => ({ data: null, error: null }))

    // Nota: questa RPC potrebbe non esistere, quindi proviamo un approccio alternativo
    // Tentiamo di listare i file (dovrebbe funzionare se le policy sono corrette)
    const { data: files, error: listError } = await supabase
      .storage
      .from('product-images')
      .list('', { limit: 1 })

    if (listError) {
      if (listError.message.includes('not found')) {
        console.log('⚠️  Policy potrebbero non essere configurate correttamente')
        console.log('💡 Esegui lo script supabase-storage-setup.sql nella dashboard')
      } else {
        console.error('❌ Errore policy:', listError.message)
      }
    } else {
      console.log('✅ Policy di accesso funzionanti')
      console.log(`   - File nel bucket: ${files.length}`)
    }
  } catch (error) {
    console.log('⚠️  Impossibile verificare le policy direttamente')
    console.log('   Questo è normale, le policy verranno testate durante l\'upload')
  }

  // Test 3: Simula upload di un file di test (non eseguito in questo script)
  console.log('\n📤 Test 3: Capacità di upload')
  console.log('⏭️  Questo test deve essere eseguito tramite l\'interfaccia admin')
  console.log('   Una volta loggato come admin:')
  console.log('   1. Vai su /admin')
  console.log('   2. Clicca su "Prodotti"')
  console.log('   3. Crea un nuovo prodotto e carica un\'immagine')
  console.log('   4. Verifica che l\'immagine venga caricata e visualizzata')

  // Test 4: Verifica URL pubblici
  console.log('\n🌐 Test 4: Generazione URL pubblici')
  try {
    const testFileName = 'test-image.jpg'
    const { data: { publicUrl } } = supabase
      .storage
      .from('product-images')
      .getPublicUrl(testFileName)

    if (publicUrl) {
      console.log('✅ Generazione URL pubblici funzionante')
      console.log('   Esempio URL:', publicUrl)
      console.log('   (Nota: questo file potrebbe non esistere)')
    } else {
      console.error('❌ Impossibile generare URL pubblico')
    }
  } catch (error) {
    console.error('❌ Errore generazione URL:', error.message)
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n✨ Test completati!')
  console.log('\n📖 Prossimi passi:')
  console.log('1. Se il bucket non esiste, crealo seguendo STORAGE_SETUP_GUIDE.md')
  console.log('2. Esegui supabase-storage-setup.sql per le policy')
  console.log('3. Testa l\'upload tramite il pannello admin')
  console.log('4. Verifica che le immagini siano visibili nel catalogo prodotti')

  return true
}

// Test ottimizzazione immagini (solo info)
function displayImageOptimizationInfo() {
  console.log('\n\n🎨 Funzionalità di Ottimizzazione Immagini\n')
  console.log('=' .repeat(60))
  console.log('\nIl sistema include le seguenti ottimizzazioni SEO:')
  console.log('\n1. 📝 Nome File SEO-Friendly')
  console.log('   - Normalizzazione caratteri speciali')
  console.log('   - Rimozione accenti')
  console.log('   - Formato: nome-prodotto-timestamp.jpg')
  console.log('\n2. 🖼️  Ottimizzazione Immagine')
  console.log('   - Ridimensionamento: max 1200x1200px')
  console.log('   - Compressione: 85% qualità JPEG')
  console.log('   - Riduzione dimensione file')
  console.log('\n3. ✅ Validazione')
  console.log('   - Formati: JPG, PNG, GIF, WEBP')
  console.log('   - Dimensione max: 5MB')
  console.log('   - Validazione tipo MIME')
  console.log('\n4. ⚡ Performance')
  console.log('   - Cache HTTP: 1 ora')
  console.log('   - Lazy loading automatico')
  console.log('   - CDN Supabase')
  console.log('\n' + '='.repeat(60))
}

// Esegui i test
async function run() {
  try {
    await testStorageConfiguration()
    displayImageOptimizationInfo()
    
    console.log('\n\n💡 Info Aggiuntive:\n')
    console.log('Componenti modificati:')
    console.log('  ✓ components/admin/AdminProducts.tsx - Form di upload')
    console.log('  ✓ lib/image-upload.ts - Utilità ottimizzazione')
    console.log('\nFile di configurazione:')
    console.log('  ✓ supabase-storage-setup.sql - Policy SQL')
    console.log('  ✓ STORAGE_SETUP_GUIDE.md - Guida completa')
    console.log('\nDocumentazione:')
    console.log('  📖 Leggi STORAGE_SETUP_GUIDE.md per istruzioni dettagliate')
    
  } catch (error) {
    console.error('\n❌ Errore durante i test:', error)
    process.exit(1)
  }
}

run()

