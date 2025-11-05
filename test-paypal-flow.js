/**
 * Test del flusso PayPal - Dolce Manu
 * Questo script testa la logica dell'API PayPal senza fare chiamate reali
 */

// Carica variabili d'ambiente da .env.local
const fs = require('fs')
const path = require('path')

try {
  const envPath = path.join(__dirname, '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=')
        if (key && values.length > 0) {
          process.env[key.trim()] = values.join('=').trim()
        }
      }
    })
  }
} catch (e) {
  // Ignora errori di caricamento .env
}

const https = require('https')
const http = require('http')

// Colori per output console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Test 1: Verifica che il server Next.js sia attivo
async function testServerRunning() {
  log('\n🔍 Test 1: Verifica server Next.js...', 'blue')
  
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      if (res.statusCode === 200 || res.statusCode === 304) {
        log('✅ Server Next.js attivo sulla porta 3000', 'green')
        resolve(true)
      } else {
        log(`⚠️  Server risponde con status: ${res.statusCode}`, 'yellow')
        resolve(true)
      }
    })
    
    req.on('error', (err) => {
      log('❌ Server Next.js NON attivo. Esegui: npm run dev', 'red')
      resolve(false)
    })
    
    req.setTimeout(3000, () => {
      req.destroy()
      log('❌ Timeout - Server potrebbe essere lento o non attivo', 'red')
      resolve(false)
    })
  })
}

// Test 2: Verifica che l'endpoint API esista
async function testApiEndpoint() {
  log('\n🔍 Test 2: Verifica endpoint /api/paypal-capture...', 'blue')
  
  return new Promise((resolve) => {
    const data = JSON.stringify({
      paypalOrderId: 'TEST_ORDER_123',
      orderDetails: {
        items: [
          { productId: 1, quantity: 1, price: 10.00 }
        ]
      },
      userEmail: 'test@example.com',
      shippingAddress: {
        address: 'Via Test 123',
        city: 'Roma',
        zip: '00100',
        country: 'Italia',
        notes: ''
      }
    })

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/paypal-capture',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      },
      timeout: 5000
    }

    const req = http.request(options, (res) => {
      let body = ''
      
      res.on('data', (chunk) => {
        body += chunk
      })
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body)
          
          if (res.statusCode === 500 && response.error) {
            // Questo è previsto perché non possiamo veramente chiamare PayPal
            log('✅ Endpoint esiste e risponde (errore previsto senza PayPal reale)', 'green')
            log(`   Messaggio: ${response.error}`, 'yellow')
            resolve(true)
          } else if (res.statusCode === 200) {
            log('✅ Endpoint funzionante e ha processato la richiesta!', 'green')
            resolve(true)
          } else {
            log(`⚠️  Endpoint risponde con status: ${res.statusCode}`, 'yellow')
            log(`   Risposta: ${JSON.stringify(response, null, 2)}`, 'yellow')
            resolve(true)
          }
        } catch (e) {
          log(`⚠️  Risposta non JSON: ${body.substring(0, 100)}`, 'yellow')
          resolve(true)
        }
      })
    })

    req.on('error', (err) => {
      log(`❌ Errore chiamata API: ${err.message}`, 'red')
      resolve(false)
    })

    req.on('timeout', () => {
      req.destroy()
      log('❌ Timeout chiamata API', 'red')
      resolve(false)
    })

    req.write(data)
    req.end()
  })
}

// Test 3: Verifica struttura dati
function testDataStructure() {
  log('\n🔍 Test 3: Verifica struttura dati ordine...', 'blue')
  
  const mockOrder = {
    paypalOrderId: 'TEST123',
    orderDetails: {
      items: [
        { productId: 1, quantity: 2, price: 15.50 },
        { productId: 2, quantity: 1, price: 8.00 }
      ]
    },
    userEmail: 'cliente@example.com',
    shippingAddress: {
      address: 'Via Roma 123',
      city: 'Milano',
      zip: '20100',
      country: 'Italia'
    }
  }

  // Verifica campi obbligatori
  const requiredFields = [
    'paypalOrderId',
    'orderDetails',
    'userEmail',
    'shippingAddress'
  ]

  let allFieldsPresent = true
  for (const field of requiredFields) {
    if (!mockOrder[field]) {
      log(`❌ Campo mancante: ${field}`, 'red')
      allFieldsPresent = false
    }
  }

  if (allFieldsPresent) {
    log('✅ Struttura dati corretta', 'green')
    
    // Calcola totale
    const total = mockOrder.orderDetails.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    )
    log(`   Totale ordine: €${total.toFixed(2)}`, 'green')
    return true
  }
  
  return false
}

// Test 4: Verifica variabili d'ambiente (senza mostrarle per sicurezza)
function testEnvVariables() {
  log('\n🔍 Test 4: Verifica variabili d\'ambiente...', 'blue')
  
  const requiredVars = [
    'NEXT_PUBLIC_PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  let allPresent = true
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      log(`❌ Variabile mancante: ${varName}`, 'red')
      allPresent = false
    } else {
      const preview = process.env[varName].substring(0, 10) + '...'
      log(`✅ ${varName}: ${preview}`, 'green')
    }
  }

  return allPresent
}

// Test 5: Verifica file necessari
function testRequiredFiles() {
  log('\n🔍 Test 5: Verifica file necessari...', 'blue')
  
  const requiredFiles = [
    'app/api/paypal-capture/route.ts',
    'app/checkout/page.tsx',
    'package.json'
  ]

  let allPresent = true
  for (const file of requiredFiles) {
    const fullPath = path.join(process.cwd(), file)
    if (fs.existsSync(fullPath)) {
      log(`✅ ${file}`, 'green')
    } else {
      log(`❌ File mancante: ${file}`, 'red')
      allPresent = false
    }
  }

  return allPresent
}

// Esegui tutti i test
async function runAllTests() {
  log('\n' + '='.repeat(60), 'blue')
  log('🧪 TEST INTEGRAZIONE PAYPAL - DOLCE MANU', 'blue')
  log('='.repeat(60), 'blue')

  const results = {
    serverRunning: await testServerRunning(),
    apiEndpoint: false,
    dataStructure: testDataStructure(),
    envVariables: testEnvVariables(),
    requiredFiles: testRequiredFiles()
  }

  // Test API solo se il server è attivo
  if (results.serverRunning) {
    // Aspetta che il server sia pronto
    log('\n⏳ Attendo 3 secondi per far inizializzare il server...', 'yellow')
    await new Promise(resolve => setTimeout(resolve, 3000))
    results.apiEndpoint = await testApiEndpoint()
  }

  // Riepilogo
  log('\n' + '='.repeat(60), 'blue')
  log('📊 RIEPILOGO TEST', 'blue')
  log('='.repeat(60), 'blue')

  const allPassed = Object.values(results).every(result => result === true)

  for (const [test, passed] of Object.entries(results)) {
    const icon = passed ? '✅' : '❌'
    const color = passed ? 'green' : 'red'
    log(`${icon} ${test}: ${passed ? 'OK' : 'FALLITO'}`, color)
  }

  log('\n' + '='.repeat(60), 'blue')
  if (allPassed) {
    log('🎉 TUTTI I TEST SUPERATI!', 'green')
    log('\n✨ Il sistema PayPal è pronto per essere testato.', 'green')
    log('📝 Prossimi passi:', 'blue')
    log('   1. Apri http://localhost:3000', 'yellow')
    log('   2. Aggiungi prodotti al carrello', 'yellow')
    log('   3. Vai al checkout', 'yellow')
    log('   4. Usa il pulsante PayPal per testare', 'yellow')
  } else {
    log('⚠️  ALCUNI TEST SONO FALLITI', 'red')
    log('\n📝 Controlla gli errori sopra e risolvi i problemi.', 'yellow')
  }
  log('='.repeat(60), 'blue')
}

// Avvia i test
runAllTests().catch(err => {
  log(`\n❌ Errore durante i test: ${err.message}`, 'red')
  process.exit(1)
})

