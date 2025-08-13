import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  // Se non c'è cookie di sessione Supabase, lascia passare (UI gestirà messaggio)
  const hasSupabaseSession = req.cookies.has('sb:token') || req.cookies.has('sb-access-token')
  if (!hasSupabaseSession) return NextResponse.next()

  // In ambienti con header Authorization (es. reverse proxy custom), si potrebbe anche bloccare qui
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}


