// E2E test ordini: crea utenti (se possibile), genera token, testa API orders
// Requisiti: Node 18+, .env.local con NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY
// Opzionale (più completo): SUPABASE_SERVICE_ROLE_KEY per creare utenti/ruoli e prodotti

/* eslint-disable no-console */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('❌ Variabili Supabase mancanti. Configura NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON)
const supabaseAdmin = SUPABASE_SERVICE ? createClient(SUPABASE_URL, SUPABASE_SERVICE) : null
const SKIP_PROVISION = String(process.env.SUPABASE_TEST_SKIP_PROVISION || '').trim() === '1'

const TEST_USER_EMAIL = process.env.SUPABASE_TEST_USER_EMAIL || 'test.user@example.com'
const TEST_USER_PASSWORD = process.env.SUPABASE_TEST_USER_PASSWORD || 'Password123!'
const TEST_ADMIN_EMAIL = process.env.SUPABASE_TEST_ADMIN_EMAIL || 'test.admin@example.com'
const TEST_ADMIN_PASSWORD = process.env.SUPABASE_TEST_ADMIN_PASSWORD || 'Password123!'

async function ensureUser(email, password, role) {
  if (!supabaseAdmin) {
    console.log(`ℹ️ Nessuna service role key. Assicurati che l'utente esista: ${email} e abbia ruolo: ${role}`)
    return null
  }
  // Crea o recupera utente via Admin API
  const { data: list } = await supabaseAdmin.auth.admin.listUsers()
  let user = list?.users?.find(u => u.email === email) || null
  if (!user) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    if (error) throw error
    user = data.user
    console.log(`✅ Creato utente ${email}`)
  } else {
    // Assicura la password (best-effort)
    await supabaseAdmin.auth.admin.updateUserById(user.id, { password })
  }
  // Imposta ruolo via RPC
  if (role) {
    const { error: roleErr } = await supabaseAdmin.rpc('update_user_role', { target_user_id: user.id, new_role: role })
    if (roleErr) {
      // Fallback: upsert diretto nella tabella user_roles (service role bypassa RLS)
      const { error: upsertErr } = await supabaseAdmin
        .from('user_roles')
        .upsert({ user_id: user.id, role })
      if (upsertErr) {
        console.log(`⚠️  Impostazione ruolo via RPC/UPSERT fallita per ${email}:`, roleErr.message || upsertErr.message)
      } else {
        console.log(`🔐 Ruolo impostato (fallback upsert): ${email} → ${role}`)
      }
    } else {
      console.log(`🔐 Ruolo impostato: ${email} → ${role}`)
    }
  }
  return user
}

async function getAccessToken(email, password) {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.session?.access_token
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options)
  const text = await res.text()
  let json
  try { json = text ? JSON.parse(text) : null } catch { json = { raw: text } }
  return { status: res.status, json }
}

async function ensureOneProductId() {
  // Prova tramite API pubblica prodotti
  const { status, json } = await fetchJson(`${BASE_URL}/api/products`)
  if (status === 200 && Array.isArray(json) && json.length > 0) {
    return String(json[0].id)
  }
  if (!supabaseAdmin) {
    throw new Error('Nessun prodotto disponibile e service role assente per crearne uno di test')
  }
  // Crea prodotto di test
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      name: 'Prodotto E2E Test',
      description: 'Creato da test-orders-e2e',
      price: 9.99,
      image_url: '/images/prodotto-1.svg',
      category: 'test',
      stock_quantity: 100
    })
    .select('id')
    .single()
  if (error) throw error
  console.log('🧪 Creato product di test:', data.id)
  return String(data.id)
}

async function run() {
  console.log('🚀 Esecuzione test ordini E2E...')

  // Prepara utenti e ruoli
  if (!SKIP_PROVISION) {
    await ensureUser(TEST_USER_EMAIL, TEST_USER_PASSWORD, 'user')
    await ensureUser(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, 'super_admin')
  } else {
    console.log('⏭️  Provisioning utenti saltato (SUPABASE_TEST_SKIP_PROVISION=1)')
  }

  let userToken = null
  let adminToken = null
  try { userToken = await getAccessToken(TEST_USER_EMAIL, TEST_USER_PASSWORD) } catch (e) { console.log('⚠️  Login utente fallito:', e?.message || e) }
  try { adminToken = await getAccessToken(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD) } catch (e) { console.log('⚠️  Login admin fallito:', e?.message || e) }
  console.log('🔑 Token generati (utente/admin)')

  // Verifica protezione GET /api/orders
  const resAnon = await fetchJson(`${BASE_URL}/api/orders`)
  console.log('GET /api/orders (anon) →', resAnon.status, resAnon.json?.error || resAnon.json)

  if (userToken) {
    const resUser = await fetchJson(`${BASE_URL}/api/orders`, { headers: { Authorization: `Bearer ${userToken}` } })
    console.log('GET /api/orders (user) →', resUser.status, resUser.json?.error || (Array.isArray(resUser.json) && `${resUser.json.length} ordini`))
  } else {
    console.log('GET /api/orders (user) → skipped (manca USER_TOKEN)')
  }

  if (adminToken) {
    const resAdmin = await fetchJson(`${BASE_URL}/api/orders`, { headers: { Authorization: `Bearer ${adminToken}` } })
    console.log('GET /api/orders (admin) →', resAdmin.status, Array.isArray(resAdmin.json) ? `${resAdmin.json.length} ordini` : resAdmin.json)
  } else {
    console.log('GET /api/orders (admin) → skipped (manca ADMIN_TOKEN)')
  }

  // Assicura un prodotto
  const productId = await ensureOneProductId()

  // Crea ordine come utente (email spoof nel body, deve essere ignorata)
  const createBody = {
    user_email: 'spoof@example.com',
    items: [{ product_id: productId, quantity: 1 }],
    shipping_address: 'Via Test 1',
    shipping_city: 'Salerno',
    shipping_postal_code: '84100',
    shipping_country: 'Italia'
  }
  const resCreate = userToken ? await fetchJson(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
    body: JSON.stringify(createBody)
  }) : { status: 0, json: { error: 'no user token' } }
  console.log('POST /api/orders (user) →', resCreate.status, resCreate.json)
  if (resCreate.status !== 201) throw new Error('Creazione ordine fallita')
  const orderId = resCreate.json.order_id

  // GET ordine come proprietario
  if (userToken) {
    const resGetOwner = await fetchJson(`${BASE_URL}/api/orders/${orderId}`, { headers: { Authorization: `Bearer ${userToken}` } })
    console.log(`GET /api/orders/${orderId} (owner) →`, resGetOwner.status)
  }

  // GET ordine come admin
  if (adminToken) {
    const resGetAdmin = await fetchJson(`${BASE_URL}/api/orders/${orderId}`, { headers: { Authorization: `Bearer ${adminToken}` } })
    console.log(`GET /api/orders/${orderId} (admin) →`, resGetAdmin.status)
  } else {
    console.log(`GET /api/orders/${orderId} (admin) → skipped (manca ADMIN_TOKEN)`)    
  }

  // PATCH ordine come user (deve essere 403)
  const resPatchUser = userToken ? await fetchJson(`${BASE_URL}/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ status: 'processing', admin_note: 'nope' })
  }) : { status: 0, json: { error: 'no user token' } }
  if (userToken) console.log(`PATCH /api/orders/${orderId} (user) →`, resPatchUser.status, resPatchUser.json?.error)

  // PATCH ordine come admin (200)
  const resPatchAdmin = adminToken ? await fetchJson(`${BASE_URL}/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'processing', admin_note: 'ok' })
  }) : { status: 0, json: { error: 'no admin token' } }
  if (adminToken) console.log(`PATCH /api/orders/${orderId} (admin) →`, resPatchAdmin.status)

  // DELETE ordine come admin (200)
  const resDeleteAdmin = adminToken ? await fetchJson(`${BASE_URL}/api/orders/${orderId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` }
  }) : { status: 0, json: { error: 'no admin token' } }
  if (adminToken) console.log(`DELETE /api/orders/${orderId} (admin) →`, resDeleteAdmin.status)

  console.log('\n✅ Test E2E completato')
}

run().catch((err) => {
  console.error('❌ Errore test E2E:', err)
  process.exit(1)
})


