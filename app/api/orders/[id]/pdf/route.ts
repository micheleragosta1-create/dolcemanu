import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import pdfService from '@/lib/pdf-service'

export const runtime = 'nodejs'

// Client Supabase
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.length > 20)
const supabaseAdmin = hasServiceKey
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  : null

// Helper per verificare autenticazione admin
async function getUserAndRole(request: Request): Promise<{ user: any | null, role: 'user' | 'admin' | 'super_admin' | null }> {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return { user: null, role: null }
    }
    const token = authHeader.slice(7)
    const { data: userData, error: userError } = await supabaseAnon.auth.getUser(token)
    if (userError || !userData?.user) return { user: null, role: null }

    // Whitelist email
    const whitelist = (process.env.ADMIN_EMAIL_WHITELIST || 'michele.ragosta1@gmail.com')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)
    if (userData.user.email && whitelist.includes(userData.user.email.toLowerCase())) {
      return { user: userData.user, role: 'super_admin' }
    }

    // Recupera ruolo tramite RPC
    const client = supabaseAdmin ?? supabaseAnon
    const { data: roleData } = await client.rpc('get_user_role', { user_uuid: userData.user.id })
    let role: any = roleData
    if (Array.isArray(role)) {
      role = role[0]?.role ?? role[0]
    } else if (role && typeof role === 'object') {
      role = role.role ?? null
    }
    if (role !== 'admin' && role !== 'super_admin' && role !== 'user') role = 'user'
    return { user: userData.user, role }
  } catch {
    return { user: null, role: null }
  }
}

// GET /api/orders/[id]/pdf - Genera e scarica il PDF proforma dell'ordine
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verifica autenticazione admin
    const { role, user } = await getUserAndRole(request)
    
    // Solo admin/super_admin possono scaricare PDF
    // Oppure l'utente proprietario dell'ordine
    const client = supabaseAdmin ?? supabaseAnon
    
    // Recupera i dettagli dell'ordine
    const { data: order, error: orderError } = await client
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            price
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 })
    }

    // Verifica permessi: admin o proprietario ordine
    const isAdmin = role === 'admin' || role === 'super_admin'
    const isOwner = user && order.user_email === user.email
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    // Prepara i dati per il PDF
    const orderData = {
      orderId: order.id,
      orderNumber: order.order_number || order.id.substring(0, 8).toUpperCase(),
      userEmail: order.user_email,
      userName: order.user_name || undefined,
      totalAmount: order.total_amount,
      items: order.order_items.map((item: any) => ({
        name: item.products.name,
        quantity: item.quantity,
        price: item.unit_price || item.price
      })),
      shippingAddress: order.shipping_address,
      shippingCity: order.shipping_city || undefined,
      shippingPostalCode: order.shipping_postal_code || undefined,
      shippingCountry: order.shipping_country || undefined,
      status: order.status,
      createdAt: order.created_at
    }

    // Genera il PDF
    const pdfBuffer = await pdfService.generateProformaPDF(orderData)

    // Restituisci il PDF come download
    const fileName = `proforma_${order.order_number || order.id.substring(0, 8)}.pdf`
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Errore generazione PDF:', error)
    return NextResponse.json({ error: 'Errore nella generazione del PDF' }, { status: 500 })
  }
}
