require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkOrders() {
  console.log('🔍 Controllo ordini nel database...\n')

  // Usa service role per bypassare RLS
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Errore:', error)
    return
  }

  console.log(`✅ Trovati ${orders.length} ordini totali\n`)
  
  orders.forEach((order, index) => {
    console.log(`${index + 1}. ID: ${order.id}`)
    console.log(`   Email: ${order.user_email}`)
    console.log(`   Totale: €${order.total_amount}`)
    console.log(`   Status: ${order.status}`)
    console.log(`   Data: ${new Date(order.created_at).toLocaleString('it-IT')}`)
    console.log('')
  })
}

checkOrders()

