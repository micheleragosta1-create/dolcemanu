const fs = require('fs')
const path = require('path')

const ORDER_ID = '6a3f8f3d-f6b3-43f3-98b7-4025e36e801d'
const API_URL = `http://localhost:3000/api/orders/${ORDER_ID}/pdf`

async function testPDFDownload() {
  console.log('🔄 Test download PDF proforma...\n')
  console.log(`📡 Endpoint: ${API_URL}\n`)

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Errore dal server:', error)
      console.log('\n⚠️  Nota: Probabilmente serve autenticazione admin.')
      console.log('   Per testare con autenticazione, usa l\'interfaccia admin:')
      console.log('   http://localhost:3000/admin/orders\n')
      return
    }

    const buffer = await response.arrayBuffer()
    const outputPath = path.join(__dirname, '..', 'test-proforma.pdf')
    
    fs.writeFileSync(outputPath, Buffer.from(buffer))
    
    console.log('✅ PDF generato con successo!')
    console.log(`📄 File salvato in: ${outputPath}`)
    console.log(`📊 Dimensione: ${(buffer.byteLength / 1024).toFixed(2)} KB\n`)
    console.log('🎯 Apri il file per verificare il contenuto!')
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error.message)
    console.log('\n⚠️  Assicurati che il server sia in esecuzione:')
    console.log('   npm run dev\n')
  }
}

testPDFDownload()

