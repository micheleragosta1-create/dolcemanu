'use client'

import { Instagram } from 'lucide-react'

// Immagini locali dalla cartella public
const instagramPosts = [
  { id: 1, image: '/images/instagram-1.svg', alt: 'Dolci artigianali' },
  { id: 2, image: '/images/instagram-2.svg', alt: 'Cioccolatini gourmet' },
  { id: 3, image: '/images/instagram-3.svg', alt: 'Box regalo' },
  { id: 4, image: '/images/instagram-4.svg', alt: 'Praline fondenti' },
  { id: 5, image: '/images/instagram-5.svg', alt: 'Lavorazione artigianale' },
  { id: 6, image: '/images/instagram-6.svg', alt: 'Dessert creativi' },
]

export default function InstagramGallery() {
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
          {instagramPosts.map((post) => (
            <a
              key={post.id}
              href={`https://instagram.com/_dolcemanu_`}
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
            href="https://instagram.com/_dolcemanu_"
            target="_blank"
            rel="noopener noreferrer"
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
