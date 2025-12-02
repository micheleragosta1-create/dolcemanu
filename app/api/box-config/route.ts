import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/box-config - Ottiene praline disponibili e prezzi box
export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !anon) {
      // Ritorna dati mock se Supabase non è configurato
      return NextResponse.json({
        pralines: [],
        boxPrices: { 8: 24.90, 16: 44.90 },
        message: 'Supabase non configurato - dati mock'
      })
    }

    const supabase = createClient(url, anon)

    // Ottieni praline disponibili per box personalizzata
    const { data: pralines, error: pralinesError } = await supabase
      .from('products')
      .select('*')
      .eq('is_box_praline', true)
      .is('deleted_at', null)
      .gt('stock_quantity', 0)
      .order('name')

    if (pralinesError) {
      console.error('Errore fetch praline:', pralinesError)
    }

    // Ottieni configurazioni box (prezzi)
    const { data: boxConfigs, error: configError } = await supabase
      .from('box_configurations')
      .select('*')
      .eq('is_active', true)
      .order('size')

    if (configError) {
      console.error('Errore fetch box config:', configError)
    }

    // Costruisci oggetto prezzi
    const boxPrices = {
      8: 24.90,  // default
      16: 44.90  // default
    }

    if (boxConfigs && boxConfigs.length > 0) {
      boxConfigs.forEach((config: { size: number; base_price: number }) => {
        if (config.size === 8 || config.size === 16) {
          boxPrices[config.size] = config.base_price
        }
      })
    }

    return NextResponse.json({
      pralines: pralines || [],
      boxPrices,
      boxConfigs: boxConfigs || []
    })

  } catch (error) {
    console.error('Errore API box-config:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento configurazione box' },
      { status: 500 }
    )
  }
}

// POST /api/box-config - Aggiorna prezzi box (solo admin)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { boxPrices } = body

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      return NextResponse.json({ error: 'Supabase non configurato' }, { status: 500 })
    }

    const supabase = createClient(url, serviceKey || anonKey)

    // Aggiorna prezzi per ogni size
    for (const size of [8, 16]) {
      if (boxPrices[size] !== undefined) {
        const { error } = await supabase
          .from('box_configurations')
          .upsert({
            size,
            base_price: boxPrices[size],
            is_active: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'size'
          })

        if (error) {
          console.error(`Errore aggiornamento prezzo box ${size}:`, error)
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Prezzi aggiornati' })

  } catch (error) {
    console.error('Errore aggiornamento prezzi:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dei prezzi' },
      { status: 500 }
    )
  }
}


