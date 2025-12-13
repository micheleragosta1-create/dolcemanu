import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET - Recupera tutte le impostazioni (pubblico)
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      // Ritorna valori di default se Supabase non è configurato
      return NextResponse.json({
        shipping_cost: '5.00',
        free_shipping_threshold: '50.00',
        shipping_enabled: 'true'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')

    if (error) {
      console.error('Errore fetch settings:', error)
      // Ritorna valori di default in caso di errore
      return NextResponse.json({
        shipping_cost: '5.00',
        free_shipping_threshold: '50.00',
        shipping_enabled: 'true'
      })
    }

    // Trasforma array in oggetto chiave-valore
    const settings: Record<string, string> = {}
    data?.forEach(item => {
      settings[item.key] = item.value
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Errore API settings:', error)
    return NextResponse.json({
      shipping_cost: '5.00',
      free_shipping_threshold: '50.00',
      shipping_enabled: 'true'
    })
  }
}

// PUT - Aggiorna le impostazioni (richiede auth admin)
export async function PUT(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Configurazione server mancante' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Formato dati non valido' },
        { status: 400 }
      )
    }

    // Aggiorna ogni impostazione
    const updates = Object.entries(settings).map(async ([key, value]) => {
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          { key, value: String(value), updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )

      if (error) {
        console.error(`Errore aggiornamento ${key}:`, error)
        throw error
      }
    })

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Errore aggiornamento settings:', error)
    return NextResponse.json(
      { error: 'Errore durante il salvataggio' },
      { status: 500 }
    )
  }
}

