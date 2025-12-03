'use client'

import { Instagram } from 'lucide-react'
import { useEffect, useState } from 'react'

// Immagini locali dalla cartella public
const instagramPosts = [
  { id: 1, image: '/images/instagram-1.svg', alt: 'Dolci artigianali' },
  { id: 2, image: '/images/instagram-2.svg', alt: 'Cioccolatini gourmet' },
  { id: 3, image: '/images/instagram-3.svg', alt: 'Box regalo' },
  { id: 4, image: '/images/instagram-4.svg', alt: 'Praline fondenti' },
  { id: 5, image: '/images/instagram-5.svg', alt: 'Lavorazione artigianale' },
  { id: 6, image: '/images/instagram-6.svg', alt: 'Dessert creativi' },
]

type ApiPost = { id: string; caption?: string; media_url?: string; thumbnail_url?: string; permalink: string }

export default function InstagramGallery() {
  const [apiPosts, setApiPosts] = useState<ApiPost[] | null>(null)
  const username = 'ondedicacao'

  useEffect(() => {
    let active = true
    fetch('/api/instagram')
      .then(r => r.json())
      .then((payload) => {
        if (!active) return
        if (payload?.meta?.ok && Array.isArray(payload?.posts) && payload.posts.length > 0) {
          setApiPosts(payload.posts)
        }
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  const postsToShow = apiPosts && apiPosts.length > 0
    ? apiPosts.map(p => ({ id: p.id, image: p.media_url || p.thumbnail_url || '', alt: p.caption || 'Instagram', href: p.permalink }))
    : instagramPosts.map(p => ({ ...p, href: `https://instagram.com/${username}` }))

  const openInstagramProfile = (e: React.MouseEvent) => {
    e.preventDefault()
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    const webUrl = `https://instagram.com/${username}`
    if (!isMobile) {
      window.open(webUrl, '_blank', 'noopener,noreferrer')
      return
    }
    const appUrl = `instagram://user?username=${username}`
    const timer = setTimeout(() => {
      window.open(webUrl, '_blank', 'noopener,noreferrer')
    }, 700)
    // tenta apertura app
    window.location.href = appUrl
    window.addEventListener('pagehide', () => clearTimeout(timer), { once: true })
  }

  return (
    <section className="instagram-section">
      <div className="instagram-container">
        <div className="instagram-header">
          <Instagram className="instagram-icon" size={40} />
          <h2 className="instagram-title">Seguici su Instagram</h2>
          <p className="instagram-subtitle">
            Scopri le nostre ultime creazioni e i momenti dietro le quinte
          </p>
        </div>

        <div className="instagram-grid">
          {postsToShow.map((post) => (
            <a
              key={post.id}
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-post"
              aria-label={`Apri su Instagram: ${post.alt}`}
            >
              <img src={post.image} alt={post.alt} className="instagram-image" />
              <div className="instagram-overlay">
                <Instagram size={24} />
              </div>
            </a>
          ))}
        </div>

        <div className="instagram-cta">
          <a
            href={`https://instagram.com/${username}`}
            onClick={openInstagramProfile}
            className="btn btn-primary instagram-button"
          >
            <Instagram size={20} />
            Seguici su Instagram
          </a>
        </div>
      </div>
    </section>
  )
}
