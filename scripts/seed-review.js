// Inserisce una recensione approvata su un prodotto di test
const { createClient } = require('@supabase/supabase-js')
const path = require('path')

const envPath = process.argv[2] || '.env.development'
require('dotenv').config({ path: envPath })

async function main() {
  console.log(`Usando env: ${envPath}`)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) {
    console.error('Mancano NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(url, service)

  // Prendi un prodotto a caso
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, name')
    .limit(1)
  if (pErr) {
    console.error('Errore lettura products:', pErr.message)
    process.exit(1)
  }
  if (!products || products.length === 0) {
    console.error('Nessun prodotto trovato')
    process.exit(1)
  }
  const product = products[0]
  console.log('Prodotto selezionato:', product)

  // Inserisci una review approvata (user fittizio)
  const payload = {
    product_id: product.id,
    user_id: '00000000-0000-0000-0000-000000000001',
    user_email: 'test@example.com',
    rating: 5,
    title: 'Eccellente',
    body: 'Qualità top, consiglio vivamente!',
    status: 'approved'
  }
  const { data: inserted, error: iErr } = await supabase
    .from('product_reviews')
    .insert([payload])
    .select('id, created_at')
    .single()
  if (iErr) {
    console.error('Errore inserimento review:', iErr.message)
    process.exit(1)
  }
  console.log('Review inserita:', inserted)

  // Verifica lettura approved
  const { data: reviews, error: rErr } = await supabase
    .from('product_reviews')
    .select('id, rating, title, status')
    .eq('product_id', product.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(5)
  if (rErr) {
    console.error('Errore lettura reviews:', rErr.message)
    process.exit(1)
  }
  console.log(`Approved recenti: ${reviews.length}`)
  console.log(reviews)
}

main().catch((e) => {
  console.error('Errore generale:', e)
  process.exit(1)
})


