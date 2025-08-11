import { NextResponse } from 'next/server'

// Rende l'endpoint staticamente ricalcolato lato server
export const revalidate = 3600 // 1 ora

type InstagramMedia = {
  id: string
  caption?: string
  media_url?: string
  permalink: string
  thumbnail_url?: string
  media_type?: string
  timestamp?: string
}

export async function GET() {
  const userId = process.env.IG_USER_ID
  const accessToken = process.env.IG_ACCESS_TOKEN

  if (!userId || !accessToken) {
    return NextResponse.json(
      { posts: [], meta: { ok: false, reason: 'missing_env' } },
      { status: 200, headers: { 'Cache-Control': 'public, max-age=300' } }
    )
  }

  const url = new URL(`https://graph.instagram.com/${userId}/media`)
  url.searchParams.set(
    'fields',
    [
      'id',
      'caption',
      'media_url',
      'permalink',
      'thumbnail_url',
      'media_type',
      'timestamp',
    ].join(',')
  )
  url.searchParams.set('access_token', accessToken)
  url.searchParams.set('limit', '6')

  try {
    const res = await fetch(url.toString(), {
      // Cache lato Next per 1 ora
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { posts: [], meta: { ok: false, status: res.status } },
        { status: 200, headers: { 'Cache-Control': 'public, max-age=300' } }
      )
    }

    const data = await res.json()
    const posts: InstagramMedia[] = Array.isArray(data?.data)
      ? data.data
          .filter((m: any) => m?.permalink && (m?.media_url || m?.thumbnail_url))
          .map((m: any) => ({
            id: String(m.id),
            caption: m.caption,
            media_url: m.media_url,
            permalink: m.permalink,
            thumbnail_url: m.thumbnail_url,
            media_type: m.media_type,
            timestamp: m.timestamp,
          }))
      : []

    return NextResponse.json(
      { posts, meta: { ok: true, count: posts.length } },
      { status: 200, headers: { 'Cache-Control': 'public, max-age=1800' } }
    )
  } catch (error) {
    return NextResponse.json(
      { posts: [], meta: { ok: false, error: 'network_error' } },
      { status: 200, headers: { 'Cache-Control': 'public, max-age=300' } }
    )
  }
}


